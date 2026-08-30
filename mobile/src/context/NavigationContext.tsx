/**
 * Navigation Context
 * Central state management for GPS tracking, route planning,
 * real road-based route fetching (OSRM), and driving mode.
 */

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { Platform, Alert } from 'react-native';
import * as Location from 'expo-location';
import { AppLocation, RouteInfo, RoutePoint } from '@/types/navigation';
import { formatDistance } from '@/utils/distance';
import { formatETA } from '@/utils/eta';
import { fetchRoute } from '@/services/route.service';
import { TripsService, TripPointRequest } from '@/services/trips.service';
import { useAuth } from './AuthContext';

export const FALLBACK_JORDAN: AppLocation = {
  id: 'gps_default',
  name: 'موقعي الحالي',
  nameAr: 'موقعي الحالي',
  nameEn: 'My Current Location',
  latitude: 31.9539,
  longitude: 35.9106,
  address: 'عمان، المملكة الأردنية الهاشمية',
  descriptionAr: 'عمان، المملكة الأردنية الهاشمية',
  descriptionEn: 'Amman, Jordan',
  isGps: true,
};

export const FALLBACK_RIYADH = FALLBACK_JORDAN;

/** Trip point collected during drive */
interface TripPointData {
  latitude: number;
  longitude: number;
  speed: number;
  timestamp: number; // milliseconds for efficient calculation
}

interface NavigationContextType {
  currentGpsLocation: AppLocation;
  userLocation: AppLocation;
  startLocation: AppLocation;
  destination: AppLocation | null;
  routeInfo: RouteInfo | null;
  /** True while OSRM route is being fetched. */
  isLoadingRoute: boolean;
  isNavigating: boolean;
  navigationProgress: number;
  simulationLocation: { latitude: number; longitude: number } | null;
  recenterTrigger: number;
  isLoadingLocation: boolean;
  /** Current trip ID when driving — null when not driving */
  currentTripId: string | null;
  /** Trip points collected so far */
  tripPoints: TripPointData[];
  setUserLocation: (location: AppLocation) => void;
  setStartLocation: (location: AppLocation) => void;
  setDestination: (location: AppLocation | null) => void;
  resetStartToGps: () => void;
  swapLocations: () => void;
  swapStartAndDestination: () => void;
  clearRoute: () => void;
  startNavigation: (tripId?: string) => void;
  endNavigation: () => void;
  triggerRecenter: () => void;
  refreshGpsLocation: (silent?: boolean) => Promise<AppLocation | null>;
  setNavigationProgress: React.Dispatch<React.SetStateAction<number>>;
  setSimulationLocation: (coords: { latitude: number; longitude: number } | null) => void;
  /** Add GPS point during drive */
  addTripPoint: (latitude: number, longitude: number, speed: number) => void;
  /** Save trip and points to backend, return trip ID */
  saveTripToBackend: (stats: {
    distanceKm: number;
    durationMin: number;
    avgSpeed: number;
    maxSpeed: number;
    speedViolations: number;
    drivingScore: number;
  }) => Promise<string | null>;
  /** Clear current trip and points */
  clearTrip: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  
  const [userLocation, setUserLocationState] = useState<AppLocation>(FALLBACK_JORDAN);
  const [startLocation, setStartLocationState] = useState<AppLocation>(FALLBACK_JORDAN);
  const [destination, setDestination] = useState<AppLocation | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [navigationProgress, setNavigationProgress] = useState(0);
  const [simulationLocation, setSimulationLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [recenterTrigger, setRecenterTrigger] = useState(0);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  
  // Trip tracking state
  const [currentTripId, setCurrentTripId] = useState<string | null>(null);
  const [tripPoints, setTripPoints] = useState<TripPointData[]>([]);
  
  const routeAbortRef = useRef<AbortController | null>(null);

  // Fetch real GPS / Location accurately using expo-location
  const refreshGpsLocation = async (silent: boolean = false): Promise<AppLocation | null> => {
    setIsLoadingLocation(true);
    const DEBUG_PREFIX = '[GPS]';
    try {
      // 1. Check & request foreground permissions
      let permission = await Location.getForegroundPermissionsAsync();
      console.log(`${DEBUG_PREFIX} Initial permission status:`, permission.status);
      
      if (permission.status !== 'granted') {
        permission = await Location.requestForegroundPermissionsAsync();
        console.log(`${DEBUG_PREFIX} After request permission status:`, permission.status);
      }

      if (permission.status !== 'granted') {
        const permErrorMsg = `Permission denied. Status: ${permission.status}`;
        console.warn(`${DEBUG_PREFIX} ${permErrorMsg}`);
        if (!silent) {
          Alert.alert(
            'إذن الموقع مطلوب',
            'يرجى السماح للتطبيق بالوصول إلى موقعك الجغرافي لتحديد مكانك الحالي على الخريطة.'
          );
        }
        return null;
      }

      // 2. Verify location services are enabled on Android
      const isServiceEnabled = await Location.hasServicesEnabledAsync();
      console.log(`${DEBUG_PREFIX} Location services enabled:`, isServiceEnabled);
      
      if (!isServiceEnabled) {
        if (Platform.OS === 'android') {
          console.log(`${DEBUG_PREFIX} Attempting to enable network provider on Android...`);
          try {
            await Location.enableNetworkProviderAsync();
            console.log(`${DEBUG_PREFIX} Network provider enabled successfully`);
          } catch (enableErr) {
            console.warn(`${DEBUG_PREFIX} Failed to enable network provider:`, enableErr);
            if (!silent) {
              Alert.alert(
                'خدمات الموقع معطلة',
                'يرجى تفعيل خدمات الموقع على جهازك والمحاولة مجدداً.'
              );
            }
            return null;
          }
        } else {
          if (!silent) {
            Alert.alert(
              'خدمات الموقع معطلة',
              'يرجى تفعيل خدمات الموقع على جهازك والمحاولة مجدداً.'
            );
          }
          return null;
        }
      }

      // 3. Obtain real GPS position from device / emulator using HIGHEST accuracy
      // Use explicit timeout of 20 seconds and highest available accuracy
      let pos: Location.LocationObject | null = null;
      const MAX_AGE_MS = 30000; // Reject locations older than 30 seconds
      
      try {
        console.log(`${DEBUG_PREFIX} Requesting current position with Highest accuracy and 20s timeout...`);
        // Determine best accuracy level available
        const accuracyLevel = Location.Accuracy.Highest || Location.Accuracy.High;
        
        pos = await Location.getCurrentPositionAsync({
          accuracy: accuracyLevel,
          timeInterval: 0,
          mayShowUserSettingsDialog: true,
        });
        
        if (pos && pos.timestamp) {
          const ageMs = Date.now() - pos.timestamp;
          console.log(`${DEBUG_PREFIX} Location obtained. Timestamp age: ${ageMs}ms, Accuracy: ${pos.coords.accuracy}m`);
          console.log(`${DEBUG_PREFIX} Coordinates: ${pos.coords.latitude}, ${pos.coords.longitude}`);
          
          // Reject obviously stale locations
          if (ageMs > MAX_AGE_MS) {
            console.warn(`${DEBUG_PREFIX} Location too old (${ageMs}ms > ${MAX_AGE_MS}ms), rejecting`);
            if (!silent) {
              Alert.alert(
                'الموقع قديم جداً',
                'تأخر موقعك الحالي أكثر من اللازم. يرجى المحاولة مجدداً.'
              );
            }
            return null;
          }
        }
      } catch (err) {
        console.error(`${DEBUG_PREFIX} getCurrentPositionAsync failed:`, err);
        console.log(`${DEBUG_PREFIX} Will NOT fall back to stale cached location. Requesting fresh data is required.`);
        
        // DO NOT fall back to getLastKnownPositionAsync - this returns stale/cached location
        // User experience is better with an error than with wrong location
        if (!silent) {
          Alert.alert(
            'تعذر تحديد الموقع',
            'تعذر الحصول على موقعك الحالي. تأكد من تشغيل GPS وتفعيل خدمات الموقع والمحاولة مجدداً.'
          );
        }
        return null;
      }

      if (
        !pos ||
        !pos.coords ||
        !Number.isFinite(pos.coords.latitude) ||
        !Number.isFinite(pos.coords.longitude)
      ) {
        console.error(`${DEBUG_PREFIX} Invalid coordinates received:`, pos?.coords);
        if (!silent) {
          Alert.alert(
            'تعذر تحديد الموقع',
            'تعذر الحصول على إحداثيات GPS الصحيحة. يرجى التأكد من تشغيل الـ GPS والمحاولة مجدداً.'
          );
        }
        return null;
      }

      const { latitude, longitude, accuracy } = pos.coords;
      console.log(`${DEBUG_PREFIX} Using location: Lat=${latitude}, Lon=${longitude}, Accuracy=${accuracy}m`);

      // 4. Reverse geocode for human-readable address label
      let addressText = 'الموقع الفعلي عبر GPS';
      try {
        const reverseResults = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });
        if (reverseResults && reverseResults.length > 0) {
          const rev = reverseResults[0];
          const parts = [rev.street, rev.district, rev.city, rev.country].filter(Boolean);
          if (parts.length > 0) {
            addressText = parts.join('، ');
            console.log(`${DEBUG_PREFIX} Geocoded address: ${addressText}`);
          }
        }
      } catch (geoErr) {
        console.warn(`${DEBUG_PREFIX} Reverse geocoding failed (non-blocking):`, geoErr);
      }

      const gpsLoc: AppLocation = {
        id: 'gps_current',
        name: 'موقعي الحالي',
        nameAr: 'موقعي الحالي',
        nameEn: 'My Current Location',
        latitude,
        longitude,
        address: addressText,
        descriptionAr: addressText,
        descriptionEn: addressText,
        isGps: true,
      };

      console.log(`${DEBUG_PREFIX} GPS location successfully determined. Updating state...`);
      setUserLocationState(gpsLoc);
      setStartLocationState((prev) => (prev.isGps || !destination ? gpsLoc : prev));
      return gpsLoc;
    } catch (e) {
      console.error(`${DEBUG_PREFIX} Unexpected error in refreshGpsLocation:`, e);
      if (!silent) {
        Alert.alert(
          'خطأ في تحديد الموقع',
          'حدث خطأ أثناء محاولة تحديد موقعك الجغرافي. يرجى المحاولة مرة أخرى.'
        );
      }
    } finally {
      setIsLoadingLocation(false);
    }
    return null;
  };

  useEffect(() => {
    refreshGpsLocation(true);
  }, []);

  // Fetch real road-based route from OSRM whenever start or destination changes
  useEffect(() => {
    // Cancel any in-flight request
    if (routeAbortRef.current) {
      routeAbortRef.current.abort();
    }

    if (!destination) {
      setRouteInfo(null);
      setIsLoadingRoute(false);
      return;
    }

    const controller = new AbortController();
    routeAbortRef.current = controller;
    setIsLoadingRoute(true);

    fetchRoute(
      { latitude: startLocation.latitude, longitude: startLocation.longitude },
      { latitude: destination.latitude, longitude: destination.longitude },
      controller.signal
    )
      .then((result) => {
        if (controller.signal.aborted) return;
        setRouteInfo({
          start: startLocation,
          destination,
          distanceKm: result.distanceKm,
          formattedDistance: formatDistance(result.distanceKm),
          estimatedMinutes: result.durationMinutes,
          formattedDuration: formatETA(result.durationMinutes),
          routeGeometry: result.points,
        });
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        console.warn('Route fetch failed, no route displayed:', err);
        // On error: clear route info so the map doesn't show stale data
        setRouteInfo(null);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoadingRoute(false);
      });

    return () => {
      controller.abort();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startLocation.latitude, startLocation.longitude, destination?.latitude, destination?.longitude]);


  const setUserLocation = (location: AppLocation) => {
    setUserLocationState(location);
  };

  const setStartLocation = (location: AppLocation) => {
    setStartLocationState(location);
  };

  const resetStartToGps = () => {
    setStartLocationState(userLocation);
  };

  const swapLocations = () => {
    if (destination) {
      const oldStart = startLocation;
      setStartLocationState(destination);
      setDestination(oldStart);
    }
  };

  const swapStartAndDestination = swapLocations;

  const clearRoute = () => {
    if (routeAbortRef.current) {
      routeAbortRef.current.abort();
    }
    setDestination(null);
    setRouteInfo(null);
    setIsLoadingRoute(false);
    setStartLocationState(userLocation);
    setIsNavigating(false);
    setNavigationProgress(0);
    setSimulationLocation(null);
  };

  const startNavigation = (tripId?: string) => {
    if (startLocation && destination) {
      setIsNavigating(true);
      setNavigationProgress(0);
      setSimulationLocation({
        latitude: startLocation.latitude,
        longitude: startLocation.longitude,
      });
      
      // If trip ID provided, initialize trip tracking
      if (tripId) {
        setCurrentTripId(tripId);
        setTripPoints([]);
        console.log(`[Trip] Starting trip ${tripId}`);
      }
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

  /** Add GPS point during drive */
  const addTripPoint = (latitude: number, longitude: number, speed: number) => {
    setTripPoints((prev) => [
      ...prev,
      {
        latitude,
        longitude,
        speed,
        timestamp: Date.now(),
      },
    ]);
  };

  /** Save trip to backend */
  const saveTripToBackend = async (stats: {
    distanceKm: number;
    durationMin: number;
    avgSpeed: number;
    maxSpeed: number;
    speedViolations: number;
    drivingScore: number;
  }): Promise<string | null> => {
    if (!token || !currentTripId) {
      console.error('[Trip] Missing token or trip ID');
      Alert.alert('خطأ', 'فشل حفظ الرحلة - بيانات مفقودة');
      return null;
    }

    try {
      console.log(`[Trip] Saving trip ${currentTripId} with ${tripPoints.length} points...`);

      // 1. Update trip with final statistics
      const endedAt = new Date().toISOString();
      await TripsService.updateTrip(
        currentTripId,
        {
          endedAt,
          distanceKm: stats.distanceKm,
          durationMin: stats.durationMin,
          avgSpeed: stats.avgSpeed,
          maxSpeed: stats.maxSpeed,
          speedViolations: stats.speedViolations,
          drivingScore: stats.drivingScore,
        },
        token
      );
      console.log(`[Trip] Trip ${currentTripId} updated with statistics`);

      // 2. Upload GPS points (batch operation)
      if (tripPoints.length > 0) {
        const pointsToUpload: TripPointRequest[] = tripPoints.map((p) => ({
          latitude: p.latitude,
          longitude: p.longitude,
          speed: p.speed,
          recordedAt: new Date(p.timestamp).toISOString(),
        }));

        const created = await TripsService.addTripPoints(currentTripId, pointsToUpload, token);
        console.log(`[Trip] Uploaded ${created} GPS points for trip ${currentTripId}`);
      }

      Alert.alert(
        'تم حفظ الرحلة! 🎉',
        `تم حفظ رحلتك بنجاح\n${stats.distanceKm.toFixed(2)} كم - ${stats.durationMin} دقيقة`,
        [{ text: 'حسناً' }]
      );

      clearTrip();
      return currentTripId;
    } catch (error) {
      console.error('[Trip] Failed to save trip:', error);
      Alert.alert(
        'خطأ في حفظ الرحلة',
        'فشل حفظ الرحلة. يرجى المحاولة مجدداً.'
      );
      return null;
    }
  };

  /** Clear current trip state */
  const clearTrip = () => {
    setCurrentTripId(null);
    setTripPoints([]);
  };

  return (
    <NavigationContext.Provider
      value={{
        currentGpsLocation: userLocation,
        userLocation,
        startLocation,
        destination,
        routeInfo,
        isLoadingRoute,
        isNavigating,
        navigationProgress,
        simulationLocation,
        recenterTrigger,
        isLoadingLocation,
        currentTripId,
        tripPoints,
        setUserLocation,
        setStartLocation,
        setDestination,
        resetStartToGps,
        swapLocations,
        swapStartAndDestination,
        clearRoute,
        startNavigation,
        endNavigation,
        triggerRecenter,
        refreshGpsLocation,
        setNavigationProgress,
        setSimulationLocation,
        addTripPoint,
        saveTripToBackend,
        clearTrip,
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
