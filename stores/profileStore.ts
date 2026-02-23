import { create } from 'zustand';
import * as Location from 'expo-location';
import { supabase } from '@/lib/supabase';
import { Config } from '@/constants/config';
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
  matchResult: null,
  maxDistanceKm: Config.defaultMaxDistanceKm,

  setMaxDistance: (km: number) => set({ maxDistanceKm: km }),

  fetchCandidates: async () => {
    set({ isLoading: true });
    try {
      // Try to get user's current location for distance filtering
      const rpcParams: Record<string, unknown> = {
        candidate_limit: 10,
        max_distance_km: get().maxDistanceKm,
      };

      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status === 'granted') {
          const position = await Location.getLastKnownPositionAsync();
          if (position) {
            rpcParams.user_lat = position.coords.latitude;
            rpcParams.user_lng = position.coords.longitude;
          }
        }
      } catch {
        // Location not available, proceed without it
      }

      const { data, error } = await supabase.rpc('get_daily_candidates', rpcParams);

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
      console.error('Error fetching candidates:', error);
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

      const result = data as MatchResult;

      if (result.matched) {
        set({ matchResult: result });
      }

      set((state) => ({ currentIndex: state.currentIndex + 1 }));
    } catch (error) {
      console.error('Error liking profile:', error);
    }
  },

  passProfile: async (targetId: string) => {
    try {
      const { error } = await supabase.from('daily_profiles').insert({
        user_id: (await supabase.auth.getUser()).data.user?.id,
        target_id: targetId,
        action: 'pass',
        action_date: new Date().toISOString().split('T')[0],
      });

      if (error) throw error;

      set((state) => ({ currentIndex: state.currentIndex + 1 }));
    } catch (error) {
      console.error('Error passing profile:', error);
    }
  },

  clearMatchResult: () => set({ matchResult: null }),

  reset: () =>
    set({
      candidates: [],
      candidatePhotos: {},
      currentIndex: 0,
      isLoading: false,
      matchResult: null,
      maxDistanceKm: Config.defaultMaxDistanceKm,
    }),
}));
