/**
 * Driving Mode Screen (/drive)
 *
 * Dedicated live driving HUD interface with:
 * - Real-time vehicle speed display
 * - Dynamic Turn-by-Turn navigation instructions
 * - Trip progress bar & live distance/ETA countdown
 * - Fullscreen OpenStreetMap tracking the car's geographic position
 * - Safe exit / End Drive action
 */

import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Pressable, Alert, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { typography } from '@/constants/typography';
import MapSurface from '@/components/map-surface';
import { useNavigation } from '@/context/NavigationContext';

const INSTRUCTIONS = [
  'اتجه نحو الشمال على طريق الملك فهد',
  'بعد 500 متر، اسلك المخرج اليمين',
  'انعطف يميناً ثم تابع لمسافة 2 كم',
  'استمر مباشرة نحو وجهتك المحددة',
  'أنت على بعد 300 متر من وجهتك المقصودة',
];

export default function DriveScreen() {
  const router = useRouter();
  const {
    startLocation,
    destination,
    routeInfo,
    simulationLocation,
    isNavigating,
    navigationProgress,
    startNavigation,
    endNavigation,
    setNavigationProgress,
    setSimulationLocation,
  } = useNavigation();

  const [speed, setSpeed] = useState(0);
  const [currentInstruction, setCurrentInstruction] = useState(INSTRUCTIONS[0]);
  const [remainingDistance, setRemainingDistance] = useState(routeInfo?.distanceKm ?? 10);
  const [remainingMinutes, setRemainingMinutes] = useState(routeInfo?.estimatedMinutes ?? 15);

  // Initialize navigation on mount
  useEffect(() => {
    startNavigation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Driving Simulation Loop
  useEffect(() => {
    if (!startLocation || !destination) return;

    const timer = setInterval(() => {
      setNavigationProgress((prev) => {
        const next = prev + 0.02; // ~50 seconds for full simulation

        if (next >= 1) {
          clearInterval(timer);
          endNavigation();
          Alert.alert('وصلت بالسلامة! 🎉', 'لقد وصلت إلى وجهتك المحددة بأمان.', [
            { text: 'العودة للخريطة', onPress: () => router.back() },
          ]);
          return 0;
        }

        // Interpolate geographic position between start and destination
        const interpLat =
          startLocation.latitude + (destination.latitude - startLocation.latitude) * next;
        const interpLng =
          startLocation.longitude + (destination.longitude - startLocation.longitude) * next;

        setSimulationLocation({ latitude: interpLat, longitude: interpLng });

        // Speed fluctuation (65 - 110 km/h)
        const currentSpeed = Math.floor(65 + Math.random() * 45);
        setSpeed(currentSpeed);

        // Update remaining stats
        if (routeInfo) {
          const remDist = Math.max(0, parseFloat((routeInfo.distanceKm * (1 - next)).toFixed(1)));
          const remTime = Math.max(1, Math.round(routeInfo.estimatedMinutes * (1 - next)));
          setRemainingDistance(remDist);
          setRemainingMinutes(remTime);
        }

        // Update instruction banner step
        const step = Math.floor(next * INSTRUCTIONS.length);
        if (step < INSTRUCTIONS.length) {
          setCurrentInstruction(INSTRUCTIONS[step]);
        }

        return next;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startLocation, destination, routeInfo]);

  const handleEndDrivePress = () => {
    Alert.alert('إنهاء الرحلة', 'هل أنت متأكد من رغبتك في إنهاء وضع القيادة؟', [
      { text: 'متابعة القيادة', style: 'cancel' },
      {
        text: 'إنهاء الرحلة',
        style: 'destructive',
        onPress: () => {
          endNavigation();
          router.back();
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* 1. Fullscreen Map Surface with active car tracker */}
      {startLocation && (
        <MapSurface
          startLocation={startLocation}
          destination={destination}
          simulationLocation={simulationLocation}
          isNavigating={true}
        />
      )}

      {/* 2. Automotive HUD Overlay */}
      <SafeAreaView style={styles.hudOverlay} pointerEvents="box-none">
        {/* Top Instruction Banner */}
        <View style={styles.hudHeader}>
          <View style={styles.hudNavIconContainer}>
            <Ionicons name="arrow-up-circle" size={38} color="#0066FF" />
          </View>
          <View style={styles.hudInstructionTextContainer}>
            <Text style={styles.hudInstructionTitle}>{currentInstruction}</Text>
            <Text style={styles.hudInstructionSubtitle}>
              {destination ? `الوجهة: ${destination.nameAr}` : 'طريق سريع'}
            </Text>
          </View>
        </View>

        {/* Center Speedometer Card */}
        <View style={styles.hudCenterContainer} pointerEvents="none">
          <View style={styles.speedometerCard}>
            <Text style={styles.speedNumber}>{speed}</Text>
            <Text style={styles.speedLabel}>كم / ساعة</Text>
          </View>

          <View style={styles.statusBadge}>
            <View style={styles.greenDot} />
            <Text style={styles.statusText}>وضع القيادة النشط 🚗</Text>
          </View>
        </View>

        {/* Bottom Trip Progress Card */}
        <View style={styles.hudBottomCard}>
          {/* Progress Bar */}
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${navigationProgress * 100}%` }]} />
          </View>

          {/* Stats Row */}
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

          {/* Cancel / End Drive Button */}
          <Pressable
            onPress={handleEndDrivePress}
            style={({ pressed }) => [styles.endDriveButton, pressed && styles.pressed]}
          >
            <Ionicons name="stop-circle" size={20} color={colors.white} style={{ marginLeft: 8 }} />
            <Text style={styles.endDriveText}>إنهاء الرحلة</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D1117',
  },
  hudOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'space-between',
    zIndex: 200,
  },
  hudHeader: {
    margin: spacing.lg,
    marginTop: spacing.md,
    backgroundColor: 'rgba(21, 27, 35, 0.96)',
    borderRadius: 20,
    padding: spacing.md,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 102, 255, 0.35)',
    shadowColor: '#000000',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  hudNavIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 102, 255, 0.15)',
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
    fontSize: 15,
  },
  hudInstructionSubtitle: {
    color: 'rgba(255, 255, 255, 0.65)',
    ...typography.caption,
    marginTop: 3,
  },
  hudCenterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  speedometerCard: {
    backgroundColor: 'rgba(21, 27, 35, 0.94)',
    borderRadius: 70,
    width: 140,
    height: 140,
    borderWidth: 3,
    borderColor: '#0066FF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0066FF',
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 10,
  },
  speedNumber: {
    color: colors.white,
    fontSize: 44,
    fontWeight: '900',
  },
  speedLabel: {
    color: '#38BDF8',
    ...typography.caption,
    fontWeight: 'bold',
    marginTop: -4,
  },
  statusBadge: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: 'rgba(21, 27, 35, 0.9)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    gap: 8,
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  statusText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  hudBottomCard: {
    margin: spacing.lg,
    backgroundColor: 'rgba(21, 27, 35, 0.96)',
    borderRadius: 24,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: '#000000',
    shadowOpacity: 0.45,
    shadowRadius: 18,
    elevation: 10,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 3,
    width: '100%',
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#0066FF',
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
    fontSize: 18,
  },
  hudStatLbl: {
    color: 'rgba(255, 255, 255, 0.5)',
    ...typography.caption,
    marginTop: 3,
  },
  hudStatDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  endDriveButton: {
    width: '100%',
    height: 50,
    borderRadius: 14,
    backgroundColor: '#EF4444',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#EF4444',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 4,
  },
  endDriveText: {
    color: colors.white,
    ...typography.bodyMedium,
    fontWeight: 'bold',
    fontSize: 16,
  },
  pressed: {
    opacity: 0.8,
  },
});
