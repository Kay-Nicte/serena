import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import type { Photo } from '@/hooks/usePhotos';

const SLOTS = [0, 1, 2, 3, 4, 5];

interface PhotoGridProps {
  photos: Photo[];
  isLoading: boolean;
  onAddPhoto: (position: number) => void;
  onRemovePhoto: (photoId: string, storagePath: string, position: number) => void;
}

export function PhotoGrid({ photos, isLoading, onAddPhoto, onRemovePhoto }: PhotoGridProps) {
  const { t } = useTranslation();

  const photoByPosition = new Map(photos.map((p) => [p.position, p]));

  const handleRemove = (photo: Photo) => {
    Alert.alert(t('profile.deletePhoto'), t('profile.deletePhotoConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('profile.deletePhoto'),
        style: 'destructive',
        onPress: () => onRemovePhoto(photo.id, photo.storage_path, photo.position),
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{t('profile.addPhotos')}</Text>
      <View style={styles.grid}>
        {SLOTS.map((position) => {
          const photo = photoByPosition.get(position);
          return (
            <View key={position} style={styles.slotWrapper}>
              {photo ? (
                <View style={styles.slot}>
                  <Image source={{ uri: photo.url }} style={styles.image} contentFit="cover" />
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemove(photo)}
                    hitSlop={4}
                  >
                    <Ionicons name="close-circle" size={22} color={Colors.error} />
                  </TouchableOpacity>
                  {position === 0 && (
                    <View style={styles.mainBadge}>
                      <Text style={styles.mainBadgeText}>{t('profile.mainPhoto')}</Text>
                    </View>
                  )}
                </View>
              ) : (
                <TouchableOpacity
                  style={[styles.slot, styles.emptySlot]}
                  onPress={() => onAddPhoto(position)}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color={Colors.primary} />
                  ) : (
                    <Ionicons name="add" size={28} color={Colors.primary} />
                  )}
                  {position === 0 && (
                    <Text style={styles.mainLabel}>{t('profile.mainPhoto')}</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          );
        })}
      </View>
      <Text style={styles.hint}>{t('profile.maxPhotos')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontFamily: Fonts.bodyMedium,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  slotWrapper: {
    width: '31.5%',
    aspectRatio: 3 / 4,
  },
  slot: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  emptySlot: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    backgroundColor: Colors.surfaceSecondary,
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
    backgroundColor: Colors.surface,
    borderRadius: 11,
  },
  mainBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(230, 168, 180, 0.85)',
    paddingVertical: 3,
    alignItems: 'center',
  },
  mainBadgeText: {
    fontSize: 10,
    fontFamily: Fonts.bodySemiBold,
    color: Colors.textOnPrimary,
  },
  mainLabel: {
    fontSize: 10,
    fontFamily: Fonts.bodyMedium,
    color: Colors.textTertiary,
  },
  hint: {
    fontSize: 12,
    fontFamily: Fonts.body,
    color: Colors.textTertiary,
    marginLeft: 4,
  },
});
