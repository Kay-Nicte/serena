import { useChatStore } from '@/stores/chatStore';

const mockMessages = [
  { id: '1', match_id: 'm1', sender_id: 'u1', content: 'Hello', image_url: null, read_at: null, created_at: '2025-01-01T10:00:00Z' },
  { id: '2', match_id: 'm1', sender_id: 'u2', content: 'Hi!', image_url: null, read_at: null, created_at: '2025-01-01T10:01:00Z' },
];

const mockChannel = { subscribe: jest.fn() };

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            limit: jest.fn(() => ({ data: [...mockMessages].reverse(), error: null })),
          })),
          lt: jest.fn(() => ({
            order: jest.fn(() => ({
              limit: jest.fn(() => ({ data: [], error: null })),
            })),
          })),
        })),
      })),
      insert: jest.fn(() => ({ error: null })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          neq: jest.fn(() => ({
            is: jest.fn(() => ({ error: null })),
          })),
        })),
      })),
    })),
    auth: {
      getUser: jest.fn(() => ({ data: { user: { id: 'u1' } } })),
    },
    channel: jest.fn(() => ({
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn(),
    })),
    removeChannel: jest.fn(),
  },
}));

jest.mock('@/lib/errorReporting', () => ({
  reportError: jest.fn(),
}));

describe('chatStore', () => {
  beforeEach(() => {
    useChatStore.getState().reset();
    jest.clearAllMocks();
  });

  it('should have correct initial state', () => {
    const state = useChatStore.getState();
    expect(state.messages).toEqual([]);
    expect(state.activeMatchId).toBeNull();
    expect(state.isLoading).toBe(false);
    expect(state.isLoadingOlder).toBe(false);
    expect(state.hasOlderMessages).toBe(true);
    expect(state.error).toBeNull();
  });

  it('should fetch messages with pagination', async () => {
    await useChatStore.getState().fetchMessages('m1');
    const state = useChatStore.getState();
    expect(state.messages).toHaveLength(2);
    // Messages should be in chronological order (reversed from desc query)
    expect(state.messages[0].id).toBe('1');
    expect(state.messages[1].id).toBe('2');
    expect(state.activeMatchId).toBe('m1');
    expect(state.isLoading).toBe(false);
    // Less than PAGE_SIZE (30) messages, so no older messages
    expect(state.hasOlderMessages).toBe(false);
  });

  it('should set loading state during fetch', async () => {
    const promise = useChatStore.getState().fetchMessages('m1');
    expect(useChatStore.getState().isLoading).toBe(true);
    await promise;
    expect(useChatStore.getState().isLoading).toBe(false);
  });

  it('should handle send message', async () => {
    const { supabase } = require('@/lib/supabase');
    await useChatStore.getState().sendMessage('m1', 'Test message');
    expect(supabase.from).toHaveBeenCalledWith('messages');
  });

  it('should reset state', () => {
    useChatStore.setState({
      messages: mockMessages as any,
      activeMatchId: 'm1',
      isLoading: true,
      error: 'some error',
    });
    useChatStore.getState().reset();
    const state = useChatStore.getState();
    expect(state.messages).toEqual([]);
    expect(state.activeMatchId).toBeNull();
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should not fetch older messages when already loading', async () => {
    useChatStore.setState({ isLoadingOlder: true, messages: mockMessages as any });
    const { supabase } = require('@/lib/supabase');
    const fromCallCount = supabase.from.mock.calls.length;
    await useChatStore.getState().fetchOlderMessages('m1');
    // Should not have called supabase.from again
    expect(supabase.from.mock.calls.length).toBe(fromCallCount);
  });

  it('should not fetch older messages when hasOlderMessages is false', async () => {
    useChatStore.setState({ hasOlderMessages: false, messages: mockMessages as any });
    const { supabase } = require('@/lib/supabase');
    const fromCallCount = supabase.from.mock.calls.length;
    await useChatStore.getState().fetchOlderMessages('m1');
    expect(supabase.from.mock.calls.length).toBe(fromCallCount);
  });
});
