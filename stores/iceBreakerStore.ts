import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

interface IceBreakerSender {
  id: string;
  name: string | null;
  avatar_url: string | null;
  bio: string | null;
  birth_date: string | null;
}

export interface IceBreaker {
  id: string;
  message: string;
  created_at: string;
  sender: IceBreakerSender;
}

interface SendResult {
  success?: boolean;
  error?: string;
}

interface RespondResult {
  success?: boolean;
  action?: string;
  match_id?: string;
  error?: string;
}

interface IceBreakerStoreState {
  pendingIceBreakers: IceBreaker[];
  isLoading: boolean;
  error: string | null;

  fetchPending: () => Promise<void>;
  sendIceBreaker: (targetUserId: string, message: string) => Promise<{ success: boolean; errorKey?: string }>;
  respondToIceBreaker: (iceBreakerId: string, accept: boolean) => Promise<{ matchId?: string }>;
  reset: () => void;
}

export const useIceBreakerStore = create<IceBreakerStoreState>((set) => ({
  pendingIceBreakers: [],
  isLoading: false,
  error: null,

  fetchPending: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase.rpc('get_pending_ice_breakers');
      if (error) throw error;
      set({ pendingIceBreakers: (data as IceBreaker[]) ?? [] });
    } catch (error) {
      console.error('Error fetching pending ice breakers:', error);
      set({ error: 'iceBreaker.errorFetching' });
    } finally {
      set({ isLoading: false });
    }
  },

  sendIceBreaker: async (targetUserId, message) => {
    try {
      const { data, error } = await supabase.rpc('send_ice_breaker', {
        target_user_id: targetUserId,
        ice_breaker_message: message,
      });
      if (error) throw error;

      const result = data as SendResult;
      if (result.error) {
        return { success: false, errorKey: result.error };
      }
      return { success: true };
    } catch (error) {
      console.error('Error sending ice breaker:', error);
      return { success: false };
    }
  },

  respondToIceBreaker: async (iceBreakerId, accept) => {
    try {
      const { data, error } = await supabase.rpc('respond_to_ice_breaker', {
        target_ice_breaker_id: iceBreakerId,
        accept,
      });
      if (error) throw error;

      const result = data as RespondResult;
      if (result.error) return {};

      // Remove from local list
      set((state) => ({
        pendingIceBreakers: state.pendingIceBreakers.filter(
          (ib) => ib.id !== iceBreakerId
        ),
      }));

      if (accept && result.match_id) {
        return { matchId: result.match_id };
      }
      return {};
    } catch (error) {
      console.error('Error responding to ice breaker:', error);
      return {};
    }
  },

  reset: () => set({ pendingIceBreakers: [], isLoading: false, error: null }),
}));
