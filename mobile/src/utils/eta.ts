/**
 * Estimated Time of Arrival (ETA) Utilities
 * Calculates estimated travel duration based on realistic city driving speed.
 */

/**
 * Calculates estimated travel duration in minutes.
 * @param distanceKm Distance in kilometers.
 * @param averageSpeedKmH Average vehicle speed in km/h (default: 45 km/h for Riyadh traffic).
 */
export function calculateETA(
  distanceKm: number,
  averageSpeedKmH: number = 45
): number {
  if (distanceKm <= 0) return 0;

  // Time in hours = distance / speed
  const hours = distanceKm / averageSpeedKmH;
  const rawMinutes = hours * 60;

  // Add baseline margin for traffic lights / intersection stops
  const totalMinutes = Math.max(1, Math.round(rawMinutes + 2));

  return totalMinutes;
}

/**
 * Formats a duration in minutes into a localized Arabic string.
 */
export function formatETA(minutes: number): string {
  if (minutes < 1) {
    return 'أقل من دقيقة';
  }
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remainingMins = minutes % 60;
    if (remainingMins === 0) {
      return `${hours} ساعة`;
    }
    return `${hours} ساعة و ${remainingMins} دقيقة`;
  }
  return `${minutes} دقيقة`;
}
