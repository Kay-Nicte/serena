import { useEffect } from 'react';
import { useChatStore } from '@/stores/chatStore';

export function useChat(matchId: string) {
  const {
    messages,
    isLoading,
    fetchMessages,
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
    };
  }, [matchId]);

  return {
    messages,
    isLoading,
    sendMessage: async (content: string) => {
      await sendMessage(matchId, content);
    },
    markAsRead: () => markAsRead(matchId),
  };
}
