import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { Config } from '@/constants/config';
import { reportError } from '@/lib/errorReporting';
import i18n from '@/i18n';
import { showToast } from '@/stores/toastStore';
import type { Profile } from './authStore';
import { type Photo, withPhotoUrls } from '@/hooks/usePhotos';

interface MatchResult {
  matched: boolean;
  match_id?: string;
}

interface ProfileStoreState {
  candidates: Profile[];
  candidatePhotos: Record<string, Photo[]>;
  currentIndex: number;
  isLoading: boolean;
  error: string | null;
  matchResult: MatchResult | null;
  maxDistanceKm: number;

  fetchCandidates: () => Promise<void>;
  setMaxDistance: (km: number) => void;
  likeProfile: (targetId: string) => Promise<void>;
  passProfile: (targetId: string) => Promise<void>;
  clearMatchResult: () => void;
  reset: () => void;
}

export const useProfileStore = create<ProfileStoreState>((set, get) => ({
  candidates: [],
  candidatePhotos: {},
  currentIndex: 0,
  isLoading: false,
  error: null,
  matchResult: null,
  maxDistanceKm: Config.defaultMaxDistanceKm,

  setMaxDistance: (km: number) => set({ maxDistanceKm: km }),

  fetchCandidates: async () => {
    set({ isLoading: true, error: null });
    try {
      // Location is updated server-side via update_user_location RPC (useLocation hook).
      // Distance filtering uses profiles.location + discovery_preferences.max_distance on the DB side.
      const { data, error } = await supabase.rpc('get_daily_candidates', {
        candidate_limit: 10,
      });

      if (error) throw error;

      const candidates = (data as Profile[]) ?? [];

      // Fetch photos for all candidates
      const candidateIds = candidates.map((c) => c.id);
      const photosMap: Record<string, Photo[]> = {};

      if (candidateIds.length > 0) {
        const { data: photosData } = await supabase
          .from('photos')
          .select('*')
          .in('user_id', candidateIds)
          .order('position', { ascending: true });

        if (photosData) {
          for (const photo of withPhotoUrls(photosData)) {
            if (!photosMap[photo.user_id]) {
              photosMap[photo.user_id] = [];
            }
            photosMap[photo.user_id].push(photo);
          }
        }
      }

      set({ candidates, candidatePhotos: photosMap, currentIndex: 0 });
    } catch (error) {
      reportError(error, { source: 'profileStore.fetchCandidates' });
      set({ error: 'today.errorFetching' });
    } finally {
      set({ isLoading: false });
    }
  },

  likeProfile: async (targetId: string) => {
    try {
      const { data, error } = await supabase.rpc('like_profile', {
        target_user_id: targetId,
      });

      if (error) throw error;

      const result = data as MatchResult & { error?: string };

      if (result.error) {
        if (result.error === 'daily_limit_reached') {
          showToast(i18n.t('today.dailyLimitReached'), 'error');
        }
        // Do not advance to next candidate on error
        return;
      }

      if (result.matched) {
        set({ matchResult: result });
      }

      set((state) => ({ currentIndex: state.currentIndex + 1 }));
    } catch (error) {
      reportError(error, { source: 'profileStore.likeProfile' });
      set({ error: 'today.errorFetching' });
    }
  },

  passProfile: async (targetId: string) => {
    try {
      const { error } = await supabase.rpc('pass_profile', {
        target_user_id: targetId,
      });

      if (error) throw error;

      set((state) => ({ currentIndex: state.currentIndex + 1 }));
    } catch (error) {
      reportError(error, { source: 'profileStore.passProfile' });
      set({ error: 'today.errorFetching' });
    }
  },

  clearMatchResult: () => set({ matchResult: null }),

  reset: () =>
    set({
      candidates: [],
      candidatePhotos: {},
      currentIndex: 0,
      isLoading: false,
      error: null,
      matchResult: null,
      maxDistanceKm: Config.defaultMaxDistanceKm,
    }),
}));
