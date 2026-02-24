import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { useAuthStore } from '@/stores/authStore';
import { requestLocationPermission, updateLocationOnServer } from '@/lib/location';

export function useLocation() {
  const isProfileComplete = useAuthStore((s) => s.isProfileComplete);
  const session = useAuthStore((s) => s.session);
  const hasUpdatedRef = useRef(false);

  useEffect(() => {
    if (!session || !isProfileComplete) return;

    const updateLocation = async () => {
      const granted = await requestLocationPermission();
      if (granted) {
        await updateLocationOnServer();
      }
    };

    if (!hasUpdatedRef.current) {
      hasUpdatedRef.current = true;
      updateLocation();
    }

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
