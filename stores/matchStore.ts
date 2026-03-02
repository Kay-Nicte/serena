import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { reportError } from '@/lib/errorReporting';
import { showToast } from '@/stores/toastStore';
import * as SecureStore from 'expo-secure-store';
import i18next from 'i18next';

export interface MatchUser {
  id: string;
  name: string | null;
  avatar_url: string | null;
  is_verified?: boolean;
}

export interface Match {
  id: string;
  otherUser: MatchUser;
  lastMessage: string | null;
  lastMessageImageUrl: string | null;
  lastMessageAudioUrl: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
  created_at: string;
  isFavorite: boolean;
}

interface MatchStoreState {
  matches: Match[];
  isLoading: boolean;
  error: string | null;

  fetchMatches: () => Promise<void>;
  toggleFavorite: (matchId: string) => Promise<void>;
  unmatchUser: (matchId: string) => Promise<void>;
  reset: () => void;
}

export const useMatchStore = create<MatchStoreState>((set, get) => ({
  matches: [],
  isLoading: false,
  error: null,

  fetchMatches: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase.rpc('get_matches_with_details');

      if (error) throw error;

      // The RPC returns a JSON array already sorted by last activity descending.
      const matches: Match[] = (data ?? []).map(
        (row: {
          id: string;
          created_at: string;
          otherUser: MatchUser;
          lastMessage: string | null;
          lastMessageAt: string | null;
          lastMessageImageUrl: string | null;
          lastMessageAudioUrl: string | null;
          unreadCount: number;
          isFavorite: boolean;
        }) => ({
          id: row.id,
          otherUser: row.otherUser,
          lastMessage: row.lastMessage,
          lastMessageImageUrl: row.lastMessageImageUrl ?? null,
          lastMessageAudioUrl: row.lastMessageAudioUrl ?? null,
          lastMessageAt: row.lastMessageAt,
          unreadCount: row.unreadCount,
          created_at: row.created_at,
          isFavorite: row.isFavorite ?? false,
        })
      );

      set({ matches });
    } catch (error) {
      reportError(error, { source: 'matchStore.fetchMatches' });
      set({ error: 'matches.errorFetching' });
    } finally {
      set({ isLoading: false });
    }
  },

  toggleFavorite: async (matchId: string) => {
    const prev = get().matches;
    // Optimistic update: toggle and re-sort (favorites first, then by activity)
    const updated = prev.map((m) =>
      m.id === matchId ? { ...m, isFavorite: !m.isFavorite } : m
    );
    updated.sort((a, b) => {
      if (a.isFavorite !== b.isFavorite) return a.isFavorite ? -1 : 1;
      const dateA = a.lastMessageAt ?? a.created_at;
      const dateB = b.lastMessageAt ?? b.created_at;
      return dateB.localeCompare(dateA);
    });
    set({ matches: updated });

    // First-time toast
    try {
      const shown = await SecureStore.getItemAsync('favorite_toast_shown');
      if (!shown) {
        showToast(i18next.t('matches.favoriteInfoToast'), 'success', 4000);
        await SecureStore.setItemAsync('favorite_toast_shown', 'true');
      }
    } catch { /* ignore SecureStore errors */ }

    try {
      const { error } = await supabase.rpc('toggle_match_favorite', {
        target_match_id: matchId,
      });
      if (error) throw error;
    } catch (error) {
      // Revert on failure
      set({ matches: prev });
      reportError(error, { source: 'matchStore.toggleFavorite' });
      showToast(i18next.t('common.error'), 'error');
    }
  },

  unmatchUser: async (matchId: string) => {
    try {
      const { error } = await supabase.rpc('unmatch_user', {
        target_match_id: matchId,
      });

      if (error) throw error;

      await get().fetchMatches();
    } catch (error) {
      reportError(error, { source: 'matchStore.unmatchUser' });
      throw error;
    }
  },

  reset: () => set({ matches: [], isLoading: false, error: null }),
}));
