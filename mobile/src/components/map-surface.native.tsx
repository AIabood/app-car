import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Pressable, Animated } from 'react-native';
import * as Location from 'expo-location';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { MOCK_LOCATIONS, MockLocation } from '@/constants/mock-locations';

const fallbackCenter: [number, number] = [46.6753, 24.7136];

type MapSurfaceProps = {
  searchQuery: string;
  selectedLocation?: MockLocation | null;
  isNavigating?: boolean;
  navigationProgress?: number; // 0 to 1
  onSelectLocation?: (loc: MockLocation) => void;
};

type MapboxModule = typeof import('@rnmapbox/maps');

function loadMapbox(): MapboxModule | null {
  if (Constants.appOwnership === 'expo') {
    return null;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mapbox = require('@rnmapbox/maps') as MapboxModule;
    mapbox.default.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN ?? '');
    return mapbox;
  } catch {
    return null;
  }
}

export default function MapSurface({
  searchQuery,
  selectedLocation,
  isNavigating = false,
  navigationProgress = 0,
  onSelectLocation,
}: MapSurfaceProps) {
  const [mapbox] = useState(loadMapbox);
  const [center, setCenter] = useState(fallbackCenter);
  const [permissionGranted, setPermissionGranted] = useState(false);

  // Animation values for mock map car moving
  const [carAnimX] = useState(() => new Animated.Value(50));
  const [carAnimY] = useState(() => new Animated.Value(70));
  const [pulseAnim] = useState(() => new Animated.Value(1));

  // Base user location for mock map
  const userMockX = 50;
  const userMockY = 70;

  useEffect(() => {
    let active = true;

    Location.requestForegroundPermissionsAsync().then(({ status }) => {
      if (active) setPermissionGranted(status === Location.PermissionStatus.GRANTED);
    });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (searchQuery === 'my location' && permissionGranted) {
      Location.getCurrentPositionAsync({}).then(({ coords }) => {
        setCenter([coords.longitude, coords.latitude]);
      });
    }
  }, [permissionGranted, searchQuery]);

  // Pulse animation for user/car pin
  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.4,
          duration: 1200,
          useNativeDriver: false,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1.0,
          duration: 1200,
          useNativeDriver: false,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [pulseAnim]);

  // Update car position along route based on progress
  useEffect(() => {
    if (isNavigating && selectedLocation) {
      const targetX = selectedLocation.x;
      const targetY = selectedLocation.y;

      const currentX = userMockX + (targetX - userMockX) * navigationProgress;
      const currentY = userMockY + (targetY - userMockY) * navigationProgress;

      Animated.spring(carAnimX, {
        toValue: currentX,
        useNativeDriver: false,
        friction: 8,
      }).start();

      Animated.spring(carAnimY, {
        toValue: currentY,
        useNativeDriver: false,
        friction: 8,
      }).start();
    } else {
      // Reset car back to user home position
      Animated.spring(carAnimX, {
        toValue: userMockX,
        useNativeDriver: false,
      }).start();
      Animated.spring(carAnimY, {
        toValue: userMockY,
        useNativeDriver: false,
      }).start();
    }
  }, [isNavigating, navigationProgress, selectedLocation, carAnimX, carAnimY]);

  if (!mapbox) {
    // Beautiful interactive Mock Map Dashboard
    return (
      <View style={styles.mockContainer}>
        {/* Sleek Grid/Grid Lines */}
        <View style={styles.gridOverlay}>
          {/* Vertical roads */}
          <View style={[styles.roadLine, { left: '15%', height: '100%', width: 8 }]} />
          <View style={[styles.roadLine, { left: '35%', height: '100%', width: 14 }]} />
          <View style={[styles.roadLine, { left: '60%', height: '100%', width: 10 }]} />
          <View style={[styles.roadLine, { left: '85%', height: '100%', width: 8 }]} />

          {/* Horizontal roads */}
          <View style={[styles.roadLine, { top: '20%', width: '100%', height: 8 }]} />
          <View style={[styles.roadLine, { top: '45%', width: '100%', height: 16 }]} />
          <View style={[styles.roadLine, { top: '75%', width: '100%', height: 10 }]} />

          {/* Dotted lanes */}
          <View style={[styles.dashedRoadLine, { top: '46.5%', width: '100%', height: 1 }]} />
          <View style={[styles.dashedRoadLine, { left: '36.5%', height: '100%', width: 1 }]} />
        </View>

        {/* Route Line if destination is selected */}
        {selectedLocation && (
          <View style={styles.routeContainer}>
            <SvgRouteLine
              startX={userMockX}
              startY={userMockY}
              endX={selectedLocation.x}
              endY={selectedLocation.y}
            />
          </View>
        )}

        {/* Render Landmarks */}
        {MOCK_LOCATIONS.map((loc) => {
          const isSelected = selectedLocation?.id === loc.id;
          return (
            <Pressable
              key={loc.id}
              onPress={() => onSelectLocation && onSelectLocation(loc)}
              style={[
                styles.landmarkPin,
                { left: `${loc.x}%`, top: `${loc.y}%` },
                isSelected && styles.landmarkPinSelected,
              ]}
            >
              <View style={[styles.landmarkDot, isSelected && styles.landmarkDotSelected]}>
                <Ionicons
                  name={loc.id === '3' ? 'airplane' : 'location'}
                  size={isSelected ? 16 : 12}
                  color={colors.white}
                />
              </View>
              <View style={styles.landmarkLabelContainer}>
                <Text style={styles.landmarkText}>{loc.nameAr}</Text>
                {isSelected && (
                  <Text style={styles.landmarkSubtext}>{loc.distance}</Text>
                )}
              </View>
            </Pressable>
          );
        })}

        {/* User / Car Dot */}
        <Animated.View
          style={[
            styles.userDotContainer,
            {
              left: carAnimX.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              }),
              top: carAnimY.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        >
          {/* Animated Pulsing Ring */}
          <Animated.View
            style={[
              styles.pulseRing,
              {
                transform: [{ scale: pulseAnim }],
                opacity: pulseAnim.interpolate({
                  inputRange: [1, 1.4],
                  outputRange: [0.6, 0],
                }),
              },
            ]}
          />
          <View style={[styles.userDot, isNavigating && styles.userDotNavigating]}>
            <Ionicons
              name={isNavigating ? 'car-sport' : 'navigate'}
              size={18}
              color={colors.white}
              style={!isNavigating && { transform: [{ rotate: '45deg' }] }}
            />
          </View>
        </Animated.View>

        {/* Riyadh Badge */}
        <View style={styles.regionBadge}>
          <Ionicons name="map" size={14} color={colors.primary} />
          <Text style={styles.regionText}>محاكاة خارطة الرياض</Text>
        </View>
      </View>
    );
  }

  // Normal Mapbox rendering
  const MapView = mapbox.default.MapView;
  const Camera = mapbox.default.Camera;
  const UserLocation = mapbox.default.UserLocation;

  return (
    <View style={styles.container}>
      <MapView style={styles.map} styleURL={mapbox.default.StyleURL.Street}>
        <Camera centerCoordinate={center} zoomLevel={12} animationDuration={500} />
        {permissionGranted && <UserLocation visible showsUserHeadingIndicator />}
      </MapView>
    </View>
  );
}

// Simple absolute positioned route drawer for mock grid
function SvgRouteLine({ startX, startY, endX, endY }: { startX: number; startY: number; endX: number; endY: number }) {
  // We simulate a path using simple divs or an absolute-positioned path
  // Since we don't have SVG package, we can draw a vertical then horizontal line, or a angled line
  const minX = Math.min(startX, endX);
  const maxX = Math.max(startX, endX);
  const minY = Math.min(startY, endY);
  const maxY = Math.max(startY, endY);

  const isVerticalFirst = startX > endX;

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Route segment 1 */}
      <View
        style={[
          styles.routeSegment,
          isVerticalFirst
            ? {
                left: `${startX}%`,
                top: `${minY}%`,
                width: 4,
                height: `${maxY - minY}%`,
              }
            : {
                left: `${minX}%`,
                top: `${startY}%`,
                width: `${maxX - minX}%`,
                height: 4,
              },
        ]}
      />
      {/* Route segment 2 */}
      <View
        style={[
          styles.routeSegment,
          isVerticalFirst
            ? {
                left: `${minX}%`,
                top: `${endY}%`,
                width: `${maxX - minX}%`,
                height: 4,
              }
            : {
                left: `${endX}%`,
                top: `${minY}%`,
                width: 4,
                height: `${maxY - minY}%`,
              },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  mockContainer: {
    flex: 1,
    backgroundColor: '#0F1419', // Dark Navy Dashboard look
    overflow: 'hidden',
    position: 'relative',
  },
  gridOverlay: {
    ...StyleSheet.absoluteFill,
    opacity: 0.15,
  },
  roadLine: {
    position: 'absolute',
    backgroundColor: '#4B5563',
    borderRadius: 4,
  },
  dashedRoadLine: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: '#9CA3AF',
    borderStyle: 'dashed',
  },
  routeContainer: {
    ...StyleSheet.absoluteFill,
  },
  routeSegment: {
    position: 'absolute',
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
    opacity: 0.8,
    borderRadius: 2,
  },
  landmarkPin: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    transform: [{ translateX: -10 }, { translateY: -10 }],
    zIndex: 10,
  },
  landmarkPinSelected: {
    zIndex: 20,
  },
  landmarkDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#374151',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
    shadowColor: colors.black,
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  landmarkDotSelected: {
    backgroundColor: colors.success,
    width: 30,
    height: 30,
    borderRadius: 15,
    borderColor: colors.white,
  },
  landmarkLabelContainer: {
    marginLeft: 6,
    backgroundColor: 'rgba(15, 20, 25, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  landmarkText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '600',
  },
  landmarkSubtext: {
    color: colors.success,
    fontSize: 9,
    fontWeight: 'bold',
    marginTop: 1,
  },
  userDotContainer: {
    position: 'absolute',
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateX: -20 }, { translateY: -20 }],
    zIndex: 30,
  },
  userDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.white,
    shadowColor: colors.primary,
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 5,
  },
  userDotNavigating: {
    backgroundColor: colors.success,
    shadowColor: colors.success,
  },
  pulseRing: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  regionBadge: {
    position: 'absolute',
    top: 90,
    left: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 20, 25, 0.9)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 6,
    zIndex: 5,
  },
  regionText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 10,
    fontWeight: '600',
  },
});