/**
 * Profile Screen
 * Premium user profile screen with Safety Score, stats, and settings in Arabic
 */

import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/layout/Screen';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { typography } from '@/constants/typography';

interface MenuOption {
  id: string;
  labelAr: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)');
  };

  const handleMenuPress = (label: string) => {
    alert(`تم فتح قسم: ${label}`);
  };

  const menuOptions: MenuOption[] = [
    {
      id: 'settings',
      labelAr: 'الإعدادات',
      icon: 'settings-outline',
      onPress: () => handleMenuPress('الإعدادات'),
    },
    {
      id: 'notifications',
      labelAr: 'التنبيهات',
      icon: 'notifications-outline',
      onPress: () => handleMenuPress('التنبيهات'),
    },
    {
      id: 'privacy',
      labelAr: 'الخصوصية والأمان',
      icon: 'shield-checkmark-outline',
      onPress: () => handleMenuPress('الخصوصية والأمان'),
    },
    {
      id: 'help',
      labelAr: 'المساعدة والدعم',
      icon: 'help-circle-outline',
      onPress: () => handleMenuPress('المساعدة والدعم'),
    },
  ];

  const displayName = user?.name || 'عبدالله';
  const displayEmail = user?.email || 'abdullah@appcar.com';

  return (
    <Screen scrollable={true} backgroundColor={colors.surfaceLight}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={44} color={colors.white} />
          </View>
          <Text style={styles.userName}>{displayName}</Text>
          <Text style={styles.userEmail}>{displayEmail}</Text>
        </View>

        {/* Safety Score Section */}
        <View style={styles.scoreCard}>
          <View style={styles.scoreHeader}>
            <Ionicons name="shield-checkmark" size={22} color={colors.success} />
            <Text style={styles.scoreTitle}>مؤشر القيادة الآمنة</Text>
          </View>
          <View style={styles.scoreValueContainer}>
            <Text style={styles.scoreSubtext}>/ 100</Text>
            <Text style={styles.scoreNumber}>88</Text>
          </View>
          {/* Progress Bar */}
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: '88%' }]} />
          </View>
          <Text style={styles.scoreFeedback}>قيادتك ممتازة وآمنة جداً! استمر على هذا الأداء 👍</Text>
        </View>

        {/* Driving Stats Section */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>إحصائيات القيادة</Text>
          <View style={styles.statsGrid}>
            {/* Stat 1 */}
            <View style={styles.statCard}>
              <View style={[styles.statIconCircle, { backgroundColor: 'rgba(0, 122, 255, 0.1)' }]}>
                <Ionicons name="car-sport" size={22} color={colors.primary} />
              </View>
              <Text style={styles.statLabel}>إجمالي الرحلات</Text>
              <Text style={styles.statValue}>24</Text>
            </View>

            {/* Stat 2 */}
            <View style={styles.statCard}>
              <View style={[styles.statIconCircle, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                <Ionicons name="trail-sign" size={22} color={colors.success} />
              </View>
              <Text style={styles.statLabel}>إجمالي المسافة</Text>
              <Text style={styles.statValue}>426 كم</Text>
            </View>

            {/* Stat 3 */}
            <View style={styles.statCard}>
              <View style={[styles.statIconCircle, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
                <Ionicons name="time" size={22} color={colors.warning} />
              </View>
              <Text style={styles.statLabel}>وقت القيادة</Text>
              <Text style={styles.statValue}>18س و 32د</Text>
            </View>
          </View>
        </View>

        {/* Settings Menu Options */}
        <View style={styles.menuSection}>
          {menuOptions.map((opt) => (
            <Pressable
              key={opt.id}
              onPress={opt.onPress}
              style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
            >
              <Ionicons name="chevron-back" size={18} color={colors.textSecondary} />
              <View style={styles.menuItemContent}>
                <Text style={styles.menuItemLabel}>{opt.labelAr}</Text>
                <View style={styles.menuIconContainer}>
                  <Ionicons name={opt.icon} size={20} color={colors.darkNavy} />
                </View>
              </View>
            </Pressable>
          ))}
        </View>

        {/* Logout Button */}
        <Pressable
          onPress={handleLogout}
          style={({ pressed }) => [styles.logoutBtn, pressed && styles.logoutBtnPressed]}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.error} style={{ marginLeft: 8 }} />
          <Text style={styles.logoutBtnText}>تسجيل الخروج</Text>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingBottom: spacing.xxl,
  },
  userCard: {
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.darkNavy,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.black,
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    marginBottom: spacing.md,
  },
  userName: {
    ...typography.heading2,
    color: colors.darkNavy,
    fontWeight: 'bold',
  },
  userEmail: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  scoreCard: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: spacing.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    shadowColor: colors.black,
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: spacing.xl,
  },
  scoreHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  scoreTitle: {
    ...typography.bodyMedium,
    color: colors.darkNavy,
    fontWeight: 'bold',
  },
  scoreValueContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginVertical: spacing.sm,
  },
  scoreNumber: {
    fontSize: 48,
    fontWeight: '900',
    color: colors.success,
    lineHeight: 52,
  },
  scoreSubtext: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginLeft: 4,
    marginBottom: 6,
    fontWeight: '600',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: colors.lightGray,
    borderRadius: 4,
    width: '100%',
    overflow: 'hidden',
    marginVertical: spacing.sm,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.success,
    borderRadius: 4,
  },
  scoreFeedback: {
    ...typography.caption,
    color: colors.success,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  statsSection: {
    width: '100%',
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.bodyMedium,
    color: colors.darkNavy,
    fontWeight: 'bold',
    textAlign: 'right',
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    width: '100%',
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.black,
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 2,
  },
  statIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  statLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  statValue: {
    ...typography.bodyMedium,
    fontWeight: 'bold',
    color: colors.darkNavy,
  },
  menuSection: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: spacing.xl,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  menuItemPressed: {
    backgroundColor: colors.lightGray,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  menuItemLabel: {
    ...typography.bodyMedium,
    color: colors.darkNavy,
    fontWeight: '500',
  },
  menuIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutBtn: {
    width: '100%',
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.error,
    backgroundColor: 'transparent',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Platform.OS === 'ios' ? spacing.xxl : spacing.md,
  },
  logoutBtnPressed: {
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
  },
  logoutBtnText: {
    color: colors.error,
    ...typography.bodyMedium,
    fontWeight: 'bold',
  },
});
