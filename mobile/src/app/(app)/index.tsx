/**
 * Map Screen
 * Main navigation screen placeholder
 */

import React from 'react';
import {
  StyleSheet,
  View,
  Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/layout/Screen';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { typography } from '@/constants/typography';

export default function MapScreen() {
  return (
    <Screen>
      <View style={styles.container}>
        <Ionicons name="map" size={80} color={colors.primary} />
        <Text style={styles.title}>Smart Map</Text>
        <Text style={styles.description}>
          Map functionality will be implemented in Phase 3.
        </Text>
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
  description: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});
