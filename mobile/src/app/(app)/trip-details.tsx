/**
 * Trip Details Screen
 * Comprehensive breakdown of a single trip with map placeholder and stats
 */

import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MOCK_TRIPS } from '@/constants/mock-trips';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { typography } from '@/constants/typography';
import {
  formatDuration,
  formatTime,
  formatDateAr,
  getDrivingStatusLabel,
  getDrivingStatusColor,
  getSafetyScoreColor,
} from '@/utils/trip-utils';

export default function TripDetailsScreen() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const router = useRouter();

  const trip = useMemo(
    () => MOCK_TRIPS.find((t) => t.id === tripId),
    [tripId]
  );

  if (!trip) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.notFound}>
          <Ionicons name="alert-circle-outline" size={56} color={colors.error} />
          <Text style={styles.notFoundText}>لم يتم العثور على الرحلة</Text>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>رجوع</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const statusColor = getDrivingStatusColor(trip.drivingStatus);
  const scoreColor = getSafetyScoreColor(trip.safetyScore);

  const handleReplay = () => {
    Alert.alert(
      'إعادة تشغيل الرحلة 🗺️',
      'هذه الميزة قيد التطوير. ستتمكن قريباً من مشاهدة مسار رحلتك بالكامل بشكل تفاعلي.',
      [{ text: 'حسناً' }]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton} accessibilityLabel="Go back">
          <Ionicons name="chevron-forward" size={24} color={colors.white} />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>تفاصيل الرحلة</Text>
          <Text style={styles.headerSub}>{formatDateAr(trip.date)} - {formatTime(trip.date)}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Mock Map Placeholder */}
        <View style={styles.mapPlaceholder}>
          <View style={styles.mapGrid} />

          {/* Origin Pin */}
          <View style={[styles.mapPin, { top: '65%', left: '40%' }]}>
            <View style={styles.pinDot} />
          </View>

          {/* Destination Pin */}
          <View style={[styles.mapPin, { top: '22%', left: '55%' }]}>
            <View style={[styles.pinDot, { backgroundColor: statusColor }]} />
          </View>

          {/* Map label */}
          <View style={styles.mapLabel}>
            <Ionicons name="map" size={13} color={colors.primary} />
            <Text style={styles.mapLabelText}>معاينة المسار</Text>
          </View>
        </View>

        {/* Route Summary */}
        <View style={styles.routeCard}>
          {/* Origin */}
          <View style={styles.routeRow}>
            <View style={styles.routeIconCol}>
              <View style={styles.routeOriginDot} />
            </View>
            <View style={styles.routeTextCol}>
              <Text style={styles.routePointLabel}>نقطة الانطلاق</Text>
              <Text style={styles.routePointName}>{trip.origin.name}</Text>
              {trip.origin.address && (
                <Text style={styles.routePointAddress}>{trip.origin.address}</Text>
              )}
            </View>
          </View>

          <View style={styles.routeConnector}>
            <View style={styles.routeConnectorLine} />
            <View style={styles.routeConnectorBadge}>
              <Text style={styles.routeConnectorText}>
                {trip.distanceKm} كم · {formatDuration(trip.durationMinutes)}
              </Text>
            </View>
            <View style={styles.routeConnectorLine} />
          </View>

          {/* Destination */}
          <View style={styles.routeRow}>
            <View style={styles.routeIconCol}>
              <View style={[styles.routeDestDot, { backgroundColor: statusColor }]} />
            </View>
            <View style={styles.routeTextCol}>
              <Text style={styles.routePointLabel}>الوجهة</Text>
              <Text style={styles.routePointName}>{trip.destination.name}</Text>
              {trip.destination.address && (
                <Text style={styles.routePointAddress}>{trip.destination.address}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Safety Score Banner */}
        <View style={[styles.scoreBanner, { borderColor: scoreColor }]}>
          <View style={styles.scoreBannerLeft}>
            <Text style={[styles.scoreBannerNumber, { color: scoreColor }]}>{trip.safetyScore}</Text>
            <Text style={styles.scoreBannerLabel}>/ 100</Text>
          </View>
          <View>
            <Text style={styles.scoreBannerTitle}>مؤشر القيادة الآمنة</Text>
            <View style={[styles.statusPill, { backgroundColor: `${statusColor}15` }]}>
              <Text style={[styles.statusPillText, { color: statusColor }]}>
                {getDrivingStatusLabel(trip.drivingStatus)}
              </Text>
            </View>
          </View>
        </View>

        {/* Stats Grid */}
        <Text style={styles.sectionTitle}>إحصائيات الرحلة</Text>
        <View style={styles.statsGrid}>
          <StatCell icon="speedometer" label="متوسط السرعة" value={`${trip.averageSpeedKmh} كم/س`} color={colors.primary} />
          <StatCell icon="flash" label="أقصى سرعة" value={`${trip.maxSpeedKmh} كم/س`} color={colors.error} />
          <StatCell icon="time" label="مدة الرحلة" value={formatDuration(trip.durationMinutes)} color={colors.info} />
          <StatCell icon="trail-sign" label="المسافة" value={`${trip.distanceKm} كم`} color={colors.success} />
        </View>

        {/* Events Section */}
        <Text style={styles.sectionTitle}>أحداث الطريق</Text>
        <View style={styles.eventsCard}>
          <EventRow
            icon="warning"
            label="تحذيرات السرعة"
            value={trip.speedWarnings}
            color={trip.speedWarnings === 0 ? colors.success : colors.warning}
          />
          <EventRow
            icon="camera"
            label="كاميرات المرور"
            value={trip.camerasEncountered}
            color={colors.info}
          />
          <EventRow
            icon="alert-circle"
            label="أحداث الطريق"
            value={trip.roadEvents}
            color={trip.roadEvents === 0 ? colors.success : colors.error}
          />
        </View>

        {/* Replay Button */}
        <Pressable
          onPress={handleReplay}
          style={({ pressed }) => [styles.replayBtn, pressed && styles.replayBtnPressed]}
        >
          <Ionicons name="play-circle" size={22} color={colors.white} style={{ marginLeft: spacing.sm }} />
          <Text style={styles.replayBtnText}>إعادة تشغيل الرحلة</Text>
          <View style={styles.comingSoonBadge}>
            <Text style={styles.comingSoonText}>قريباً</Text>
          </View>
        </Pressable>

      </ScrollView>
    </SafeAreaView>
  );
}

function StatCell({
  icon,
  label,
  value,
  color,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <View style={statStyles.cell}>
      <View style={[statStyles.iconBox, { backgroundColor: `${color}12` }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={statStyles.value}>{value}</Text>
      <Text style={statStyles.label}>{label}</Text>
    </View>
  );
}

function EventRow({
  icon,
  label,
  value,
  color,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <View style={eventStyles.row}>
      <View style={[eventStyles.iconBox, { backgroundColor: `${color}12` }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text style={eventStyles.label}>{label}</Text>
      <Text style={[eventStyles.value, { color }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surfaceLight,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  notFoundText: {
    ...typography.heading3,
    color: colors.text,
  },
  backBtn: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: 12,
  },
  backBtnText: {
    color: colors.white,
    fontWeight: 'bold',
  },
  header: {
    backgroundColor: colors.darkNavy,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.md,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    alignItems: 'flex-end',
  },
  headerTitle: {
    ...typography.heading3,
    color: colors.white,
    fontWeight: '800',
  },
  headerSub: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  mapPlaceholder: {
    height: 180,
    backgroundColor: '#0F1419',
    borderRadius: 20,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  mapGrid: {
    ...StyleSheet.absoluteFill,
    opacity: 0.15,
  },
  mapPin: {
    position: 'absolute',
    alignItems: 'center',
  },
  pinDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.darkNavy,
    borderWidth: 2.5,
    borderColor: colors.white,
    shadowColor: colors.black,
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
  mapLabel: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: 'rgba(15,20,25,0.85)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    gap: 4,
  },
  mapLabelText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    fontWeight: '600',
  },
  routeCard: {
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.black,
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  routeRow: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  routeIconCol: {
    alignItems: 'center',
    paddingTop: 4,
  },
  routeOriginDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.darkNavy,
    borderWidth: 2,
    borderColor: colors.border,
  },
  routeDestDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  routeTextCol: {
    flex: 1,
    alignItems: 'flex-end',
  },
  routePointLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '700',
    marginBottom: 2,
  },
  routePointName: {
    ...typography.bodyMedium,
    color: colors.darkNavy,
    fontWeight: '700',
  },
  routePointAddress: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  routeConnector: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginVertical: spacing.sm,
    paddingRight: 5, // align with route dots column
  },
  routeConnectorLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  routeConnectorBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    backgroundColor: colors.lightGray,
    borderRadius: 20,
    marginHorizontal: spacing.sm,
  },
  routeConnectorText: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  scoreBanner: {
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1.5,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.md,
    shadowColor: colors.black,
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  scoreBannerLeft: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  scoreBannerNumber: {
    fontSize: 44,
    fontWeight: '900',
    lineHeight: 46,
  },
  scoreBannerLabel: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginBottom: 4,
    fontWeight: '600',
  },
  scoreBannerTitle: {
    ...typography.bodyMedium,
    color: colors.darkNavy,
    fontWeight: '700',
    textAlign: 'right',
    marginBottom: spacing.xs,
  },
  statusPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-end',
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '800',
  },
  sectionTitle: {
    ...typography.label,
    color: colors.textSecondary,
    textAlign: 'right',
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  statsGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  eventsCard: {
    backgroundColor: colors.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  replayBtn: {
    height: 52,
    backgroundColor: colors.darkNavy,
    borderRadius: 14,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    shadowColor: colors.darkNavy,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  replayBtnPressed: {
    opacity: 0.8,
  },
  replayBtnText: {
    color: colors.white,
    ...typography.bodyMedium,
    fontWeight: 'bold',
  },
  comingSoonBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 10,
  },
  comingSoonText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    fontWeight: '700',
  },
});

const statStyles = StyleSheet.create({
  cell: {
    width: '47%',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.black,
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
    gap: 4,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  value: {
    ...typography.bodyMedium,
    color: colors.darkNavy,
    fontWeight: '800',
    textAlign: 'center',
  },
  label: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
  },
});

const eventStyles = StyleSheet.create({
  row: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    flex: 1,
    ...typography.bodyMedium,
    color: colors.darkNavy,
    textAlign: 'right',
  },
  value: {
    fontSize: 20,
    fontWeight: '900',
    minWidth: 28,
    textAlign: 'center',
  },
});
