import { useEffect, useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useColors } from '@/hooks/useColors';
import { Fonts } from '@/constants/fonts';

interface UndoButtonProps {
  visible: boolean;
  onUndo: () => void;
  remainingSeconds: number;
}

export function UndoButton({ visible, onUndo, remainingSeconds }: UndoButtonProps) {
  const { t } = useTranslation();
  const opacity = useRef(new Animated.Value(0)).current;
  const Colors = useColors();
  const styles = makeStyles(Colors);

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: visible ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <TouchableOpacity style={styles.pill} onPress={onUndo} activeOpacity={0.7}>
        <Ionicons name="arrow-undo" size={18} color={Colors.surface} />
        <Text style={styles.text}>{t('today.undoSwipe')}</Text>
        <Text style={styles.countdown}>{remainingSeconds}s</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

function makeStyles(c: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    container: {
      position: 'absolute',
      bottom: 80,
      alignSelf: 'center',
      zIndex: 10,
    },
    pill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: c.primary,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
      elevation: 4,
    },
    text: {
      fontSize: 14,
      fontFamily: Fonts.bodySemiBold,
      color: c.surface,
    },
    countdown: {
      fontSize: 13,
      fontFamily: Fonts.body,
      color: 'rgba(255,255,255,0.7)',
    },
  });
}
