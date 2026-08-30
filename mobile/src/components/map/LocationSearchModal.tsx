/**
 * LocationSearchModal
 * Real place search sheet for selecting Start or Destination.
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Modal,
  Pressable,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { typography } from '@/constants/typography';
import { AppLocation, LocationSelectionMode, getLocationAddress, getLocationLabel } from '@/types/navigation';
import { searchPlaces } from '@/services/places.service';

const SEARCH_DEBOUNCE_MS = 450;

interface LocationSearchModalProps {
  visible: boolean;
  selectionMode: LocationSelectionMode;
  currentGpsLocation: AppLocation;
  onClose: () => void;
  onSelect: (location: AppLocation) => void;
}

export function LocationSearchModal({
  visible,
  selectionMode,
  currentGpsLocation,
  onClose,
  onSelect,
}: LocationSearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AppLocation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const isStart = selectionMode === 'START';
  const title = isStart ? 'حدد نقطة الانطلاق' : 'إلى أين تريد الذهاب؟';
  const placeholder = isStart ? 'ابحث عن نقطة الانطلاق...' : 'ابحث عن مكان حقيقي...';

  useEffect(() => {
    if (!visible) {
      setQuery('');
      setResults([]);
      setIsLoading(false);
      setErrorMessage(null);
      requestIdRef.current += 1;
    }
  }, [visible]);

  useEffect(() => {
    if (!visible) return;

    const trimmed = query.trim();
    if (trimmed.length < 2) {
      requestIdRef.current += 1;
      setResults([]);
      setIsLoading(false);
      setErrorMessage(null);
      return;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    const controller = new AbortController();
    setIsLoading(true);
    setErrorMessage(null);

    const timer = setTimeout(() => {
      searchPlaces(trimmed, {
        latitude: currentGpsLocation.latitude,
        longitude: currentGpsLocation.longitude,
        signal: controller.signal,
      })
        .then((places) => {
          if (requestId !== requestIdRef.current) return;
          setResults(places);
          setErrorMessage(null);
        })
        .catch((error: unknown) => {
          if (controller.signal.aborted) return;
          if (requestId !== requestIdRef.current) return;
          setResults([]);
          setErrorMessage('تعذر البحث عن الأماكن. حاول مرة أخرى.');
          console.warn('Place search error', error);
        })
        .finally(() => {
          if (requestId === requestIdRef.current) {
            setIsLoading(false);
          }
        });
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, visible, currentGpsLocation.latitude, currentGpsLocation.longitude]);

  const handleSelectGps = () => {
    onSelect(currentGpsLocation);
    onClose();
  };

  const handleSelectPlace = (loc: AppLocation) => {
    onSelect(loc);
    onClose();
  };

  const trimmedQuery = query.trim();
  const showEmpty = !isLoading && trimmedQuery.length >= 2 && results.length === 0 && !errorMessage;
  const showHint = trimmedQuery.length < 2 && !isLoading;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.header}>
            <Pressable onPress={onClose} style={styles.closeBtn} accessibilityLabel="إغلاق البحث">
              <Ionicons name="close" size={24} color={colors.white} />
            </Pressable>
            <Text style={styles.headerTitle}>{title}</Text>
            <View style={{ width: 32 }} />
          </View>

          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color={colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder={placeholder}
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

          <ScrollView
            style={styles.scrollList}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.listContent}
          >
            {isStart && (
              <Pressable
                onPress={handleSelectGps}
                style={({ pressed }) => [styles.gpsItem, pressed && styles.pressed]}
              >
                <View style={styles.gpsIconCircle}>
                  <Ionicons name="locate" size={20} color="#10B981" />
                </View>
                <View style={styles.itemTextCol}>
                  <Text style={styles.gpsTitle}>موقعي الحالي</Text>
                  <Text style={styles.gpsSubtitle}>استخدام إحداثيات GPS الحالية</Text>
                </View>
                <View style={styles.badgeGps}>
                  <Text style={styles.badgeGpsText}>GPS</Text>
                </View>
              </Pressable>
            )}

            {isLoading && (
              <View style={styles.stateBlock}>
                <ActivityIndicator color="#38BDF8" />
                <Text style={styles.stateText}>جاري البحث عن الأماكن...</Text>
              </View>
            )}

            {errorMessage && !isLoading && (
              <View style={styles.stateBlock}>
                <Ionicons name="cloud-offline-outline" size={28} color={colors.textSecondary} />
                <Text style={styles.stateText}>{errorMessage}</Text>
              </View>
            )}

            {showHint && (
              <View style={styles.stateBlock}>
                <Ionicons name="location-outline" size={28} color={colors.textSecondary} />
                <Text style={styles.stateText}>اكتب اسم مكان حقيقي لتحديد موقعه على الخريطة</Text>
              </View>
            )}

            {showEmpty && (
              <View style={styles.stateBlock}>
                <Ionicons name="search-outline" size={28} color={colors.textSecondary} />
                <Text style={styles.stateText}>لا توجد نتائج مطابقة لـ «{trimmedQuery}»</Text>
              </View>
            )}

            {!isLoading && results.map((loc) => (
              <Pressable
                key={loc.id}
                onPress={() => handleSelectPlace(loc)}
                style={({ pressed }) => [styles.locationItem, pressed && styles.pressed]}
              >
                <View style={styles.locationIconCircle}>
                  <Ionicons name="location" size={18} color={colors.primary} />
                </View>
                <View style={styles.itemTextCol}>
                  <Text style={styles.locationTitle}>{getLocationLabel(loc)}</Text>
                  {getLocationAddress(loc) ? (
                    <Text style={styles.locationSubtitle}>{getLocationAddress(loc)}</Text>
                  ) : null}
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
  stateBlock: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  stateText: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
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
