/**
 * Navigation Types
 * Data models for route planning, location points, and driving modes.
 */

export interface AppLocation {
  id: string;
  nameAr: string;
  nameEn: string;
  latitude: number;
  longitude: number;
  descriptionAr?: string;
  descriptionEn?: string;
  isGps?: boolean;
}

export interface RouteInfo {
  start: AppLocation;
  destination: AppLocation;
  distanceKm: number;
  formattedDistance: string;
  estimatedMinutes: number;
  formattedDuration: string;
}

export type NavigationMode = 'IDLE' | 'PLANNING' | 'READY' | 'NAVIGATING';
