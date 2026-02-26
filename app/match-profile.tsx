import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Colors } from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import { supabase } from '@/lib/supabase';
import { getPhotoUrl } from '@/lib/storage';
import { PhotoCarousel } from '@/components/PhotoCarousel';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ProfileData {
  id: string;
  name: string | null;
  birth_date: string | null;
  bio: string | null;
  orientation: string | null;
  looking_for: string | null;
  avatar_url: string | null;
}

interface PhotoRow {
  id: string;
  storage_path: string;
  position: number;
}

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

export default function MatchProfileScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [photos, setPhotos] = useState<{ uri: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      if (!userId) return;

      setIsLoading(true);
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, name, birth_date, bio, orientation, looking_for, avatar_url')
          .eq('id', userId)
          .single();

        if (profileError) throw profileError;
        setProfile(profileData as ProfileData);

        const { data: photosData, error: photosError } = await supabase
          .from('photos')
          .select('id, storage_path, position')
          .eq('user_id', userId)
          .order('position');

        if (!photosError && photosData) {
          const photoUrls = (photosData as PhotoRow[]).map((p) => ({
            uri: getPhotoUrl(p.storage_path),
          }));
          setPhotos(photoUrls);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [userId]);

  const age = calculateAge(profile?.birth_date ?? null);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.centered}>
          <Text style={styles.emptyText}>{t('common.error')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {profile.name ?? ''}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <PhotoCarousel
          photos={photos}
          fallbackUri={profile.avatar_url}
          width={SCREEN_WIDTH}
          aspectRatio={3 / 4}
        />

        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {profile.name}
            </Text>
            {age !== null && <Text style={styles.age}>{age}</Text>}
          </View>

          {profile.bio ? (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>{t('profile.bio')}</Text>
              <Text style={styles.bio}>{profile.bio}</Text>
            </View>
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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    backgroundColor: Colors.surface,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontFamily: Fonts.bodySemiBold,
    color: Colors.text,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 15,
    fontFamily: Fonts.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  info: {
    padding: 24,
    gap: 16,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  name: {
    fontSize: 28,
    fontFamily: Fonts.heading,
    color: Colors.text,
    flexShrink: 1,
  },
  age: {
    fontSize: 24,
    fontFamily: Fonts.body,
    color: Colors.textSecondary,
  },
  section: {
    gap: 6,
  },
  sectionLabel: {
    fontSize: 14,
    fontFamily: Fonts.bodyMedium,
    color: Colors.textSecondary,
  },
  bio: {
    fontSize: 16,
    fontFamily: Fonts.body,
    color: Colors.text,
    lineHeight: 24,
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
