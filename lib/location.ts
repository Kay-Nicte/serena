import { supabase } from './supabase';

export async function requestLocationPermission(): Promise<boolean> {
  try {
    const Location = await import('expo-location');
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
}

export async function getCurrentLocation(): Promise<{
  latitude: number;
  longitude: number;
} | null> {
  try {
    const Location = await import('expo-location');
    const { status } = await Location.getForegroundPermissionsAsync();
    if (status !== 'granted') return null;

    // Prefer last known position if available and recent (< 10 min)
    const lastKnown = await Location.getLastKnownPositionAsync();
    if (lastKnown) {
      const ageMs = Date.now() - lastKnown.timestamp;
      if (ageMs < 10 * 60 * 1000) {
        return {
          latitude: lastKnown.coords.latitude,
          longitude: lastKnown.coords.longitude,
        };
      }
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch {
    return null;
  }
}

export async function updateLocationOnServer(): Promise<void> {
  const coords = await getCurrentLocation();
  if (!coords) return;

  await supabase.rpc('update_user_location', {
    lat: coords.latitude,
    lng: coords.longitude,
  });
}

export async function reverseGeocodeCity(): Promise<string | null> {
  try {
    const coords = await getCurrentLocation();
    if (!coords) return null;

    const Location = await import('expo-location');
    const results = await Location.reverseGeocodeAsync({
      latitude: coords.latitude,
      longitude: coords.longitude,
    });

    if (results.length === 0) return null;

    const { city, region, country } = results[0];
    const parts: string[] = [];
    if (city) parts.push(city);
    if (region && region !== city) parts.push(region);
    if (country) parts.push(country);

    return parts.join(', ') || null;
  } catch {
    return null;
  }
}

export interface CitySuggestion {
  display: string;
  city: string;
  region: string;
  country: string;
}

export async function searchCities(query: string): Promise<CitySuggestion[]> {
  if (!query || query.trim().length < 2) return [];

  try {
    const url =
      `https://nominatim.openstreetmap.org/search?` +
      `q=${encodeURIComponent(query.trim())}` +
      `&format=json&addressdetails=1&limit=5` +
      `&featuretype=city`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Serenade/1.0',
        'Accept-Language': 'es,en',
      },
    });

    if (!response.ok) return [];

    const data = await response.json();

    return data.map((item: any) => {
      const addr = item.address ?? {};
      const city =
        addr.city || addr.town || addr.village || addr.municipality || item.name || '';
      const region = addr.state || addr.county || '';
      const country = addr.country || '';

      const parts: string[] = [];
      if (city) parts.push(city);
      if (region && region !== city) parts.push(region);
      if (country) parts.push(country);

      return {
        display: parts.join(', '),
        city,
        region,
        country,
      };
    });
  } catch {
    return [];
  }
}
