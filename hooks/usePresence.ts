import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { useAuthStore } from '@/stores/authStore';
import { updatePresence } from '@/lib/presence';

export function usePresence() {
  const isProfileComplete = useAuthStore((s) => s.isProfileComplete);
  const session = useAuthStore((s) => s.session);
  const hasInitRef = useRef(false);

  useEffect(() => {
    if (!session || !isProfileComplete) return;

    if (!hasInitRef.current) {
      hasInitRef.current = true;
      updatePresence(true);
    }

    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        updatePresence(true);
      } else if (nextState === 'background' || nextState === 'inactive') {
        updatePresence(false);
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
      updatePresence(false);
    };
  }, [session, isProfileComplete]);
}
