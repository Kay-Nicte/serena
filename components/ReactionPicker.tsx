import { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Pressable,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';

const REACTIONS: { key: string; icon: string; iconFilled: string }[] = [
  { key: 'heart', icon: 'heart-outline', iconFilled: 'heart' },
  { key: 'thumbs-up', icon: 'thumbs-up-outline', iconFilled: 'thumbs-up' },
  { key: 'happy', icon: 'happy-outline', iconFilled: 'happy' },
  { key: 'flame', icon: 'flame-outline', iconFilled: 'flame' },
  { key: 'sparkles', icon: 'sparkles-outline', iconFilled: 'sparkles' },
  { key: 'sad', icon: 'sad-outline', iconFilled: 'sad' },
];

interface ReactionPickerProps {
  visible: boolean;
  currentReaction?: string | null;
  onSelect: (reaction: string) => void;
  onClose: () => void;
  anchorY: number;
  anchorX: number;
}

export function ReactionPicker({
  visible,
  currentReaction,
  onSelect,
  onClose,
  anchorY,
  anchorX,
}: ReactionPickerProps) {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const Colors = useColors();
  const styles = makeStyles(Colors);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 200,
          friction: 15,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scale.setValue(0);
      opacity.setValue(0);
    }
  }, [visible]);

  if (!visible) return null;

  // Position the pill above the long-pressed message
  const PILL_WIDTH = 276;
  const PILL_HEIGHT = 48;
  const MARGIN = 8;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Animated.View
          style={[
            styles.pill,
            {
              top: anchorY - PILL_HEIGHT - MARGIN,
              left: Math.max(12, Math.min(anchorX - PILL_WIDTH / 2, 400 - PILL_WIDTH - 12)),
              transform: [{ scale }],
              opacity,
            },
          ]}
        >
          {REACTIONS.map((r) => {
            const isSelected = currentReaction === r.key;
            return (
              <TouchableOpacity
                key={r.key}
                onPress={() => onSelect(r.key)}
                style={[styles.reactionButton, isSelected && styles.reactionButtonSelected]}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={(isSelected ? r.iconFilled : r.icon) as any}
                  size={24}
                  color={Colors.primary}
                />
              </TouchableOpacity>
            );
          })}
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

export { REACTIONS };

function makeStyles(c: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
    },
    pill: {
      position: 'absolute',
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.surface,
      borderRadius: 28,
      paddingHorizontal: 8,
      paddingVertical: 6,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 8,
      gap: 2,
    },
    reactionButton: {
      width: 40,
      height: 36,
      borderRadius: 18,
      justifyContent: 'center',
      alignItems: 'center',
    },
    reactionButtonSelected: {
      backgroundColor: c.primaryPastel,
    },
  });
}
