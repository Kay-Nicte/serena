import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { reportError } from '@/lib/errorReporting';

export interface TriviaQuestion {
  id: string;
  question: Record<string, string>;
  option_a: Record<string, string>;
  option_b: Record<string, string>;
}

export interface TriviaInvite {
  session_id: string;
  inviter: {
    id: string;
    name: string;
    avatar_url: string | null;
    is_verified: boolean;
  };
  created_at: string;
}

export interface TriviaSession {
  session_id: string;
  status: string;
  partner: { id: string; name: string; avatar_url: string | null };
  created_at: string;
  is_inviter: boolean;
}

export interface TriviaResult {
  session_id: string;
  status: string;
  match_percentage: number;
  partner: {
    id: string;
    name: string;
    avatar_url: string | null;
    is_verified: boolean;
  };
  answers: Array<{
    question_id: string;
    my_answer: string;
    their_answer: string;
  }>;
}

interface TriviaState {
  pendingInvites: TriviaInvite[];
  sessions: TriviaSession[];
  currentSessionId: string | null;
  questionIds: string[];
  questions: TriviaQuestion[];
  answers: Record<string, string>;
  result: TriviaResult | null;
  loading: boolean;
  submitting: boolean;

  sendInvite: (inviteeId: string) => Promise<{ success: boolean }>;
  fetchPendingInvites: () => Promise<void>;
  respondToInvite: (sessionId: string, accept: boolean) => Promise<{ accepted: boolean; questionIds?: string[] }>;
  fetchQuestions: (questionIds: string[]) => Promise<void>;
  setAnswer: (questionId: string, answer: string) => void;
  submitAnswers: () => Promise<{ completed: boolean; matchPercentage?: number }>;
  getResults: (sessionId: string) => Promise<void>;
  fetchSessions: () => Promise<void>;
  reset: () => void;
}

export const useTriviaStore = create<TriviaState>((set, get) => ({
  pendingInvites: [],
  sessions: [],
  currentSessionId: null,
  questionIds: [],
  questions: [],
  answers: {},
  result: null,
  loading: false,
  submitting: false,

  sendInvite: async (inviteeId) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase.rpc('create_trivia_invite', { p_invitee_id: inviteeId });
      if (error) throw error;
      set({ currentSessionId: data.session_id, questionIds: data.question_ids });
      await get().fetchQuestions(data.question_ids);
      return { success: true };
    } catch (e) {
      reportError(e, { source: 'triviaStore.sendInvite' });
      return { success: false };
    } finally {
      set({ loading: false });
    }
  },

  fetchPendingInvites: async () => {
    try {
      const { data, error } = await supabase.rpc('get_pending_trivia_invites');
      if (error) throw error;
      set({ pendingInvites: (data as TriviaInvite[]) || [] });
    } catch (e) {
      reportError(e, { source: 'triviaStore.fetchPendingInvites' });
    }
  },

  respondToInvite: async (sessionId, accept) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase.rpc('respond_trivia_invite', {
        p_session_id: sessionId,
        p_accept: accept,
      });
      if (error) throw error;
      if (data.accepted) {
        set({ currentSessionId: sessionId, questionIds: data.question_ids });
        await get().fetchQuestions(data.question_ids);
      }
      await get().fetchPendingInvites();
      return { accepted: data.accepted, questionIds: data.question_ids };
    } catch (e) {
      reportError(e, { source: 'triviaStore.respondToInvite' });
      return { accepted: false };
    } finally {
      set({ loading: false });
    }
  },

  fetchQuestions: async (questionIds) => {
    try {
      const { data, error } = await supabase
        .from('game_questions')
        .select('*')
        .in('id', questionIds);
      if (error) throw error;
      const sorted = questionIds
        .map((id) => (data as TriviaQuestion[]).find((q) => q.id === id))
        .filter(Boolean) as TriviaQuestion[];
      set({ questions: sorted });
    } catch (e) {
      reportError(e, { source: 'triviaStore.fetchQuestions' });
    }
  },

  setAnswer: (questionId, answer) => {
    set((s) => ({ answers: { ...s.answers, [questionId]: answer } }));
  },

  submitAnswers: async () => {
    const { currentSessionId, answers } = get();
    if (!currentSessionId) return { completed: false };
    set({ submitting: true });
    try {
      const answersArray = Object.entries(answers).map(([questionId, answer]) => ({
        question_id: questionId,
        answer,
      }));
      const { data, error } = await supabase.rpc('submit_trivia_answers', {
        p_session_id: currentSessionId,
        p_answers: answersArray,
      });
      if (error) throw error;
      if (data.completed) {
        await get().getResults(currentSessionId);
        return { completed: true, matchPercentage: data.match_percentage };
      }
      return { completed: false };
    } catch (e) {
      reportError(e, { source: 'triviaStore.submitAnswers' });
      return { completed: false };
    } finally {
      set({ submitting: false });
    }
  },

  getResults: async (sessionId) => {
    try {
      const { data, error } = await supabase.rpc('get_trivia_results', { p_session_id: sessionId });
      if (error) throw error;
      set({ result: data as TriviaResult });
    } catch (e) {
      reportError(e, { source: 'triviaStore.getResults' });
    }
  },

  fetchSessions: async () => {
    try {
      const { data, error } = await supabase.rpc('get_my_trivia_sessions');
      if (error) throw error;
      set({ sessions: (data as TriviaSession[]) || [] });
    } catch (e) {
      reportError(e, { source: 'triviaStore.fetchSessions' });
    }
  },

  reset: () => set({
    currentSessionId: null,
    questionIds: [],
    questions: [],
    answers: {},
    result: null,
    loading: false,
    submitting: false,
  }),
}));
