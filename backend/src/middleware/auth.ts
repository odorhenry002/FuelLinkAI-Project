import { FastifyReply, FastifyRequest } from 'fastify';
import { verifyAccessToken } from '../services/auth.service.js';
import { UnauthorizedError, ForbiddenError } from '../lib/errors.js';
import { prisma } from '../lib/prisma.js';

declare module 'fastify' {
  interface FastifyRequest {
    auth?: {
      userId: string;
      tenantId: string;
    };
  }
}

/**
 * JWT authentication guard.
 * Verifies the Bearer token and attaches `request.auth`.
 * Zero Trust: every request is authenticated and tenant-scoped.
 */
export async function authenticate(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const header = request.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing Bearer token');
  }

  const token = header.slice('Bearer '.length);
  const payload = await verifyAccessToken(token);
  request.auth = payload;
}

/**
 * Optional authentication — allows unauthenticated access to
 * a route while still populating auth context when present.
 */
export async function optionalAuthenticate(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const header = request.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    const token = header.slice('Bearer '.length);
    try {
      request.auth = await verifyAccessToken(token);
    } catch {
      // Ignore invalid token for optional routes
    }
  }
}

/**
 * Role guard — checks the user has a membership in the organisation
 * with at least one of the allowed roles.
 */
export async function requireRole(roles: string[]) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    if (!request.auth) {
      throw new UnauthorizedError('Authentication required');
    }

    const membership = await prisma.membership.findFirst({
      where: {
        userId: request.auth.userId,
        role: { in: roles as never },
      },
      select: { id: true, role: true },
    });

    if (!membership) {
      throw new ForbiddenError('Insufficient role permissions');
    }
  };
}