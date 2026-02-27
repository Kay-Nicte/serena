import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { reportError } from '@/lib/errorReporting';

export type VerificationStatus = 'none' | 'pending' | 'approved' | 'rejected';

interface VerificationRequest {
  id: string;
  gesture: string;
  status: VerificationStatus;
  rejection_reason: string | null;
  created_at: string;
  reviewed_at: string | null;
}

interface VerificationState {
  status: VerificationStatus;
  isVerified: boolean;
  latestRequest: VerificationRequest | null;
  currentGesture: string | null;
  isLoading: boolean;

  fetchStatus: () => Promise<void>;
  fetchRandomGesture: () => Promise<string>;
  submitRequest: (selfiePath: string, gestureCode: string) => Promise<{ success: boolean; error?: string }>;
  reset: () => void;
}

export const useVerificationStore = create<VerificationState>((set) => ({
  status: 'none',
  isVerified: false,
  latestRequest: null,
  currentGesture: null,
  isLoading: false,

  fetchStatus: async () => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase.rpc('get_verification_status');
      if (error) throw error;
      set({
        isVerified: data.is_verified,
        status: data.verification_status,
        latestRequest: data.latest_request,
      });
    } catch (error) {
      reportError(error, { source: 'verificationStore.fetchStatus' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchRandomGesture: async () => {
    const { data, error } = await supabase.rpc('get_random_gesture');
    if (error) throw error;
    const gesture = data as string;
    set({ currentGesture: gesture });
    return gesture;
  },

  submitRequest: async (selfiePath, gestureCode) => {
    try {
      const { data, error } = await supabase.rpc('submit_verification_request', {
        selfie_path: selfiePath,
        gesture_code: gestureCode,
      });
      if (error) throw error;
      if (data.error) return { success: false, error: data.error };
      set({ status: 'pending' });
      return { success: true };
    } catch (error) {
      reportError(error, { source: 'verificationStore.submitRequest' });
      return { success: false };
    }
  },

  reset: () => set({
    status: 'none',
    isVerified: false,
    latestRequest: null,
    currentGesture: null,
    isLoading: false,
  }),
}));
