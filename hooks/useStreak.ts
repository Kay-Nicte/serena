import { useEffect } from 'react';
import { useDailyStatsStore } from '@/stores/dailyStatsStore';
import { useAuthStore } from '@/stores/authStore';

export function useStreak() {
  const session = useAuthStore((s) => s.session);
  const isProfileComplete = useAuthStore((s) => s.isProfileComplete);
  const fetch = useDailyStatsStore((s) => s.fetch);

  useEffect(() => {
    if (session && isProfileComplete) {
      fetch();
    }
  }, [session, isProfileComplete]);

  return useDailyStatsStore();
}
