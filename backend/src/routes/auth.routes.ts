import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { register, login, refresh, logout, validatePassword } from '../services/auth.service.js';
import { authenticate } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';

const registerSchema = z.object({
  tenantName: z.string().min(2).max(100),
  tenantSlug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
  organisationName: z.string().max(200).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

export async function registerAuthRoutes(app: FastifyInstance): Promise<void> {
  app.post('/auth/register', async (request, reply) => {
    const body = registerSchema.parse(request.body);
    validatePassword(body.password);

    const result = await register(body);
    return reply.status(201).send(result);
  });

  app.post('/auth/login', async (request, reply) => {
    const body = loginSchema.parse(request.body);
    const result = await login(body);
    return reply.send(result);
  });

  app.post('/auth/refresh', async (request, reply) => {
    const body = refreshSchema.parse(request.body);
    const tokens = await refresh(body.refreshToken);
    return reply.send({ tokens });
  });

  app.post('/auth/logout', async (request, reply) => {
    const body = refreshSchema.parse(request.body);
    const auth = request.auth;
    if (auth) {
      await logout(body.refreshToken, auth.userId);
    }
    return reply.send({ success: true });
  });

  app.get('/auth/me', { preHandler: authenticate }, async (request, reply) => {
    const auth = request.auth!;
    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      include: {
        memberships: {
          include: { organisation: { select: { id: true, name: true, type: true } } },
        },
      },
    });

    if (!user) {
      return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'User not found' } });
    }

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
          organisationType: m.organisation.type,
          role: m.role,
          isDefault: m.isDefault,
        })),
      },
    };
  });
}