import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  TextInput,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Tag';
import { PhotoGrid } from '@/components/PhotoGrid';
import { Colors } from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import { Config, ORIENTATIONS, LOOKING_FOR_OPTIONS, type Orientation, type LookingFor } from '@/constants/config';
import { useAuthStore } from '@/stores/authStore';
import { usePhotoStore, type Photo } from '@/stores/photoStore';
import { pickImage } from '@/lib/storage';
import { supabase } from '@/lib/supabase';
import { showToast } from '@/stores/toastStore';

const LOOKING_FOR = LOOKING_FOR_OPTIONS;

export default function CompleteProfileScreen() {
  const { t } = useTranslation();
  const { user, updateProfile } = useAuthStore();
  const { photos, addPhoto, removePhoto } = usePhotoStore();

  const [name, setName] = useState('');
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [bio, setBio] = useState('');
  const [orientations, setOrientations] = useState<string[]>([]);
  const [lookingFor, setLookingFor] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [trialGranted, setTrialGranted] = useState(false);

  const yearNum = parseInt(year, 10);
  const isValidYear = year.length === 4 && yearNum >= 1900 && yearNum <= new Date().getFullYear();

  const birthDateString =
    day && month && isValidYear
      ? `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
      : null;

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

  const toggleOrientation = (o: string) => {
    setOrientations((prev) => prev.includes(o) ? [] : [o]);
  };

  const toggleLookingFor = (lf: string) => {
    setLookingFor((prev) => prev.includes(lf) ? prev.filter((x) => x !== lf) : [...prev, lf]);
  };

  const handleAddPhoto = async (position: number) => {
    const uri = await pickImage();
    if (uri && user) {
      await addPhoto(user.id, uri, position);
    }
  };

  const handleRemovePhoto = async (photo: Photo) => {
    await removePhoto(photo);
  };

  const handleSave = async () => {
    if (!isValid) return;

    setLoading(true);
    try {
      // Save profile data WITHOUT marking complete yet
      // (marking complete triggers navigation, which would unmount the modal)
      await supabase
        .from('profiles')
        .update({
          name: name.trim(),
          birth_date: birthDateString,
          bio: bio.trim(),
          orientation: orientations,
          looking_for: lookingFor,
        })
        .eq('id', user!.id);

      // Activate 7-day premium free trial
      try {
        const { data } = await supabase.rpc('activate_premium_trial');
        if (data?.granted) {
          setTrialGranted(true);
          setLoading(false);
          return; // Wait for modal dismiss before marking complete
        }
      } catch {
        // Non-critical: trial activation failure should not block profile completion
      }

      // No trial modal → mark complete now (triggers navigation)
      await updateProfile({ is_profile_complete: true } as any);
    } catch {
      showToast(t('common.error'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTrialDismiss = async () => {
    setTrialGranted(false);
    // NOW mark profile complete → triggers navigation to tabs
    await updateProfile({ is_profile_complete: true } as any);
  };

  const isValid = name.trim() && birthDateString && !isUnderage && photos.length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>{t('profile.completeTitle')}</Text>
          <Text style={styles.subtitle}>{t('profile.completeSubtitle')}</Text>

          {/* Premium teaser */}
          <View style={styles.premiumTeaser}>
            <Ionicons name="diamond" size={20} color="#E0A800" />
            <Text style={styles.premiumTeaserText}>{t('premium.completeProfileTeaser')}</Text>
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
            title={t('profile.save')}
            onPress={handleSave}
            loading={loading}
            disabled={!isValid}
            style={styles.saveButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Premium trial welcome modal */}
      <Modal visible={trialGranted} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Ionicons name="diamond" size={40} color="#E0A800" />
            <Text style={styles.modalTitle}>{t('premium.trialTitle')}</Text>
            <Text style={styles.modalDescription}>{t('premium.trialDescription')}</Text>
            <View style={styles.modalBenefits}>
              <View style={styles.modalBenefit}>
                <Ionicons name="heart" size={18} color={Colors.primary} />
                <Text style={styles.modalBenefitText}>{t('premium.benefit10Likes')}</Text>
              </View>
              <View style={styles.modalBenefit}>
                <Ionicons name="star" size={18} color="#E0A800" />
                <Text style={styles.modalBenefitText}>{t('premium.benefitSuperlike')}</Text>
              </View>
              <View style={styles.modalBenefit}>
                <Ionicons name="chatbubble" size={18} color={Colors.primary} />
                <Text style={styles.modalBenefitText}>{t('premium.benefitIceBreaker')}</Text>
              </View>
              <View style={styles.modalBenefit}>
                <Ionicons name="eye" size={18} color={Colors.primary} />
                <Text style={styles.modalBenefitText}>{t('premium.benefitReadReceipts')}</Text>
              </View>
              <View style={styles.modalBenefit}>
                <Ionicons name="time" size={18} color={Colors.primary} />
                <Text style={styles.modalBenefitText}>{t('premium.benefitLastSeen')}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleTrialDismiss}
              activeOpacity={0.7}
            >
              <Text style={styles.modalButtonText}>{t('common.done')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  content: {
    paddingHorizontal: 32,
    paddingBottom: 40,
    gap: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: Fonts.heading,
    color: Colors.text,
    paddingTop: 24,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: Fonts.body,
    color: Colors.textSecondary,
    lineHeight: 22,
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
    fontFamily: Fonts.bodyMedium,
    color: Colors.error,
    marginTop: 4,
    marginLeft: 4,
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
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  premiumTeaser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFF8E1',
    borderWidth: 1,
    borderColor: '#FFE082',
    borderRadius: 16,
    padding: 14,
  },
  premiumTeaserText: {
    fontSize: 14,
    fontFamily: Fonts.bodyMedium,
    color: '#9A7800',
    flex: 1,
    lineHeight: 20,
  },
  saveButton: {
    marginTop: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  modalCard: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    gap: 14,
    width: '100%',
    maxWidth: 360,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontFamily: Fonts.heading,
    color: Colors.text,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 14,
    fontFamily: Fonts.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalBenefits: {
    width: '100%',
    gap: 10,
    paddingVertical: 4,
  },
  modalBenefit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modalBenefitText: {
    fontSize: 14,
    fontFamily: Fonts.bodyMedium,
    color: Colors.text,
    flex: 1,
  },
  modalButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 24,
    marginTop: 4,
  },
  modalButtonText: {
    fontSize: 16,
    fontFamily: Fonts.bodySemiBold,
    color: Colors.textOnPrimary,
  },
});
