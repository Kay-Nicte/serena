import { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { Colors } from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import { Ionicons } from '@expo/vector-icons';
import type { Profile } from '@/stores/authStore';
import type { Photo } from '@/hooks/usePhotos';

interface ProfileCardProps {
  profile: Profile;
  photos?: Photo[];
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 48;

function calculateAge(birthDate: string | null): number | null {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export function ProfileCard({ profile, photos }: ProfileCardProps) {
  const { t } = useTranslation();
  const age = calculateAge(profile.birth_date);
  const [activeIndex, setActiveIndex] = useState(0);

  const imageUrls =
    photos && photos.length > 0
      ? photos.map((p) => p.url)
      : profile.avatar_url
        ? [profile.avatar_url]
        : [];

  const hasMultiple = imageUrls.length > 1;

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = e.nativeEvent.contentOffset.x;
      const index = Math.round(offsetX / CARD_WIDTH);
      setActiveIndex(index);
    },
    []
  );

  const renderPhoto = () => {
    if (imageUrls.length === 0) {
      return (
        <View style={[styles.photo, styles.photoPlaceholder]}>
          <Ionicons name="person" size={80} color={Colors.primaryLight} />
        </View>
      );
    }

    if (!hasMultiple) {
      return (
        <Image
          source={{ uri: imageUrls[0] }}
          style={styles.photo}
          contentFit="cover"
          transition={200}
        />
      );
    }

    return (
      <View>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          style={styles.photoScroll}
        >
          {imageUrls.map((url, i) => (
            <Image
              key={i}
              source={{ uri: url }}
              style={[styles.photo, { width: CARD_WIDTH }]}
              contentFit="cover"
              transition={200}
            />
          ))}
        </ScrollView>
        <View style={styles.dots}>
          {imageUrls.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === activeIndex && styles.dotActive]}
            />
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.card}>
      {renderPhoto()}

      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {profile.name}
          </Text>
          {age !== null && <Text style={styles.age}>{age}</Text>}
        </View>

        {profile.bio ? (
          <Text style={styles.bio}>{profile.bio}</Text>
        ) : null}

        <View style={styles.tags}>
          {profile.orientation ? (
            <View style={styles.tag}>
              <Text style={styles.tagText}>
                {t(`orientation.${profile.orientation}`)}
              </Text>
            </View>
          ) : null}
          {profile.looking_for ? (
            <View style={styles.tag}>
              <Text style={styles.tagText}>
                {t(`lookingFor.${profile.looking_for}`)}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  photoScroll: {
    width: CARD_WIDTH,
  },
  photo: {
    width: '100%',
    aspectRatio: 3 / 4,
  },
  photoPlaceholder: {
    backgroundColor: Colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dots: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  dotActive: {
    backgroundColor: Colors.primary,
    width: 9,
    height: 9,
    borderRadius: 4.5,
  },
  info: {
    padding: 20,
    gap: 10,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  name: {
    fontSize: 26,
    fontFamily: Fonts.heading,
    color: Colors.text,
    flexShrink: 1,
  },
  age: {
    fontSize: 22,
    fontFamily: Fonts.body,
    color: Colors.textSecondary,
  },
  bio: {
    fontSize: 15,
    fontFamily: Fonts.body,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  tag: {
    backgroundColor: Colors.primaryPastel,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  tagText: {
    fontSize: 13,
    fontFamily: Fonts.bodyMedium,
    color: Colors.primaryDark,
  },
});
