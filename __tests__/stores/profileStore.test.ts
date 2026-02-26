import { useProfileStore } from '@/stores/profileStore';

// Mock supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    rpc: jest.fn(),
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        in: jest.fn(() => ({
          order: jest.fn(() => ({ data: [], error: null })),
        })),
      })),
      insert: jest.fn(() => ({ error: null })),
    })),
    auth: {
      getUser: jest.fn(() => ({ data: { user: { id: 'user-1' } } })),
    },
  },
}));

jest.mock('expo-location', () => ({
  getForegroundPermissionsAsync: jest.fn(() => ({ status: 'denied' })),
  getLastKnownPositionAsync: jest.fn(() => null),
}));

jest.mock('@/lib/errorReporting', () => ({
  reportError: jest.fn(),
}));

jest.mock('@/hooks/usePhotos', () => ({
  withPhotoUrls: (photos: any[]) => photos,
}));

describe('profileStore', () => {
  beforeEach(() => {
    useProfileStore.getState().reset();
  });

  it('should have correct initial state', () => {
    const state = useProfileStore.getState();
    expect(state.candidates).toEqual([]);
    expect(state.currentIndex).toBe(0);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.matchResult).toBeNull();
    expect(state.maxDistanceKm).toBe(50);
  });

  it('should set max distance', () => {
    useProfileStore.getState().setMaxDistance(100);
    expect(useProfileStore.getState().maxDistanceKm).toBe(100);
  });

  it('should clear match result', () => {
    useProfileStore.setState({ matchResult: { matched: true, match_id: '123' } });
    useProfileStore.getState().clearMatchResult();
    expect(useProfileStore.getState().matchResult).toBeNull();
  });

  it('should reset state', () => {
    useProfileStore.setState({
      candidates: [{ id: '1' } as any],
      currentIndex: 3,
      error: 'some error',
    });
    useProfileStore.getState().reset();
    const state = useProfileStore.getState();
    expect(state.candidates).toEqual([]);
    expect(state.currentIndex).toBe(0);
    expect(state.error).toBeNull();
  });

  it('should fetch candidates and set loading state', async () => {
    const { supabase } = require('@/lib/supabase');
    supabase.rpc.mockResolvedValueOnce({ data: [], error: null });

    const promise = useProfileStore.getState().fetchCandidates();
    expect(useProfileStore.getState().isLoading).toBe(true);

    await promise;
    expect(useProfileStore.getState().isLoading).toBe(false);
    expect(useProfileStore.getState().candidates).toEqual([]);
  });

  it('should handle fetch candidates error', async () => {
    const { supabase } = require('@/lib/supabase');
    supabase.rpc.mockResolvedValueOnce({ data: null, error: new Error('Network error') });

    await useProfileStore.getState().fetchCandidates();
    expect(useProfileStore.getState().error).toBe('today.errorFetching');
    expect(useProfileStore.getState().isLoading).toBe(false);
  });

  it('should increment currentIndex on pass', async () => {
    const { supabase } = require('@/lib/supabase');
    supabase.from.mockReturnValueOnce({
      insert: jest.fn(() => ({ error: null })),
    });

    await useProfileStore.getState().passProfile('target-1');
    expect(useProfileStore.getState().currentIndex).toBe(1);
  });
});
