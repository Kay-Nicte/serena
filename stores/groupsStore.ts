import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { reportError } from '@/lib/errorReporting';

export interface Group {
  id: string;
  slug: string;
  icon: string;
  color: string;
  member_count: number;
  is_member: boolean;
}

export interface GroupMember {
  id: string;
  name: string;
  avatar_url: string | null;
  age: number | null;
  hometown: string | null;
  is_verified: boolean;
}

interface GroupsState {
  groups: Group[];
  members: GroupMember[];
  loading: boolean;
  membersLoading: boolean;
  fetchGroups: () => Promise<void>;
  joinGroup: (groupId: string) => Promise<{ success: boolean }>;
  leaveGroup: (groupId: string) => Promise<{ success: boolean }>;
  fetchMembers: (groupId: string) => Promise<void>;
  reset: () => void;
}

export const useGroupsStore = create<GroupsState>((set, get) => ({
  groups: [],
  members: [],
  loading: false,
  membersLoading: false,

  fetchGroups: async () => {
    set({ loading: true });
    try {
      const { data, error } = await supabase.rpc('get_groups');
      if (error) throw error;
      set({ groups: (data as Group[]) ?? [] });
    } catch (e) {
      reportError(e, { source: 'groupsStore.fetchGroups' });
    } finally {
      set({ loading: false });
    }
  },

  joinGroup: async (groupId: string) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('group_members')
        .insert({ group_id: groupId, user_id: userData.user.id });
      if (error) throw error;

      // Optimistic update
      set((state) => ({
        groups: state.groups.map((g) =>
          g.id === groupId
            ? { ...g, is_member: true, member_count: g.member_count + 1 }
            : g
        ),
      }));
      return { success: true };
    } catch (e) {
      reportError(e, { source: 'groupsStore.joinGroup' });
      return { success: false };
    }
  },

  leaveGroup: async (groupId: string) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', userData.user.id);
      if (error) throw error;

      set((state) => ({
        groups: state.groups.map((g) =>
          g.id === groupId
            ? { ...g, is_member: false, member_count: Math.max(0, g.member_count - 1) }
            : g
        ),
      }));
      return { success: true };
    } catch (e) {
      reportError(e, { source: 'groupsStore.leaveGroup' });
      return { success: false };
    }
  },

  fetchMembers: async (groupId: string) => {
    set({ membersLoading: true, members: [] });
    try {
      const { data, error } = await supabase.rpc('get_group_members', { p_group_id: groupId });
      if (error) throw error;
      set({ members: (data as GroupMember[]) ?? [] });
    } catch (e) {
      reportError(e, { source: 'groupsStore.fetchMembers' });
    } finally {
      set({ membersLoading: false });
    }
  },

  reset: () => set({ groups: [], members: [], loading: false, membersLoading: false }),
}));
