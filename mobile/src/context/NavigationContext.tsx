/**
 * Navigation Context
 * Central state management for GPS tracking, route planning, distance/ETA estimation, and driving mode.
 */

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import * as Location from 'expo-location';
import { AppLocation, RouteInfo } from '@/types/navigation';
import { calculateDistance, formatDistance } from '@/utils/distance';
import { calculateETA, formatETA } from '@/utils/eta';

export const FALLBACK_RIYADH: AppLocation = {
  id: 'gps_default',
  nameAr: 'موقعي الحالي',
  nameEn: 'My Current Location',
  latitude: 24.7136,
  longitude: 46.6753,
  descriptionAr: 'مدينة الرياض، المملكة العربية السعودية',
  descriptionEn: 'Riyadh, Saudi Arabia',
  isGps: true,
};

interface NavigationContextType {
  userLocation: AppLocation;
  startLocation: AppLocation;
  destination: AppLocation | null;
  routeInfo: RouteInfo | null;
  isNavigating: boolean;
  navigationProgress: number;
  simulationLocation: { latitude: number; longitude: number } | null;
  recenterTrigger: number;
  isLoadingLocation: boolean;
  setUserLocation: (location: AppLocation) => void;
  setStartLocation: (location: AppLocation) => void;
  setDestination: (location: AppLocation | null) => void;
  resetStartToGps: () => void;
  swapStartAndDestination: () => void;
  clearRoute: () => void;
  startNavigation: () => void;
  endNavigation: () => void;
  triggerRecenter: () => void;
  refreshGpsLocation: () => Promise<void>;
  setNavigationProgress: React.Dispatch<React.SetStateAction<number>>;
  setSimulationLocation: (coords: { latitude: number; longitude: number } | null) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [userLocation, setUserLocationState] = useState<AppLocation>(FALLBACK_RIYADH);
  const [startLocation, setStartLocationState] = useState<AppLocation>(FALLBACK_RIYADH);
  const [destination, setDestination] = useState<AppLocation | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [navigationProgress, setNavigationProgress] = useState(0);
  const [simulationLocation, setSimulationLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [recenterTrigger, setRecenterTrigger] = useState(0);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // Fetch real GPS on mount
  const refreshGpsLocation = async () => {
    setIsLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const gpsLoc: AppLocation = {
          id: 'gps_current',
          nameAr: 'موقعي الحالي',
          nameEn: 'My Current Location',
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          descriptionAr: 'الموقع الفعلي عبر GPS',
          descriptionEn: 'Live GPS Location',
          isGps: true,
        };

        setUserLocationState(gpsLoc);

        // If start location is still default GPS, update it to the live GPS
        setStartLocationState((prev) => (prev.isGps ? gpsLoc : prev));
      }
    } catch (e) {
      console.warn('GPS location request error', e);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  useEffect(() => {
    refreshGpsLocation();
  }, []);

  // Compute Route Info automatically when start & destination exist
  const routeInfo = useMemo<RouteInfo | null>(() => {
    if (!startLocation || !destination) return null;

    const distanceKm = calculateDistance(
      startLocation.latitude,
      startLocation.longitude,
      destination.latitude,
      destination.longitude
    );

    const estimatedMinutes = calculateETA(distanceKm);

    return {
      start: startLocation,
      destination,
      distanceKm,
      formattedDistance: formatDistance(distanceKm),
      estimatedMinutes,
      formattedDuration: formatETA(estimatedMinutes),
    };
  }, [startLocation, destination]);

  const setUserLocation = (location: AppLocation) => {
    setUserLocationState(location);
  };

  const setStartLocation = (location: AppLocation) => {
    setStartLocationState(location);
  };

  const resetStartToGps = () => {
    setStartLocationState(userLocation);
  };

  const swapStartAndDestination = () => {
    if (destination) {
      const oldStart = startLocation;
      setStartLocationState(destination);
      setDestination(oldStart);
    }
  };

  const clearRoute = () => {
    setDestination(null);
    setStartLocationState(userLocation);
    setIsNavigating(false);
    setNavigationProgress(0);
    setSimulationLocation(null);
  };

  const startNavigation = () => {
    if (startLocation && destination) {
      setIsNavigating(true);
      setNavigationProgress(0);
      setSimulationLocation({
        latitude: startLocation.latitude,
        longitude: startLocation.longitude,
      });
    }
  };

  const endNavigation = () => {
    setIsNavigating(false);
    setNavigationProgress(0);
    setSimulationLocation(null);
  };

  const triggerRecenter = () => {
    setRecenterTrigger((prev) => prev + 1);
  };

  return (
    <NavigationContext.Provider
      value={{
        userLocation,
        startLocation,
        destination,
        routeInfo,
        isNavigating,
        navigationProgress,
        simulationLocation,
        recenterTrigger,
        isLoadingLocation,
        setUserLocation,
        setStartLocation,
        setDestination,
        resetStartToGps,
        swapStartAndDestination,
        clearRoute,
        startNavigation,
        endNavigation,
        triggerRecenter,
        refreshGpsLocation,
        setNavigationProgress,
        setSimulationLocation,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation(): NavigationContextType {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}
