import React, { useEffect, useRef } from 'react';
import { Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { Fonts } from '@/constants/fonts';

type ToastVariant = 'success' | 'error';

const ICON_MAP: Record<ToastVariant, keyof typeof Ionicons.glyphMap> = {
  success: 'checkmark-circle',
  error: 'alert-circle',
};

interface ToastProps {
  visible: boolean;
  message: string;
  variant?: ToastVariant;
  duration?: number;
  onDismiss: () => void;
  onPress?: (() => void) | null;
}

// Hook for easy toast usage
export function useToast() {
  const [state, setState] = React.useState<{
    visible: boolean;
    message: string;
    variant: ToastVariant;
  }>({ visible: false, message: '', variant: 'success' });

  const show = (message: string, variant: ToastVariant = 'success') => {
    setState({ visible: true, message, variant });
  };

  const dismiss = () => {
    setState((prev) => ({ ...prev, visible: false }));
  };

  return { ...state, show, dismiss };
}

export function Toast({
  visible,
  message,
  variant = 'success',
  duration = 3000,
  onDismiss,
  onPress,
}: ToastProps) {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const Colors = useColors();
  const styles = makeStyles(Colors);

  const COLOR_MAP: Record<ToastVariant, string> = {
    success: Colors.success,
    error: Colors.error,
  };

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          damping: 18,
          stiffness: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      timerRef.current = setTimeout(() => {
        dismiss();
      }, duration);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [visible]);

  const dismiss = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => onDismiss());
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        { top: Math.max(insets.top, 12) + 4 },
        { transform: [{ translateY }], opacity },
      ]}
    >
      <TouchableOpacity
        style={[styles.toast, { borderLeftColor: COLOR_MAP[variant] }]}
        onPress={() => {
          if (onPress) onPress();
          dismiss();
        }}
        activeOpacity={0.9}
      >
        <Ionicons name={ICON_MAP[variant]} size={22} color={COLOR_MAP[variant]} />
        <Text style={styles.message}>{message}</Text>
        <TouchableOpacity onPress={dismiss} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="close" size={18} color={Colors.textTertiary} />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
}

function makeStyles(c: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    container: {
      position: 'absolute',
      left: 16,
      right: 16,
      zIndex: 9999,
      alignItems: 'center',
    },
    toast: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      backgroundColor: c.surface,
      borderRadius: 14,
      borderLeftWidth: 4,
      paddingVertical: 14,
      paddingHorizontal: 16,
      width: '100%',
      maxWidth: 400,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 12,
      elevation: 8,
    },
    message: {
      flex: 1,
      fontSize: 15,
      fontFamily: Fonts.bodyMedium,
      color: c.text,
      lineHeight: 20,
    },
  });
}
