/**
 * LocationSearchModal
 * Modal sheet allowing the user to search and select either a Start location or a Destination.
 */

import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Modal,
  Pressable,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { typography } from '@/constants/typography';
import { AppLocation } from '@/types/navigation';
import { MOCK_LOCATIONS } from '@/constants/mock-locations';

interface LocationSearchModalProps {
  visible: boolean;
  targetType: 'start' | 'destination';
  currentGpsLocation: AppLocation;
  onClose: () => void;
  onSelect: (location: AppLocation) => void;
}

export function LocationSearchModal({
  visible,
  targetType,
  currentGpsLocation,
  onClose,
  onSelect,
}: LocationSearchModalProps) {
  const [query, setQuery] = useState('');

  const isStart = targetType === 'start';
  const title = isStart ? 'تحديد نقطة البداية' : 'تحديد الوجهة';

  const filteredLocations = useMemo(() => {
    if (!query.trim()) return MOCK_LOCATIONS;
    const q = query.toLowerCase();
    return MOCK_LOCATIONS.filter(
      (loc) =>
        loc.nameAr.toLowerCase().includes(q) ||
        loc.nameEn.toLowerCase().includes(q) ||
        (loc.descriptionAr && loc.descriptionAr.toLowerCase().includes(q))
    );
  }, [query]);

  const handleSelectGps = () => {
    onSelect(currentGpsLocation);
    setQuery('');
    onClose();
  };

  const handleSelectPlace = (loc: AppLocation) => {
    onSelect(loc);
    setQuery('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <SafeAreaView style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={colors.white} />
            </Pressable>
            <Text style={styles.headerTitle}>{title}</Text>
            <View style={{ width: 32 }} />
          </View>

          {/* Search Input */}
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color={colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder={isStart ? 'ابحث عن نقطة البداية...' : 'ابحث عن الوجهة المطلوبة...'}
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={query}
              onChangeText={setQuery}
              autoFocus
              returnKeyType="search"
            />
            {query.length > 0 && (
              <Pressable onPress={() => setQuery('')} style={styles.clearBtn}>
                <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
              </Pressable>
            )}
          </View>

          {/* Location Results List */}
          <ScrollView
            style={styles.scrollList}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.listContent}
          >
            {/* Option: Current GPS Location */}
            <Pressable
              onPress={handleSelectGps}
              style={({ pressed }) => [styles.gpsItem, pressed && styles.pressed]}
            >
              <View style={styles.gpsIconCircle}>
                <Ionicons name="locate" size={20} color="#10B981" />
              </View>
              <View style={styles.itemTextCol}>
                <Text style={styles.gpsTitle}>موقعي الحالي</Text>
                <Text style={styles.gpsSubtitle}>استخدام إحداثيات GPS الحالية للسيارة</Text>
              </View>
              <View style={styles.badgeGps}>
                <Text style={styles.badgeGpsText}>GPS</Text>
              </View>
            </Pressable>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>أماكن ومعالم مشهورة</Text>
            </View>

            {filteredLocations.map((loc) => (
              <Pressable
                key={loc.id}
                onPress={() => handleSelectPlace(loc)}
                style={({ pressed }) => [styles.locationItem, pressed && styles.pressed]}
              >
                <View style={styles.locationIconCircle}>
                  <Ionicons
                    name={loc.id === '3' ? 'airplane' : 'location'}
                    size={18}
                    color={colors.primary}
                  />
                </View>
                <View style={styles.itemTextCol}>
                  <Text style={styles.locationTitle}>{loc.nameAr}</Text>
                  {loc.descriptionAr && (
                    <Text style={styles.locationSubtitle}>{loc.descriptionAr}</Text>
                  )}
                </View>
                <Ionicons name="chevron-back" size={18} color="rgba(255,255,255,0.2)" />
              </Pressable>
            ))}
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    height: '85%',
    backgroundColor: '#111827',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  closeBtn: {
    padding: spacing.xs,
  },
  headerTitle: {
    ...typography.heading3,
    color: colors.white,
    fontWeight: 'bold',
  },
  searchBar: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 14,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
    paddingHorizontal: spacing.md,
    height: 48,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  searchInput: {
    flex: 1,
    color: colors.white,
    textAlign: 'right',
    marginRight: spacing.sm,
    ...typography.body,
  },
  clearBtn: {
    padding: 4,
  },
  scrollList: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  gpsItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    padding: spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    marginBottom: spacing.md,
  },
  gpsIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.md,
  },
  gpsTitle: {
    ...typography.bodyMedium,
    color: '#34D399',
    fontWeight: 'bold',
  },
  gpsSubtitle: {
    ...typography.caption,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 2,
  },
  badgeGps: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeGpsText: {
    color: '#34D399',
    fontSize: 10,
    fontWeight: 'bold',
  },
  sectionHeader: {
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'right',
    fontWeight: '600',
  },
  locationItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  locationIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 102, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.md,
  },
  itemTextCol: {
    flex: 1,
    alignItems: 'flex-end',
  },
  locationTitle: {
    ...typography.bodyMedium,
    color: colors.white,
    fontWeight: '600',
  },
  locationSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  pressed: {
    opacity: 0.7,
  },
});
