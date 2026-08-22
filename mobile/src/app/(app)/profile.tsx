/**
 * Profile Screen
 * User profile placeholder
 */

import React from 'react';
import {
  StyleSheet,
  View,
  Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/layout/Screen';
import { AppButton } from '@/components/ui/AppButton';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { typography } from '@/constants/typography';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)');
  };

  return (
    <Screen>
      <View style={styles.container}>
        <Ionicons name="person-circle" size={80} color={colors.primary} />
        <Text style={styles.title}>Profile</Text>
        
        {user && (
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
          </View>
        )}
        
        <Text style={styles.description}>
          Profile features will be implemented in a later phase.
        </Text>

        <AppButton
          title="Sign Out"
          onPress={handleLogout}
          variant="outline"
          style={styles.logoutButton}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...typography.heading2,
    color: colors.text,
    marginTop: spacing.lg,
  },
  userInfo: {
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  userName: {
    ...typography.bodyMedium,
    color: colors.text,
  },
  userEmail: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  logoutButton: {
    marginTop: spacing.xl,
    alignSelf: 'center',
    width: 150,
  },
});
