import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { reportError } from '@/lib/errorReporting';
import type { RealtimeChannel } from '@supabase/supabase-js';

const PAGE_SIZE = 30;

export interface MessageReaction {
  userId: string;
  reaction: string;
}

export interface Message {
  id: string;
  match_id: string;
  sender_id: string;
  content: string;
  image_url: string | null;
  audio_url: string | null;
  read_at: string | null;
  created_at: string;
  reactions: MessageReaction[];
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
  sendMessage: (matchId: string, content: string, imageUrl?: string, audioUrl?: string) => Promise<void>;
  markAsRead: (matchId: string) => Promise<void>;
  toggleReaction: (messageId: string, reaction: string) => Promise<void>;
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

      const rawMessages = ((data as any[]) ?? []).reverse();
      const messageIds = rawMessages.map((m) => m.id);

      // Fetch reactions for these messages
      let reactionsMap: Record<string, MessageReaction[]> = {};
      if (messageIds.length > 0) {
        const { data: reactions } = await supabase
          .from('message_reactions')
          .select('message_id, user_id, reaction')
          .in('message_id', messageIds);

        if (reactions) {
          for (const r of reactions) {
            if (!reactionsMap[r.message_id]) reactionsMap[r.message_id] = [];
            reactionsMap[r.message_id].push({ userId: r.user_id, reaction: r.reaction });
          }
        }
      }

      const messages: Message[] = rawMessages.map((m) => ({
        ...m,
        reactions: reactionsMap[m.id] ?? [],
      }));

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

      const rawMessages = ((data as any[]) ?? []).reverse();
      const messageIds = rawMessages.map((m) => m.id);

      let reactionsMap: Record<string, MessageReaction[]> = {};
      if (messageIds.length > 0) {
        const { data: reactions } = await supabase
          .from('message_reactions')
          .select('message_id, user_id, reaction')
          .in('message_id', messageIds);

        if (reactions) {
          for (const r of reactions) {
            if (!reactionsMap[r.message_id]) reactionsMap[r.message_id] = [];
            reactionsMap[r.message_id].push({ userId: r.user_id, reaction: r.reaction });
          }
        }
      }

      const olderMessages: Message[] = rawMessages.map((m) => ({
        ...m,
        reactions: reactionsMap[m.id] ?? [],
      }));

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

  sendMessage: async (matchId: string, content: string, imageUrl?: string, audioUrl?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from('messages').insert({
        match_id: matchId,
        sender_id: user.id,
        content: content || '',
        image_url: imageUrl ?? null,
        audio_url: audioUrl ?? null,
      });

      if (error) throw error;
    } catch (error) {
      reportError(error, { source: 'chatStore.sendMessage' });
      set({ error: 'chat.errorSending' });
    }
  },

  toggleReaction: async (messageId: string, reaction: string) => {
    const { messages } = get();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Optimistic update
    const prevMessages = messages;
    set({
      messages: messages.map((msg) => {
        if (msg.id !== messageId) return msg;
        const existing = msg.reactions.find((r) => r.userId === user.id);
        let newReactions: MessageReaction[];
        if (!existing) {
          newReactions = [...msg.reactions, { userId: user.id, reaction }];
        } else if (existing.reaction === reaction) {
          newReactions = msg.reactions.filter((r) => r.userId !== user.id);
        } else {
          newReactions = msg.reactions.map((r) =>
            r.userId === user.id ? { ...r, reaction } : r
          );
        }
        return { ...msg, reactions: newReactions };
      }),
    });

    try {
      const { error } = await supabase.rpc('toggle_reaction', {
        target_message_id: messageId,
        reaction_type: reaction,
      });
      if (error) throw error;
    } catch (error) {
      // Revert on failure
      set({ messages: prevMessages });
      reportError(error, { source: 'chatStore.toggleReaction' });
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

    // Collect message IDs for reaction filtering
    const getMessageIds = () => get().messages.map((m) => m.id);

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
          const raw = payload.new as any;
          const newMessage: Message = { ...raw, reactions: [] };
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
          const updated = payload.new as any;
          set((state) => ({
            messages: state.messages.map((msg) =>
              msg.id === updated.id ? { ...msg, read_at: updated.read_at } : msg
            ),
          }));
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'message_reactions',
        },
        (payload) => {
          const record = (payload.new || payload.old) as any;
          if (!record?.message_id) return;
          const messageIds = getMessageIds();
          if (!messageIds.includes(record.message_id)) return;

          // Refetch reactions for this specific message
          supabase
            .from('message_reactions')
            .select('message_id, user_id, reaction')
            .eq('message_id', record.message_id)
            .then(({ data }) => {
              const reactions: MessageReaction[] = (data ?? []).map((r: any) => ({
                userId: r.user_id,
                reaction: r.reaction,
              }));
              set((state) => ({
                messages: state.messages.map((msg) =>
                  msg.id === record.message_id ? { ...msg, reactions } : msg
                ),
              }));
            });
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
