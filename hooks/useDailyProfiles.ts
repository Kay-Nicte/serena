import { useEffect, useState } from 'react';
import { useProfileStore } from '@/stores/profileStore';
import { supabase } from '@/lib/supabase';
import { getPhotoUrl } from '@/lib/storage';

export interface Photo {
  url: string;
  position: number;
}

export function useDailyProfiles() {
  const {
    candidates,
    currentIndex,
    isLoading,
    error,
    matchResult,
    fetchCandidates,
    resetPasses,
    likeProfile,
    passProfile,
    clearMatchResult,
  } = useProfileStore();

  const [currentPhotos, setCurrentPhotos] = useState<Photo[]>([]);

  const currentProfile = candidates[currentIndex] ?? null;
  const hasMore = currentIndex < candidates.length;

  useEffect(() => {
    fetchCandidates();
  }, []);

  useEffect(() => {
    if (currentProfile) {
      supabase
        .from('photos')
        .select('storage_path, position')
        .eq('user_id', currentProfile.id)
        .order('position')
        .then(({ data }) => {
          if (data && data.length > 0) {
            setCurrentPhotos(
              data.map((p) => ({
                url: getPhotoUrl(p.storage_path),
                position: p.position,
              }))
            );
          } else {
            setCurrentPhotos([]);
          }
        });
    } else {
      setCurrentPhotos([]);
    }
  }, [currentProfile?.id]);

  return {
    currentProfile,
    currentPhotos,
    hasMore,
    isLoading,
    error,
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
    resetPasses,
  };
}
