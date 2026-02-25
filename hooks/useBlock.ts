import { useEffect } from 'react';
import { useBlockStore } from '@/stores/blockStore';

export function useBlock() {
  const {
    blockedUsers,
    blockedIds,
    isLoading,
    error,
    fetchBlockedUsers,
    blockUser,
    unblockUser,
    reportUser,
    isBlocked,
  } = useBlockStore();

  useEffect(() => {
    fetchBlockedUsers();
  }, []);

  return {
    blockedUsers,
    blockedIds,
    isLoading,
    error,
    blockUser,
    unblockUser,
    reportUser,
    isBlocked,
    refresh: fetchBlockedUsers,
  };
}
