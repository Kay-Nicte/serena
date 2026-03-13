import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { reportError } from '@/lib/errorReporting';

export interface WyrQuestion {
  id: string;
  question: Record<string, string>;
  option_a: Record<string, string>;
  option_b: Record<string, string>;
}

export interface WyrStats {
  total_votes: number;
  pct_a: number;
  pct_b: number;
}

export interface WyrProfileAnswer {
  question: Record<string, string>;
  option_a: Record<string, string>;
  option_b: Record<string, string>;
  answer: string;
}

interface WyrState {
  dailyQuestion: WyrQuestion | null;
  userAnswer: string | null;
  stats: WyrStats | null;
  loading: boolean;

  fetchDaily: () => Promise<void>;
  submitAnswer: (questionId: string, answer: string) => Promise<void>;
  fetchUserAnswers: (userId: string) => Promise<WyrProfileAnswer[]>;
}

export const useWyrStore = create<WyrState>((set) => ({
  dailyQuestion: null,
  userAnswer: null,
  stats: null,
  loading: false,

  fetchDaily: async () => {
    set({ loading: true });
    try {
      const { data, error } = await supabase.rpc('get_daily_wyr');
      if (error) throw error;
      set({
        dailyQuestion: data?.question as WyrQuestion | null,
        userAnswer: data?.user_answer ?? null,
        stats: data?.stats as WyrStats | null,
      });
    } catch (e) {
      reportError(e, { source: 'wyrStore.fetchDaily' });
    } finally {
      set({ loading: false });
    }
  },

  submitAnswer: async (questionId, answer) => {
    set({ userAnswer: answer });
    try {
      const { data, error } = await supabase.rpc('answer_wyr', {
        p_question_id: questionId,
        p_answer: answer,
      });
      if (error) throw error;
      set({ stats: data as WyrStats });
    } catch (e) {
      reportError(e, { source: 'wyrStore.submitAnswer' });
    }
  },

  fetchUserAnswers: async (userId) => {
    try {
      const { data, error } = await supabase.rpc('get_user_wyr_answers', { p_user_id: userId });
      if (error) throw error;
      return (data as WyrProfileAnswer[]) || [];
    } catch (e) {
      reportError(e, { source: 'wyrStore.fetchUserAnswers' });
      return [];
    }
  },
}));
