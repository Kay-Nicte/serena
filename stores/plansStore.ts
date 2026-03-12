import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { reportError } from '@/lib/errorReporting';
import * as Location from 'expo-location';

export interface Plan {
  id: string;
  creator_id: string;
  creator_name: string;
  creator_avatar: string | null;
  title: string;
  description: string | null;
  category: 'viajes' | 'ocio' | 'cultura';
  location_name: string;
  event_date: string;
  max_attendees: number | null;
  attendee_count: number;
  is_joined: boolean;
  is_creator: boolean;
  created_at: string;
  distance_km: number | null;
}

export type PlanCategory = 'todos' | 'cerca' | 'viajes' | 'ocio' | 'cultura';

interface CreatePlanData {
  title: string;
  description?: string | null;
  category: 'viajes' | 'ocio' | 'cultura';
  location_name: string;
  latitude?: number;
  longitude?: number;
  event_date: string;
  max_attendees?: number | null;
}

interface PlansState {
  plans: Plan[];
  loading: boolean;
  category: PlanCategory;
  fetchPlans: () => Promise<void>;
  joinPlan: (planId: string) => Promise<{ success: boolean; error?: string }>;
  leavePlan: (planId: string) => Promise<{ success: boolean; error?: string }>;
  createPlan: (data: CreatePlanData) => Promise<{ success: boolean; error?: string }>;
  deletePlan: (planId: string) => Promise<{ success: boolean; error?: string }>;
  setCategory: (category: PlanCategory) => Promise<void>;
  reset: () => void;
}

export const usePlansStore = create<PlansState>((set, get) => ({
  plans: [],
  loading: false,
  category: 'todos',

  fetchPlans: async () => {
    set({ loading: true });
    try {
      const { category } = get();

      let lat: number | undefined;
      let lng: number | undefined;

      if (category === 'cerca') {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const position = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          lat = position.coords.latitude;
          lng = position.coords.longitude;
        }
      }

      const params: Record<string, unknown> = {};
      if (category !== 'todos' && category !== 'cerca') {
        params.p_category = category;
      }
      if (lat !== undefined && lng !== undefined) {
        params.p_lat = lat;
        params.p_lng = lng;
      }

      const { data, error } = await supabase.rpc('get_plans', params);
      if (error) throw error;

      set({ plans: (data as Plan[]) ?? [] });
    } catch (e) {
      reportError(e, { source: 'plansStore.fetchPlans' });
    } finally {
      set({ loading: false });
    }
  },

  joinPlan: async (planId: string) => {
    try {
      const { data, error } = await supabase.rpc('join_plan', { p_plan_id: planId });
      if (error) throw error;

      set((state) => ({
        plans: state.plans.map((p) =>
          p.id === planId
            ? { ...p, is_joined: true, attendee_count: p.attendee_count + 1 }
            : p
        ),
      }));
      return { success: true };
    } catch (e) {
      reportError(e, { source: 'plansStore.joinPlan' });
      return { success: false, error: (e as Error).message };
    }
  },

  leavePlan: async (planId: string) => {
    try {
      const { data, error } = await supabase.rpc('leave_plan', { p_plan_id: planId });
      if (error) throw error;

      set((state) => ({
        plans: state.plans.map((p) =>
          p.id === planId
            ? { ...p, is_joined: false, attendee_count: Math.max(0, p.attendee_count - 1) }
            : p
        ),
      }));
      return { success: true };
    } catch (e) {
      reportError(e, { source: 'plansStore.leavePlan' });
      return { success: false, error: (e as Error).message };
    }
  },

  createPlan: async (data: CreatePlanData) => {
    try {
      const { error } = await supabase.from('plans').insert({
        title: data.title,
        description: data.description ?? null,
        category: data.category,
        location_name: data.location_name,
        latitude: data.latitude ?? null,
        longitude: data.longitude ?? null,
        event_date: data.event_date,
        max_attendees: data.max_attendees ?? null,
      });
      if (error) throw error;

      await get().fetchPlans();
      return { success: true };
    } catch (e) {
      reportError(e, { source: 'plansStore.createPlan' });
      return { success: false, error: (e as Error).message };
    }
  },

  deletePlan: async (planId: string) => {
    try {
      const { error } = await supabase
        .from('plans')
        .update({ is_active: false })
        .eq('id', planId);
      if (error) throw error;

      await get().fetchPlans();
      return { success: true };
    } catch (e) {
      reportError(e, { source: 'plansStore.deletePlan' });
      return { success: false, error: (e as Error).message };
    }
  },

  setCategory: async (category: PlanCategory) => {
    set({ category });
    await get().fetchPlans();
  },

  reset: () => {
    set({ plans: [], loading: false, category: 'todos' });
  },
}));
