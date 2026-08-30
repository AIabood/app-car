/**
 * Route Service
 * Fetches real road-based route geometry from OSRM (Project OSRM — free, no API key required).
 * Returns actual driving route polyline coordinates plus real distance and duration.
 *
 * OSRM Public Server: https://router.project-osrm.org
 */

import { RoutePoint } from '@/types/navigation';

const OSRM_BASE = 'https://router.project-osrm.org/route/v1/driving';

export type RouteResult = {
  /** Array of lat/lng points forming the road-based route polyline. */
  points: RoutePoint[];
  /** Real road distance in kilometers. */
  distanceKm: number;
  /** Real driving duration in minutes. */
  durationMinutes: number;
};

type OsrmResponse = {
  code: string;
  routes?: {
    distance: number; // meters
    duration: number; // seconds
    geometry?: {
      coordinates?: [number, number][]; // [lng, lat] pairs
    };
  }[];
};

/**
 * Fetches a real driving route between two coordinates using OSRM.
 *
 * @param start   Origin coordinates
 * @param end     Destination coordinates
 * @param signal  Optional AbortSignal for request cancellation
 * @returns       RouteResult with road geometry, distance, and duration
 * @throws        Error if network request fails or OSRM returns no route
 */
export async function fetchRoute(
  start: RoutePoint,
  end: RoutePoint,
  signal?: AbortSignal
): Promise<RouteResult> {
  // OSRM coordinate format: lng,lat (note: longitude first)
  const coords = `${start.longitude},${start.latitude};${end.longitude},${end.latitude}`;
  const url = `${OSRM_BASE}/${coords}?overview=full&geometries=geojson`;

  const response = await fetch(url, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    signal,
  });

  if (!response.ok) {
    throw new Error(`OSRM request failed (HTTP ${response.status})`);
  }

  const data = (await response.json()) as OsrmResponse;

  if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
    throw new Error(`OSRM returned no routes (code: ${data.code})`);
  }

  const route = data.routes[0];
  const geometryCoords = route.geometry?.coordinates ?? [];

  // Convert OSRM [lng, lat] pairs → { latitude, longitude } objects
  const points: RoutePoint[] = geometryCoords.map(([lng, lat]) => ({
    latitude: lat,
    longitude: lng,
  }));

  // Fall back to straight-line endpoints if OSRM geometry is empty
  if (points.length < 2) {
    points.push(start, end);
  }

  const distanceKm = Math.round((route.distance / 1000) * 10) / 10;
  const durationMinutes = Math.max(1, Math.round(route.duration / 60));

  return { points, distanceKm, durationMinutes };
}
