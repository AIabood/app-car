/**
 * RoutePlanningHeader
 * Top floating card for Start Location (with change button) and Destination search selector.
 */

import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { typography } from '@/constants/typography';
import { AppLocation } from '@/types/navigation';

interface RoutePlanningHeaderProps {
  startLocation: AppLocation;
  destination: AppLocation | null;
  onChangeStartPress: () => void;
  onDestinationPress: () => void;
  onSwapPress: () => void;
  onClearPress: () => void;
}

export function RoutePlanningHeader({
  startLocation,
  destination,
  onChangeStartPress,
  onDestinationPress,
  onSwapPress,
  onClearPress,
}: RoutePlanningHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Start Location Row */}
        <View style={styles.row}>
          <View style={styles.startDot}>
            <View style={styles.innerStartDot} />
          </View>

          <View style={styles.infoCol}>
            <Text style={styles.label}>نقطة البداية</Text>
            <Text style={styles.locationName} numberOfLines={1}>
              {startLocation.nameAr}
            </Text>
          </View>

          <Pressable
            onPress={onChangeStartPress}
            style={({ pressed }) => [styles.changeButton, pressed && styles.pressed]}
          >
            <Text style={styles.changeText}>تغيير</Text>
          </Pressable>
        </View>

        {/* Divider with Connector & Swap */}
        <View style={styles.dividerRow}>
          <View style={styles.connectorLine} />
          <View style={styles.dividerHLine} />
          {destination && (
            <Pressable
              onPress={onSwapPress}
              style={({ pressed }) => [styles.swapButton, pressed && styles.pressed]}
              accessibilityLabel="تبديل نقطة البداية والوجهة"
            >
              <Ionicons name="swap-vertical" size={16} color={colors.primary} />
            </Pressable>
          )}
        </View>

        {/* Destination Row */}
        <Pressable
          onPress={onDestinationPress}
          style={({ pressed }) => [styles.row, styles.destRow, pressed && styles.pressed]}
        >
          <View style={styles.destDot}>
            <Ionicons name="location" size={14} color={colors.white} />
          </View>

          <View style={styles.infoCol}>
            <Text style={styles.label}>الوجهة</Text>
            <Text
              style={[
                styles.locationName,
                !destination && styles.placeholderText,
              ]}
              numberOfLines={1}
            >
              {destination ? destination.nameAr : 'إلى أين تريد الذهاب؟'}
            </Text>
          </View>

          {destination ? (
            <Pressable
              onPress={onClearPress}
              style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
            >
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </Pressable>
          ) : (
            <Ionicons name="search" size={20} color={colors.primary} />
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 100,
  },
  card: {
    backgroundColor: 'rgba(21, 27, 35, 0.94)',
    borderRadius: 20,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: '#000000',
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  row: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  destRow: {
    marginTop: 2,
  },
  startDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  innerStartDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
  },
  destDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  infoCol: {
    flex: 1,
    alignItems: 'flex-end',
    marginRight: spacing.xs,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '600',
  },
  locationName: {
    ...typography.bodyMedium,
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 14,
    marginTop: 1,
  },
  placeholderText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: 'normal',
  },
  changeButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    backgroundColor: 'rgba(0, 102, 255, 0.15)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 102, 255, 0.35)',
  },
  changeText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: 'bold',
  },
  dividerRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginVertical: 2,
    position: 'relative',
    height: 16,
  },
  connectorLine: {
    position: 'absolute',
    right: 18,
    top: -8,
    bottom: -8,
    width: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  dividerHLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginRight: 40,
    marginLeft: 32,
  },
  swapButton: {
    position: 'absolute',
    left: spacing.xs,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  iconBtn: {
    padding: 4,
  },
  pressed: {
    opacity: 0.75,
  },
});
