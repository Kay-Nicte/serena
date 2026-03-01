import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { reportError } from '@/lib/errorReporting';

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
  lastMessageAt: string | null;
  unreadCount: number;
  created_at: string;
}

interface MatchStoreState {
  matches: Match[];
  isLoading: boolean;
  error: string | null;

  fetchMatches: () => Promise<void>;
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
          unreadCount: number;
        }) => ({
          id: row.id,
          otherUser: row.otherUser,
          lastMessage: row.lastMessage,
          lastMessageImageUrl: row.lastMessageImageUrl ?? null,
          lastMessageAt: row.lastMessageAt,
          unreadCount: row.unreadCount,
          created_at: row.created_at,
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
