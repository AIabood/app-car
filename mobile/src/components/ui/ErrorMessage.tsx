/**
 * ErrorMessage Component
 * Reusable error display component
 */

import React from 'react';
import {
  StyleSheet,
  View,
  Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { typography } from '@/constants/typography';

export interface ErrorMessageProps {
  message: string;
  style?: any;
}

export function ErrorMessage({ message, style }: ErrorMessageProps) {
  return (
    <View style={[styles.container, style]}>
      <Ionicons
        name="alert-circle"
        size={20}
        color={colors.error}
        style={styles.icon}
      />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    padding: spacing.md,
    marginVertical: spacing.sm,
  },
  icon: {
    marginRight: spacing.md,
  },
  text: {
    ...typography.body,
    color: colors.error,
    flex: 1,
  },
});
