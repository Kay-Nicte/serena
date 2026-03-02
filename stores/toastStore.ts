import { create } from 'zustand';

type ToastVariant = 'success' | 'error';

interface ToastState {
  visible: boolean;
  message: string;
  variant: ToastVariant;
  duration: number;
  onPress: (() => void) | null;
  show: (message: string, variant?: ToastVariant, duration?: number, onPress?: (() => void) | null) => void;
  dismiss: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  visible: false,
  message: '',
  variant: 'success',
  duration: 3000,
  onPress: null,
  show: (message, variant = 'success', duration = 3000, onPress = null) =>
    set({ visible: true, message, variant, duration, onPress }),
  dismiss: () => set({ visible: false, onPress: null }),
}));

/** Shorthand to show a toast from anywhere (no hook needed) */
export const showToast = (message: string, variant: ToastVariant = 'success', duration = 3000, onPress?: () => void) =>
  useToastStore.getState().show(message, variant, duration, onPress ?? null);
