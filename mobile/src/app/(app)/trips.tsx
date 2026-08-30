/**
 * My Trips Screen
 * Smart driving history with summary, filters and grouped trip cards
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { TripCard } from '@/components/TripCard';
import { FilterPeriod } from '@/types/trips';
import { filterTrips, groupTripsByDate, formatTotalTime } from '@/utils/trip-utils';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { typography } from '@/constants/typography';
import { useAuth } from '@/context/AuthContext';
import { TripsService, TripResponse } from '@/services/trips.service';

const FILTER_OPTIONS: { key: FilterPeriod; label: string }[] = [
  { key: 'all', label: 'الكل' },
  { key: 'today', label: 'اليوم' },
  { key: 'week', label: 'الأسبوع' },
  { key: 'month', label: 'الشهر' },
];

export default function TripsScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const [activeFilter, setActiveFilter] = useState<FilterPeriod>('all');
  const [trips, setTrips] = useState<TripResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch trips from backend
  const fetchTrips = useCallback(async () => {
    if (!token) return;

    try {
      setError(null);
      const fetchedTrips = await TripsService.getTrips(token);
      setTrips(fetchedTrips);
    } catch (err) {
      console.error('Failed to fetch trips:', err);
      setError('فشل تحميل الرحلات');
    }
  }, [token]);

  // Initial load
  useEffect(() => {
    setLoading(true);
    fetchTrips().finally(() => setLoading(false));
  }, []);

  // Refetch when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchTrips();
    }, [fetchTrips])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTrips();
    setRefreshing(false);
  };

  // Convert TripResponse to internal Trip type for filtering/grouping
  const mockTrips = useMemo(() => trips.map((trip, idx) => ({
    id: `trip-${idx}`,
    date: new Date(trip.startedAt),
    distanceKm: trip.distanceKm ?? 0,
    durationMin: trip.durationMin ?? 0,
    durationMinutes: trip.durationMin ?? 0,
    status: 'completed' as const,
    safetyScore: trip.drivingScore ?? 75,
    speedViolations: trip.speedViolations,
    avgSpeed: trip.avgSpeed ?? 0,
    maxSpeed: trip.maxSpeed ?? 0,
    origin: 'Trip',
    destination: 'End',
  } as any)), [trips]);

  const filtered = useMemo(
    () => filterTrips(mockTrips, activeFilter),
    [activeFilter, mockTrips]
  );

  const grouped = useMemo(() => groupTripsByDate(filtered), [filtered]);

  // Calculate summary stats
  const summary = useMemo(() => {
    if (trips.length === 0) return null;
    
    const totalDistance = trips.reduce((sum, t) => sum + (t.distanceKm ?? 0), 0);
    const totalDuration = trips.reduce((sum, t) => sum + (t.durationMin ?? 0), 0);
    const avgScore = trips.reduce((sum, t) => sum + (t.drivingScore ?? 0), 0) / trips.length;
    
    return {
      totalTrips: trips.length,
      totalDistance: parseFloat(totalDistance.toFixed(1)),
      totalDuration,
      overallSafetyScore: Math.round(avgScore),
    };
  }, [trips]);

  const handleTripPress = (tripId: string) => {
    router.push({ pathname: '/(app)/trip-details', params: { tripId } });
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#0066FF" />
      </SafeAreaView>
    );
  }

  const scoreColor =
    summary && summary.overallSafetyScore >= 90
      ? colors.success
      : summary && summary.overallSafetyScore >= 75
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {error && (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={16} color={colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Driving Summary Card */}
        {summary && (
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              {/* Score */}
              <View style={styles.scoreBox}>
                <Text style={[styles.scoreValue, { color: scoreColor }]}>
                  {summary.overallSafetyScore}
                </Text>
                <Text style={styles.scoreSubLabel}>/ 100</Text>
                <Text style={styles.scoreTitle}>مؤشر الأمان</Text>
              </View>

              <View style={styles.summaryDivider} />

              {/* Stats */}
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Ionicons name="car-sport" size={16} color={colors.primary} />
                  <Text style={styles.statValue}>{summary.totalTrips}</Text>
                  <Text style={styles.statLabel}>رحلة</Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="trail-sign" size={16} color={colors.success} />
                  <Text style={styles.statValue}>{summary.totalDistance}</Text>
                  <Text style={styles.statLabel}>كم</Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="time" size={16} color={colors.warning} />
                  <Text style={styles.statValue}>
                    {formatTotalTime(summary.totalDuration)}
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
                    width: `${summary.overallSafetyScore}%`,
                    backgroundColor: scoreColor,
                  },
                ]}
              />
            </View>
          </View>
        )}

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
        {trips.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="car-outline" size={56} color={colors.border} />
            <Text style={styles.emptyTitle}>لا توجد رحلات</Text>
            <Text style={styles.emptySubtitle}>ابدأ برحلتك الأولى الآن!</Text>
          </View>
        ) : grouped.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="filter" size={56} color={colors.border} />
            <Text style={styles.emptyTitle}>لا توجد نتائج</Text>
            <Text style={styles.emptySubtitle}>جرب تغيير الفلتر</Text>
          </View>
        ) : (
          grouped.map((group) => (
            <View key={group.label}>
              <Text style={styles.groupLabel}>{group.label}</Text>
              {group.trips.map((trip, idx) => (
                <TripCard
                  key={`${group.label}-${idx}`}
                  trip={trip}
                  onPress={(t) => handleTripPress(trips[trips.length - idx - 1].id)}
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
  errorBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.sm,
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },
  errorText: {
    color: colors.error,
    flex: 1,
    textAlign: 'right',
    ...typography.caption,
  },
});
