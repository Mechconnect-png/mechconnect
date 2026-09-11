/**
 * Calculate distance in kilometers between two coordinates using Haversine formula
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 100) / 100;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Calculate estimated time of arrival in minutes assuming urban speed of 30 km/h
 */
export function calculateEtaMinutes(distanceKm: number): number {
  const averageSpeedKmH = 30;
  const timeHours = distanceKm / averageSpeedKmH;
  const timeMinutes = Math.ceil(timeHours * 60);
  return Math.max(3, timeMinutes); // Minimum 3 minutes
}
