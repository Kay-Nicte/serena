import { useEffect } from 'react';
import { useMatchStore } from '@/stores/matchStore';

export function useMatches() {
  const { matches, isLoading, fetchMatches } = useMatchStore();

  useEffect(() => {
    fetchMatches();
  }, []);

  return {
    matches,
    isLoading,
    refresh: fetchMatches,
  };
}
