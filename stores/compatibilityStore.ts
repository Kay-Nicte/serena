import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { reportError } from '@/lib/errorReporting';

export interface CompatibleProfile {
  user_id: string;
  name: string;
  avatar_url: string | null;
  is_verified: boolean;
  compatibility_pct: number;
  compared_fields: number;
  is_match: boolean;
}

interface CompatibilityState {
  result: CompatibleProfile | null;
  found: boolean | null; // null = not searched yet, true/false = result
  loading: boolean;

  findMostCompatible: () => Promise<void>;
  reset: () => void;
}

export const useCompatibilityStore = create<CompatibilityState>((set) => ({
  result: null,
  found: null,
  loading: false,

  findMostCompatible: async () => {
    set({ loading: true, found: null, result: null });
    try {
      const { data, error } = await supabase.rpc('find_most_compatible');
      if (error) throw error;
      if (data?.found) {
        set({
          found: true,
          result: {
            user_id: data.user_id,
            name: data.name,
            avatar_url: data.avatar_url,
            is_verified: data.is_verified,
            compatibility_pct: data.compatibility_pct,
            compared_fields: data.compared_fields,
            is_match: data.is_match ?? false,
          },
        });
      } else {
        set({ found: false });
      }
    } catch (e) {
      reportError(e, { source: 'compatibilityStore.findMostCompatible' });
      set({ found: false });
    } finally {
      set({ loading: false });
    }
  },

  reset: () => set({ result: null, found: null, loading: false }),
}));
