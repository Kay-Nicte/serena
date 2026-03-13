import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { Fonts } from '@/constants/fonts';

interface SegmentedControlProps {
  segments: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export function SegmentedControl({ segments, selectedIndex, onSelect }: SegmentedControlProps) {
  const Colors = useColors();

  return (
    <View style={[styles.container, { backgroundColor: Colors.surfaceSecondary }]}>
      {segments.map((label, i) => {
        const isActive = i === selectedIndex;
        return (
          <TouchableOpacity
            key={i}
            style={[
              styles.segment,
              isActive && [styles.segmentActive, { backgroundColor: Colors.surface }],
            ]}
            onPress={() => onSelect(i)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.label,
                { color: isActive ? Colors.text : Colors.textTertiary },
                isActive && styles.labelActive,
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 3,
    marginHorizontal: 24,
    marginBottom: 12,
  },
  segment: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  segmentActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  label: {
    fontSize: 14,
    fontFamily: Fonts.bodyMedium,
  },
  labelActive: {
    fontFamily: Fonts.bodySemiBold,
  },
});
