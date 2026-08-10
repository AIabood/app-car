import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { prisma } from '../../plugins/database';

const createReportSchema = z.object({
  reportType: z.enum(['CAMERA', 'ACCIDENT', 'ROAD_WORK']),
  latitude: z.number(),
  longitude: z.number(),
  description: z.string().max(1000).optional(),
});

const voteReportSchema = z.object({
  vote: z.enum(['up', 'down']),
});

const reviewReportSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
});

export const reportRoutes: FastifyPluginAsync = async (app) => {
  app.get('/reports', { preHandler: [app.authenticate] }, async (request) => {
    const userId = request.user.sub;
    const isAdmin = request.user.role === 'ADMIN';

    const reports = await prisma.communityReport.findMany({
      where: isAdmin ? undefined : { userId },
      orderBy: { createdAt: 'desc' },
    });

    return { reports };
  });

  app.get('/reports/:id', { preHandler: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const userId = request.user.sub;
    const isAdmin = request.user.role === 'ADMIN';

    const report = await prisma.communityReport.findUnique({ where: { id } });
    if (!report) {
      return reply.status(404).send({ message: 'Report not found' });
    }

    if (!isAdmin && report.userId !== userId) {
      return reply.status(403).send({ message: 'Not authorized to view this report' });
    }

    return { report };
  });

  app.post('/reports', { preHandler: [app.authenticate] }, async (request, reply) => {
    const body = createReportSchema.parse(request.body);
    const userId = request.user.sub;

    const report = await prisma.communityReport.create({
      data: {
        userId,
        reportType: body.reportType,
        latitude: body.latitude,
        longitude: body.longitude,
        description: body.description,
      },
    });

    return reply.status(201).send({ report });
  });

  app.post('/reports/:id/vote', { preHandler: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = voteReportSchema.parse(request.body);

    const report = await prisma.communityReport.findUnique({ where: { id } });
    if (!report) {
      return reply.status(404).send({ message: 'Report not found' });
    }

    const updated = await prisma.communityReport.update({
      where: { id },
      data: {
        upVotes: body.vote === 'up' ? { increment: 1 } : undefined,
        downVotes: body.vote === 'down' ? { increment: 1 } : undefined,
      },
    });

    return { report: updated };
  });

  app.patch('/reports/:id/review', { preHandler: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = reviewReportSchema.parse(request.body);
    const isAdmin = request.user.role === 'ADMIN';

    if (!isAdmin) {
      return reply.status(403).send({ message: 'Admin access required' });
    }

    const report = await prisma.communityReport.update({
      where: { id },
      data: {
        status: body.status,
        reviewedBy: request.user.sub,
        reviewedAt: new Date(),
      },
    });

    return { report };
  });
};