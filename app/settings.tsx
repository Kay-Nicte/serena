import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { Colors } from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import { useAuthStore } from '@/stores/authStore';
import { deleteAccount } from '@/lib/auth';
import {
  registerForPushNotificationsAsync,
  savePushTokenToServer,
  removePushTokenFromServer,
} from '@/lib/notifications';
import { supabase } from '@/lib/supabase';
import i18n from '@/i18n';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user, profile, updateProfile, signOut } = useAuthStore();

  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>(
    profile?.language_preference ?? i18n.language
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    checkPushTokenExists();
  }, []);

  const checkPushTokenExists = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('push_tokens')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();
    setPushEnabled(!!data);
  };

  const handleTogglePush = async (value: boolean) => {
    setPushLoading(true);
    try {
      if (value) {
        const token = await registerForPushNotificationsAsync();
        if (token) {
          await savePushTokenToServer(token);
          setPushEnabled(true);
        } else {
          Alert.alert(t('common.error'), t('notifications.permissionMessage'));
        }
      } else {
        await removePushTokenFromServer();
        setPushEnabled(false);
      }
    } catch {
      Alert.alert(t('common.error'));
    } finally {
      setPushLoading(false);
    }
  };

  const handleChangeLanguage = async (lang: string) => {
    setSelectedLanguage(lang);
    await i18n.changeLanguage(lang);
    try {
      await updateProfile({ language_preference: lang } as any);
    } catch {
      // profile update failed but language changed locally
    }
  };

  const handleDeleteAccount = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    const confirmWord = t('settings.deleteAccountConfirmWord');
    if (deleteConfirmText.trim().toUpperCase() !== confirmWord.toUpperCase()) {
      return;
    }

    setDeleting(true);
    try {
      await removePushTokenFromServer();
      await deleteAccount();
      // Auth listener in authStore will handle navigation
    } catch {
      Alert.alert(t('common.error'), t('settings.deleteAccountError'));
      setDeleting(false);
    }
  };

  const appVersion = Constants.expoConfig?.version ?? '1.0.0';

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
        <Text style={styles.headerTitle}>{t('settings.title')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.account')}</Text>
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.row}
              onPress={() => router.push('/change-password')}
              activeOpacity={0.7}
            >
              <Ionicons name="lock-closed-outline" size={20} color={Colors.text} />
              <Text style={styles.rowLabel}>{t('settings.changePassword')}</Text>
              <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
            </TouchableOpacity>

            <View style={styles.separator} />

            <TouchableOpacity
              style={styles.row}
              onPress={handleDeleteAccount}
              activeOpacity={0.7}
            >
              <Ionicons name="trash-outline" size={20} color={Colors.error} />
              <Text style={[styles.rowLabel, { color: Colors.error }]}>
                {t('settings.deleteAccount')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Delete Account Confirmation */}
        {showDeleteConfirm && (
          <View style={styles.card}>
            <Text style={styles.deleteWarning}>
              {t('settings.deleteAccountWarning')}
            </Text>
            <Text style={styles.deleteConfirmLabel}>
              {t('settings.deleteAccountConfirmLabel')}
            </Text>
            <TextInput
              style={styles.deleteInput}
              value={deleteConfirmText}
              onChangeText={setDeleteConfirmText}
              autoCapitalize="characters"
              editable={!deleting}
            />
            <View style={styles.deleteActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowDeleteConfirm(false);
                  setDeleteConfirmText('');
                }}
              >
                <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.deleteButton,
                  deleteConfirmText.trim().toUpperCase() !==
                    t('settings.deleteAccountConfirmWord').toUpperCase() && styles.deleteButtonDisabled,
                ]}
                onPress={confirmDelete}
                disabled={
                  deleting ||
                  deleteConfirmText.trim().toUpperCase() !==
                    t('settings.deleteAccountConfirmWord').toUpperCase()
                }
              >
                <Text style={styles.deleteButtonText}>
                  {deleting ? t('common.loading') : t('settings.deleteAccount')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.notifications')}</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Ionicons name="notifications-outline" size={20} color={Colors.text} />
              <Text style={styles.rowLabel}>{t('settings.pushNotifications')}</Text>
              <Switch
                value={pushEnabled}
                onValueChange={handleTogglePush}
                disabled={pushLoading}
                trackColor={{ false: Colors.border, true: Colors.primaryLight }}
                thumbColor={pushEnabled ? Colors.primary : Colors.surface}
              />
            </View>
          </View>
        </View>

        {/* Language Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.language')}</Text>
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.row}
              onPress={() => handleChangeLanguage('en')}
              activeOpacity={0.7}
            >
              <Text style={styles.rowLabel}>{t('settings.languageEn')}</Text>
              {selectedLanguage === 'en' && (
                <Ionicons name="checkmark" size={20} color={Colors.primary} />
              )}
            </TouchableOpacity>

            <View style={styles.separator} />

            <TouchableOpacity
              style={styles.row}
              onPress={() => handleChangeLanguage('es')}
              activeOpacity={0.7}
            >
              <Text style={styles.rowLabel}>{t('settings.languageEs')}</Text>
              {selectedLanguage === 'es' && (
                <Ionicons name="checkmark" size={20} color={Colors.primary} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Legal Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.legal')}</Text>
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.row}
              onPress={() => router.push('/terms-of-service')}
              activeOpacity={0.7}
            >
              <Ionicons name="document-text-outline" size={20} color={Colors.text} />
              <Text style={styles.rowLabel}>{t('settings.termsOfService')}</Text>
              <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
            </TouchableOpacity>

            <View style={styles.separator} />

            <TouchableOpacity
              style={styles.row}
              onPress={() => router.push('/privacy-policy')}
              activeOpacity={0.7}
            >
              <Ionicons name="shield-outline" size={20} color={Colors.text} />
              <Text style={styles.rowLabel}>{t('settings.privacyPolicy')}</Text>
              <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.about')}</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Ionicons name="information-circle-outline" size={20} color={Colors.text} />
              <Text style={styles.rowLabel}>{t('settings.version')}</Text>
              <Text style={styles.rowValue}>{appVersion}</Text>
            </View>
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
    fontSize: 20,
    fontFamily: Fonts.bodySemiBold,
    color: Colors.text,
    marginLeft: 4,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
    gap: 8,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: Fonts.bodySemiBold,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginLeft: 4,
    marginTop: 8,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  rowLabel: {
    flex: 1,
    fontSize: 16,
    fontFamily: Fonts.body,
    color: Colors.text,
  },
  rowValue: {
    fontSize: 16,
    fontFamily: Fonts.body,
    color: Colors.textSecondary,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginLeft: 48,
  },
  deleteWarning: {
    fontSize: 14,
    fontFamily: Fonts.body,
    color: Colors.error,
    lineHeight: 20,
    padding: 16,
    paddingBottom: 8,
  },
  deleteConfirmLabel: {
    fontSize: 14,
    fontFamily: Fonts.bodyMedium,
    color: Colors.text,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  deleteInput: {
    marginHorizontal: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: Fonts.body,
    color: Colors.text,
    backgroundColor: Colors.background,
  },
  deleteActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    padding: 16,
  },
  cancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelButtonText: {
    fontSize: 14,
    fontFamily: Fonts.bodySemiBold,
    color: Colors.textSecondary,
  },
  deleteButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.error,
  },
  deleteButtonDisabled: {
    opacity: 0.4,
  },
  deleteButtonText: {
    fontSize: 14,
    fontFamily: Fonts.bodySemiBold,
    color: Colors.textOnPrimary,
  },
});
