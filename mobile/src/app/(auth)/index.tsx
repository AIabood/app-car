/**
 * Welcome Screen
 * Entry point for the application
 */

import React from 'react';
import {
  StyleSheet,
  View,
  Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/layout/Screen';
import { AppButton } from '@/components/ui/AppButton';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { typography } from '@/constants/typography';

export default function WelcomeScreen() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/(auth)/register');
  };

  const handleSignIn = () => {
    router.push('/(auth)/login');
  };

  const handleGoogleSignIn = () => {
    alert('Google Sign-In will be available soon.');
  };

  return (
    <Screen scrollable keyboardAvoiding={false}>
      <View style={styles.hero}>
        <Ionicons name="car" size={80} color={colors.primary} />
        <Text style={styles.appName}>AppCar</Text>
        <Text style={styles.tagline}>Smart Driving Assistant</Text>
      </View>

      <View style={styles.description}>
        <Text style={styles.descriptionText}>
          Your smarter companion on every road.
        </Text>
      </View>

      <View style={styles.actions}>
        <AppButton
          title="Get Started"
          onPress={handleGetStarted}
          variant="primary"
          style={styles.button}
        />

        <AppButton
          title="Continue with Google"
          onPress={handleGoogleSignIn}
          variant="secondary"
          style={styles.button}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account?</Text>
        <AppButton
          title="Sign In"
          onPress={handleSignIn}
          variant="outline"
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.xxxl,
    marginTop: spacing.huge,
  },
  appName: {
    ...typography.heading1,
    color: colors.text,
    marginTop: spacing.lg,
  },
  tagline: {
    ...typography.heading3,
    color: colors.primary,
    marginTop: spacing.sm,
  },
  description: {
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  descriptionText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  actions: {
    gap: spacing.lg,
    marginVertical: spacing.xl,
  },
  button: {
    marginBottom: spacing.md,
  },
  footer: {
    alignItems: 'center',
    marginTop: spacing.xxxl,
  },
  footerText: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
});
