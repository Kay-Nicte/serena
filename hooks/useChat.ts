import { useEffect } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { updatePresence } from '@/lib/presence';

export function useChat(matchId: string) {
  const {
    messages,
    isLoading,
    isLoadingOlder,
    hasOlderMessages,
    fetchMessages,
    fetchOlderMessages,
    sendMessage,
    markAsRead,
    subscribe,
    unsubscribe,
  } = useChatStore();

  useEffect(() => {
    fetchMessages(matchId);
    subscribe(matchId);
    markAsRead(matchId);

    return () => {
      unsubscribe();
      // Clear typing when leaving chat
      updatePresence(true, null);
    };
  }, [matchId]);

  return {
    messages,
    isLoading,
    isLoadingOlder,
    hasOlderMessages,
    sendMessage: async (content: string, imageUrl?: string) => {
      await sendMessage(matchId, content, imageUrl);
    },
    fetchOlderMessages: () => fetchOlderMessages(matchId),
    markAsRead: () => markAsRead(matchId),
  };
}
