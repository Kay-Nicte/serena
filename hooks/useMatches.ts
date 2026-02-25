import { useEffect, useRef, useCallback } from 'react';
import { useMatchStore } from '@/stores/matchStore';
import { supabase } from '@/lib/supabase';

export function useMatches() {
  const { matches, isLoading, fetchMatches } = useMatchStore();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const debouncedFetch = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchMatches();
    }, 500);
  }, [fetchMatches]);

  useEffect(() => {
    fetchMatches();

    // Subscribe to message changes to keep the list fresh
    const channel = supabase
      .channel(`matches-messages-${Date.now()}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        () => { debouncedFetch(); }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'messages' },
        () => { debouncedFetch(); }
      )
      .subscribe();

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    matches,
    isLoading,
    refresh: fetchMatches,
  };
}
