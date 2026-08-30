/**
 * MapScreen — Place search and start/destination selection.
 */

import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native';
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
import { AppLocation, LocationSelectionMode } from '@/types/navigation';

export default function MapScreen() {
  const router = useRouter();
  const {
    currentGpsLocation,
    startLocation,
    destination,
    routeInfo,
    isLoadingRoute,
    recenterTrigger,
    setStartLocation,
    setDestination,
    swapLocations,
    clearRoute,
    triggerRecenter,
    refreshGpsLocation,
    resetStartToGps,
    isLoadingLocation,
  } = useNavigation();

  const [modalVisible, setModalVisible] = useState(false);
  const [selectionMode, setSelectionMode] = useState<LocationSelectionMode>('DESTINATION');
  const [focusNonce, setFocusNonce] = useState(0);

  const handleLocateMe = async () => {
    const loc = await refreshGpsLocation();
    if (loc) {
      setStartLocation(loc);
    } else {
      resetStartToGps();
    }
    triggerRecenter();
  };

  const openLocationSearch = (mode: LocationSelectionMode) => {
    setSelectionMode(mode);
    setModalVisible(true);
  };

  const handleSelectLocationFromModal = (location: AppLocation) => {
    if (selectionMode === 'START') {
      setStartLocation(location);
    } else {
      setDestination(location);
    }
    setFocusNonce((prev) => prev + 1);
  };

  const handleQuickDestination = (location: AppLocation) => {
    setDestination(location);
    setFocusNonce((prev) => prev + 1);
  };

  const handleStartDrive = () => {
    if (startLocation && destination) {
      router.push('/(app)/drive');
    }
  };

  return (
    <View style={styles.container}>
      <MapSurface
        startLocation={startLocation}
        destination={destination}
        routeGeometry={routeInfo?.routeGeometry}
        recenterTrigger={recenterTrigger}
        focusNonce={focusNonce}
      />

      <RoutePlanningHeader
        startLocation={startLocation}
        destination={destination}
        onChangeStartPress={() => openLocationSearch('START')}
        onDestinationPress={() => openLocationSearch('DESTINATION')}
        onSwapPress={() => {
          swapLocations();
          setFocusNonce((prev) => prev + 1);
        }}
        onClearPress={() => {
          clearRoute();
          setFocusNonce((prev) => prev + 1);
        }}
      />

      <View style={styles.floatingButtons}>
        <Pressable
          accessibilityLabel="تحديد موقعي على الخريطة"
          onPress={handleLocateMe}
          disabled={isLoadingLocation}
          style={({ pressed }) => [styles.locateButton, pressed && styles.pressed, isLoadingLocation && styles.locateLoading]}
        >
          {isLoadingLocation ? (
            <ActivityIndicator size="small" color="#0066FF" />
          ) : (
            <Ionicons name="locate" size={24} color="#0066FF" />
          )}
        </Pressable>
      </View>

      {routeInfo ? (
        <RouteInfoSheet
          routeInfo={routeInfo}
          isLoadingRoute={isLoadingRoute}
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
                <Text style={styles.welcomeTitle}>اختر نقطة الانطلاق والوجهة</Text>
                <Text style={styles.welcomeSubtitle}>ابحث عن مكان حقيقي ليظهر مباشرة على الخريطة</Text>
              </View>
            </View>

            <Text style={styles.chipsLabel}>أماكن مقترحة:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
              {MOCK_LOCATIONS.map((loc) => (
                <Pressable
                  key={loc.id}
                  onPress={() => handleQuickDestination(loc)}
                  style={({ pressed }) => [styles.chip, pressed && styles.pressed]}
                >
                  <Ionicons
                    name={loc.id === '3' ? 'airplane' : 'location'}
                    size={14}
                    color="#0066FF"
                    style={{ marginLeft: 6 }}
                  />
                  <Text style={styles.chipText}>{loc.name}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      )}

      <LocationSearchModal
        visible={modalVisible}
        selectionMode={selectionMode}
        currentGpsLocation={currentGpsLocation}
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
  locateLoading: {
    borderColor: '#0066FF',
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
