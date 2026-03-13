import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { reportError } from '@/lib/errorReporting';
import type { RealtimeChannel } from '@supabase/supabase-js';

const PAGE_SIZE = 30;

export interface GroupMessage {
  id: string;
  group_id: string;
  sender_id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  sender_name: string;
  sender_avatar: string | null;
}

interface GroupChatState {
  messages: GroupMessage[];
  isLoading: boolean;
  isLoadingOlder: boolean;
  hasOlderMessages: boolean;
  error: string | null;
  subscription: RealtimeChannel | null;

  fetchMessages: (groupId: string) => Promise<void>;
  fetchOlderMessages: (groupId: string) => Promise<void>;
  sendMessage: (groupId: string, content: string, imageUrl?: string) => Promise<void>;
  subscribe: (groupId: string) => void;
  unsubscribe: () => void;
  reset: () => void;
}

// Cache sender profiles to avoid repeated lookups
const senderCache: Record<string, { name: string; avatar_url: string | null }> = {};

async function getSenderInfo(senderId: string): Promise<{ name: string; avatar_url: string | null }> {
  if (senderCache[senderId]) return senderCache[senderId];
  const { data } = await supabase
    .from('profiles')
    .select('name, avatar_url')
    .eq('id', senderId)
    .single();
  const info = { name: data?.name ?? '?', avatar_url: data?.avatar_url ?? null };
  senderCache[senderId] = info;
  return info;
}

async function enrichMessages(raw: any[]): Promise<GroupMessage[]> {
  const senderIds = [...new Set(raw.map((m) => m.sender_id))];
  await Promise.all(senderIds.map(getSenderInfo));
  return raw.map((m) => ({
    ...m,
    sender_name: senderCache[m.sender_id]?.name ?? '?',
    sender_avatar: senderCache[m.sender_id]?.avatar_url ?? null,
  }));
}

export const useGroupChatStore = create<GroupChatState>((set, get) => ({
  messages: [],
  isLoading: false,
  isLoadingOlder: false,
  hasOlderMessages: true,
  error: null,
  subscription: null,

  fetchMessages: async (groupId: string) => {
    set({ isLoading: true, error: null, hasOlderMessages: true });
    try {
      const { data, error } = await supabase
        .from('group_messages')
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: false })
        .limit(PAGE_SIZE);

      if (error) throw error;

      const rawMessages = ((data as any[]) ?? []).reverse();
      const messages = await enrichMessages(rawMessages);

      set({ messages, hasOlderMessages: (data?.length ?? 0) >= PAGE_SIZE });
    } catch (error) {
      reportError(error, { source: 'groupChatStore.fetchMessages' });
      set({ error: 'chat.errorFetching' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchOlderMessages: async (groupId: string) => {
    const { isLoadingOlder, hasOlderMessages, messages } = get();
    if (isLoadingOlder || !hasOlderMessages || messages.length === 0) return;

    set({ isLoadingOlder: true });
    try {
      const oldestMessage = messages[0];
      const { data, error } = await supabase
        .from('group_messages')
        .select('*')
        .eq('group_id', groupId)
        .lt('created_at', oldestMessage.created_at)
        .order('created_at', { ascending: false })
        .limit(PAGE_SIZE);

      if (error) throw error;

      const rawMessages = ((data as any[]) ?? []).reverse();
      const olderMessages = await enrichMessages(rawMessages);

      set({
        messages: [...olderMessages, ...messages],
        hasOlderMessages: (data?.length ?? 0) >= PAGE_SIZE,
      });
    } catch (error) {
      reportError(error, { source: 'groupChatStore.fetchOlderMessages' });
    } finally {
      set({ isLoadingOlder: false });
    }
  },

  sendMessage: async (groupId: string, content: string, imageUrl?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from('group_messages').insert({
        group_id: groupId,
        sender_id: user.id,
        content: content || '',
        image_url: imageUrl ?? null,
      });

      if (error) throw error;
    } catch (error) {
      reportError(error, { source: 'groupChatStore.sendMessage' });
      set({ error: 'chat.errorSending' });
    }
  },

  subscribe: (groupId: string) => {
    get().unsubscribe();

    const channel = supabase
      .channel(`group-messages:${groupId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'group_messages',
          filter: `group_id=eq.${groupId}`,
        },
        async (payload) => {
          const raw = payload.new as any;
          const info = await getSenderInfo(raw.sender_id);
          const newMessage: GroupMessage = {
            ...raw,
            sender_name: info.name,
            sender_avatar: info.avatar_url,
          };
          set((state) => ({
            messages: [...state.messages, newMessage],
          }));
        }
      )
      .subscribe();

    set({ subscription: channel });
  },

  unsubscribe: () => {
    const { subscription } = get();
    if (subscription) {
      supabase.removeChannel(subscription);
      set({ subscription: null });
    }
  },

  reset: () => {
    get().unsubscribe();
    set({
      messages: [],
      isLoading: false,
      isLoadingOlder: false,
      hasOlderMessages: true,
      error: null,
      subscription: null,
    });
  },
}));
