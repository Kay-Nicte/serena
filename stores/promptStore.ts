import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { reportError } from '@/lib/errorReporting';

export interface ProfilePrompt {
  id: string;
  user_id: string;
  prompt_key: string;
  answer: string;
  position: number;
  created_at: string;
}

interface PromptStoreState {
  myPrompts: ProfilePrompt[];
  isLoading: boolean;

  fetchMyPrompts: () => Promise<void>;
  fetchPromptsForUser: (userId: string) => Promise<ProfilePrompt[]>;
  upsertPrompt: (promptKey: string, answer: string, position: number) => Promise<void>;
  deletePrompt: (position: number) => Promise<void>;
  reset: () => void;
}

export const usePromptStore = create<PromptStoreState>((set, get) => ({
  myPrompts: [],
  isLoading: false,

  fetchMyPrompts: async () => {
    set({ isLoading: true });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profile_prompts')
        .select('*')
        .eq('user_id', user.id)
        .order('position');

      if (error) throw error;
      set({ myPrompts: data ?? [] });
    } catch (error) {
      reportError(error, { source: 'promptStore.fetchMyPrompts' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchPromptsForUser: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profile_prompts')
        .select('*')
        .eq('user_id', userId)
        .order('position');

      if (error) throw error;
      return data ?? [];
    } catch (error) {
      reportError(error, { source: 'promptStore.fetchPromptsForUser' });
      return [];
    }
  },

  upsertPrompt: async (promptKey: string, answer: string, position: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Delete existing prompt at this position, then insert new one
      await supabase
        .from('profile_prompts')
        .delete()
        .eq('user_id', user.id)
        .eq('position', position);

      const { error } = await supabase
        .from('profile_prompts')
        .insert({
          user_id: user.id,
          prompt_key: promptKey,
          answer,
          position,
        });

      if (error) throw error;
      await get().fetchMyPrompts();
    } catch (error) {
      reportError(error, { source: 'promptStore.upsertPrompt' });
      throw error;
    }
  },

  deletePrompt: async (position: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('profile_prompts')
        .delete()
        .eq('user_id', user.id)
        .eq('position', position);

      if (error) throw error;
      await get().fetchMyPrompts();
    } catch (error) {
      reportError(error, { source: 'promptStore.deletePrompt' });
      throw error;
    }
  },

  reset: () => set({ myPrompts: [], isLoading: false }),
}));
