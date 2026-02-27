import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { reportError } from '@/lib/errorReporting';

interface DailyStatsState {
  remainingLikes: number;
  totalLikes: number;
  availableSuperlikes: number;
  availableIceBreakers: number;
  currentStreak: number;
  longestStreak: number;
  reward: string | null;
  isLoading: boolean;

  fetch: () => Promise<void>;
  decrementLike: () => void;
  decrementSuperlike: () => void;
  decrementIceBreaker: () => void;
  reset: () => void;
}

export const useDailyStatsStore = create<DailyStatsState>((set) => ({
  remainingLikes: 0,
  totalLikes: 0,
  availableSuperlikes: 0,
  availableIceBreakers: 0,
  currentStreak: 0,
  longestStreak: 0,
  reward: null,
  isLoading: true,

  fetch: async () => {
    try {
      const [streakRes, likesRes] = await Promise.all([
        supabase.rpc('check_in_streak'),
        supabase.rpc('get_remaining_likes'),
      ]);

      if (streakRes.error) throw streakRes.error;
      if (likesRes.error) throw likesRes.error;

      const s = streakRes.data;
      const l = likesRes.data;

      set({
        currentStreak: s.current_streak,
        longestStreak: s.longest_streak,
        reward: s.already_checked_in ? null : s.reward,
        availableSuperlikes: s.available_superlikes,
        availableIceBreakers: s.available_ice_breakers,
        totalLikes: l.total_limit,
        remainingLikes: l.remaining,
        isLoading: false,
      });
    } catch (error) {
      reportError(error, { source: 'dailyStatsStore.fetch' });
      set({ isLoading: false });
    }
  },

  decrementLike: () =>
    set((state) => ({
      remainingLikes: Math.max(state.remainingLikes - 1, 0),
    })),

  decrementSuperlike: () =>
    set((state) => ({
      availableSuperlikes: Math.max(state.availableSuperlikes - 1, 0),
    })),

  decrementIceBreaker: () =>
    set((state) => ({
      availableIceBreakers: Math.max(state.availableIceBreakers - 1, 0),
    })),

  reset: () =>
    set({
      remainingLikes: 0,
      totalLikes: 0,
      availableSuperlikes: 0,
      availableIceBreakers: 0,
      currentStreak: 0,
      longestStreak: 0,
      reward: null,
      isLoading: true,
    }),
}));
