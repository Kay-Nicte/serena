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

export function computeActivityLevel(
  lastSeen: string | undefined,
): 'today' | 'this_week' | 'this_month' | 'inactive' | null {
  if (!lastSeen) return null;
  const diff = Date.now() - new Date(lastSeen).getTime();
  const hours = diff / 3600000;
  if (hours < 24) return 'today';
  if (hours < 168) return 'this_week';
  if (hours < 720) return 'this_month';
  return 'inactive';
}

interface ProfileStoreState {
  candidates: Profile[];
  candidatePhotos: Record<string, Photo[]>;
  candidatePresence: Record<string, string>;
  currentIndex: number;
  isLoading: boolean;
  error: string | null;
  matchResult: MatchResult | null;
  maxDistanceKm: number;

  fetchCandidates: () => Promise<void>;
  resetPasses: () => Promise<void>;
  setMaxDistance: (km: number) => void;
  likeProfile: (targetId: string) => Promise<void>;
  superlikeProfile: (targetId: string) => Promise<void>;
  passProfile: (targetId: string) => Promise<void>;
  clearMatchResult: () => void;
  reset: () => void;
}

export const useProfileStore = create<ProfileStoreState>((set, get) => ({
  candidates: [],
  candidatePhotos: {},
  candidatePresence: {},
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

      // Fetch presence data for activity level
      const presenceMap: Record<string, string> = {};
      if (candidateIds.length > 0) {
        const { data: presenceData } = await supabase
          .from('user_presence')
          .select('user_id, last_seen')
          .in('user_id', candidateIds);
        if (presenceData) {
          for (const p of presenceData) {
            presenceMap[p.user_id] = p.last_seen;
          }
        }
      }

      set({ candidates, candidatePhotos: photosMap, candidatePresence: presenceMap, currentIndex: 0 });
    } catch (error) {
      reportError(error, { source: 'profileStore.fetchCandidates' });
      set({ error: 'today.errorFetching' });
    } finally {
      set({ isLoading: false });
    }
  },

  resetPasses: async () => {
    try {
      const { error } = await supabase.rpc('reset_daily_passes');
      if (error) throw error;
      await get().fetchCandidates();
    } catch (error) {
      reportError(error, { source: 'profileStore.resetPasses' });
      showToast(i18n.t('common.error'), 'error');
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

  superlikeProfile: async (targetId: string) => {
    try {
      const { data, error } = await supabase.rpc('superlike_profile', {
        target_user_id: targetId,
      });

      if (error) throw error;

      const result = data as MatchResult & { error?: string };

      if (result.error) {
        if (result.error === 'no_superlikes_available') {
          showToast(i18n.t('superlike.noSuperlikes'), 'error');
        }
        return;
      }

      if (result.matched) {
        set({ matchResult: result });
      }

      set((state) => ({ currentIndex: state.currentIndex + 1 }));
    } catch (error) {
      reportError(error, { source: 'profileStore.superlikeProfile' });
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
      candidatePresence: {},
      currentIndex: 0,
      isLoading: false,
      error: null,
      matchResult: null,
      maxDistanceKm: Config.defaultMaxDistanceKm,
    }),
}));
