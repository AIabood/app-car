/**
 * RouteInfoSheet
 * Bottom sheet displaying route summary, distance, estimated travel time (ETA),
 * and the prominent "Start Drive" button.
 */

import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { typography } from '@/constants/typography';
import { RouteInfo } from '@/types/navigation';

interface RouteInfoSheetProps {
  routeInfo: RouteInfo;
  onStartDrive: () => void;
  onCancel: () => void;
}

export function RouteInfoSheet({
  routeInfo,
  onStartDrive,
  onCancel,
}: RouteInfoSheetProps) {
  return (
    <View style={styles.container}>
      <View style={styles.sheetCard}>
        {/* Header: Locations Path */}
        <View style={styles.routeHeader}>
          <View style={styles.pointRow}>
            <View style={styles.greenDot} />
            <Text style={styles.pointName} numberOfLines={1}>
              {routeInfo.start.nameAr}
            </Text>
          </View>

          <View style={styles.arrowContainer}>
            <Ionicons name="arrow-down" size={14} color="rgba(255, 255, 255, 0.4)" />
          </View>

          <View style={styles.pointRow}>
            <View style={styles.redDot} />
            <Text style={styles.pointName} numberOfLines={1}>
              {routeInfo.destination.nameAr}
            </Text>
          </View>
        </View>

        {/* Stats Grid: Distance & ETA */}
        <View style={styles.statsRow}>
          {/* Distance */}
          <View style={styles.statBox}>
            <View style={styles.statIconBadge}>
              <Ionicons name="analytics" size={18} color="#38BDF8" />
            </View>
            <View style={styles.statTexts}>
              <Text style={styles.statValue}>{routeInfo.formattedDistance}</Text>
              <Text style={styles.statLabel}>المسافة التقريبية</Text>
            </View>
          </View>

          <View style={styles.statDivider} />

          {/* ETA */}
          <View style={styles.statBox}>
            <View style={styles.statIconBadge}>
              <Ionicons name="time" size={18} color="#34D399" />
            </View>
            <View style={styles.statTexts}>
              <Text style={styles.statValue}>{routeInfo.formattedDuration}</Text>
              <Text style={styles.statLabel}>الوقت المقدر</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsRow}>
          <Pressable
            onPress={onStartDrive}
            style={({ pressed }) => [styles.startDriveBtn, pressed && styles.pressed]}
          >
            <Ionicons name="car-sport" size={22} color={colors.white} style={{ marginLeft: 8 }} />
            <Text style={styles.startDriveText}>ابدأ القيادة</Text>
          </Pressable>

          <Pressable
            onPress={onCancel}
            style={({ pressed }) => [styles.cancelBtn, pressed && styles.pressed]}
          >
            <Ionicons name="close" size={20} color={colors.textSecondary} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 95,
  },
  sheetCard: {
    backgroundColor: 'rgba(17, 24, 39, 0.96)',
    borderRadius: 24,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: '#000000',
    shadowOpacity: 0.45,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  routeHeader: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  pointRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  greenDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
    marginLeft: spacing.sm,
  },
  redDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444',
    marginLeft: spacing.sm,
  },
  arrowContainer: {
    marginRight: 4,
    marginVertical: 2,
    alignItems: 'flex-end',
  },
  pointName: {
    ...typography.bodyMedium,
    color: colors.white,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'right',
  },
  statsRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  statBox: {
    flex: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  statIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  statTexts: {
    alignItems: 'flex-end',
    flex: 1,
  },
  statValue: {
    ...typography.heading3,
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: spacing.sm,
  },
  actionsRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.sm,
  },
  startDriveBtn: {
    flex: 1,
    height: 52,
    backgroundColor: '#0066FF',
    borderRadius: 16,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0066FF',
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 6,
  },
  startDriveText: {
    ...typography.bodyMedium,
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelBtn: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  pressed: {
    opacity: 0.8,
  },
});
