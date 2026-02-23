import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
  KeyboardAvoidingView,
  TextInput,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Tag';
import { Colors } from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import { Config } from '@/constants/config';
import { useAuthStore } from '@/stores/authStore';
import { pickImage, uploadPhoto, getPhotoUrl } from '@/lib/storage';
import { Ionicons } from '@expo/vector-icons';

const ORIENTATIONS = ['lesbian', 'bisexual', 'pansexual', 'queer', 'other'] as const;
const LOOKING_FOR = ['friendship', 'dating', 'relationship', 'explore'] as const;

export default function CompleteProfileScreen() {
  const { t } = useTranslation();
  const { user, updateProfile } = useAuthStore();

  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [bio, setBio] = useState('');
  const [orientation, setOrientation] = useState<string | null>(null);
  const [lookingFor, setLookingFor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const birthDateString =
    day && month && year
      ? `${year.padStart(4, '0')}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
      : null;

  const handlePickPhoto = async () => {
    const uri = await pickImage();
    if (uri) setPhotoUri(uri);
  };

  const handleSave = async () => {
    if (!name.trim() || !birthDateString || !orientation || !lookingFor) {
      Alert.alert(t('common.error'), t('common.error'));
      return;
    }

    setLoading(true);
    try {
      let avatarUrl: string | null = null;

      if (photoUri && user) {
        const path = await uploadPhoto(user.id, photoUri, 0);
        avatarUrl = getPhotoUrl(path);
      }

      await updateProfile({
        name: name.trim(),
        birth_date: birthDateString,
        bio: bio.trim() || null,
        orientation: orientation as 'lesbian' | 'bisexual' | 'pansexual' | 'queer' | 'other',
        looking_for: lookingFor as 'friendship' | 'dating' | 'relationship' | 'explore',
        avatar_url: avatarUrl,
        is_profile_complete: true,
      });
    } catch {
      Alert.alert(t('common.error'), t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const isValid = name.trim() && birthDateString && orientation && lookingFor;

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

          {/* Photo */}
          <TouchableOpacity style={styles.photoContainer} onPress={handlePickPhoto}>
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.photo} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Ionicons name="camera-outline" size={32} color={Colors.primary} />
                <Text style={styles.photoText}>{t('profile.addPhoto')}</Text>
              </View>
            )}
          </TouchableOpacity>

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
                  placeholder="DD"
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
                  placeholder="MM"
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
                  placeholder="AAAA"
                  placeholderTextColor={Colors.textTertiary}
                  keyboardType="number-pad"
                  maxLength={4}
                  value={year}
                  onChangeText={setYear}
                />
              </View>
            </View>
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
                  selected={orientation === o}
                  onPress={() => setOrientation(o)}
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
                  selected={lookingFor === lf}
                  onPress={() => setLookingFor(lf)}
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
  photoContainer: {
    width: 120,
    height: 160,
    borderRadius: 20,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.surfaceSecondary,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  photoText: {
    fontSize: 12,
    fontFamily: Fonts.bodyMedium,
    color: Colors.primary,
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
  saveButton: {
    marginTop: 12,
  },
});
