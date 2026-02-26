import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { reportError } from '@/lib/errorReporting';

interface PremiumStatus {
  isPremium: boolean;
  premiumUntil: string | null;
  expired: boolean;
}

export function usePremium() {
  const session = useAuthStore((s) => s.session);
  const [status, setStatus] = useState<PremiumStatus>({
    isPremium: false, premiumUntil: null, expired: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchStatus = useCallback(async () => {
    if (!session) return;
    try {
      const { data, error } = await supabase.rpc('get_premium_status');
      if (error) throw error;
      setStatus({
        isPremium: data.is_premium,
        premiumUntil: data.premium_until,
        expired: data.expired,
      });
    } catch (error) {
      reportError(error, { source: 'usePremium.fetchStatus' });
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  const activateTrial = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc('activate_premium_trial');
      if (error) throw error;
      await fetchStatus();
      return data;
    } catch (error) {
      reportError(error, { source: 'usePremium.activateTrial' });
      throw error;
    }
  }, [fetchStatus]);

  return { ...status, isLoading, fetchStatus, activateTrial };
}
