/**
 * TripCard Component
 * Represents a single trip in the list with route visualization
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Trip } from '@/types/trips';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { typography } from '@/constants/typography';
import {
  formatDuration,
  formatTime,
  getDrivingStatusLabel,
  getDrivingStatusColor,
  getSafetyScoreColor,
} from '@/utils/trip-utils';

interface TripCardProps {
  trip: Trip;
  onPress: (trip: Trip) => void;
}

export function TripCard({ trip, onPress }: TripCardProps) {
  const statusColor = getDrivingStatusColor(trip.drivingStatus);
  const scoreColor = getSafetyScoreColor(trip.safetyScore);

  return (
    <Pressable
      onPress={() => onPress(trip)}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      {/* Left: Route Visualization */}
      <View style={styles.routeColumn}>
        <View style={styles.routeDot} />
        <View style={styles.routeLine} />
        <View style={[styles.routeDotDest, { backgroundColor: statusColor }]} />
      </View>

      {/* Center: Trip Details */}
      <View style={styles.detailsColumn}>
        <Text style={styles.originLabel} numberOfLines={1}>{trip.origin.name}</Text>
        <View style={styles.middleRow}>
          <Text style={styles.distanceText}>{trip.distanceKm} كم</Text>
          <Text style={styles.durationText}>{formatDuration(trip.durationMinutes)}</Text>
        </View>
        <Text style={styles.destLabel} numberOfLines={1}>{trip.destination.name}</Text>

        <View style={styles.metaRow}>
          <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>
              {getDrivingStatusLabel(trip.drivingStatus)}
            </Text>
          </View>
          <Text style={styles.timeText}>{formatTime(trip.date)}</Text>
        </View>
      </View>

      {/* Right: Safety Score */}
      <View style={styles.scoreColumn}>
        <Text style={[styles.scoreNumber, { color: scoreColor }]}>{trip.safetyScore}</Text>
        <Text style={styles.scoreLabel}>درجة</Text>
        <Ionicons name="chevron-back" size={16} color={colors.textSecondary} style={styles.chevron} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row-reverse',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.sm,
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardPressed: {
    opacity: 0.85,
    backgroundColor: colors.surfaceLight,
  },
  routeColumn: {
    width: 20,
    alignItems: 'center',
    marginLeft: spacing.md,
    paddingVertical: 2,
  },
  routeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.darkNavy,
    borderWidth: 2,
    borderColor: colors.border,
  },
  routeLine: {
    width: 2,
    flex: 1,
    minHeight: 24,
    backgroundColor: colors.border,
    marginVertical: 2,
    borderRadius: 1,
  },
  routeDotDest: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  detailsColumn: {
    flex: 1,
    alignItems: 'flex-end',
  },
  originLabel: {
    ...typography.bodyMedium,
    color: colors.darkNavy,
    fontWeight: '600',
    textAlign: 'right',
  },
  middleRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.sm,
    marginVertical: 4,
  },
  distanceText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  durationText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  destLabel: {
    ...typography.bodyMedium,
    color: colors.darkNavy,
    fontWeight: '600',
    textAlign: 'right',
  },
  metaRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    width: '100%',
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  timeText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  scoreColumn: {
    alignItems: 'center',
    marginRight: spacing.md,
    minWidth: 40,
  },
  scoreNumber: {
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 24,
  },
  scoreLabel: {
    fontSize: 9,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  chevron: {
    marginTop: spacing.xs,
  },
});
