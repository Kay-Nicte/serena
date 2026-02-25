import { useWindowDimensions } from 'react-native';

const TABLET_BREAKPOINT = 768;
const TABLET_CONTENT_MAX = 600;
const TABLET_CHAT_MAX = 500;

export function useResponsive() {
  const { width, height } = useWindowDimensions();
  const isTablet = width >= TABLET_BREAKPOINT;

  const horizontalPadding = isTablet ? 32 : 24;
  const contentMaxWidth = isTablet ? TABLET_CONTENT_MAX : width;
  const chatMaxWidth = isTablet ? TABLET_CHAT_MAX : width;

  const rawCardWidth = width - horizontalPadding * 2;
  const cardWidth = Math.min(rawCardWidth, TABLET_CONTENT_MAX - horizontalPadding * 2);

  const matchColumns = isTablet ? 3 : 2;

  return {
    width,
    height,
    isTablet,
    contentMaxWidth,
    chatMaxWidth,
    cardWidth,
    horizontalPadding,
    matchColumns,
  };
}
