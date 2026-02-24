import { useEffect } from 'react';
import { useDiscoveryStore } from '@/stores/discoveryStore';

export function useDiscoveryPreferences() {
  const { preferences, isLoading, fetchPreferences, updatePreferences } =
    useDiscoveryStore();

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  return {
    preferences,
    isLoading,
    updatePreferences,
    refresh: fetchPreferences,
  };
}
