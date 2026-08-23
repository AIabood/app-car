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
    origin: { name: 'المنزل', address: 'حي الملقا، الرياض' },
    destination: { name: 'برج المملكة', address: 'طريق الملك فهد، العليا' },
    distanceKm: 8.4,
    durationMinutes: 14,
    averageSpeedKmh: 62,
    maxSpeedKmh: 88,
    safetyScore: 94,
    drivingStatus: 'excellent',
    speedWarnings: 0,
    camerasEncountered: 2,
    roadEvents: 0,
  },
  {
    id: 'trip-002',
    date: daysAgo(0, 17, 45),
    origin: { name: 'برج المملكة', address: 'طريق الملك فهد، العليا' },
    destination: { name: 'الرياض بارك', address: 'طريق الدائري الشمالي' },
    distanceKm: 5.1,
    durationMinutes: 11,
    averageSpeedKmh: 48,
    maxSpeedKmh: 79,
    safetyScore: 89,
    drivingStatus: 'safe',
    speedWarnings: 1,
    camerasEncountered: 1,
    roadEvents: 1,
  },
  {
    id: 'trip-003',
    date: daysAgo(1, 8, 15),
    origin: { name: 'المنزل', address: 'حي الملقا، الرياض' },
    destination: { name: 'مطار الملك خالد الدولي', address: 'طريق مطار الملك خالد' },
    distanceKm: 34.5,
    durationMinutes: 32,
    averageSpeedKmh: 95,
    maxSpeedKmh: 130,
    safetyScore: 71,
    drivingStatus: 'warnings',
    speedWarnings: 4,
    camerasEncountered: 5,
    roadEvents: 2,
  },
  {
    id: 'trip-004',
    date: daysAgo(1, 19, 0),
    origin: { name: 'مطار الملك خالد الدولي', address: 'طريق مطار الملك خالد' },
    destination: { name: 'المنزل', address: 'حي الملقا، الرياض' },
    distanceKm: 35.2,
    durationMinutes: 28,
    averageSpeedKmh: 101,
    maxSpeedKmh: 140,
    safetyScore: 65,
    drivingStatus: 'caution',
    speedWarnings: 7,
    camerasEncountered: 5,
    roadEvents: 3,
  },
  {
    id: 'trip-005',
    date: daysAgo(3, 9, 0),
    origin: { name: 'المنزل', address: 'حي الملقا، الرياض' },
    destination: { name: 'بوليفارد رياض سيتي', address: 'طريق الأمير تركي بن عبدالعزيز' },
    distanceKm: 7.3,
    durationMinutes: 12,
    averageSpeedKmh: 58,
    maxSpeedKmh: 82,
    safetyScore: 92,
    drivingStatus: 'excellent',
    speedWarnings: 0,
    camerasEncountered: 2,
    roadEvents: 0,
  },
  {
    id: 'trip-006',
    date: daysAgo(3, 14, 30),
    origin: { name: 'بوليفارد رياض سيتي', address: 'طريق الأمير تركي بن عبدالعزيز' },
    destination: { name: 'برج الفيصلية', address: 'طريق الملك فهد، العليا' },
    distanceKm: 10.2,
    durationMinutes: 17,
    averageSpeedKmh: 68,
    maxSpeedKmh: 96,
    safetyScore: 85,
    drivingStatus: 'safe',
    speedWarnings: 1,
    camerasEncountered: 3,
    roadEvents: 1,
  },
  {
    id: 'trip-007',
    date: daysAgo(5, 7, 45),
    origin: { name: 'المنزل', address: 'حي الملقا، الرياض' },
    destination: { name: 'برج الفيصلية', address: 'طريق الملك فهد، العليا' },
    distanceKm: 10.2,
    durationMinutes: 15,
    averageSpeedKmh: 70,
    maxSpeedKmh: 92,
    safetyScore: 90,
    drivingStatus: 'excellent',
    speedWarnings: 0,
    camerasEncountered: 3,
    roadEvents: 0,
  },
  {
    id: 'trip-008',
    date: daysAgo(7, 18, 0),
    origin: { name: 'الرياض بارك', address: 'طريق الدائري الشمالي' },
    destination: { name: 'المنزل', address: 'حي الملقا، الرياض' },
    distanceKm: 5.8,
    durationMinutes: 10,
    averageSpeedKmh: 57,
    maxSpeedKmh: 77,
    safetyScore: 96,
    drivingStatus: 'excellent',
    speedWarnings: 0,
    camerasEncountered: 1,
    roadEvents: 0,
  },
];

export const MOCK_SUMMARY: DrivingSummary = {
  totalTrips: 24,
  totalDistanceKm: 426,
  totalDrivingMinutes: 1112, // 18h 32m
  overallSafetyScore: 88,
};
