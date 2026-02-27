import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors } from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import { PhotoCarousel } from '@/components/PhotoCarousel';
import type { Profile } from '@/stores/authStore';

// Ensure orientation/looking_for are always clean string arrays
function ensureArray(val: unknown): string[] {
  if (val == null) return [];
  if (Array.isArray(val)) {
    return val.flatMap((v) => {
      const s = String(v).replace(/^\{|\}$/g, '');
      return s.includes(',') ? s.split(',').map((x) => x.replace(/"/g, '').trim()) : [s];
    });
  }
  if (typeof val === 'string') {
    const trimmed = val.replace(/^\{|\}$/g, '');
    return trimmed ? trimmed.split(',').map((s) => s.replace(/"/g, '').trim()) : [];
  }
  return [String(val)];
}

type ActivityLevel = 'today' | 'this_week' | 'this_month' | 'inactive';

interface ProfileCardProps {
  profile: Profile;
  photos?: { uri: string }[];
  activityLevel?: ActivityLevel | null;
  lastSeen?: string;
  showActivityLevel?: boolean;
  isSuperlike?: boolean;
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

const ACTIVITY_CONFIG: Record<ActivityLevel, { color: string; i18nKey: string }> = {
  today: { color: Colors.success, i18nKey: 'today.activityToday' },
  this_week: { color: Colors.warning, i18nKey: 'today.activityThisWeek' },
  this_month: { color: '#E0A050', i18nKey: 'today.activityThisMonth' },
  inactive: { color: Colors.textTertiary, i18nKey: 'today.activityInactive' },
};

function formatInactiveTime(lastSeen: string | undefined, t: (key: string, opts?: any) => string): string {
  if (!lastSeen) return t('today.activityInactive');
  const diff = Date.now() - new Date(lastSeen).getTime();
  const months = Math.floor(diff / (30 * 24 * 3600000));
  if (months <= 1) return t('today.inactiveMonth');
  if (months < 12) return t('today.inactiveMonths', { count: months });
  const years = Math.floor(months / 12);
  if (years === 1) return t('today.inactiveYear');
  return t('today.inactiveYears', { count: years });
}

export function ProfileCard({ profile, photos, activityLevel, lastSeen, showActivityLevel, isSuperlike }: ProfileCardProps) {
  const { t } = useTranslation();
  const age = calculateAge(profile.birth_date);

  return (
    <View style={styles.card}>
      <PhotoCarousel
        photos={photos ?? []}
        fallbackUri={profile.avatar_url}
        width={CARD_WIDTH}
      />

      {isSuperlike && (
        <View style={styles.superlikeBanner}>
          <Text style={styles.superlikeBannerText}>
            {'⭐ '}{t('superlike.receivedBadge')}
          </Text>
        </View>
      )}

      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {profile.name}
          </Text>
          {age !== null && <Text style={styles.age}>{age}</Text>}
        </View>

        {showActivityLevel && activityLevel && (
          <View style={styles.activityRow}>
            <View
              style={[
                styles.activityDot,
                { backgroundColor: ACTIVITY_CONFIG[activityLevel].color },
              ]}
            />
            <Text style={styles.activityText}>
              {activityLevel === 'inactive'
                ? formatInactiveTime(lastSeen, t)
                : t(ACTIVITY_CONFIG[activityLevel].i18nKey)}
            </Text>
          </View>
        )}

        {profile.bio ? (
          <Text style={styles.bio}>{profile.bio}</Text>
        ) : null}

        <View style={styles.tags}>
          {ensureArray(profile.orientation).map((o, i) => (
            <View key={`o-${o}-${i}`} style={styles.tag}>
              <Text style={styles.tagText}>{t(`orientation.${o}`)}</Text>
            </View>
          ))}
          {ensureArray(profile.looking_for).map((lf, i) => (
            <View key={`lf-${lf}-${i}`} style={styles.tag}>
              <Text style={styles.tagText}>{t(`lookingFor.${lf}`)}</Text>
            </View>
          ))}
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
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  activityText: {
    fontSize: 13,
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
  superlikeBanner: {
    backgroundColor: '#FFF8E1',
    borderBottomWidth: 1,
    borderBottomColor: '#FFE082',
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  superlikeBannerText: {
    fontSize: 14,
    fontFamily: Fonts.bodySemiBold,
    color: '#E0A800',
  },
});
