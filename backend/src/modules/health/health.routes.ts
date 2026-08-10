import { FastifyInstance } from 'fastify';
import { prisma } from '../../plugins/database';

export async function healthRoutes(app: FastifyInstance) {
  app.get('/health', async () => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return {
        status: 'ok',
        service: 'SDA Backend',
        database: 'connected',
        timestamp: new Date().toISOString(),
      };
    } catch {
      return {
        status: 'degraded',
        service: 'SDA Backend',
        database: 'disconnected',
        timestamp: new Date().toISOString(),
      };
    }
  });
}
