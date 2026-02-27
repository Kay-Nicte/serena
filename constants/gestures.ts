export const GESTURES: Record<string, { icon: string }> = {
  peace_sign: { icon: 'hand-right-outline' },
  thumbs_up: { icon: 'thumbs-up-outline' },
  hand_on_chin: { icon: 'hand-left-outline' },
  point_at_camera: { icon: 'finger-print-outline' },
  ok_sign: { icon: 'happy-outline' },
  wave: { icon: 'hand-right-outline' },
  finger_heart: { icon: 'heart-outline' },
  salute: { icon: 'hand-right-outline' },
} as const;

export type GestureCode = keyof typeof GESTURES;
