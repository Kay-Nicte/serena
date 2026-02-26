import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import { supabase } from '@/lib/supabase';
import { showToast } from '@/stores/toastStore';

export default function VerifyEmailScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const [resending, setResending] = useState(false);

  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });
      if (error) throw error;
      showToast(t('auth.verifyEmailResentMessage'));
    } catch {
      showToast(t('auth.errorGeneric'), 'error');
    } finally {
      setResending(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="mail-outline" size={64} color={Colors.primary} />
        </View>
        <Text style={styles.title}>{t('auth.verifyEmailTitle')}</Text>
        <Text style={styles.subtitle}>{t('auth.verifyEmailSubtitle')}</Text>
        {email && <Text style={styles.email}>{email}</Text>}
        <Text style={styles.hint}>{t('auth.verifyEmailHint')}</Text>

        <View style={styles.actions}>
          <Button
            title={t('auth.verifyEmailResend')}
            onPress={handleResend}
            loading={resending}
            style={styles.resendButton}
          />
          <Button
            title={t('auth.backToLogin')}
            onPress={() => router.replace('/(auth)/login')}
            variant="outline"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primaryPastel,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontFamily: Fonts.heading,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: Fonts.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 8,
  },
  email: {
    fontSize: 15,
    fontFamily: Fonts.bodySemiBold,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  hint: {
    fontSize: 13,
    fontFamily: Fonts.body,
    color: Colors.textTertiary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  actions: {
    width: '100%',
    gap: 12,
  },
  resendButton: {
    marginBottom: 4,
  },
});
