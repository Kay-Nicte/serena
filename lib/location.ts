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
