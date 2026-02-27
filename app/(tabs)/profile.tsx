import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import { Config, ORIENTATIONS, LOOKING_FOR_OPTIONS, type Orientation, type LookingFor } from '@/constants/config';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Tag } from '@/components/ui/Tag';

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
import { PhotoGrid } from '@/components/PhotoGrid';
import { useAuthStore } from '@/stores/authStore';
import { usePhotos } from '@/hooks/usePhotos';
import { useDiscoveryPreferences } from '@/hooks/useDiscoveryPreferences';
import { pickImage } from '@/lib/storage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useResponsive } from '@/hooks/useResponsive';
import { showToast } from '@/stores/toastStore';
import { useStreak } from '@/hooks/useStreak';
import { useDailyStatsStore } from '@/stores/dailyStatsStore';

const LOOKING_FOR = LOOKING_FOR_OPTIONS;

export default function ProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user, profile, updateProfile, fetchProfile } = useAuthStore();
  const { photos, addPhoto, removePhoto } = usePhotos(user?.id);
  const { preferences } = useDiscoveryPreferences();
  const { isTablet, contentMaxWidth, horizontalPadding } = useResponsive();
  useStreak(); // triggers fetch on mount
  const isPremium = profile?.is_premium ?? false;
  const premiumUntil = profile?.premium_until ?? null;
  const currentStreak = useDailyStatsStore((s) => s.currentStreak);
  const availableSuperlikes = useDailyStatsStore((s) => s.availableSuperlikes);
  const availableIceBreakers = useDailyStatsStore((s) => s.availableIceBreakers);
  const remainingLikes = useDailyStatsStore((s) => s.remainingLikes);
  const totalLikes = useDailyStatsStore((s) => s.totalLikes);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [orientations, setOrientations] = useState<string[]>([]);
  const [lookingFor, setLookingFor] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [showStreakInfo, setShowStreakInfo] = useState(false);

  const isUnderage = (() => {
    const d = parseInt(day, 10);
    const m = parseInt(month, 10);
    const y = parseInt(year, 10);
    if (!d || !m || !y || year.length < 4) return false;
    const today = new Date();
    let age = today.getFullYear() - y;
    const monthDiff = (today.getMonth() + 1) - m;
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < d)) age--;
    return age < 18;
  })();

  useEffect(() => {
    if (profile) {
      setName(profile.name ?? '');
      setBio(profile.bio ?? '');
      setOrientations(profile.orientation ?? []);
      setLookingFor(profile.looking_for ?? []);
      if (profile.birth_date) {
        const [y, m, d] = profile.birth_date.split('-');
        setYear(y);
        setMonth(m);
        setDay(d);
      }
    }
  }, [profile, editing]);

  const handleAddPhoto = async (position: number) => {
    const uri = await pickImage();
    if (uri && user) {
      await addPhoto(user.id, uri, position);
      await fetchProfile();
    }
  };

  const handleRemovePhoto = async (photo: Parameters<typeof removePhoto>[0]) => {
    await removePhoto(photo);
    await fetchProfile();
  };

  const toggleOrientation = (o: string) => {
    setOrientations((prev) => prev.includes(o) ? [] : [o]);
  };

  const toggleLookingFor = (lf: string) => {
    setLookingFor((prev) => prev.includes(lf) ? prev.filter((x) => x !== lf) : [...prev, lf]);
  };

  const handleSave = async () => {
    if (!name.trim() || isUnderage) return;
    setSaving(true);
    try {
      const birthDateString =
        day && month && year
          ? `${year.padStart(4, '0')}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
          : profile?.birth_date ?? null;

      await updateProfile({
        name: name.trim(),
        bio: bio.trim() || null,
        birth_date: birthDateString,
        orientation: orientations.length > 0 ? orientations : null,
        looking_for: lookingFor.length > 0 ? lookingFor : null,
      } as any);
      setEditing(false);
    } catch {
      showToast(t('common.error'), 'error');
    } finally {
      setSaving(false);
    }
  };

  // --- VIEW MODE ---
  if (!editing) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={[styles.scrollContent, { paddingHorizontal: horizontalPadding }, isTablet && { maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%' }]}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>{t('tabs.profile')}</Text>
            <View style={styles.headerIcons}>
              <TouchableOpacity onPress={() => setEditing(true)} hitSlop={8}>
                <Ionicons name="create-outline" size={24} color={Colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/settings')} hitSlop={8}>
                <Ionicons name="settings-outline" size={24} color={Colors.primary} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.card}>
            {profile?.avatar_url ? (
              <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={40} color={Colors.primary} />
              </View>
            )}

            <Text style={styles.name}>{profile?.name ?? '—'}</Text>

            {isPremium && (
              <View style={styles.premiumBadge}>
                <Ionicons name="diamond" size={14} color="#E0A800" />
                <Text style={styles.premiumBadgeText}>{t('premium.badge')}</Text>
                {premiumUntil && (
                  <Text style={styles.premiumExpiry}>
                    {t('premium.expiresOn', { date: new Date(premiumUntil).toLocaleDateString() })}
                  </Text>
                )}
              </View>
            )}

            {profile?.bio ? (
              <Text style={styles.bio}>{profile.bio}</Text>
            ) : null}

            <View style={styles.info}>
              {profile?.birth_date && (() => {
                const birth = new Date(profile.birth_date);
                const today = new Date();
                let age = today.getFullYear() - birth.getFullYear();
                const monthDiff = today.getMonth() - birth.getMonth();
                if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
                  age--;
                }
                return (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>{t('profile.age')}</Text>
                    <Text style={styles.infoValue}>{t('profile.ageValue', { age })}</Text>
                  </View>
                );
              })()}
              {ensureArray(profile?.orientation).length > 0 && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>{t('profile.orientation')}</Text>
                  <Text style={styles.infoValue}>
                    {ensureArray(profile?.orientation).map((o) => t(`orientation.${o}`)).join(', ')}
                  </Text>
                </View>
              )}
              {ensureArray(profile?.looking_for).length > 0 && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>{t('profile.lookingFor')}</Text>
                  <Text style={styles.infoValue}>
                    {ensureArray(profile?.looking_for).map((lf) => t(`lookingFor.${lf}`)).join(', ')}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Streak Card */}
          <View style={styles.streakCard}>
            <View style={styles.streakHeader}>
              <Ionicons name="flame" size={22} color={Colors.warning} />
              <Text style={styles.streakTitle}>{t('streak.title')}</Text>
              <TouchableOpacity onPress={() => setShowStreakInfo((v) => !v)} hitSlop={8}>
                <Ionicons
                  name={showStreakInfo ? 'information-circle' : 'information-circle-outline'}
                  size={20}
                  color={Colors.textTertiary}
                />
              </TouchableOpacity>
            </View>
            {showStreakInfo && (
              <Text style={styles.streakInfoText}>{t('streak.info')}</Text>
            )}
            {currentStreak > 0 ? (
              <Text style={styles.streakValue}>
                {currentStreak === 1 ? t('streak.day') : t('streak.days', { count: currentStreak })}
              </Text>
            ) : (
              <Text style={styles.streakEmpty}>{t('streak.noStreak')}</Text>
            )}
            <View style={styles.streakItems}>
              <View style={styles.streakItem}>
                <Ionicons name="heart" size={16} color={Colors.primary} />
                <Text style={styles.streakItemText}>
                  {t('streak.remainingLikes', { remaining: remainingLikes, total: totalLikes })}
                </Text>
                {currentStreak >= 2 && currentStreak < 10 && (
                  <Text style={styles.streakBonus}>+1</Text>
                )}
              </View>
              <View style={styles.streakItem}>
                <Ionicons name="star" size={16} color={Colors.warning} />
                <Text style={styles.streakItemText}>
                  {t('streak.availableSuperlikes', { count: availableSuperlikes })}
                </Text>
              </View>
              <View style={styles.streakItem}>
                <Ionicons name="chatbubble" size={16} color={Colors.primary} />
                <Text style={styles.streakItemText}>
                  {t('streak.availableIceBreakers', { count: availableIceBreakers })}
                </Text>
              </View>
            </View>
          </View>

          {/* Discovery Preferences */}
          <View style={styles.discoveryCard}>
            <View style={styles.discoveryHeader}>
              <Text style={styles.discoveryTitle}>{t('discovery.title')}</Text>
            </View>
            <View style={styles.info}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t('discovery.ageRange')}</Text>
                <Text style={styles.infoValue}>
                  {preferences?.min_age ?? Config.minAge} — {preferences?.max_age ?? Config.maxAge} {t('discovery.years')}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t('discovery.distance')}</Text>
                <Text style={styles.infoValue}>
                  {preferences?.max_distance
                    ? `${preferences.max_distance} km`
                    : t('discovery.distanceAll')}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t('discovery.orientations')}</Text>
                <Text style={styles.infoValue}>
                  {preferences?.orientations?.length
                    ? preferences.orientations.map((o) => t(`orientation.${o}`)).join(', ')
                    : t('discovery.orientationsAll')}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t('discovery.lookingFor')}</Text>
                <Text style={styles.infoValue}>
                  {preferences?.looking_for?.length
                    ? preferences.looking_for.map((lf) => t(`lookingFor.${lf}`)).join(', ')
                    : t('discovery.lookingForAll')}
                </Text>
              </View>
            </View>
            <Button
              title={t('discovery.edit')}
              onPress={() => router.push('/discovery-preferences')}
              variant="outline"
            />
          </View>

        </ScrollView>
      </SafeAreaView>
    );
  }

  // --- EDIT MODE ---
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingHorizontal: horizontalPadding }, isTablet && { maxWidth: contentMaxWidth, alignSelf: 'center' as const, width: '100%' as const }]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.headerRow}>
            <Text style={styles.title}>{t('tabs.profile')}</Text>
            <TouchableOpacity onPress={() => setEditing(false)} hitSlop={8}>
              <Ionicons name="close" size={24} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Photos */}
          <PhotoGrid
            photos={photos}
            onAdd={handleAddPhoto}
            onRemove={handleRemovePhoto}
            editable
          />

          {/* Name */}
          <Input
            label={t('profile.name')}
            value={name}
            onChangeText={setName}
            placeholder={t('profile.namePlaceholder')}
            maxLength={Config.maxNameLength}
          />

          {/* Birth Date */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>{t('profile.birthDate')}</Text>
            <View style={styles.dateRow}>
              <View style={styles.dateField}>
                <TextInput
                  style={styles.dateInput}
                  placeholder={t('profile.dayPlaceholder')}
                  placeholderTextColor={Colors.textTertiary}
                  keyboardType="number-pad"
                  maxLength={2}
                  value={day}
                  onChangeText={setDay}
                />
              </View>
              <Text style={styles.dateSeparator}>/</Text>
              <View style={styles.dateField}>
                <TextInput
                  style={styles.dateInput}
                  placeholder={t('profile.monthPlaceholder')}
                  placeholderTextColor={Colors.textTertiary}
                  keyboardType="number-pad"
                  maxLength={2}
                  value={month}
                  onChangeText={setMonth}
                />
              </View>
              <Text style={styles.dateSeparator}>/</Text>
              <View style={styles.dateFieldYear}>
                <TextInput
                  style={styles.dateInput}
                  placeholder={t('profile.yearPlaceholder')}
                  placeholderTextColor={Colors.textTertiary}
                  keyboardType="number-pad"
                  maxLength={4}
                  value={year}
                  onChangeText={setYear}
                />
              </View>
            </View>
            {isUnderage && (
              <Text style={styles.underageError}>{t('profile.underageError')}</Text>
            )}
          </View>

          {/* Bio */}
          <Input
            label={t('profile.bio')}
            value={bio}
            onChangeText={setBio}
            placeholder={t('profile.bioPlaceholder')}
            multiline
            numberOfLines={4}
            maxLength={Config.maxBioLength}
          />

          {/* Orientation */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>{t('profile.orientation')}</Text>
            <View style={styles.tags}>
              {ORIENTATIONS.map((o) => (
                <Tag
                  key={o}
                  label={t(`orientation.${o}`)}
                  selected={orientations.includes(o)}
                  onPress={() => toggleOrientation(o)}
                />
              ))}
            </View>
          </View>

          {/* Looking For */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>{t('profile.lookingFor')}</Text>
            <View style={styles.tags}>
              {LOOKING_FOR.map((lf) => (
                <Tag
                  key={lf}
                  label={t(`lookingFor.${lf}`)}
                  selected={lookingFor.includes(lf)}
                  onPress={() => toggleLookingFor(lf)}
                />
              ))}
            </View>
          </View>

          <Button
            title={t('common.save')}
            onPress={handleSave}
            loading={saving}
            disabled={!name.trim() || isUnderage}
            style={styles.saveButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
    gap: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  title: {
    fontSize: 28,
    fontFamily: Fonts.heading,
    color: Colors.text,
  },
  card: {
    padding: 24,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    alignItems: 'center',
    gap: 12,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: 22,
    fontFamily: Fonts.heading,
    color: Colors.text,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  premiumBadgeText: {
    fontSize: 13,
    fontFamily: Fonts.bodySemiBold,
    color: '#E0A800',
  },
  premiumExpiry: {
    fontSize: 11,
    fontFamily: Fonts.body,
    color: '#C49000',
    marginLeft: 4,
  },
  bio: {
    fontSize: 14,
    fontFamily: Fonts.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  info: {
    width: '100%',
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: Fonts.bodyMedium,
    color: Colors.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    fontFamily: Fonts.bodySemiBold,
    color: Colors.text,
    flexShrink: 1,
    textAlign: 'right',
  },
  section: {
    gap: 10,
  },
  sectionLabel: {
    fontSize: 14,
    fontFamily: Fonts.bodyMedium,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateField: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
  },
  dateFieldYear: {
    flex: 1.5,
    height: 52,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
  },
  dateInput: {
    textAlign: 'center',
    fontSize: 16,
    fontFamily: Fonts.body,
    color: Colors.text,
  },
  dateSeparator: {
    fontSize: 18,
    fontFamily: Fonts.body,
    color: Colors.textTertiary,
  },
  underageError: {
    fontSize: 13,
    fontFamily: Fonts.body,
    color: Colors.error,
    marginTop: 4,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  saveButton: {
    marginTop: 4,
  },
  streakCard: {
    padding: 20,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    gap: 12,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  streakTitle: {
    fontSize: 18,
    fontFamily: Fonts.heading,
    color: Colors.text,
  },
  streakValue: {
    fontSize: 16,
    fontFamily: Fonts.bodySemiBold,
    color: Colors.text,
  },
  streakEmpty: {
    fontSize: 14,
    fontFamily: Fonts.body,
    color: Colors.textSecondary,
  },
  streakItems: {
    gap: 8,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  streakItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  streakItemText: {
    fontSize: 14,
    fontFamily: Fonts.body,
    color: Colors.textSecondary,
  },
  streakBonus: {
    fontSize: 12,
    fontFamily: Fonts.bodySemiBold,
    color: Colors.success,
  },
  streakInfoText: {
    fontSize: 13,
    fontFamily: Fonts.body,
    color: Colors.textSecondary,
    lineHeight: 19,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    padding: 12,
    overflow: 'hidden',
  },
  discoveryCard: {
    padding: 20,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    gap: 14,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  discoveryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  discoveryTitle: {
    fontSize: 18,
    fontFamily: Fonts.heading,
    color: Colors.text,
  },
});
