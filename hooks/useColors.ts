import { useColorScheme } from 'react-native';
import { useThemeStore } from '@/stores/themeStore';
import { lightColors, darkColors } from '@/constants/colors';

export function useColors() {
  const preference = useThemeStore((s) => s.theme);
  const system = useColorScheme();
  const isDark = preference === 'dark' || (preference === 'system' && system === 'dark');
  return isDark ? darkColors : lightColors;
}
