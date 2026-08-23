/**
 * Reports Screen
 * Premium road reports screen in Arabic
 */

import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  Keyboard,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/layout/Screen';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { typography } from '@/constants/typography';

interface IncidentType {
  id: string;
  labelAr: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const INCIDENT_TYPES: IncidentType[] = [
  { id: 'accident', labelAr: 'حادث 🚗', icon: 'car-sport', color: colors.error },
  { id: 'traffic', labelAr: 'ازدحام 🚦', icon: 'trail-sign', color: colors.warning },
  { id: 'hazard', labelAr: 'خطر طريق ⚠', icon: 'warning', color: colors.warning },
  { id: 'roadwork', labelAr: 'أعمال طرق 🚧', icon: 'construct', color: colors.primary },
  { id: 'camera', labelAr: 'كاميرا مراقبة 📷', icon: 'camera', color: colors.info },
  { id: 'radar', labelAr: 'رادار سرعة 📡', icon: 'radio', color: colors.error },
  { id: 'closed', labelAr: 'طريق مغلق 🚫', icon: 'close-circle', color: colors.error },
];

export default function ReportsScreen() {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    if (!selectedType) return;

    Keyboard.dismiss();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      const selectedLabel = INCIDENT_TYPES.find((t) => t.id === selectedType)?.labelAr;
      alert(`تم إرسال بلاغك (${selectedLabel}) بنجاح! شكراً لمساعدتك في الحفاظ على سلامة الطرق 🚨`);
      
      // Reset form
      setSelectedType(null);
      setDescription('');
    }, 1500);
  };

  return (
    <Screen scrollable={true} backgroundColor={colors.surfaceLight}>
      <View style={styles.header}>
        <Text style={styles.title}>الإبلاغ عن بلاغ مروري 🚨</Text>
        <Text style={styles.subtitle}>
          ساعد السائقين الآخرين من خلال الإبلاغ عن الأحداث والمخاطر على الطريق فوراً.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>اختر نوع البلاغ:</Text>
        <View style={styles.grid}>
          {INCIDENT_TYPES.map((type) => {
            const isSelected = selectedType === type.id;
            return (
              <Pressable
                key={type.id}
                onPress={() => setSelectedType(type.id)}
                style={[
                  styles.card,
                  isSelected && {
                    borderColor: type.color,
                    backgroundColor: `${type.color}0A`, // 4% opacity of the color
                    shadowColor: type.color,
                    shadowOpacity: 0.15,
                    shadowRadius: 8,
                    elevation: 3,
                  },
                ]}
              >
                <View
                  style={[
                    styles.iconCircle,
                    { backgroundColor: `${type.color}15` },
                    isSelected && { backgroundColor: type.color },
                  ]}
                >
                  <Ionicons
                    name={type.icon}
                    size={24}
                    color={isSelected ? colors.white : type.color}
                  />
                </View>
                <Text style={[styles.cardLabel, isSelected && { color: type.color, fontWeight: 'bold' }]}>
                  {type.labelAr}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>تفاصيل إضافية (اختياري):</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="اكتب تفاصيل إضافية حول موقع البلاغ أو حالته..."
          placeholderTextColor={colors.textSecondary}
          multiline={true}
          numberOfLines={4}
          textAlignVertical="top"
          style={styles.textInput}
        />
      </View>

      <View style={styles.submitContainer}>
        <Pressable
          onPress={handleSubmit}
          disabled={!selectedType || isSubmitting}
          style={({ pressed }) => [
            styles.submitButton,
            (!selectedType || isSubmitting) && styles.submitButtonDisabled,
            pressed && styles.submitButtonPressed,
          ]}
        >
          {isSubmitting ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <>
              <Ionicons name="send" size={18} color={colors.white} style={{ marginLeft: 8 }} />
              <Text style={styles.submitButtonText}>إرسال البلاغ</Text>
            </>
          )}
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.xl,
    alignItems: 'flex-end',
    width: '100%',
  },
  title: {
    ...typography.heading2,
    color: colors.darkNavy,
    textAlign: 'right',
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'right',
    marginTop: spacing.xs,
    lineHeight: 22,
  },
  section: {
    marginBottom: spacing.xl,
    width: '100%',
  },
  sectionTitle: {
    ...typography.bodyMedium,
    color: colors.darkNavy,
    fontWeight: 'bold',
    textAlign: 'right',
    marginBottom: spacing.md,
  },
  grid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  card: {
    width: '47%', // roughly 2 columns with gap
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    minHeight: 110,
    shadowColor: colors.black,
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  cardLabel: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.darkNavy,
    textAlign: 'center',
  },
  textInput: {
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: spacing.md,
    color: colors.text,
    minHeight: 100,
    textAlign: 'right', // Renders text right-aligned for Arabic
    ...typography.body,
  },
  submitContainer: {
    marginTop: spacing.md,
    marginBottom: Platform.OS === 'ios' ? spacing.xxl : spacing.md,
    width: '100%',
  },
  submitButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.primary,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.5,
    backgroundColor: colors.mediumGray,
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonPressed: {
    opacity: 0.85,
  },
  submitButtonText: {
    color: colors.white,
    ...typography.bodyMedium,
    fontWeight: 'bold',
  },
});
