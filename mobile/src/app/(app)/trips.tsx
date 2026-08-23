/**
 * My Trips Screen
 * Smart driving history with summary, filters and grouped trip cards
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TripCard } from '@/components/TripCard';
import { MOCK_TRIPS, MOCK_SUMMARY } from '@/constants/mock-trips';
import { FilterPeriod } from '@/types/trips';
import { filterTrips, groupTripsByDate, formatTotalTime } from '@/utils/trip-utils';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { typography } from '@/constants/typography';

const FILTER_OPTIONS: { key: FilterPeriod; label: string }[] = [
  { key: 'all', label: 'الكل' },
  { key: 'today', label: 'اليوم' },
  { key: 'week', label: 'الأسبوع' },
  { key: 'month', label: 'الشهر' },
];

export default function TripsScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<FilterPeriod>('all');

  const filtered = useMemo(
    () => filterTrips(MOCK_TRIPS, activeFilter),
    [activeFilter]
  );

  const grouped = useMemo(() => groupTripsByDate(filtered), [filtered]);

  const handleTripPress = (tripId: string) => {
    router.push({ pathname: '/(app)/trip-details', params: { tripId } });
  };

  const scoreColor =
    MOCK_SUMMARY.overallSafetyScore >= 90
      ? colors.success
      : MOCK_SUMMARY.overallSafetyScore >= 75
      ? colors.info
      : colors.warning;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>رحلاتي 🚗</Text>
        <Text style={styles.headerSub}>سجل القيادة والأداء</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Driving Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            {/* Score */}
            <View style={styles.scoreBox}>
              <Text style={[styles.scoreValue, { color: scoreColor }]}>
                {MOCK_SUMMARY.overallSafetyScore}
              </Text>
              <Text style={styles.scoreSubLabel}>/ 100</Text>
              <Text style={styles.scoreTitle}>مؤشر الأمان</Text>
            </View>

            <View style={styles.summaryDivider} />

            {/* Stats */}
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Ionicons name="car-sport" size={16} color={colors.primary} />
                <Text style={styles.statValue}>{MOCK_SUMMARY.totalTrips}</Text>
                <Text style={styles.statLabel}>رحلة</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="trail-sign" size={16} color={colors.success} />
                <Text style={styles.statValue}>{MOCK_SUMMARY.totalDistanceKm}</Text>
                <Text style={styles.statLabel}>كم</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="time" size={16} color={colors.warning} />
                <Text style={styles.statValue}>
                  {formatTotalTime(MOCK_SUMMARY.totalDrivingMinutes)}
                </Text>
                <Text style={styles.statLabel}>وقت القيادة</Text>
              </View>
            </View>
          </View>

          {/* Score progress bar */}
          <View style={styles.progressBg}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${MOCK_SUMMARY.overallSafetyScore}%`,
                  backgroundColor: scoreColor,
                },
              ]}
            />
          </View>
        </View>

        {/* Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {FILTER_OPTIONS.map((opt) => {
            const active = activeFilter === opt.key;
            return (
              <Pressable
                key={opt.key}
                onPress={() => setActiveFilter(opt.key)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Grouped Trip List */}
        {grouped.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="car-outline" size={56} color={colors.border} />
            <Text style={styles.emptyTitle}>لا توجد رحلات</Text>
            <Text style={styles.emptySubtitle}>لم تقم بأي رحلات في هذه الفترة</Text>
          </View>
        ) : (
          grouped.map((group) => (
            <View key={group.label}>
              <Text style={styles.groupLabel}>{group.label}</Text>
              {group.trips.map((trip) => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  onPress={(t) => handleTripPress(t.id)}
                />
              ))}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surfaceLight,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.darkNavy,
  },
  headerTitle: {
    ...typography.heading2,
    color: colors.white,
    fontWeight: '900',
    textAlign: 'right',
  },
  headerSub: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'right',
    marginTop: 2,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  summaryCard: {
    backgroundColor: colors.darkNavy,
    borderRadius: 20,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: colors.darkNavy,
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  summaryRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  scoreBox: {
    alignItems: 'center',
    minWidth: 72,
  },
  scoreValue: {
    fontSize: 40,
    fontWeight: '900',
    lineHeight: 42,
  },
  scoreSubLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    fontWeight: '600',
    marginTop: -4,
  },
  scoreTitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  summaryDivider: {
    width: 1,
    height: 60,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: spacing.md,
  },
  statsGrid: {
    flex: 1,
    flexDirection: 'row-reverse',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    ...typography.bodyMedium,
    color: colors.white,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 2,
  },
  statLabel: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '600',
  },
  progressBg: {
    height: 5,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  filterRow: {
    flexDirection: 'row-reverse',
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.darkNavy,
    borderColor: colors.darkNavy,
  },
  chipText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: colors.white,
  },
  groupLabel: {
    ...typography.label,
    color: colors.textSecondary,
    textAlign: 'right',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.huge,
    gap: spacing.sm,
  },
  emptyTitle: {
    ...typography.heading3,
    color: colors.darkNavy,
    marginTop: spacing.sm,
  },
  emptySubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
