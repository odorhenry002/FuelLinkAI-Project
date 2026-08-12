import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { env } from '../config/env.js';
import { prisma } from '../lib/prisma.js';
import { ConflictError, UnauthorizedError, ValidationError } from '../lib/errors.js';
import { writeAuditLog } from './audit.service.js';

export interface RegisterInput {
  tenantName: string;
  tenantSlug: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  organisationName?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function signAccessToken(userId: string, tenantId: string): string {
  return jwt.sign({ sub: userId, tenantId }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_TTL,
    issuer: 'fuellink',
    audience: 'fuellink-api',
  });
}

function signRefreshToken(userId: string): string {
  return jwt.sign({ sub: userId }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_TTL,
    issuer: 'fuellink',
    audience: 'fuellink-api',
  });
}

function parseTtlToSeconds(ttl: string): number {
  const match = /^(\d+)([smhd])$/.exec(ttl);
  if (!match) return 900;
  const value = Number(match[1]);
  const unit = match[2];
  const multipliers: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
  return value * multipliers[unit];
}

export async function register(input: RegisterInput): Promise<{ user: unknown; tokens: AuthTokens }> {
  const existingTenant = await prisma.tenant.findUnique({ where: { slug: input.tenantSlug } });
  if (existingTenant) {
    throw new ConflictError('Organisation slug is already in use');
  }

  const passwordHash = await bcrypt.hash(input.password, env.BCRYPT_ROUNDS);

  const tenant = await prisma.tenant.create({
    data: {
      name: input.tenantName,
      slug: input.tenantSlug,
    },
  });

  const user = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: input.email.toLowerCase(),
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
    },
  });

  const organisation = await prisma.organisation.create({
    data: {
      tenantId: tenant.id,
      name: input.organisationName ?? input.tenantName,
    },
  });

  await prisma.membership.create({
    data: {
      userId: user.id,
      organisationId: organisation.id,
      role: 'OWNER',
      isDefault: true,
    },
  });

  await writeAuditLog({
    tenantId: tenant.id,
    userId: user.id,
    action: 'auth.register',
    entity: 'User',
    entityId: user.id,
  });

  const tokens = await issueTokens(user.id, tenant.id);

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      tenantId: tenant.id,
      organisationId: organisation.id,
    },
    tokens,
  };
}

export async function login(input: LoginInput): Promise<{ user: unknown; tokens: AuthTokens }> {
  const user = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() },
    include: { memberships: { include: { organisation: true } } },
  });

  if (!user?.passwordHash) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) {
    throw new UnauthorizedError('Invalid email or password');
  }

  if (user.status !== 'ACTIVE') {
    throw new UnauthorizedError('Account is not active');
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  await writeAuditLog({
    tenantId: user.tenantId,
    userId: user.id,
    action: 'auth.login',
    entity: 'User',
    entityId: user.id,
  });

  const tokens = await issueTokens(user.id, user.tenantId);

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      tenantId: user.tenantId,
      memberships: user.memberships.map((m) => ({
        organisationId: m.organisationId,
        organisationName: m.organisation.name,
        role: m.role,
        isDefault: m.isDefault,
      })),
    },
    tokens,
  };
}

async function issueTokens(userId: string, tenantId: string): Promise<AuthTokens> {
  const accessToken = signAccessToken(userId, tenantId);
  const refreshToken = signRefreshToken(userId);
  const refreshTtlSeconds = parseTtlToSeconds(env.JWT_REFRESH_TTL);

  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + refreshTtlSeconds * 1000),
    },
  });

  return {
    accessToken,
    refreshToken,
    expiresIn: parseTtlToSeconds(env.JWT_ACCESS_TTL),
  };
}

export async function refresh(refreshToken: string): Promise<AuthTokens> {
  let payload: jwt.JwtPayload;
  try {
    payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET, {
      issuer: 'fuellink',
      audience: 'fuellink-api',
    }) as jwt.JwtPayload;
  } catch {
    throw new UnauthorizedError('Invalid refresh token');
  }

  const tokenHash = hashToken(refreshToken);
  const stored = await prisma.refreshToken.findUnique({ where: { tokenHash } });

  if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
    throw new UnauthorizedError('Refresh token has expired or been revoked');
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub as string } });
  if (!user || user.status !== 'ACTIVE') {
    throw new UnauthorizedError('Account is not active');
  }

  // Rotate: revoke old token, issue new pair
  await prisma.refreshToken.update({
    where: { id: stored.id },
    data: { revokedAt: new Date() },
  });

  return issueTokens(user.id, user.tenantId);
}

export async function logout(refreshToken: string, userId: string): Promise<void> {
  const tokenHash = hashToken(refreshToken);
  await prisma.refreshToken.updateMany({
    where: { tokenHash, userId },
    data: { revokedAt: new Date() },
  });
}

export async function verifyAccessToken(token: string): Promise<{ userId: string; tenantId: string }> {
  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET, {
      issuer: 'fuellink',
      audience: 'fuellink-api',
    }) as jwt.JwtPayload;
    return { userId: payload.sub as string, tenantId: payload.tenantId as string };
  } catch {
    throw new UnauthorizedError('Invalid or expired access token');
  }
}

export function validatePassword(password: string): void {
  if (password.length < 8) {
    throw new ValidationError('Password must be at least 8 characters long');
  }
  if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
    throw new ValidationError('Password must contain uppercase, lowercase and numeric characters');
  }
}