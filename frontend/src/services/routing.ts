export interface RouteResult {
  coordinates: Array<[number, number]>;
  distanceMeters: number;
  durationSeconds: number;
  etaMinutes: number;
}

export interface LocationSearchResult {
  placeId: string;
  displayName: string;
  lat: number;
  lng: number;
}

/**
 * Searches location suggestions using OpenStreetMap Nominatim geocoding API.
 * Uses query parameter and returns latitude, longitude, and formatted display address.
 */
export async function searchLocationSuggestions(query: string): Promise<LocationSearchResult[]> {
  if (!query || query.trim().length < 2) return [];

  const trimmed = query.trim();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const encoded = encodeURIComponent(trimmed);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encoded}&limit=5`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.map((item: any) => ({
          placeId: String(item.place_id || Math.random()),
          displayName: item.display_name,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon)
        }));
      }
    }
  } catch (err) {
    console.warn('[GEOCODING] Nominatim search network fallback:', err);
  }

  // Pre-configured geocoded fallback dictionary for reliable offline/demo testing
  const fallbackDict: Array<{ keys: string[]; displayName: string; lat: number; lng: number }> = [
    {
      keys: ['gandhipuram', 'gandhi puram'],
      displayName: 'Gandhipuram, Coimbatore, Tamil Nadu, India',
      lat: 11.0168,
      lng: 76.9558
    },
    {
      keys: ['rs puram', 'r.s. puram', 'rspuram'],
      displayName: 'RS Puram, Coimbatore, Tamil Nadu, India',
      lat: 11.0084,
      lng: 76.9463
    },
    {
      keys: ['anna nagar'],
      displayName: 'Anna Nagar, Chennai, Tamil Nadu, India',
      lat: 13.0890,
      lng: 80.2750
    },
    {
      keys: ['t nagar', 't. nagar', 'thyagaraya nagar'],
      displayName: 'T Nagar, Chennai, Tamil Nadu, India',
      lat: 13.0418,
      lng: 80.2341
    },
    {
      keys: ['avinashi road', 'avinashi'],
      displayName: 'Avinashi Road, Coimbatore, Tamil Nadu, India',
      lat: 11.0183,
      lng: 76.9742
    },
    {
      keys: ['peelamedu'],
      displayName: 'Peelamedu, Coimbatore, Tamil Nadu, India',
      lat: 11.0270,
      lng: 77.0030
    },
    {
      keys: ['adyar'],
      displayName: 'Adyar, Chennai, Tamil Nadu, India',
      lat: 13.0012,
      lng: 80.2565
    },
    {
      keys: ['velachery'],
      displayName: 'Velachery, Chennai, Tamil Nadu, India',
      lat: 12.9759,
      lng: 80.2212
    },
    {
      keys: ['guindy'],
      displayName: 'Guindy, Chennai, Tamil Nadu, India',
      lat: 13.0067,
      lng: 80.2020
    },
    {
      keys: ['madurai'],
      displayName: 'Madurai Main, Madurai, Tamil Nadu, India',
      lat: 9.9252,
      lng: 78.1198
    },
    {
      keys: ['trichy', 'tiruchirappalli'],
      displayName: 'Tiruchirappalli, Tamil Nadu, India',
      lat: 10.7905,
      lng: 78.7047
    },
    {
      keys: ['salem'],
      displayName: 'Salem City, Tamil Nadu, India',
      lat: 11.6643,
      lng: 78.1460
    }
  ];

  const lower = trimmed.toLowerCase();
  const matched = fallbackDict.filter(item =>
    item.keys.some(k => lower.includes(k) || k.includes(lower))
  );

  if (matched.length > 0) {
    return matched.map((item, idx) => ({
      placeId: `fallback-${idx}`,
      displayName: item.displayName,
      lat: item.lat,
      lng: item.lng
    }));
  }

  return [];
}

/**
 * Reverse geocodes latitude and longitude into a readable street address using OpenStreetMap Nominatim API.
 * Falls back to clean coordinate string if network/service is unavailable.
 */
export async function fetchAddressFromCoords(lat: number, lng: number): Promise<string> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.display_name) {
        const parts = data.display_name.split(', ');
        if (parts.length > 3) {
          return `${parts[0]}, ${parts[1]}, ${parts[2]}`;
        }
        return data.display_name;
      }
    }
  } catch (err) {
    console.warn('[GPS] Reverse geocoding fallback used:', err);
  }

  return `Breakdown Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
}

/**
 * Calculates Haversine distance in meters between two lat/lng points.
 */
export function getHaversineDistanceMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Fallback route generator when OSRM public service is unreachable.
 * Generates a realistic multi-point road-like curve with turns instead of a direct 2-point line.
 */
function generateFallbackRoadRoute(
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number
): RouteResult {
  const pointsCount = 14;
  const coordinates: Array<[number, number]> = [];

  const directDistance = getHaversineDistanceMeters(startLat, startLng, endLat, endLng);
  // Direct distance vector
  const deltaLat = endLat - startLat;
  const deltaLng = endLng - startLng;

  // Perpendicular vector for road curvature simulation
  const perpLat = -deltaLng;
  const perpLng = deltaLat;

  for (let i = 0; i <= pointsCount; i++) {
    const t = i / pointsCount;
    // Base linear interpolation
    let lat = startLat + deltaLat * t;
    let lng = startLng + deltaLng * t;

    // Add realistic road curves at 25%, 50%, 75% progress
    if (i > 0 && i < pointsCount) {
      const curveIntensity = Math.sin(t * Math.PI * 2.5) * 0.18;
      lat += perpLat * curveIntensity;
      lng += perpLng * curveIntensity;
    }

    coordinates.push([lat, lng]);
  }

  // Calculate cumulative distance along path
  let totalDistance = 0;
  for (let i = 0; i < coordinates.length - 1; i++) {
    totalDistance += getHaversineDistanceMeters(
      coordinates[i][0],
      coordinates[i][1],
      coordinates[i + 1][0],
      coordinates[i + 1][1]
    );
  }

  // Assume urban driving speed ~30 km/h (8.33 m/s)
  const durationSeconds = Math.round(totalDistance / 8.33);
  const etaMinutes = Math.max(1, Math.round(durationSeconds / 60));

  return {
    coordinates,
    distanceMeters: Math.round(totalDistance),
    durationSeconds,
    etaMinutes
  };
}

/**
 * Fetches actual road geometry using OpenStreetMap / OSRM public routing API.
 * Uses fallback curved multi-point route if network or API is unavailable.
 */
export async function fetchRoadRoute(
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number
): Promise<RouteResult> {
  // If coordinates are almost identical, return single point
  const distM = getHaversineDistanceMeters(startLat, startLng, endLat, endLng);
  if (distM < 5) {
    return {
      coordinates: [[startLat, startLng], [endLat, endLng]],
      distanceMeters: Math.round(distM),
      durationSeconds: 0,
      etaMinutes: 0
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4-second timeout for OSRM fetch

    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;

    const response = await fetch(osrmUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`OSRM API responded with status ${response.status}`);
    }

    const data = await response.json();

    if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
      const primaryRoute = data.routes[0];
      // OSRM returns coordinates as [lng, lat]
      const rawCoords: Array<[number, number]> = primaryRoute.geometry.coordinates;
      
      // Convert to Leaflet format [lat, lng]
      const coordinates: Array<[number, number]> = rawCoords.map(([lng, lat]) => [lat, lng]);

      const distanceMeters = Math.round(primaryRoute.distance);
      const durationSeconds = Math.round(primaryRoute.duration);
      const etaMinutes = Math.max(1, Math.round(durationSeconds / 60));

      return {
        coordinates,
        distanceMeters,
        durationSeconds,
        etaMinutes
      };
    } else {
      throw new Error('OSRM API returned no valid routes.');
    }
  } catch (error) {
    console.warn('[ROUTING] OSRM service unavailable, using realistic road curve fallback:', error);
    return generateFallbackRoadRoute(startLat, startLng, endLat, endLng);
  }
}
