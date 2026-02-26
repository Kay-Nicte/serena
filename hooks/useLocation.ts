import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { useAuthStore } from '@/stores/authStore';
import { requestLocationPermission, updateLocationOnServer } from '@/lib/location';

const MIN_UPDATE_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes

export function useLocation() {
  const isProfileComplete = useAuthStore((s) => s.isProfileComplete);
  const session = useAuthStore((s) => s.session);
  const lastUpdateRef = useRef<number>(0);

  useEffect(() => {
    if (!session || !isProfileComplete) return;

    const updateLocation = async () => {
      const now = Date.now();
      if (now - lastUpdateRef.current < MIN_UPDATE_INTERVAL_MS) return;

      const granted = await requestLocationPermission();
      if (granted) {
        await updateLocationOnServer();
        lastUpdateRef.current = now;
      }
    };

    // Initial update
    updateLocation();

    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        updateLocation();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [session, isProfileComplete]);
}
