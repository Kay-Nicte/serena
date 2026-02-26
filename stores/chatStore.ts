import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { reportError } from '@/lib/errorReporting';
import type { RealtimeChannel } from '@supabase/supabase-js';

const PAGE_SIZE = 30;

export interface Message {
  id: string;
  match_id: string;
  sender_id: string;
  content: string;
  image_url: string | null;
  read_at: string | null;
  created_at: string;
}

interface ChatStoreState {
  messages: Message[];
  activeMatchId: string | null;
  isLoading: boolean;
  isLoadingOlder: boolean;
  hasOlderMessages: boolean;
  error: string | null;
  subscription: RealtimeChannel | null;

  fetchMessages: (matchId: string) => Promise<void>;
  fetchOlderMessages: (matchId: string) => Promise<void>;
  sendMessage: (matchId: string, content: string, imageUrl?: string) => Promise<void>;
  markAsRead: (matchId: string) => Promise<void>;
  subscribe: (matchId: string) => void;
  unsubscribe: () => void;
  reset: () => void;
}

export const useChatStore = create<ChatStoreState>((set, get) => ({
  messages: [],
  activeMatchId: null,
  isLoading: false,
  isLoadingOlder: false,
  hasOlderMessages: true,
  error: null,
  subscription: null,

  fetchMessages: async (matchId: string) => {
    set({ isLoading: true, error: null, activeMatchId: matchId, hasOlderMessages: true });
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('match_id', matchId)
        .order('created_at', { ascending: false })
        .limit(PAGE_SIZE);

      if (error) throw error;

      const messages = ((data as Message[]) ?? []).reverse();
      set({ messages, hasOlderMessages: (data?.length ?? 0) >= PAGE_SIZE });
    } catch (error) {
      reportError(error, { source: 'chatStore.fetchMessages' });
      set({ error: 'chat.errorFetching' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchOlderMessages: async (matchId: string) => {
    const { isLoadingOlder, hasOlderMessages, messages } = get();
    if (isLoadingOlder || !hasOlderMessages || messages.length === 0) return;

    set({ isLoadingOlder: true });
    try {
      const oldestMessage = messages[0];
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('match_id', matchId)
        .lt('created_at', oldestMessage.created_at)
        .order('created_at', { ascending: false })
        .limit(PAGE_SIZE);

      if (error) throw error;

      const olderMessages = ((data as Message[]) ?? []).reverse();
      set({
        messages: [...olderMessages, ...messages],
        hasOlderMessages: (data?.length ?? 0) >= PAGE_SIZE,
      });
    } catch (error) {
      reportError(error, { source: 'chatStore.fetchOlderMessages' });
    } finally {
      set({ isLoadingOlder: false });
    }
  },

  sendMessage: async (matchId: string, content: string, imageUrl?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from('messages').insert({
        match_id: matchId,
        sender_id: user.id,
        content: content || '',
        image_url: imageUrl ?? null,
      });

      if (error) throw error;
    } catch (error) {
      reportError(error, { source: 'chatStore.sendMessage' });
      set({ error: 'chat.errorSending' });
    }
  },

  markAsRead: async (matchId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('match_id', matchId)
        .neq('sender_id', user.id)
        .is('read_at', null);

      if (error) throw error;
    } catch (error) {
      reportError(error, { source: 'chatStore.markAsRead' });
    }
  },

  subscribe: (matchId: string) => {
    // Clean up any existing subscription
    get().unsubscribe();

    const channel = supabase
      .channel(`messages:${matchId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          set((state) => ({
            messages: [...state.messages, newMessage],
          }));
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          const updated = payload.new as Message;
          set((state) => ({
            messages: state.messages.map((msg) =>
              msg.id === updated.id ? { ...msg, read_at: updated.read_at } : msg
            ),
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
      activeMatchId: null,
      isLoading: false,
      isLoadingOlder: false,
      hasOlderMessages: true,
      error: null,
      subscription: null,
    });
  },
}));
