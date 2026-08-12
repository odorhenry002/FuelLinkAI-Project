import { buildApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './lib/logger.js';
import { prisma } from './lib/prisma.js';

async function main(): Promise<void> {
  const app = await buildApp();

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    logger.info({ signal }, 'shutdown.initiated');
    await app.close();
    await prisma.$disconnect();
    process.exit(0);
  };

  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));

  try {
    await app.listen({ port: env.PORT, host: env.HOST });
    logger.info(
      { port: env.PORT, prefix: env.API_PREFIX, nodeEnv: env.NODE_ENV },
      'fuellink-ai server started',
    );
  } catch (error) {
    logger.error({ error }, 'server.startup_failed');
    await prisma.$disconnect();
    process.exit(1);
  }
}

void main();