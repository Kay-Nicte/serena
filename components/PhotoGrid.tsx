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

  // Use refs so PanResponder always sees the latest values
  const draggingRef = useRef<number | null>(null);
  const hoverRef = useRef<number | null>(null);
  const sortedRef = useRef<Photo[]>([]);

  const sortedPhotos = [...photos].sort((a, b) => a.position - b.position);
  sortedRef.current = sortedPhotos;

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
        draggingRef.current !== null && (Math.abs(gesture.dx) > 5 || Math.abs(gesture.dy) > 5),
      onPanResponderGrant: () => {},
      onPanResponderMove: (_, gesture) => {
        const di = draggingRef.current;
        if (di === null) return;
        dragAnim.setValue({ x: gesture.dx, y: gesture.dy });
        const startSlot = getSlotPosition(di);
        const newIndex = getIndexFromPosition(
          startSlot.x + gesture.dx,
          startSlot.y + gesture.dy,
        );
        if (newIndex !== hoverRef.current && newIndex < sortedRef.current.length) {
          hoverRef.current = newIndex;
          setHoverIndex(newIndex);
        }
      },
      onPanResponderRelease: () => {
        const di = draggingRef.current;
        const hi = hoverRef.current;
        if (di !== null && hi !== null && di !== hi && onReorder) {
          const newOrder = [...sortedRef.current];
          const [moved] = newOrder.splice(di, 1);
          newOrder.splice(hi, 0, moved);
          onReorder(newOrder);
        }
        dragAnim.setValue({ x: 0, y: 0 });
        draggingRef.current = null;
        hoverRef.current = null;
        setDraggingIndex(null);
        setHoverIndex(null);
      },
      onPanResponderTerminate: () => {
        dragAnim.setValue({ x: 0, y: 0 });
        draggingRef.current = null;
        hoverRef.current = null;
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
    draggingRef.current = index;
    hoverRef.current = index;
    dragAnim.setValue({ x: 0, y: 0 });
    setDraggingIndex(index);
    setHoverIndex(index);
  };

  // Build visual order: if dragging, show the reordered preview (without the dragged photo in its original slot)
  const getVisualPhotos = () => {
    if (draggingIndex === null || hoverIndex === null) return sortedPhotos;
    const preview = [...sortedPhotos];
    const [moved] = preview.splice(draggingIndex, 1);
    preview.splice(hoverIndex, 0, moved);
    return preview;
  };

  const visualPhotos = getVisualPhotos();
  const draggedPhoto = draggingIndex !== null ? sortedPhotos[draggingIndex] : null;
  const dragSlotPos = draggingIndex !== null ? getSlotPosition(draggingIndex) : null;

  return (
    <View>
      <View style={styles.grid} {...panResponder.panHandlers}>
        {slots.map((slotIndex) => {
          const photo = slotIndex < visualPhotos.length ? visualPhotos[slotIndex] : null;
          const isDropTarget = draggingIndex !== null && slotIndex === hoverIndex;

          if (photo) {
            // Hide the photo that is being dragged (it's shown as the floating overlay instead)
            const isBeingDragged = draggingIndex !== null && photo === sortedPhotos[draggingIndex];

            return (
              <TouchableOpacity
                key={`photo-${slotIndex}`}
                style={[
                  styles.slot,
                  { width: itemWidth, height: itemHeight },
                  isDropTarget && styles.slotHighlight,
                  isBeingDragged && { opacity: 0.3 },
                ]}
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

        {/* Floating overlay: the photo being dragged follows the finger */}
        {draggedPhoto && dragSlotPos && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.slot,
              {
                width: itemWidth,
                height: itemHeight,
                position: 'absolute',
                left: dragSlotPos.x,
                top: dragSlotPos.y,
                zIndex: 10,
                elevation: 10,
                opacity: 0.85,
                transform: [
                  { translateX: dragAnim.x },
                  { translateY: dragAnim.y },
                  { scale: 1.08 },
                ],
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.25,
                shadowRadius: 8,
              },
            ]}
          >
            <Image
              source={{ uri: getPhotoUrl(draggedPhoto.storage_path) }}
              style={styles.image}
              contentFit="cover"
            />
          </Animated.View>
        )}
      </View>
      {editable && photos.length >= 2 && (
        <Text style={styles.reorderHint}>{t('profile.reorderHint')}</Text>
      )}
    </View>
  );
}

const slots = Array.from({ length: Config.maxPhotos }, (_, i) => i);

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
