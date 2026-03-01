import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { showToast } from '@/stores/toastStore';
import { useRouter } from 'expo-router';

export function PremiumExpiryModal() {
  const { t } = useTranslation();
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const session = useAuthStore((s) => s.session);

  // Check premium expiry directly — this is the ONLY place that calls
  // get_premium_status(), so it always receives the one-time expired signal.
  useEffect(() => {
    if (!session) return;
    supabase.rpc('get_premium_status').then(({ data }) => {
      if (data?.expired) {
        setVisible(true);
        // Refetch profile so badge/flags update everywhere
        useAuthStore.getState().fetchProfile();
      }
    });
  }, [session]);

  if (!visible) return null;

  const handleRenew = () => {
    setVisible(false);
    router.push('/premium');
  };

  const handleDecline = () => {
    setStep(2);
  };

  const handleClose = () => {
    setVisible(false);
  };

  return (
    <Modal visible transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          {step === 1 ? (
            <>
              <Ionicons name="diamond-outline" size={40} color={Colors.textTertiary} />
              <Text style={styles.title}>{t('premium.expiredTitle')}</Text>
              <Text style={styles.description}>{t('premium.expiredMessage')}</Text>
              <View style={styles.benefits}>
                <Benefit icon="heart" color={Colors.primary} text={t('premium.benefit10Likes')} />
                <Benefit icon="star" color="#E0A800" text={t('premium.benefitSuperlike')} />
                <Benefit icon="chatbubble" color={Colors.primary} text={t('premium.benefitIceBreaker')} />
                <Benefit icon="eye" color={Colors.primary} text={t('premium.benefitReadReceipts')} />
                <Benefit icon="time" color={Colors.primary} text={t('premium.benefitLastSeen')} />
              </View>
              <TouchableOpacity style={styles.renewButton} onPress={handleRenew} activeOpacity={0.7}>
                <Ionicons name="diamond" size={18} color="#FFFFFF" />
                <Text style={styles.renewButtonText}>{t('premium.renew')}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDecline} hitSlop={8}>
                <Text style={styles.noThanks}>{t('premium.noThanks')}</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Ionicons name="flame" size={40} color={Colors.warning} />
              <Text style={styles.title}>{t('premium.keepGoingTitle')}</Text>
              <Text style={styles.keepGoingMessage}>{t('premium.keepGoingMessage')}</Text>
              <TouchableOpacity style={styles.understoodButton} onPress={handleClose} activeOpacity={0.7}>
                <Text style={styles.understoodButtonText}>{t('premium.understood')}</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

function Benefit({ icon, color, text }: { icon: string; color: string; text: string }) {
  return (
    <View style={styles.benefit}>
      <Ionicons name={icon as any} size={18} color={color} />
      <Text style={styles.benefitText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  card: {
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
  title: {
    fontSize: 22,
    fontFamily: Fonts.heading,
    color: Colors.text,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    fontFamily: Fonts.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  benefits: {
    width: '100%',
    gap: 10,
    paddingVertical: 4,
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  benefitText: {
    fontSize: 14,
    fontFamily: Fonts.bodyMedium,
    color: Colors.text,
    flex: 1,
  },
  renewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#E0A800',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 24,
    marginTop: 4,
  },
  renewButtonText: {
    fontSize: 16,
    fontFamily: Fonts.bodySemiBold,
    color: '#FFFFFF',
  },
  noThanks: {
    fontSize: 14,
    fontFamily: Fonts.body,
    color: Colors.textTertiary,
    paddingVertical: 4,
  },
  keepGoingMessage: {
    fontSize: 15,
    fontFamily: Fonts.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  understoodButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 24,
    marginTop: 4,
  },
  understoodButtonText: {
    fontSize: 16,
    fontFamily: Fonts.bodySemiBold,
    color: Colors.textOnPrimary,
  },
});
