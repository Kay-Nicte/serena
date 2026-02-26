import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { reportError } from '@/lib/errorReporting';

export interface BlockedUser {
  id: string;
  blocked_id: string;
  blocked_name: string | null;
  blocked_avatar_url: string | null;
  created_at: string;
}

type ReportReason =
  | 'inappropriate_content'
  | 'fake_profile'
  | 'harassment'
  | 'spam'
  | 'other';

interface BlockStoreState {
  blockedUsers: BlockedUser[];
  blockedIds: Set<string>;
  isLoading: boolean;
  error: string | null;

  fetchBlockedUsers: () => Promise<void>;
  blockUser: (targetUserId: string) => Promise<void>;
  unblockUser: (targetUserId: string) => Promise<void>;
  reportUser: (
    targetUserId: string,
    reason: ReportReason,
    description?: string,
  ) => Promise<void>;
  isBlocked: (userId: string) => boolean;
  reset: () => void;
}

export const useBlockStore = create<BlockStoreState>((set, get) => ({
  blockedUsers: [],
  blockedIds: new Set(),
  isLoading: false,
  error: null,

  fetchBlockedUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_blocks')
        .select(
          `
          id,
          blocked_id,
          created_at,
          blocked:profiles!user_blocks_blocked_id_fkey(name, avatar_url)
        `,
        )
        .eq('blocker_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const blockedUsers: BlockedUser[] = (data ?? []).map((row: any) => {
        const profile = Array.isArray(row.blocked)
          ? row.blocked[0]
          : row.blocked;
        return {
          id: row.id,
          blocked_id: row.blocked_id,
          blocked_name: profile?.name ?? null,
          blocked_avatar_url: profile?.avatar_url ?? null,
          created_at: row.created_at,
        };
      });

      set({
        blockedUsers,
        blockedIds: new Set(blockedUsers.map((b) => b.blocked_id)),
      });
    } catch (error) {
      reportError(error, { source: 'blockStore.fetchBlockedUsers' });
      set({ error: 'block.errorFetching' });
    } finally {
      set({ isLoading: false });
    }
  },

  blockUser: async (targetUserId: string) => {
    try {
      const { error } = await supabase.rpc('block_user', {
        target_user_id: targetUserId,
      });
      if (error) throw error;

      await get().fetchBlockedUsers();
    } catch (error) {
      reportError(error, { source: 'blockStore.blockUser' });
      set({ error: 'block.errorBlocking' });
      throw error;
    }
  },

  unblockUser: async (targetUserId: string) => {
    try {
      const { error } = await supabase.rpc('unblock_user', {
        target_user_id: targetUserId,
      });
      if (error) throw error;

      await get().fetchBlockedUsers();
    } catch (error) {
      reportError(error, { source: 'blockStore.unblockUser' });
      set({ error: 'block.errorUnblocking' });
      throw error;
    }
  },

  reportUser: async (
    targetUserId: string,
    reason: ReportReason,
    description?: string,
  ) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Check for existing active report from this user against the same person
      const { data: existing } = await supabase
        .from('reports')
        .select('id')
        .eq('reporter_id', user.id)
        .eq('reported_id', targetUserId)
        .in('status', ['pending', 'reviewed'])
        .limit(1);

      if (existing && existing.length > 0) {
        throw new Error('DUPLICATE_REPORT');
      }

      const { error } = await supabase.from('reports').insert({
        reporter_id: user.id,
        reported_id: targetUserId,
        reason,
        description: description || null,
      });

      if (error) throw error;
    } catch (error: any) {
      reportError(error, { source: 'blockStore.reportUser' });
      if (error?.message === 'DUPLICATE_REPORT') {
        set({ error: 'report.alreadyReported' });
      } else {
        set({ error: 'report.errorSubmitting' });
      }
      throw error;
    }
  },

  isBlocked: (userId: string) => get().blockedIds.has(userId),

  reset: () =>
    set({
      blockedUsers: [],
      blockedIds: new Set(),
      isLoading: false,
      error: null,
    }),
}));
