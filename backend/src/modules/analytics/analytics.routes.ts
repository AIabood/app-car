import { FastifyPluginAsync } from 'fastify';
import { prisma } from '../../plugins/database';

export const analyticsRoutes: FastifyPluginAsync = async (app) => {
  app.get('/analytics/summary', { preHandler: [app.authenticate] }, async (request) => {
    const userId = request.user.sub;

    const summary = await prisma.trip.aggregate({
      where: { userId },
      _count: { id: true },
      _sum: {
        distanceKm: true,
        speedViolations: true,
      },
      _avg: {
        avgSpeed: true,
        drivingScore: true,
      },
      _max: {
        maxSpeed: true,
      },
    });

    const safeTripCount = await prisma.trip.count({
      where: {
        userId,
        drivingScore: { gte: 80 },
      },
    });

    const warningTripCount = await prisma.trip.count({
      where: {
        userId,
        drivingScore: { gte: 50, lt: 80 },
      },
    });

    const dangerTripCount = await prisma.trip.count({
      where: {
        userId,
        drivingScore: { lt: 50 },
      },
    });

    const recentTrips = await prisma.trip.findMany({
      where: { userId },
      orderBy: { startedAt: 'desc' },
      take: 5,
    });

    return {
      summary: {
        totalTrips: summary._count.id,
        totalDistanceKm: summary._sum.distanceKm ?? 0,
        totalViolations: summary._sum.speedViolations ?? 0,
        averageSpeed: summary._avg.avgSpeed ?? 0,
        averageDrivingScore: summary._avg.drivingScore ?? 0,
        maxSpeed: summary._max.maxSpeed ?? 0,
        safeTripCount,
        warningTripCount,
        dangerTripCount,
      },
      recentTrips,
    };
  });

  app.get('/analytics/driving', { preHandler: [app.authenticate] }, async (request) => {
    const userId = request.user.sub;

    const worstTrip = await prisma.trip.findFirst({
      where: { userId },
      orderBy: { drivingScore: 'asc' },
    });

    const fastestTrip = await prisma.trip.findFirst({
      where: { userId },
      orderBy: { maxSpeed: 'desc' },
    });

    return {
      driving: {
        worstTrip,
        fastestTrip,
      },
    };
  });
};