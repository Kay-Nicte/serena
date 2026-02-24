import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import { Config, ORIENTATIONS, LOOKING_FOR_OPTIONS } from '@/constants/config';
import { Button } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Tag';
import { useDiscoveryPreferences } from '@/hooks/useDiscoveryPreferences';
import { useProfileStore } from '@/stores/profileStore';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';

export default function DiscoveryPreferencesScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { preferences, isLoading, updatePreferences } = useDiscoveryPreferences();
  const { fetchCandidates } = useProfileStore();

  const [minAge, setMinAge] = useState(String(Config.discoveryDefaults.minAge));
  const [maxAge, setMaxAge] = useState(String(Config.discoveryDefaults.maxAge));
  const [orientations, setOrientations] = useState<string[]>([]);
  const [lookingFor, setLookingFor] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (preferences) {
      setMinAge(String(preferences.min_age));
      setMaxAge(String(preferences.max_age));
      setOrientations(preferences.orientations ?? []);
      setLookingFor(preferences.looking_for ?? []);
    }
  }, [preferences]);

  const toggleOrientation = (o: string) => {
    setOrientations((prev) =>
      prev.includes(o) ? prev.filter((x) => x !== o) : [...prev, o]
    );
  };

  const toggleLookingFor = (lf: string) => {
    setLookingFor((prev) =>
      prev.includes(lf) ? prev.filter((x) => x !== lf) : [...prev, lf]
    );
  };

  const handleSave = async () => {
    const min = parseInt(minAge, 10) || Config.discoveryDefaults.minAge;
    const max = parseInt(maxAge, 10) || Config.discoveryDefaults.maxAge;

    if (min < Config.minAge || max > Config.maxAge || min > max) {
      Alert.alert(t('common.error'), t('common.error'));
      return;
    }

    setSaving(true);
    try {
      await updatePreferences({
        min_age: min,
        max_age: max,
        orientations: orientations.length > 0 ? orientations : null,
        looking_for: lookingFor.length > 0 ? lookingFor : null,
      });
      await fetchCandidates();
      router.back();
    } catch {
      Alert.alert(t('common.error'), t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
              <Ionicons name="arrow-back" size={24} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.title}>{t('discovery.title')}</Text>
            <View style={{ width: 24 }} />
          </View>

          <Text style={styles.subtitle}>{t('discovery.subtitle')}</Text>

          {/* Age Range */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>{t('discovery.ageRange')}</Text>
            <View style={styles.ageRow}>
              <View style={styles.ageField}>
                <Text style={styles.ageLabel}>{t('discovery.minAge')}</Text>
                <View style={styles.ageInputWrap}>
                  <TextInput
                    style={styles.ageInput}
                    keyboardType="number-pad"
                    maxLength={2}
                    value={minAge}
                    onChangeText={setMinAge}
                    placeholder={String(Config.discoveryDefaults.minAge)}
                    placeholderTextColor={Colors.textTertiary}
                  />
                </View>
              </View>
              <Text style={styles.ageSeparator}>—</Text>
              <View style={styles.ageField}>
                <Text style={styles.ageLabel}>{t('discovery.maxAge')}</Text>
                <View style={styles.ageInputWrap}>
                  <TextInput
                    style={styles.ageInput}
                    keyboardType="number-pad"
                    maxLength={2}
                    value={maxAge}
                    onChangeText={setMaxAge}
                    placeholder={String(Config.discoveryDefaults.maxAge)}
                    placeholderTextColor={Colors.textTertiary}
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Orientations */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>{t('discovery.orientations')}</Text>
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
            {orientations.length === 0 && (
              <Text style={styles.hint}>{t('discovery.orientationsAll')}</Text>
            )}
          </View>

          {/* Looking For */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>{t('discovery.lookingFor')}</Text>
            <View style={styles.tags}>
              {LOOKING_FOR_OPTIONS.map((lf) => (
                <Tag
                  key={lf}
                  label={t(`lookingFor.${lf}`)}
                  selected={lookingFor.includes(lf)}
                  onPress={() => toggleLookingFor(lf)}
                />
              ))}
            </View>
            {lookingFor.length === 0 && (
              <Text style={styles.hint}>{t('discovery.lookingForAll')}</Text>
            )}
          </View>

          <Button
            title={t('common.save')}
            onPress={handleSave}
            loading={saving || isLoading}
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
    paddingHorizontal: 24,
    paddingBottom: 40,
    gap: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
  },
  title: {
    fontSize: 28,
    fontFamily: Fonts.heading,
    color: Colors.text,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: Fonts.body,
    color: Colors.textSecondary,
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
  ageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  ageField: {
    flex: 1,
    gap: 4,
  },
  ageLabel: {
    fontSize: 12,
    fontFamily: Fonts.bodyMedium,
    color: Colors.textTertiary,
    marginLeft: 4,
  },
  ageInputWrap: {
    height: 52,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
  },
  ageInput: {
    textAlign: 'center',
    fontSize: 16,
    fontFamily: Fonts.body,
    color: Colors.text,
  },
  ageSeparator: {
    fontSize: 18,
    fontFamily: Fonts.body,
    color: Colors.textTertiary,
    marginBottom: 14,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  hint: {
    fontSize: 12,
    fontFamily: Fonts.body,
    color: Colors.textTertiary,
    marginLeft: 4,
  },
  saveButton: {
    marginTop: 4,
  },
});
