import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors } from '@/constants/colors';
import { Fonts } from '@/constants/fonts';

export function TypingIndicator() {
  const { t } = useTranslation();
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ])
      );

    const a1 = animate(dot1, 0);
    const a2 = animate(dot2, 200);
    const a3 = animate(dot3, 400);

    a1.start();
    a2.start();
    a3.start();

    return () => {
      a1.stop();
      a2.stop();
      a3.stop();
    };
  }, [dot1, dot2, dot3]);

  const dotStyle = (anim: Animated.Value) => ({
    opacity: anim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 1],
    }),
  });

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{t('chat.typing')}</Text>
      <View style={styles.dots}>
        <Animated.Text style={[styles.dot, dotStyle(dot1)]}>.</Animated.Text>
        <Animated.Text style={[styles.dot, dotStyle(dot2)]}>.</Animated.Text>
        <Animated.Text style={[styles.dot, dotStyle(dot3)]}>.</Animated.Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  text: {
    fontSize: 13,
    fontFamily: Fonts.body,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  dots: {
    flexDirection: 'row',
    marginLeft: 1,
  },
  dot: {
    fontSize: 13,
    fontFamily: Fonts.body,
    color: Colors.textSecondary,
  },
});
