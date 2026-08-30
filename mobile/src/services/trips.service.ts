/**
 * Trips Service
 * Handles trip creation, updates, and GPS point logging via backend API.
 */

import { apiRequest, ApiError } from './api';
import { AppLocation } from '@/types/navigation';

export interface CreateTripRequest {
  startedAt: string; // ISO 8601 datetime
  endedAt?: string;
  distanceKm?: number;
  durationMin?: number;
  avgSpeed?: number;
  maxSpeed?: number;
  speedViolations?: number;
  drivingScore?: number;
}

export interface UpdateTripRequest {
  endedAt?: string;
  distanceKm?: number;
  durationMin?: number;
  avgSpeed?: number;
  maxSpeed?: number;
  speedViolations?: number;
  drivingScore?: number;
}

export interface TripPointRequest {
  latitude: number;
  longitude: number;
  speed?: number;
  recordedAt: string; // ISO 8601 datetime
}

export interface AddPointsRequest {
  points: TripPointRequest[];
}

export interface TripResponse {
  id: string;
  userId: string;
  startedAt: string;
  endedAt: string | null;
  distanceKm: number | null;
  durationMin: number | null;
  avgSpeed: number | null;
  maxSpeed: number | null;
  speedViolations: number;
  drivingScore: number | null;
  createdAt: string;
}

export interface TripsListResponse {
  trips: TripResponse[];
}

export interface TripDetailsResponse {
  trip: TripResponse & {
    points: Array<{
      id: string;
      tripId: string;
      latitude: number;
      longitude: number;
      speed: number | null;
      recordedAt: string;
    }>;
  };
}

export interface AddPointsResponse {
  created: number;
}

export class TripsService {
  /**
   * Create a new trip
   */
  static async createTrip(
    data: CreateTripRequest,
    token: string,
  ): Promise<TripResponse> {
    try {
      const response = await apiRequest<{ trip: TripResponse }>(
        '/trips',
        {
          method: 'POST',
          body: data,
          token,
        },
      );
      return response.trip;
    } catch (err) {
      console.error('Failed to create trip:', err);
      throw err;
    }
  }

  /**
   * Get all trips for authenticated user
   */
  static async getTrips(token: string): Promise<TripResponse[]> {
    try {
      const response = await apiRequest<TripsListResponse>(
        '/trips',
        { token },
      );
      return response.trips;
    } catch (err) {
      console.error('Failed to fetch trips:', err);
      throw err;
    }
  }

  /**
   * Get trip details with all GPS points
   */
  static async getTripDetails(
    tripId: string,
    token: string,
  ): Promise<TripDetailsResponse['trip']> {
    try {
      const response = await apiRequest<TripDetailsResponse>(
        `/trips/${tripId}`,
        { token },
      );
      return response.trip;
    } catch (err) {
      console.error('Failed to fetch trip details:', err);
      throw err;
    }
  }

  /**
   * Update trip with final statistics
   */
  static async updateTrip(
    tripId: string,
    data: UpdateTripRequest,
    token: string,
  ): Promise<TripResponse> {
    try {
      const response = await apiRequest<{ trip: TripResponse }>(
        `/trips/${tripId}`,
        {
          method: 'PATCH',
          body: data,
          token,
        },
      );
      return response.trip;
    } catch (err) {
      console.error('Failed to update trip:', err);
      throw err;
    }
  }

  /**
   * Add GPS points to a trip (batch operation)
   * Can be called multiple times to add points progressively
   */
  static async addTripPoints(
    tripId: string,
    points: TripPointRequest[],
    token: string,
  ): Promise<number> {
    try {
      const response = await apiRequest<AddPointsResponse>(
        `/trips/${tripId}/points`,
        {
          method: 'POST',
          body: { points },
          token,
        },
      );
      return response.created;
    } catch (err) {
      console.error('Failed to add trip points:', err);
      throw err;
    }
  }
}
