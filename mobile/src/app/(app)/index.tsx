/**
 * MapScreen — Route Planning Screen
 *
 * Provides a modern automotive Route Planning experience:
 * 1. Automatic GPS start location determination
 * 2. Start location customization
 * 3. Destination search and selection
 * 4. Route preview on OpenStreetMap with distance and ETA calculation
 * 5. One-tap launch into Driving Mode (/drive)
 */

import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { typography } from '@/constants/typography';
import MapSurface from '@/components/map-surface';
import { RoutePlanningHeader } from '@/components/map/RoutePlanningHeader';
import { RouteInfoSheet } from '@/components/map/RouteInfoSheet';
import { LocationSearchModal } from '@/components/map/LocationSearchModal';
import { useNavigation } from '@/context/NavigationContext';
import { MOCK_LOCATIONS } from '@/constants/mock-locations';
import { AppLocation } from '@/types/navigation';

export default function MapScreen() {
  const router = useRouter();
  const {
    userLocation,
    startLocation,
    destination,
    routeInfo,
    recenterTrigger,
    setStartLocation,
    setDestination,
    swapStartAndDestination,
    clearRoute,
    triggerRecenter,
  } = useNavigation();

  // Search Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTarget, setModalTarget] = useState<'start' | 'destination'>('destination');

  const handleOpenSearch = (target: 'start' | 'destination') => {
    setModalTarget(target);
    setModalVisible(true);
  };

  const handleSelectLocationFromModal = (location: AppLocation) => {
    if (modalTarget === 'start') {
      setStartLocation(location);
    } else {
      setDestination(location);
    }
  };

  const handleSelectLandmarkOnMap = (location: AppLocation) => {
    setDestination(location);
  };

  const handleStartDrive = () => {
    if (startLocation && destination) {
      router.push('/(app)/drive');
    }
  };

  return (
    <View style={styles.container}>
      {/* 1. OpenStreetMap Interactive Surface */}
      <MapSurface
        startLocation={startLocation}
        destination={destination}
        onSelectLocation={handleSelectLandmarkOnMap}
        recenterTrigger={recenterTrigger}
      />

      {/* 2. Top Route Planning Floating Header */}
      <RoutePlanningHeader
        startLocation={startLocation}
        destination={destination}
        onChangeStartPress={() => handleOpenSearch('start')}
        onDestinationPress={() => handleOpenSearch('destination')}
        onSwapPress={swapStartAndDestination}
        onClearPress={clearRoute}
      />

      {/* 3. Floating "Locate Me" GPS Center Button */}
      <View style={styles.floatingButtons}>
        <Pressable
          accessibilityLabel="تحديد موقعي على الخريطة"
          onPress={triggerRecenter}
          style={({ pressed }) => [styles.locateButton, pressed && styles.pressed]}
        >
          <Ionicons name="locate" size={24} color="#0066FF" />
        </Pressable>
      </View>

      {/* 4. Bottom Panel: Route Info Sheet (if destination selected) OR Quick Destinations Card */}
      {routeInfo ? (
        <RouteInfoSheet
          routeInfo={routeInfo}
          onStartDrive={handleStartDrive}
          onCancel={clearRoute}
        />
      ) : (
        <View style={styles.welcomePanelContainer}>
          <View style={styles.welcomeCard}>
            <View style={styles.welcomeHeader}>
              <View style={styles.carIconCircle}>
                <Ionicons name="navigate-circle" size={28} color="#0066FF" />
              </View>
              <View style={styles.welcomeTextCol}>
                <Text style={styles.welcomeTitle}>تخطيط الرحلة 📍</Text>
                <Text style={styles.welcomeSubtitle}>اختر وجهتك لاستعراض المسار وتقدير الوقت</Text>
              </View>
            </View>

            {/* Quick destination chips */}
            <Text style={styles.chipsLabel}>وجهات مقترحة في الرياض:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
              {MOCK_LOCATIONS.map((loc) => (
                <Pressable
                  key={loc.id}
                  onPress={() => setDestination(loc)}
                  style={({ pressed }) => [styles.chip, pressed && styles.pressed]}
                >
                  <Ionicons
                    name={loc.id === '3' ? 'airplane' : 'location'}
                    size={14}
                    color="#0066FF"
                    style={{ marginLeft: 6 }}
                  />
                  <Text style={styles.chipText}>{loc.nameAr}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      )}

      {/* 5. Location Search & Picker Modal */}
      <LocationSearchModal
        visible={modalVisible}
        targetType={modalTarget}
        currentGpsLocation={userLocation}
        onClose={() => setModalVisible(false)}
        onSelect={handleSelectLocationFromModal}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D1117',
  },
  floatingButtons: {
    position: 'absolute',
    right: spacing.lg,
    bottom: 240,
    zIndex: 90,
  },
  locateButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(21, 27, 35, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000000',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  welcomePanelContainer: {
    position: 'absolute',
    bottom: 20,
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 95,
  },
  welcomeCard: {
    backgroundColor: 'rgba(21, 27, 35, 0.95)',
    borderRadius: 24,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: '#000000',
    shadowOpacity: 0.4,
    shadowRadius: 18,
    elevation: 8,
  },
  welcomeHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  carIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 102, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.md,
  },
  welcomeTextCol: {
    flex: 1,
    alignItems: 'flex-end',
  },
  welcomeTitle: {
    ...typography.heading3,
    color: colors.white,
    fontWeight: 'bold',
  },
  welcomeSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  chipsLabel: {
    ...typography.caption,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'right',
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  chipsScroll: {
    flexDirection: 'row',
    marginTop: spacing.xs,
  },
  chip: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: 14,
    marginLeft: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  chipText: {
    ...typography.caption,
    fontWeight: 'bold',
    color: colors.white,
  },
  pressed: {
    opacity: 0.75,
  },
});
