/**
 * Trip Data Types
 * Shared TypeScript types for the My Trips feature
 */

export type DrivingStatus = 'excellent' | 'safe' | 'warnings' | 'caution';

export interface TripWaypoint {
  name: string;
  address?: string;
}

export interface Trip {
  id: string;
  date: Date;
  origin: TripWaypoint;
  destination: TripWaypoint;
  distanceKm: number;
  durationMinutes: number;
  averageSpeedKmh: number;
  maxSpeedKmh: number;
  safetyScore: number;
  drivingStatus: DrivingStatus;
  speedWarnings: number;
  camerasEncountered: number;
  roadEvents: number;
}

export interface DrivingSummary {
  totalTrips: number;
  totalDistanceKm: number;
  totalDrivingMinutes: number;
  overallSafetyScore: number;
}

export type FilterPeriod = 'all' | 'today' | 'week' | 'month';

export interface GroupedTrips {
  label: string;
  trips: Trip[];
}
