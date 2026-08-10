import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { prisma } from '../../plugins/database';

const createTripSchema = z.object({
  startedAt: z.string().datetime(),
  endedAt: z.string().datetime().optional(),
  distanceKm: z.number().optional(),
  durationMin: z.number().optional(),
  avgSpeed: z.number().optional(),
  maxSpeed: z.number().optional(),
  speedViolations: z.number().optional(),
  drivingScore: z.number().optional(),
});

const updateTripSchema = createTripSchema.partial();

const tripPointSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  speed: z.number().optional(),
  recordedAt: z.string().datetime(),
});

const addPointsSchema = z.object({
  points: z.array(tripPointSchema).min(1),
});

export const tripRoutes: FastifyPluginAsync = async (app) => {
  app.get('/trips', { preHandler: [app.authenticate] }, async (request) => {
    const userId = request.user.sub;

    const trips = await prisma.trip.findMany({
      where: { userId },
      orderBy: { startedAt: 'desc' },
      include: {
        points: {
          take: 1,
          orderBy: { recordedAt: 'asc' },
        },
      },
    });

    return { trips };
  });

  app.get('/trips/:id', { preHandler: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const userId = request.user.sub;

    const trip = await prisma.trip.findFirst({
      where: { id, userId },
      include: {
        points: {
          orderBy: { recordedAt: 'asc' },
        },
      },
    });

    if (!trip) {
      return reply.status(404).send({ message: 'Trip not found' });
    }

    return { trip };
  });

  app.post('/trips', { preHandler: [app.authenticate] }, async (request, reply) => {
    const body = createTripSchema.parse(request.body);
    const userId = request.user.sub;

    const trip = await prisma.trip.create({
      data: {
        userId,
        startedAt: new Date(body.startedAt),
        endedAt: body.endedAt ? new Date(body.endedAt) : undefined,
        distanceKm: body.distanceKm,
        durationMin: body.durationMin,
        avgSpeed: body.avgSpeed,
        maxSpeed: body.maxSpeed,
        speedViolations: body.speedViolations,
        drivingScore: body.drivingScore,
      },
    });

    return reply.status(201).send({ trip });
  });

  app.patch('/trips/:id', { preHandler: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = updateTripSchema.parse(request.body);
    const userId = request.user.sub;

    const trip = await prisma.trip.findUnique({ where: { id } });
    if (!trip || trip.userId !== userId) {
      return reply.status(404).send({ message: 'Trip not found' });
    }

    const updated = await prisma.trip.update({
      where: { id },
      data: {
        endedAt: body.endedAt ? new Date(body.endedAt) : undefined,
        distanceKm: body.distanceKm,
        durationMin: body.durationMin,
        avgSpeed: body.avgSpeed,
        maxSpeed: body.maxSpeed,
        speedViolations: body.speedViolations,
        drivingScore: body.drivingScore,
      },
    });

    return { trip: updated };
  });

  app.post('/trips/:id/points', { preHandler: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = addPointsSchema.parse(request.body);
    const userId = request.user.sub;

    const trip = await prisma.trip.findUnique({ where: { id } });
    if (!trip || trip.userId !== userId) {
      return reply.status(404).send({ message: 'Trip not found' });
    }

    const created = await prisma.tripPoint.createMany({
      data: body.points.map((point) => ({
        tripId: id,
        latitude: point.latitude,
        longitude: point.longitude,
        speed: point.speed,
        recordedAt: new Date(point.recordedAt),
      })),
    });

    return reply.status(201).send({ created: created.count });
  });
};