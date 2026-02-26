import { create } from 'zustand';

type ToastVariant = 'success' | 'error';

interface ToastState {
  visible: boolean;
  message: string;
  variant: ToastVariant;
  show: (message: string, variant?: ToastVariant) => void;
  dismiss: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  visible: false,
  message: '',
  variant: 'success',
  show: (message, variant = 'success') => set({ visible: true, message, variant }),
  dismiss: () => set({ visible: false }),
}));

/** Shorthand to show a toast from anywhere (no hook needed) */
export const showToast = (message: string, variant: ToastVariant = 'success') =>
  useToastStore.getState().show(message, variant);
