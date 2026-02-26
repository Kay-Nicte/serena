import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { Colors } from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import { create } from 'zustand';

interface ConfirmState {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  destructive: boolean;
  onConfirm: (() => void) | null;
  show: (opts: {
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    destructive?: boolean;
    onConfirm: () => void;
  }) => void;
  dismiss: () => void;
}

export const useConfirmStore = create<ConfirmState>((set) => ({
  visible: false,
  title: '',
  message: '',
  confirmLabel: '',
  cancelLabel: '',
  destructive: false,
  onConfirm: null,
  show: ({ title, message, confirmLabel, cancelLabel, destructive, onConfirm }) =>
    set({
      visible: true,
      title,
      message,
      confirmLabel: confirmLabel ?? '',
      cancelLabel: cancelLabel ?? '',
      destructive: destructive ?? true,
      onConfirm,
    }),
  dismiss: () => set({ visible: false, onConfirm: null }),
}));

export const showConfirm = useConfirmStore.getState().show;

interface ConfirmDialogProps {
  defaultConfirmLabel: string;
  defaultCancelLabel: string;
}

export function ConfirmDialog({ defaultConfirmLabel, defaultCancelLabel }: ConfirmDialogProps) {
  const { visible, title, message, confirmLabel, cancelLabel, destructive, onConfirm, dismiss } =
    useConfirmStore();

  const handleConfirm = () => {
    dismiss();
    onConfirm?.();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={dismiss}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={dismiss}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.card}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.message}>{message}</Text>
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={dismiss}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelText}>
                    {cancelLabel || defaultCancelLabel}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.confirmButton, destructive && styles.confirmDestructive]}
                  onPress={handleConfirm}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.confirmText, destructive && styles.confirmTextDestructive]}>
                    {confirmLabel || defaultConfirmLabel}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  title: {
    fontSize: 18,
    fontFamily: Fonts.bodySemiBold,
    color: Colors.text,
    marginBottom: 8,
  },
  message: {
    fontSize: 15,
    fontFamily: Fonts.body,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 24,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelText: {
    fontSize: 15,
    fontFamily: Fonts.bodySemiBold,
    color: Colors.textSecondary,
  },
  confirmButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.primary,
  },
  confirmDestructive: {
    backgroundColor: Colors.error,
  },
  confirmText: {
    fontSize: 15,
    fontFamily: Fonts.bodySemiBold,
    color: Colors.textOnPrimary,
  },
  confirmTextDestructive: {
    color: Colors.textOnPrimary,
  },
});
