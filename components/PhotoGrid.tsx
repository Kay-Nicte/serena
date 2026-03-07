import { useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, PanResponder } from 'react-native';
import { showConfirm } from '@/components/ConfirmDialog';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { Fonts } from '@/constants/fonts';
import { Config } from '@/constants/config';
import { getPhotoUrl } from '@/lib/storage';
import { useResponsive } from '@/hooks/useResponsive';
import type { Photo } from '@/stores/photoStore';

interface PhotoGridProps {
  photos: Photo[];
  onAdd: (position: number) => void;
  onRemove: (photo: Photo) => void;
  onReorder?: (orderedPhotos: Photo[]) => void;
  editable?: boolean;
}

const GRID_COLUMNS = 3;
const GRID_GAP = 8;

export function PhotoGrid({ photos, onAdd, onRemove, onReorder, editable = true }: PhotoGridProps) {
  const { t } = useTranslation();
  const { width: screenWidth, isTablet, contentMaxWidth } = useResponsive();
  const effectiveWidth = isTablet ? Math.min(screenWidth, contentMaxWidth) : screenWidth;
  const containerPadding = 32 * 2;
  const itemWidth = (effectiveWidth - containerPadding - GRID_GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS;
  const itemHeight = itemWidth * (4 / 3);
  const Colors = useColors();
  const styles = makeStyles(Colors);

  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const dragAnim = useRef(new Animated.ValueXY()).current;
  const dragStartPos = useRef({ x: 0, y: 0 });

  // Build sorted photos array (only existing photos, by position)
  const sortedPhotos = [...photos].sort((a, b) => a.position - b.position);

  const getSlotPosition = useCallback((index: number) => {
    const col = index % GRID_COLUMNS;
    const row = Math.floor(index / GRID_COLUMNS);
    return {
      x: col * (itemWidth + GRID_GAP),
      y: row * (itemHeight + GRID_GAP),
    };
  }, [itemWidth, itemHeight]);

  const getIndexFromPosition = useCallback((px: number, py: number) => {
    const col = Math.min(Math.max(Math.round(px / (itemWidth + GRID_GAP)), 0), GRID_COLUMNS - 1);
    const maxRows = Math.ceil(Config.maxPhotos / GRID_COLUMNS);
    const row = Math.min(Math.max(Math.round(py / (itemHeight + GRID_GAP)), 0), maxRows - 1);
    return row * GRID_COLUMNS + col;
  }, [itemWidth, itemHeight]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gesture) =>
        editable && !!onReorder && (Math.abs(gesture.dx) > 8 || Math.abs(gesture.dy) > 8),
      onPanResponderGrant: () => {},
      onPanResponderMove: (_, gesture) => {
        if (draggingIndex === null) return;
        dragAnim.setValue({
          x: gesture.dx,
          y: gesture.dy,
        });
        const startSlot = getSlotPosition(draggingIndex);
        const newIndex = getIndexFromPosition(
          startSlot.x + gesture.dx,
          startSlot.y + gesture.dy,
        );
        if (newIndex !== hoverIndex && newIndex < sortedPhotos.length) {
          setHoverIndex(newIndex);
        }
      },
      onPanResponderRelease: () => {
        if (draggingIndex !== null && hoverIndex !== null && draggingIndex !== hoverIndex && onReorder) {
          const newOrder = [...sortedPhotos];
          const [moved] = newOrder.splice(draggingIndex, 1);
          newOrder.splice(hoverIndex, 0, moved);
          onReorder(newOrder);
        }
        dragAnim.setValue({ x: 0, y: 0 });
        setDraggingIndex(null);
        setHoverIndex(null);
      },
      onPanResponderTerminate: () => {
        dragAnim.setValue({ x: 0, y: 0 });
        setDraggingIndex(null);
        setHoverIndex(null);
      },
    })
  ).current;

  const handleRemove = (photo: Photo) => {
    showConfirm({
      title: t('profile.removePhoto'),
      message: t('profile.removePhotoConfirm'),
      destructive: true,
      onConfirm: () => onRemove(photo),
    });
  };

  const handleLongPress = (index: number) => {
    if (!editable || !onReorder || sortedPhotos.length < 2) return;
    setDraggingIndex(index);
    setHoverIndex(index);
    const pos = getSlotPosition(index);
    dragStartPos.current = pos;
  };

  const photoByPosition = new Map(photos.map((p) => [p.position, p]));
  const slots = Array.from({ length: Config.maxPhotos }, (_, i) => i);

  // Build visual order: if dragging, show the reordered preview
  const getVisualPhotos = () => {
    if (draggingIndex === null || hoverIndex === null) return sortedPhotos;
    const preview = [...sortedPhotos];
    const [moved] = preview.splice(draggingIndex, 1);
    preview.splice(hoverIndex, 0, moved);
    return preview;
  };

  const visualPhotos = getVisualPhotos();

  return (
    <View>
      <View style={styles.grid} {...panResponder.panHandlers}>
        {slots.map((slotIndex) => {
          const photo = slotIndex < visualPhotos.length ? visualPhotos[slotIndex] : null;
          const isDragging = draggingIndex !== null && slotIndex === (hoverIndex ?? draggingIndex);
          const isBeingDragged = draggingIndex !== null && photo === sortedPhotos[draggingIndex];

          if (photo) {
            const slotStyle = [styles.slot, { width: itemWidth, height: itemHeight }];
            if (isDragging) slotStyle.push(styles.slotHighlight as any);
            if (isBeingDragged && draggingIndex !== null) {
              slotStyle.push({ opacity: 0.5 } as any);
            }

            return (
              <TouchableOpacity
                key={`photo-${slotIndex}`}
                style={slotStyle}
                onLongPress={() => handleLongPress(slotIndex)}
                delayLongPress={200}
                activeOpacity={0.8}
              >
                <Image
                  source={{ uri: getPhotoUrl(photo.storage_path) }}
                  style={styles.image}
                  contentFit="cover"
                  transition={200}
                />
                {slotIndex === 0 && (
                  <View style={styles.primaryBadge}>
                    <Text style={styles.primaryBadgeText}>{t('profile.primaryPhoto')}</Text>
                  </View>
                )}
                {editable && draggingIndex === null && (
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemove(photo)}
                    hitSlop={4}
                  >
                    <Ionicons name="close-circle" size={22} color={Colors.error} />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              key={`empty-${slotIndex}`}
              style={[styles.slot, styles.emptySlot, { width: itemWidth, height: itemHeight }]}
              onPress={() => editable && onAdd(slotIndex)}
              disabled={!editable}
              activeOpacity={0.7}
            >
              <Ionicons name="add" size={28} color={Colors.primary} />
              {slotIndex === 0 && (
                <Text style={styles.addLabel}>{t('profile.primaryPhoto')}</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
      {editable && photos.length >= 2 && (
        <Text style={styles.reorderHint}>{t('profile.reorderHint')}</Text>
      )}
    </View>
  );
}

function makeStyles(c: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: GRID_GAP,
    },
    slot: {
      borderRadius: 12,
      overflow: 'hidden',
      position: 'relative',
    },
    slotHighlight: {
      borderWidth: 2,
      borderColor: c.primary,
    },
    emptySlot: {
      backgroundColor: c.surfaceSecondary,
      borderWidth: 2,
      borderColor: c.border,
      borderStyle: 'dashed',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 4,
    },
    image: {
      width: '100%',
      height: '100%',
    },
    removeButton: {
      position: 'absolute',
      top: 4,
      right: 4,
      backgroundColor: c.surface,
      borderRadius: 11,
    },
    primaryBadge: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(230, 168, 180, 0.85)',
      paddingVertical: 3,
      alignItems: 'center',
    },
    primaryBadgeText: {
      fontSize: 10,
      fontFamily: Fonts.bodySemiBold,
      color: c.textOnPrimary,
    },
    addLabel: {
      fontSize: 10,
      fontFamily: Fonts.bodyMedium,
      color: c.primary,
    },
    reorderHint: {
      fontSize: 12,
      fontFamily: Fonts.body,
      color: c.textTertiary,
      textAlign: 'center',
      marginTop: 8,
    },
  });
}
