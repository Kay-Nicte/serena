import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { reportError } from '@/lib/errorReporting';

export interface QuizQuestion {
  id: string;
  question: Record<string, string>;
  options: Record<string, string>[];
  category: string;
}

export interface LeaderboardEntry {
  user_id: string;
  name: string;
  avatar_url: string | null;
  is_verified: boolean;
  score: number;
  total: number;
  played_at: string;
}

interface QuizState {
  questions: QuizQuestion[];
  answers: Record<string, number>; // question_id -> selected option index
  alreadyPlayed: boolean;
  score: number | null;
  total: number | null;
  myLastScore: { score: number; total: number; played_at: string } | null;
  leaderboard: LeaderboardEntry[];
  loading: boolean;
  submitting: boolean;

  fetchDailyQuiz: () => Promise<void>;
  setAnswer: (questionId: string, selected: number) => void;
  submitQuiz: () => Promise<void>;
  fetchLeaderboard: () => Promise<void>;
  reset: () => void;
}

export const useQuizStore = create<QuizState>((set, get) => ({
  questions: [],
  answers: {},
  alreadyPlayed: false,
  score: null,
  total: null,
  myLastScore: null,
  leaderboard: [],
  loading: false,
  submitting: false,

  fetchDailyQuiz: async () => {
    set({ loading: true });
    try {
      const { data, error } = await supabase.rpc('get_daily_quiz');
      if (error) throw error;
      if (data.already_played) {
        set({ alreadyPlayed: true });
      } else {
        set({ questions: (data.questions as QuizQuestion[]) || [], alreadyPlayed: false });
      }
    } catch (e) {
      reportError(e, { source: 'quizStore.fetchDailyQuiz' });
    } finally {
      set({ loading: false });
    }
  },

  setAnswer: (questionId, selected) => {
    set((s) => ({ answers: { ...s.answers, [questionId]: selected } }));
  },

  submitQuiz: async () => {
    const { answers } = get();
    set({ submitting: true });
    try {
      const answersArray = Object.entries(answers).map(([questionId, selected]) => ({
        question_id: questionId,
        selected,
      }));
      const { data, error } = await supabase.rpc('submit_quiz', { p_answers: answersArray });
      if (error) throw error;
      set({ score: data.score, total: data.total, alreadyPlayed: true });
    } catch (e) {
      reportError(e, { source: 'quizStore.submitQuiz' });
    } finally {
      set({ submitting: false });
    }
  },

  fetchLeaderboard: async () => {
    try {
      const { data, error } = await supabase.rpc('get_quiz_leaderboard');
      if (error) throw error;
      set({
        myLastScore: data.my_score ?? null,
        leaderboard: (data.leaderboard as LeaderboardEntry[]) ?? [],
      });
    } catch (e) {
      reportError(e, { source: 'quizStore.fetchLeaderboard' });
    }
  },

  reset: () => set({
    questions: [],
    answers: {},
    alreadyPlayed: false,
    score: null,
    total: null,
    myLastScore: null,
    leaderboard: [],
    loading: false,
    submitting: false,
  }),
}));
