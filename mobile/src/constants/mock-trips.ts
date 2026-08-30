/**
 * Mock Trips Data
 * Realistic driving history data for the My Trips feature
 */

import { Trip, DrivingSummary } from '@/types/trips';

const now = new Date();

const daysAgo = (days: number, hour = 8, minute = 0): Date => {
  const d = new Date(now);
  d.setDate(d.getDate() - days);
  d.setHours(hour, minute, 0, 0);
  return d;
};

export const MOCK_TRIPS: Trip[] = [
  {
    id: 'trip-001',
    date: daysAgo(0, 7, 30),
    origin: { name: 'المنزل', address: 'عبدون، عمان' },
    destination: { name: 'بوليفارد العبدلي', address: 'العبدلي، عمان' },
    distanceKm: 6.4,
    durationMinutes: 12,
    averageSpeedKmh: 55,
    maxSpeedKmh: 75,
    safetyScore: 95,
    drivingStatus: 'excellent',
    speedWarnings: 0,
    camerasEncountered: 2,
    roadEvents: 0,
  },
  {
    id: 'trip-002',
    date: daysAgo(0, 17, 45),
    origin: { name: 'بوليفارد العبدلي', address: 'العبدلي، عمان' },
    destination: { name: 'سيتي مول', address: 'شارع الملك عبد الله الثاني' },
    distanceKm: 8.1,
    durationMinutes: 16,
    averageSpeedKmh: 48,
    maxSpeedKmh: 70,
    safetyScore: 90,
    drivingStatus: 'safe',
    speedWarnings: 1,
    camerasEncountered: 1,
    roadEvents: 1,
  },
  {
    id: 'trip-003',
    date: daysAgo(1, 8, 15),
    origin: { name: 'المنزل', address: 'دابوق، عمان' },
    destination: { name: 'مطار الملكة علياء الدولي', address: 'طريق المطار' },
    distanceKm: 38.5,
    durationMinutes: 34,
    averageSpeedKmh: 95,
    maxSpeedKmh: 115,
    safetyScore: 88,
    drivingStatus: 'safe',
    speedWarnings: 1,
    camerasEncountered: 4,
    roadEvents: 0,
  },
  {
    id: 'trip-004',
    date: daysAgo(1, 19, 0),
    origin: { name: 'مطار الملكة علياء الدولي', address: 'طريق المطار' },
    destination: { name: 'المنزل', address: 'دابوق، عمان' },
    distanceKm: 38.2,
    durationMinutes: 31,
    averageSpeedKmh: 98,
    maxSpeedKmh: 120,
    safetyScore: 78,
    drivingStatus: 'warnings',
    speedWarnings: 3,
    camerasEncountered: 4,
    roadEvents: 2,
  },
  {
    id: 'trip-005',
    date: daysAgo(3, 9, 0),
    origin: { name: 'المنزل', address: 'خلدا، عمان' },
    destination: { name: 'الجامعة الأردنية', address: 'شارع الملكة رانيا' },
    distanceKm: 5.3,
    durationMinutes: 10,
    averageSpeedKmh: 52,
    maxSpeedKmh: 68,
    safetyScore: 96,
    drivingStatus: 'excellent',
    speedWarnings: 0,
    camerasEncountered: 1,
    roadEvents: 0,
  },
  {
    id: 'trip-006',
    date: daysAgo(3, 14, 30),
    origin: { name: 'الجامعة الأردنية', address: 'شارع الملكة رانيا' },
    destination: { name: 'الدوار السابع', address: 'طريق المطار' },
    distanceKm: 9.2,
    durationMinutes: 18,
    averageSpeedKmh: 60,
    maxSpeedKmh: 80,
    safetyScore: 86,
    drivingStatus: 'safe',
    speedWarnings: 1,
    camerasEncountered: 2,
    roadEvents: 1,
  },
];

export const MOCK_SUMMARY: DrivingSummary = {
  totalTrips: 24,
  totalDistanceKm: 426,
  totalDrivingMinutes: 1112, // 18h 32m
  overallSafetyScore: 88,
};
