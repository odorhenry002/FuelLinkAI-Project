import { PrismaClient } from '@prisma/client';
import { logger } from './logger.js';

/**
 * Singleton Prisma client.
 * In development, the client is recreated on hot-reload to avoid
 * exhausting database connections.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: [
      { emit: 'event', level: 'query' },
      { emit: 'event', level: 'error' },
      { emit: 'event', level: 'warn' },
    ],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

prisma.$on('query', (e) => {
  logger.debug({ query: e.query, params: e.params, durationMs: e.duration }, 'db.query');
});

prisma.$on('error', (e) => {
  logger.error({ message: e.message, target: e.target }, 'db.error');
});

prisma.$on('warn', (e) => {
  logger.warn({ message: e.message, target: e.target }, 'db.warn');
});