import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';

export function useAuth() {
  const { initialize, isLoading, session, user, profile, isProfileComplete, isProfileFetched } =
    useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return {
    isLoading,
    isAuthenticated: !!session,
    session,
    user,
    profile,
    isProfileComplete,
    isProfileFetched,
  };
}
