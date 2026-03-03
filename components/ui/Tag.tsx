import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { Fonts } from '@/constants/fonts';

interface TagProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
}

export function Tag({ label, selected = false, onPress }: TagProps) {
  const Colors = useColors();
  const styles = makeStyles(Colors);

  return (
    <TouchableOpacity
      style={[styles.tag, selected && styles.tagSelected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.text, selected && styles.textSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function makeStyles(c: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    tag: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 20,
      borderWidth: 1.5,
      borderColor: c.border,
      backgroundColor: c.surface,
    },
    tagSelected: {
      borderColor: c.primary,
      backgroundColor: c.primaryPastel,
    },
    text: {
      fontSize: 14,
      fontFamily: Fonts.bodyMedium,
      color: c.textSecondary,
    },
    textSelected: {
      color: c.primaryDark,
    },
  });
}
