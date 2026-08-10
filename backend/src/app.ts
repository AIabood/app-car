import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { registerJwt } from './plugins/jwt';
import { disconnectDatabase } from './plugins/database';
import { healthRoutes } from './modules/health/health.routes';
import { authRoutes } from './modules/auth/auth.routes';
import { cameraRoutes } from './modules/cameras/camera.routes';
import { tripRoutes } from './modules/trips/trip.routes';
import { reportRoutes } from './modules/reports/report.routes';
import { analyticsRoutes } from './modules/analytics/analytics.routes';

const port = Number(process.env.PORT) || 3000;
const host = process.env.HOST || '0.0.0.0';

async function bootstrap() {
  const app = Fastify({ logger: true });

  await app.register(cors, { origin: true });
  await registerJwt(app);

  await app.register(healthRoutes, { prefix: '/api' });
  await app.register(authRoutes, { prefix: '/api/auth' });
  await app.register(cameraRoutes, { prefix: '/api' });
  await app.register(tripRoutes, { prefix: '/api' });
  await app.register(reportRoutes, { prefix: '/api' });
  await app.register(analyticsRoutes, { prefix: '/api' });

  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof Error && error.name === 'ZodError') {
      return reply.status(400).send({
        message: 'Validation error',
        issues: error.message,
      });
    }

    app.log.error(error);
    return reply.status(500).send({ message: 'Internal server error' });
  });

  try {
    await app.listen({ port, host });
    console.log(`SDA Backend running at http://localhost:${port}`);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }

  const shutdown = async () => {
    await app.close();
    await disconnectDatabase();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

bootstrap();
