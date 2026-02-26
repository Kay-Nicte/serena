import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { reportError } from '@/lib/errorReporting';

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  reward: string | null;
  availableSuperlikes: number;
  availableIceBreakers: number;
  alreadyCheckedIn: boolean;
}

export function useStreak() {
  const session = useAuthStore((s) => s.session);
  const isProfileComplete = useAuthStore((s) => s.isProfileComplete);
  const [streak, setStreak] = useState<StreakData>({
    currentStreak: 0, longestStreak: 0, reward: null,
    availableSuperlikes: 0, availableIceBreakers: 0, alreadyCheckedIn: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  const checkIn = useCallback(async () => {
    if (!session || !isProfileComplete) return;
    try {
      const { data, error } = await supabase.rpc('check_in_streak');
      if (error) throw error;
      setStreak({
        currentStreak: data.current_streak,
        longestStreak: data.longest_streak,
        reward: data.reward,
        availableSuperlikes: data.available_superlikes,
        availableIceBreakers: data.available_ice_breakers,
        alreadyCheckedIn: data.already_checked_in,
      });
    } catch (error) {
      reportError(error, { source: 'useStreak.checkIn' });
    } finally {
      setIsLoading(false);
    }
  }, [session, isProfileComplete]);

  useEffect(() => { checkIn(); }, [checkIn]);

  return { ...streak, isLoading, refresh: checkIn };
}
