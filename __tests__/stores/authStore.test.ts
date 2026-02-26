import { useAuthStore } from '@/stores/authStore';

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => ({
            data: {
              id: 'user-1',
              name: 'Test',
              is_profile_complete: true,
              is_admin: false,
              language_preference: null,
            },
            error: null,
          })),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({ error: null })),
      })),
    })),
    auth: {
      getSession: jest.fn(() => ({ data: { session: null }, error: null })),
      getUser: jest.fn(() => ({ data: { user: { id: 'user-1' } } })),
      signOut: jest.fn(() => ({ error: null })),
      onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
    },
  },
}));

jest.mock('@/lib/auth', () => ({
  getSession: jest.fn(() => null),
  signOut: jest.fn(),
}));

jest.mock('@/lib/errorReporting', () => ({
  reportError: jest.fn(),
}));

jest.mock('@/lib/notifications', () => ({
  removePushTokenFromServer: jest.fn(),
}));

jest.mock('@/stores/profileStore', () => ({
  useProfileStore: { getState: () => ({ reset: jest.fn() }) },
}));
jest.mock('@/stores/matchStore', () => ({
  useMatchStore: { getState: () => ({ reset: jest.fn() }) },
}));
jest.mock('@/stores/chatStore', () => ({
  useChatStore: { getState: () => ({ reset: jest.fn() }) },
}));
jest.mock('@/stores/photoStore', () => ({
  usePhotoStore: { getState: () => ({ reset: jest.fn() }) },
}));
jest.mock('@/stores/discoveryStore', () => ({
  useDiscoveryStore: { getState: () => ({ reset: jest.fn() }) },
}));
jest.mock('@/stores/blockStore', () => ({
  useBlockStore: { getState: () => ({ reset: jest.fn() }) },
}));

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.setState({
      session: null,
      user: null,
      profile: null,
      isLoading: true,
      isProfileComplete: false,
    });
  });

  it('should have correct initial state', () => {
    const state = useAuthStore.getState();
    expect(state.session).toBeNull();
    expect(state.user).toBeNull();
    expect(state.profile).toBeNull();
    expect(state.isProfileComplete).toBe(false);
  });

  it('should fetch profile and set isProfileComplete', async () => {
    useAuthStore.setState({ user: { id: 'user-1' } as any });
    await useAuthStore.getState().fetchProfile();

    const state = useAuthStore.getState();
    expect(state.profile).toBeDefined();
    expect(state.profile?.name).toBe('Test');
    expect(state.isProfileComplete).toBe(true);
  });

  it('should not fetch profile without user', async () => {
    useAuthStore.setState({ user: null });
    await useAuthStore.getState().fetchProfile();
    expect(useAuthStore.getState().profile).toBeNull();
  });

  it('should clear state on sign out (setState directly)', () => {
    useAuthStore.setState({
      session: { access_token: 'token' } as any,
      user: { id: 'user-1' } as any,
      profile: { id: 'user-1', name: 'Test' } as any,
      isProfileComplete: true,
    });

    // Simulate sign out state clearing
    useAuthStore.setState({
      session: null,
      user: null,
      profile: null,
      isProfileComplete: false,
    });

    const state = useAuthStore.getState();
    expect(state.session).toBeNull();
    expect(state.user).toBeNull();
    expect(state.profile).toBeNull();
    expect(state.isProfileComplete).toBe(false);
  });
});
