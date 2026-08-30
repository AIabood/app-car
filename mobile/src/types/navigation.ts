/**
 * Navigation Types
 * Unified location model for GPS, search results, start, and destination.
 */

export type LocationSelectionMode = 'START' | 'DESTINATION';

/** A single geographic coordinate point used for route geometry. */
export interface RoutePoint {
  latitude: number;
  longitude: number;
}

export interface AppLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
  nameAr: string;
  nameEn: string;
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
  /** Real road-based polyline points returned from OSRM. */
  routeGeometry?: RoutePoint[];
}

export type NavigationMode = 'IDLE' | 'PLANNING' | 'READY' | 'NAVIGATING';

export function getLocationLabel(location: AppLocation): string {
  return location.name || location.nameAr || location.nameEn;
}

export function getLocationAddress(location: AppLocation): string | undefined {
  return location.address || location.descriptionAr || location.descriptionEn;
}
