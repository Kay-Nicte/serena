import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { reportError } from '@/lib/errorReporting';
import { Config } from '@/constants/config';

export interface DiscoveryPreferences {
  user_id: string;
  min_age: number;
  max_age: number;
  orientations: string[] | null;
  looking_for: string[] | null;
  max_distance: number | null;
  smoking: string[] | null;
  drinking: string[] | null;
  children: string[] | null;
  pets: string[] | null;
  zodiac: string[] | null;
  hogwarts_house: string[] | null;
  min_height: number | null;
  max_height: number | null;
  smoking_include_unspecified: boolean;
  drinking_include_unspecified: boolean;
  children_include_unspecified: boolean;
  pets_include_unspecified: boolean;
  zodiac_include_unspecified: boolean;
  hogwarts_include_unspecified: boolean;
  height_include_unspecified: boolean;
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
      reportError(error, { source: 'discoveryStore.fetchPreferences' });
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
        max_distance: updates.max_distance !== undefined ? updates.max_distance : (current?.max_distance ?? null),
        smoking: updates.smoking !== undefined ? updates.smoking : (current?.smoking ?? null),
        drinking: updates.drinking !== undefined ? updates.drinking : (current?.drinking ?? null),
        children: updates.children !== undefined ? updates.children : (current?.children ?? null),
        pets: updates.pets !== undefined ? updates.pets : (current?.pets ?? null),
        zodiac: updates.zodiac !== undefined ? updates.zodiac : (current?.zodiac ?? null),
        hogwarts_house: updates.hogwarts_house !== undefined ? updates.hogwarts_house : (current?.hogwarts_house ?? null),
        min_height: updates.min_height !== undefined ? updates.min_height : (current?.min_height ?? null),
        max_height: updates.max_height !== undefined ? updates.max_height : (current?.max_height ?? null),
        smoking_include_unspecified: updates.smoking_include_unspecified ?? current?.smoking_include_unspecified ?? true,
        drinking_include_unspecified: updates.drinking_include_unspecified ?? current?.drinking_include_unspecified ?? true,
        children_include_unspecified: updates.children_include_unspecified ?? current?.children_include_unspecified ?? true,
        pets_include_unspecified: updates.pets_include_unspecified ?? current?.pets_include_unspecified ?? true,
        zodiac_include_unspecified: updates.zodiac_include_unspecified ?? current?.zodiac_include_unspecified ?? true,
        hogwarts_include_unspecified: updates.hogwarts_include_unspecified ?? current?.hogwarts_include_unspecified ?? true,
        height_include_unspecified: updates.height_include_unspecified ?? current?.height_include_unspecified ?? true,
      };

      const { data, error } = await supabase
        .from('discovery_preferences')
        .upsert(payload, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) throw error;

      set({ preferences: data as DiscoveryPreferences });
    } catch (error) {
      reportError(error, { source: 'discoveryStore.updatePreferences' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  reset: () => set({ preferences: null, isLoading: false }),
}));
