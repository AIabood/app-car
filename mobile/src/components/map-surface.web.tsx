/**
 * MapSurface — Web Fallback
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { AppLocation } from '@/types/navigation';

export const FALLBACK_LOCATION = {
  latitude: 24.7136,
  longitude: 46.6753,
};

export type Coordinates = {
  latitude: number;
  longitude: number;
};

type MapSurfaceProps = {
  startLocation: AppLocation;
  destination?: AppLocation | null;
  simulationLocation?: Coordinates | null;
  isNavigating?: boolean;
  onSelectLocation?: (loc: AppLocation) => void;
  recenterTrigger?: number;
};

export default function MapSurface({ isNavigating }: MapSurfaceProps) {
  return (
    <View style={styles.mockContainer}>
      <View style={styles.gridOverlay}>
        <View style={[styles.roadLine, { left: '15%', height: '100%', width: 8 }]} />
        <View style={[styles.roadLine, { left: '35%', height: '100%', width: 14 }]} />
        <View style={[styles.roadLine, { left: '60%', height: '100%', width: 10 }]} />
        <View style={[styles.roadLine, { left: '85%', height: '100%', width: 8 }]} />
        <View style={[styles.roadLine, { top: '20%', width: '100%', height: 8 }]} />
        <View style={[styles.roadLine, { top: '45%', width: '100%', height: 16 }]} />
        <View style={[styles.roadLine, { top: '75%', width: '100%', height: 10 }]} />
      </View>

      <View style={[styles.userDot, isNavigating && styles.userDotNavigating]}>
        <Ionicons
          name={isNavigating ? 'car-sport' : 'navigate'}
          size={18}
          color={colors.white}
        />
      </View>

      <View style={styles.regionBadge}>
        <Ionicons name="map" size={14} color={colors.primary} />
        <Text style={styles.regionText}>خارطة الرياض (الويب)</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mockContainer: {
    flex: 1,
    backgroundColor: '#0F1419',
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
  userDot: {
    position: 'absolute',
    left: '48%',
    top: '68%',
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.white,
  },
  userDotNavigating: {
    backgroundColor: colors.success,
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