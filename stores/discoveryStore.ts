import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { Config } from '@/constants/config';

export interface DiscoveryPreferences {
  user_id: string;
  min_age: number;
  max_age: number;
  orientations: string[] | null;
  looking_for: string[] | null;
}

interface DiscoveryStoreState {
  preferences: DiscoveryPreferences | null;
  isLoading: boolean;

  fetchPreferences: () => Promise<void>;
  updatePreferences: (updates: Partial<Omit<DiscoveryPreferences, 'user_id'>>) => Promise<void>;
  reset: () => void;
}

export const useDiscoveryStore = create<DiscoveryStoreState>((set, get) => ({
  preferences: null,
  isLoading: false,

  fetchPreferences: async () => {
    set({ isLoading: true });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('discovery_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      set({ preferences: data as DiscoveryPreferences | null });
    } catch (error) {
      console.error('Error fetching discovery preferences:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  updatePreferences: async (updates) => {
    set({ isLoading: true });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const current = get().preferences;
      const payload = {
        user_id: user.id,
        min_age: updates.min_age ?? current?.min_age ?? Config.minAge,
        max_age: updates.max_age ?? current?.max_age ?? Config.maxAge,
        orientations: updates.orientations !== undefined ? updates.orientations : (current?.orientations ?? null),
        looking_for: updates.looking_for !== undefined ? updates.looking_for : (current?.looking_for ?? null),
      };

      const { data, error } = await supabase
        .from('discovery_preferences')
        .upsert(payload, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) throw error;

      set({ preferences: data as DiscoveryPreferences });
    } catch (error) {
      console.error('Error updating discovery preferences:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  reset: () => set({ preferences: null, isLoading: false }),
}));
