/**
 * Calculates the distance (in km) between point A and B using Earth's radius as the spherical surface.
 * @param pointALat Latitude of Point A
 * @param pointALon Longitude of Point A
 * @param pointBLat Latitude of Point B
 * @param pointBLon Longitude of Point B
 * @returns The distance in meters.
 */
export function haversineDistance(
  pointALat: number,
  pointALon: number,
  pointBLat: number,
  pointBLon: number
): number {
  const radius = 6371000; // Earth's radius in meters

  // Convert latitude and longitude differences to radians
  const deltaLatitude = (pointBLat - pointALat) * (Math.PI / 180);
  const deltaLongitude = (pointBLon - pointALon) * (Math.PI / 180);

  // Convert latitude values to radians
  const latARadians = pointALat * (Math.PI / 180);
  const latBRadians = pointBLat * (Math.PI / 180);

  // Haversine formula
  const halfChordLength =
    Math.sin(deltaLatitude / 2) * Math.sin(deltaLatitude / 2) +
    Math.cos(latARadians) *
      Math.cos(latBRadians) *
      Math.sin(deltaLongitude / 2) *
      Math.sin(deltaLongitude / 2);

  const angularDistance = 2 * Math.atan2(Math.sqrt(halfChordLength), Math.sqrt(1 - halfChordLength));

  // Distance in kilometers
  return radius * angularDistance;
}
