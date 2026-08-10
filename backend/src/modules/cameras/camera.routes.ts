import { FastifyInstance } from 'fastify';
import { prisma } from '../../plugins/database';

export async function cameraRoutes(app: FastifyInstance) {
  app.get('/cameras', async () => {
    const cameras = await prisma.speedCamera.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    return { cameras };
  });

  app.get('/cameras/nearby', async (request) => {
    const { lat, lng, radiusKm = 5 } = request.query as {
      lat?: string;
      lng?: string;
      radiusKm?: string;
    };

    if (!lat || !lng) {
      return { cameras: [], message: 'lat and lng are required' };
    }

    const latitude = Number(lat);
    const longitude = Number(lng);
    const radius = Number(radiusKm);

    // Simple bounding box filter for MVP (PostGIS ST_DWithin later)
    const latDelta = radius / 111;
    const lngDelta = radius / (111 * Math.cos((latitude * Math.PI) / 180));

    const cameras = await prisma.speedCamera.findMany({
      where: {
        isActive: true,
        latitude: { gte: latitude - latDelta, lte: latitude + latDelta },
        longitude: { gte: longitude - lngDelta, lte: longitude + lngDelta },
      },
    });

    const withDistance = cameras
      .map((camera) => ({
        ...camera,
        distanceKm: haversineKm(latitude, longitude, camera.latitude, camera.longitude),
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm);

    return { cameras: withDistance };
  });
}

function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
