import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

export async function registerJwt(app: FastifyInstance) {
  await app.register(import('@fastify/jwt'), {
    secret: process.env.JWT_SECRET || 'dev-secret-change-me',
  });

  app.decorate(
    'authenticate',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        await request.jwtVerify();
      } catch {
        reply.status(401).send({ message: 'Unauthorized' });
      }
    },
  );
}

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (
      request: FastifyRequest,
      reply: FastifyReply,
    ) => Promise<void>;
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { sub: string; email: string; role: string };
    user: { sub: string; email: string; role: string };
  }
}
