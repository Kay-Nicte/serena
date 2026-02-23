import { useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import { AppState } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';

/**
 * Requests location permission, gets current coordinates,
 * and saves them to profiles.location as a PostGIS point.
 * Runs on mount and when the app comes back to foreground.
 * Fails silently if permission is denied.
 */
export function useLocation() {
  const hasUpdated = useRef(false);

  const updateLocation = async () => {
    try {
      const user = useAuthStore.getState().user;
      if (!user) return;

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = position.coords;

      await supabase
        .from('profiles')
        .update({
          location: `POINT(${longitude} ${latitude})`,
        })
        .eq('id', user.id);
    } catch (error) {
      // Silently fail - location is optional
      console.log('Location update skipped:', error);
    }
  };

  useEffect(() => {
    if (!hasUpdated.current) {
      hasUpdated.current = true;
      updateLocation();
    }

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        updateLocation();
      }
    });

    return () => subscription.remove();
  }, []);
}
