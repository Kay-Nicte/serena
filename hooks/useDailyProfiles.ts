import { useEffect } from 'react';
import { useProfileStore } from '@/stores/profileStore';

export function useDailyProfiles() {
  const {
    candidates,
    currentIndex,
    isLoading,
    matchResult,
    fetchCandidates,
    likeProfile,
    passProfile,
    clearMatchResult,
  } = useProfileStore();

  useEffect(() => {
    fetchCandidates();
  }, []);

  const currentProfile = candidates[currentIndex] ?? null;
  const hasMore = currentIndex < candidates.length;

  return {
    currentProfile,
    hasMore,
    isLoading,
    matchResult,
    like: async () => {
      if (currentProfile) {
        await likeProfile(currentProfile.id);
      }
    },
    pass: async () => {
      if (currentProfile) {
        await passProfile(currentProfile.id);
      }
    },
    clearMatchResult,
    refresh: fetchCandidates,
  };
}
