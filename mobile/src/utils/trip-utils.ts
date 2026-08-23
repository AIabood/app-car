/**
 * Trip utility helpers
 */

import { Trip, DrivingStatus, GroupedTrips, FilterPeriod } from '@/types/trips';

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} دقيقة`;
  if (m === 0) return `${h} ساعة`;
  return `${h}س ${m}د`;
}

export function formatTotalTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}س ${m}د`;
}

export function formatTime(date: Date): string {
  const h = date.getHours();
  const m = date.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'م' : 'ص';
  const h12 = h % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}

export function formatDateAr(date: Date): string {
  const months = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
  ];
  return `${date.getDate()} ${months[date.getMonth()]}`;
}

export function getDrivingStatusLabel(status: DrivingStatus): string {
  switch (status) {
    case 'excellent': return 'قيادة ممتازة';
    case 'safe': return 'قيادة آمنة';
    case 'warnings': return 'تحذيرات سرعة';
    case 'caution': return 'يحتاج تحسين';
  }
}

export function getDrivingStatusColor(status: DrivingStatus): string {
  switch (status) {
    case 'excellent': return '#10B981'; // green
    case 'safe': return '#3B82F6';      // blue
    case 'warnings': return '#F59E0B';  // amber
    case 'caution': return '#EF4444';   // red
  }
}

export function getSafetyScoreColor(score: number): string {
  if (score >= 90) return '#10B981';
  if (score >= 75) return '#3B82F6';
  if (score >= 60) return '#F59E0B';
  return '#EF4444';
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function filterTrips(trips: Trip[], period: FilterPeriod): Trip[] {
  const now = new Date();
  switch (period) {
    case 'today':
      return trips.filter((t) => isSameDay(t.date, now));
    case 'week': {
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return trips.filter((t) => t.date >= weekAgo);
    }
    case 'month': {
      const monthAgo = new Date(now);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return trips.filter((t) => t.date >= monthAgo);
    }
    default:
      return trips;
  }
}

export function groupTripsByDate(trips: Trip[]): GroupedTrips[] {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  const groups: Record<string, Trip[]> = {};
  const labelOrder: string[] = [];

  for (const trip of trips) {
    let label: string;
    if (isSameDay(trip.date, now)) {
      label = 'اليوم';
    } else if (isSameDay(trip.date, yesterday)) {
      label = 'أمس';
    } else {
      label = formatDateAr(trip.date);
    }

    if (!groups[label]) {
      groups[label] = [];
      labelOrder.push(label);
    }
    groups[label].push(trip);
  }

  return labelOrder.map((label) => ({ label, trips: groups[label] }));
}
