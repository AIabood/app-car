/**
 * MapScreen (Main App Screen)
 *
 * Manages:
 *  - Search & destination selection
 *  - userLocation  = real GPS from expo-location
 *  - simulationLocation = interpolated position used during navigation MVP simulation
 *  - Navigation HUD, speedometer, instructions
 *
 * MapSurface receives props and handles only rendering.
 */

import { useState, useEffect, useRef } from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  Text,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import MapSurface, { FALLBACK_LOCATION, Coordinates } from '@/components/map-surface';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { typography } from '@/constants/typography';
import { MOCK_LOCATIONS, AppLocation } from '@/constants/mock-locations';

export default function MapScreen() {
  const [search, setSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<AppLocation | null>(null);

  // ── Real GPS location (preserved throughout session) ──────────────────────
  const [userLocation, setUserLocation] = useState<Coordinates>(FALLBACK_LOCATION);

  // ── Simulation: interpolated position used ONLY during navigation MVP ─────
  const [simulationLocation, setSimulationLocation] = useState<Coordinates | null>(null);

  // Trigger map re-center (incremented by Locate Me button)
  const [recenterTrigger, setRecenterTrigger] = useState(0);

  // ── Navigation simulation states ──────────────────────────────────────────
  const [isNavigating, setIsNavigating] = useState(false);
  const [navigationProgress, setNavigationProgress] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [remainingDistance, setRemainingDistance] = useState(0);
  const [remainingMinutes, setRemainingMinutes] = useState(0);
  const [currentInstruction, setCurrentInstruction] = useState('');

  // Store start location for interpolation (captured when navigation begins)
  const navStartLocation = useRef<Coordinates>(FALLBACK_LOCATION);

  const searchInputRef = useRef<TextInput>(null);

  // ── Fetch GPS on mount ────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        // Permission denied — keep Riyadh fallback
        return;
      }
      try {
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setUserLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      } catch {
        // Could not retrieve location — keep fallback
      }
    })();
  }, []);

  // ── Filter locations based on search query ─────────────────────────────────
  const filteredLocations = MOCK_LOCATIONS.filter(
    (loc) =>
      loc.nameAr.toLowerCase().includes(search.toLowerCase()) ||
      loc.nameEn.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelectLocation = (loc: AppLocation) => {
    setSelectedLocation(loc);
    setSearch(loc.nameAr);
    setShowSuggestions(false);
    searchInputRef.current?.blur();
  };

  const handleClearSearch = () => {
    setSearch('');
    setSelectedLocation(null);
    setShowSuggestions(false);
  };

  // ── Locate Me: refresh GPS and re-center map ───────────────────────────────
  const handleLocateMe = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const updated: Coordinates = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      };
      setUserLocation(updated);
    } catch {
      // keep current userLocation
    }
    // Bump trigger to animate camera in MapSurface
    setRecenterTrigger((n) => n + 1);
  };

  // ── Start Navigation Simulation ────────────────────────────────────────────
  const startNavigation = () => {
    // Capture the real user location as simulation start
    navStartLocation.current = userLocation;
    setSimulationLocation(userLocation);

    setIsNavigating(true);
    setNavigationProgress(0);
    setSpeed(0);
    setCurrentInstruction('اتجه نحو الشمال على طريق الملك فهد');

    if (selectedLocation) {
      const distNum = parseFloat(selectedLocation.distance.replace(/[^0-9.]/g, ''));
      const timeNum = parseInt(selectedLocation.duration.replace(/[^0-9]/g, ''));
      setRemainingDistance(distNum);
      setRemainingMinutes(timeNum);
    } else {
      setRemainingDistance(15.0);
      setRemainingMinutes(20);
    }
  };

  // ── Stop Navigation Simulation ─────────────────────────────────────────────
  const stopNavigation = () => {
    setIsNavigating(false);
    setNavigationProgress(0);
    setSimulationLocation(null); // return to real userLocation marker
    setSelectedLocation(null);
    setSearch('');
  };

  // ── Navigation Simulator Loop ──────────────────────────────────────────────
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;

    if (isNavigating) {
      const instructions = [
        'اتجه نحو الشمال على طريق الملك فهد',
        'بعد 500 متر، اسلك المخرج اليمين',
        'انعطف يميناً ثم تابع لمسافة 2 كم',
        'استمر مباشرة نحو وجهتك المحددة',
        'لقد وصلت إلى وجهتك المقصودة!',
      ];

      timer = setInterval(() => {
        setNavigationProgress((prev) => {
          const next = prev + 0.02; // ~50 seconds total

          if (next >= 1) {
            clearInterval(timer);
            setIsNavigating(false);
            setSimulationLocation(null);
            alert('لقد وصلت إلى وجهتك بأمان! 🎉');
            return 0;
          }

          // ── Interpolate simulation position ──────────────────────────────
          if (selectedLocation) {
            const interpLat =
              navStartLocation.current.latitude +
              (selectedLocation.latitude - navStartLocation.current.latitude) * next;
            const interpLng =
              navStartLocation.current.longitude +
              (selectedLocation.longitude - navStartLocation.current.longitude) * next;
            setSimulationLocation({ latitude: interpLat, longitude: interpLng });
          }

          // ── HUD updates ──────────────────────────────────────────────────
          const randomSpeed = Math.floor(60 + Math.random() * 50);
          setSpeed(randomSpeed);

          if (selectedLocation) {
            const distTotal = parseFloat(selectedLocation.distance.replace(/[^0-9.]/g, ''));
            const timeTotal = parseInt(selectedLocation.duration.replace(/[^0-9]/g, ''));
            setRemainingDistance(Math.max(0, parseFloat((distTotal * (1 - next)).toFixed(1))));
            setRemainingMinutes(Math.max(0, Math.round(timeTotal * (1 - next))));
          } else {
            setRemainingDistance((d) => Math.max(0, parseFloat((d - 0.1).toFixed(1))));
            setRemainingMinutes((m) => Math.max(0, m - 1));
          }

          const step = Math.floor(next * 5);
          if (step < instructions.length) {
            setCurrentInstruction(instructions[step]);
          }

          return next;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isNavigating, selectedLocation]);

  return (
    <View style={styles.container}>
      {/* ── Map Surface ───────────────────────────────────────────────── */}
      <MapSurface
        userLocation={userLocation}
        simulationLocation={simulationLocation}
        selectedLocation={selectedLocation}
        isNavigating={isNavigating}
        navigationProgress={navigationProgress}
        onSelectLocation={handleSelectLocation}
        recenterTrigger={recenterTrigger}
      />

      {/* ── TOP OVERLAYS — hidden during navigation ────────────────────── */}
      {!isNavigating && (
        <SafeAreaView style={styles.topContainer}>
          {/* Search Bar */}
          <View style={styles.searchShell}>
            <Ionicons name="search" size={21} color={colors.mediumGray} />
            <TextInput
              ref={searchInputRef}
              value={search}
              onChangeText={(text) => {
                setSearch(text);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="ابحث عن وجهتك في الرياض..."
              placeholderTextColor={colors.mediumGray}
              returnKeyType="search"
              style={styles.searchInput}
            />
            {search.length > 0 && (
              <Pressable accessibilityLabel="Clear search" onPress={handleClearSearch} style={styles.clearIcon}>
                <Ionicons name="close-circle" size={20} color={colors.mediumGray} />
              </Pressable>
            )}
          </View>

          {/* Suggestions Dropdown */}
          {showSuggestions && (
            <View style={styles.suggestionsCard}>
              <ScrollView keyboardShouldPersistTaps="handled">
                {filteredLocations.length > 0 ? (
                  filteredLocations.map((loc) => (
                    <Pressable
                      key={loc.id}
                      onPress={() => handleSelectLocation(loc)}
                      style={({ pressed }) => [styles.suggestionItem, pressed && styles.pressed]}
                    >
                      <Ionicons name="location-outline" size={20} color={colors.primary} />
                      <View style={styles.suggestionTextContainer}>
                        <Text style={styles.suggestionTitle}>{loc.nameAr}</Text>
                        <Text style={styles.suggestionSubtitle}>{loc.descriptionAr}</Text>
                      </View>
                      <Text style={styles.suggestionDistance}>{loc.distance}</Text>
                    </Pressable>
                  ))
                ) : (
                  <View style={styles.noResults}>
                    <Text style={styles.noResultsText}>لا توجد نتائج مطابقة</Text>
                  </View>
                )}
              </ScrollView>
            </View>
          )}
        </SafeAreaView>
      )}

      {/* ── FLOATING ACTION BUTTONS — hidden during navigation ─────────── */}
      {!isNavigating && (
        <View style={styles.floatingButtons}>
          <Pressable
            accessibilityLabel="Center map on my location"
            onPress={handleLocateMe}
            style={({ pressed }) => [styles.floatingButton, pressed && styles.pressed]}
          >
            <Ionicons name="locate" size={24} color={colors.primary} />
          </Pressable>
        </View>
      )}

      {/* ── BOTTOM INFO PANEL / START DRIVE CARD ───────────────────────── */}
      {!isNavigating && (
        <View style={styles.bottomCardContainer}>
          {selectedLocation ? (
            /* Destination Selected Panel */
            <View style={styles.destPanel}>
              <View style={styles.destHeader}>
                <View style={styles.destIconCircle}>
                  <Ionicons name="navigate-circle" size={32} color={colors.primary} />
                </View>
                <View style={styles.destDetails}>
                  <Text style={styles.destTitle}>{selectedLocation.nameAr}</Text>
                  <Text style={styles.destSubtitle}>{selectedLocation.descriptionAr}</Text>
                </View>
              </View>

              {/* Trip Estimates Row */}
              <View style={styles.estimatesRow}>
                <View style={styles.estimateCol}>
                  <Ionicons name="time-outline" size={18} color={colors.mediumGray} />
                  <Text style={styles.estimateLabel}>الوقت المقدر</Text>
                  <Text style={styles.estimateValue}>{selectedLocation.duration}</Text>
                </View>
                <View style={styles.dividerLine} />
                <View style={styles.estimateCol}>
                  <Ionicons name="analytics-outline" size={18} color={colors.mediumGray} />
                  <Text style={styles.estimateLabel}>المسافة</Text>
                  <Text style={styles.estimateValue}>{selectedLocation.distance}</Text>
                </View>
              </View>

              <View style={styles.actionRow}>
                <Pressable
                  onPress={startNavigation}
                  style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
                >
                  <Ionicons name="car-sport" size={20} color={colors.white} style={{ marginRight: 8 }} />
                  <Text style={styles.primaryButtonText}>ابدأ القيادة</Text>
                </Pressable>
                <Pressable
                  onPress={handleClearSearch}
                  style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
                >
                  <Text style={styles.secondaryButtonText}>إلغاء</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            /* Free Drive / Welcome Panel */
            <View style={styles.welcomePanel}>
              <Text style={styles.welcomeTitle}>أهلاً بك في AppCar 👋</Text>
              <Text style={styles.welcomeSubtitle}>ابحث عن وجهة، أو ابدأ رحلة حرة لمراقبة القيادة</Text>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
                {MOCK_LOCATIONS.slice(0, 3).map((loc) => (
                  <Pressable
                    key={loc.id}
                    onPress={() => handleSelectLocation(loc)}
                    style={styles.chip}
                  >
                    <Ionicons name="location" size={12} color={colors.primary} style={{ marginRight: 4 }} />
                    <Text style={styles.chipText}>{loc.nameAr}</Text>
                  </Pressable>
                ))}
              </ScrollView>

              <Pressable
                onPress={startNavigation}
                style={({ pressed }) => [styles.freeDriveButton, pressed && styles.pressed]}
              >
                <Ionicons name="play" size={20} color={colors.white} style={{ marginRight: 6 }} />
                <Text style={styles.freeDriveButtonText}>ابدأ رحلة قيادة حرة</Text>
              </Pressable>
            </View>
          )}
        </View>
      )}

      {/* ── LIVE NAVIGATION HUD ─────────────────────────────────────────── */}
      {isNavigating && (
        <SafeAreaView style={styles.hudOverlay}>
          {/* Top Instruction Banner */}
          <View style={styles.hudHeader}>
            <View style={styles.hudNavIconContainer}>
              <Ionicons name="arrow-up-circle" size={36} color={colors.white} />
            </View>
            <View style={styles.hudInstructionTextContainer}>
              <Text style={styles.hudInstructionTitle}>{currentInstruction}</Text>
              <Text style={styles.hudInstructionSubtitle}>الشارع التالي: طريق الملك فهد</Text>
            </View>
          </View>

          {/* Center Info HUD */}
          <View style={styles.hudCenterContainer}>
            <View style={styles.speedometerCard}>
              <Text style={styles.speedNumber}>{speed}</Text>
              <Text style={styles.speedLabel}>كم / ساعة</Text>
            </View>

            <View style={styles.hudStatusBadge}>
              <View style={styles.greenIndicatorDot} />
              <Text style={styles.hudStatusText}>الملاحة نشطة</Text>
            </View>
          </View>

          {/* Bottom Navigation Stats Card */}
          <View style={styles.hudBottomCard}>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${navigationProgress * 100}%` }]} />
            </View>

            <View style={styles.hudStatsRow}>
              <View style={styles.hudStatCol}>
                <Text style={styles.hudStatVal}>{remainingMinutes} دقيقة</Text>
                <Text style={styles.hudStatLbl}>الوقت المتبقي</Text>
              </View>
              <View style={styles.hudStatDivider} />
              <View style={styles.hudStatCol}>
                <Text style={styles.hudStatVal}>{remainingDistance} كم</Text>
                <Text style={styles.hudStatLbl}>المسافة المتبقية</Text>
              </View>
            </View>

            <Pressable
              onPress={stopNavigation}
              style={({ pressed }) => [styles.hudCancelButton, pressed && styles.pressed]}
            >
              <Ionicons name="stop" size={18} color={colors.white} style={{ marginRight: 6 }} />
              <Text style={styles.hudCancelText}>إنهاء الرحلة</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1419',
  },
  topContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  searchShell: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    height: 52,
    paddingHorizontal: spacing.md,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: 14,
    shadowColor: colors.black,
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  searchInput: {
    ...typography.body,
    flex: 1,
    color: colors.text,
    paddingVertical: 0,
    textAlign: 'right',
  },
  clearIcon: {
    padding: 2,
  },
  suggestionsCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xs,
    backgroundColor: colors.white,
    borderRadius: 14,
    maxHeight: 250,
    shadowColor: colors.black,
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
    overflow: 'hidden',
  },
  suggestionItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  suggestionTextContainer: {
    flex: 1,
    marginHorizontal: spacing.sm,
    alignItems: 'flex-end',
  },
  suggestionTitle: {
    ...typography.bodyMedium,
    color: colors.text,
    fontWeight: '600',
  },
  suggestionSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  suggestionDistance: {
    ...typography.caption,
    fontWeight: 'bold',
    color: colors.primary,
  },
  noResults: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  noResultsText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  floatingButtons: {
    position: 'absolute',
    right: spacing.lg,
    bottom: 250,
    gap: spacing.sm,
    zIndex: 90,
  },
  floatingButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.black,
    shadowOpacity: 0.16,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  bottomCardContainer: {
    position: 'absolute',
    bottom: spacing.lg,
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 95,
  },
  welcomePanel: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: spacing.lg,
    shadowColor: colors.black,
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
    alignItems: 'center',
  },
  welcomeTitle: {
    ...typography.heading3,
    color: colors.darkNavy,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  chipsScroll: {
    flexDirection: 'row',
    marginTop: spacing.md,
    marginBottom: spacing.md,
    width: '100%',
  },
  chip: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.darkNavy,
  },
  freeDriveButton: {
    width: '100%',
    height: 50,
    borderRadius: 14,
    backgroundColor: colors.primary,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
  },
  freeDriveButtonText: {
    color: colors.white,
    ...typography.bodyMedium,
    fontWeight: 'bold',
  },
  destPanel: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: spacing.lg,
    shadowColor: colors.black,
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  destHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  destIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.md,
  },
  destDetails: {
    flex: 1,
    alignItems: 'flex-end',
  },
  destTitle: {
    ...typography.heading3,
    color: colors.darkNavy,
  },
  destSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  estimatesRow: {
    flexDirection: 'row-reverse',
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
  },
  estimateCol: {
    flex: 1,
    alignItems: 'center',
  },
  estimateLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  estimateValue: {
    ...typography.bodyMedium,
    fontWeight: 'bold',
    color: colors.darkNavy,
    marginTop: 1,
  },
  dividerLine: {
    width: 1,
    backgroundColor: colors.border,
  },
  actionRow: {
    flexDirection: 'row-reverse',
    gap: spacing.sm,
  },
  primaryButton: {
    flex: 2,
    height: 50,
    backgroundColor: colors.success,
    borderRadius: 12,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: colors.white,
    ...typography.bodyMedium,
    fontWeight: 'bold',
  },
  secondaryButton: {
    flex: 1,
    height: 50,
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryButtonText: {
    color: colors.darkNavy,
    ...typography.bodyMedium,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.8,
  },
  hudOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
    zIndex: 200,
  },
  hudHeader: {
    margin: spacing.lg,
    backgroundColor: colors.success,
    borderRadius: 16,
    padding: spacing.md,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  hudNavIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.md,
  },
  hudInstructionTextContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  hudInstructionTitle: {
    color: colors.white,
    ...typography.bodyMedium,
    fontWeight: 'bold',
  },
  hudInstructionSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    ...typography.caption,
    marginTop: 2,
  },
  hudCenterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  speedometerCard: {
    backgroundColor: 'rgba(15, 20, 25, 0.9)',
    borderRadius: 40,
    width: 140,
    height: 140,
    borderWidth: 3,
    borderColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.success,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  speedNumber: {
    color: colors.white,
    fontSize: 42,
    fontWeight: '800',
  },
  speedLabel: {
    color: colors.success,
    ...typography.caption,
    fontWeight: 'bold',
    marginTop: -2,
  },
  hudStatusBadge: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 20, 25, 0.95)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    gap: 8,
  },
  greenIndicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  hudStatusText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '600',
  },
  hudBottomCard: {
    margin: spacing.lg,
    backgroundColor: 'rgba(15, 20, 25, 0.95)',
    borderRadius: 20,
    padding: spacing.lg,
    shadowColor: colors.black,
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 3,
    width: '100%',
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.success,
    borderRadius: 3,
  },
  hudStatsRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  hudStatCol: {
    flex: 1,
    alignItems: 'center',
  },
  hudStatVal: {
    color: colors.white,
    ...typography.heading3,
    fontWeight: 'bold',
  },
  hudStatLbl: {
    color: 'rgba(255, 255, 255, 0.5)',
    ...typography.caption,
    marginTop: 2,
  },
  hudStatDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  hudCancelButton: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.error,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hudCancelText: {
    color: colors.white,
    ...typography.bodyMedium,
    fontWeight: 'bold',
  },
});
