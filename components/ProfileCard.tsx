import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors } from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import { PhotoCarousel } from '@/components/PhotoCarousel';
import type { Profile } from '@/stores/authStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface ProfileCardProps {
  profile: Profile;
  photos?: { uri: string }[];
  cardWidth?: number;
  maxHeight?: number;
}

const INFO_HEIGHT_ESTIMATE = 120;

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

export function ProfileCard({ profile, photos, cardWidth = SCREEN_WIDTH - 48, maxHeight }: ProfileCardProps) {
  const { t } = useTranslation();
  const age = calculateAge(profile.birth_date);

  const naturalPhotoHeight = cardWidth / (3 / 4);
  let photoHeight = naturalPhotoHeight;
  if (maxHeight) {
    photoHeight = Math.min(naturalPhotoHeight, maxHeight - INFO_HEIGHT_ESTIMATE);
  }

  return (
    <View style={[styles.card, { width: cardWidth }]}>
      <PhotoCarousel
        photos={photos ?? []}
        fallbackUri={profile.avatar_url}
        width={cardWidth}
        height={photoHeight}
      />

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
    backgroundColor: Colors.surface,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
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
