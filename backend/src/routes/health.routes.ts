import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';

export async function registerHealthRoutes(app: FastifyInstance): Promise<void> {
  app.get('/health', async () => ({
    status: 'ok',
    service: 'fuellink-ai',
    timestamp: new Date().toISOString(),
  }));

  app.get('/health/live', async () => ({
    status: 'ok',
    uptime: process.uptime(),
  }));

  app.get('/health/ready', async (request, reply) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return { status: 'ready', database: 'connected' };
    } catch (error) {
      request.log.error({ error }, 'health.ready_failed');
      return reply.status(503).send({ status: 'not_ready', database: 'disconnected' });
    }
  });
}