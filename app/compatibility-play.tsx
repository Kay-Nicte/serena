import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { useColors } from '@/hooks/useColors';
import { Fonts } from '@/constants/fonts';
import { ResponsiveContainer } from '@/components/ResponsiveContainer';
import { useCompatibilityStore } from '@/stores/compatibilityStore';
import { useProfileStore } from '@/stores/profileStore';
import { useDailyStatsStore } from '@/stores/dailyStatsStore';
import { useIceBreakerStore } from '@/stores/iceBreakerStore';
import { useAuthStore } from '@/stores/authStore';
import { IceBreakerModal } from '@/components/IceBreakerModal';

const SEARCH_DURATION = 2800;
const RING_COUNT = 3;

function PulseRings({ Colors }: { Colors: ReturnType<typeof useColors> }) {
  const rings = useRef(
    Array.from({ length: RING_COUNT }, () => ({
      scale: new Animated.Value(0.3),
      opacity: new Animated.Value(0.6),
    }))
  ).current;

  useEffect(() => {
    const animations = rings.map((ring, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 400),
          Animated.parallel([
            Animated.timing(ring.scale, {
              toValue: 2.2,
              duration: 1600,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(ring.opacity, {
              toValue: 0,
              duration: 1600,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(ring.scale, { toValue: 0.3, duration: 0, useNativeDriver: true }),
            Animated.timing(ring.opacity, { toValue: 0.6, duration: 0, useNativeDriver: true }),
          ]),
        ])
      )
    );
    const composite = Animated.parallel(animations);
    composite.start();
    return () => composite.stop();
  }, []);

  return (
    <>
      {rings.map((ring, i) => (
        <Animated.View
          key={i}
          style={[
            styles.ring,
            {
              borderColor: Colors.primary,
              transform: [{ scale: ring.scale }],
              opacity: ring.opacity,
            },
          ]}
        />
      ))}
    </>
  );
}

export default function CompatibilityPlayScreen() {
  const { t } = useTranslation();
  const Colors = useColors();
  const s = makeStyles(Colors);
  const router = useRouter();

  const { result, found, loading, findMostCompatible, reset } = useCompatibilityStore();
  const likeProfile = useProfileStore((s) => s.likeProfile);
  const superlikeProfile = useProfileStore((s) => s.superlikeProfile);
  const availableSuperlikes = useDailyStatsStore((s) => s.availableSuperlikes);
  const availableIceBreakers = useDailyStatsStore((s) => s.availableIceBreakers);
  const remainingLikes = useDailyStatsStore((s) => s.remainingLikes);
  const isPremium = useAuthStore((s) => s.profile?.is_premium ?? false);
  const sendIceBreaker = useIceBreakerStore((s) => s.sendIceBreaker);
  const [phase, setPhase] = useState<'searching' | 'found' | 'reveal'>('searching');
  const [iceBreakerVisible, setIceBreakerVisible] = useState(false);
  const [actionDone, setActionDone] = useState(false);

  // Reveal animation
  const revealScale = useRef(new Animated.Value(0)).current;
  const revealOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    findMostCompatible();
    return () => reset();
  }, []);

  // When data arrives, wait for minimum search duration then transition
  const startTime = useRef(Date.now()).current;
  useEffect(() => {
    if (loading || found === null) return;

    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, SEARCH_DURATION - elapsed);

    const timer = setTimeout(() => {
      if (found && result) {
        setPhase('found');
        // Brief pause on "Encontrada." then reveal
        setTimeout(() => {
          setPhase('reveal');
          Animated.parallel([
            Animated.spring(revealScale, {
              toValue: 1,
              friction: 6,
              tension: 40,
              useNativeDriver: true,
            }),
            Animated.timing(revealOpacity, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
          ]).start();
        }, 800);
      } else {
        setPhase('reveal');
      }
    }, remaining);

    return () => clearTimeout(timer);
  }, [loading, found]);

  const handleClose = () => {
    reset();
    router.back();
  };

  // Phase: searching
  if (phase === 'searching') {
    return (
      <SafeAreaView style={s.container}>
        <View style={s.header}>
          <TouchableOpacity onPress={handleClose}>
            <Ionicons name="close" size={28} color={Colors.text} />
          </TouchableOpacity>
          <View style={{ width: 28 }} />
          <View style={{ width: 28 }} />
        </View>
        <View style={s.centered}>
          <View style={styles.ringContainer}>
            <PulseRings Colors={Colors} />
            <View style={[styles.centerDot, { backgroundColor: Colors.primary }]}>
              <Ionicons name="heart" size={28} color="#FFF" />
            </View>
          </View>
          <Text style={s.searchText}>{t('games.compatSearching')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Phase: found (brief "Encontrada." moment)
  if (phase === 'found') {
    return (
      <SafeAreaView style={s.container}>
        <View style={s.header}>
          <TouchableOpacity onPress={handleClose}>
            <Ionicons name="close" size={28} color={Colors.text} />
          </TouchableOpacity>
          <View style={{ width: 28 }} />
          <View style={{ width: 28 }} />
        </View>
        <View style={s.centered}>
          <View style={[styles.centerDot, { backgroundColor: Colors.primary }]}>
            <Ionicons name="heart" size={28} color="#FFF" />
          </View>
          <Text style={s.foundText}>{t('games.compatFound')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Phase: reveal - no result
  if (!found || !result) {
    return (
      <SafeAreaView style={s.container}>
        <View style={s.header}>
          <TouchableOpacity onPress={handleClose}>
            <Ionicons name="close" size={28} color={Colors.text} />
          </TouchableOpacity>
          <View style={{ width: 28 }} />
          <View style={{ width: 28 }} />
        </View>
        <View style={s.centered}>
          <Ionicons name="search-outline" size={64} color={Colors.primaryLight} />
          <Text style={s.emptyText}>{t('games.compatNoResult')}</Text>
          <TouchableOpacity style={s.backButton} onPress={handleClose}>
            <Text style={s.backButtonText}>{t('common.back')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Phase: reveal - show result
  const pct = result.compatibility_pct;
  const pctColor = pct >= 70 ? '#4CAF50' : pct >= 40 ? '#FF9800' : '#F44336';

  return (
    <SafeAreaView style={s.container}>
      <ResponsiveContainer>
        <View style={s.header}>
          <TouchableOpacity onPress={handleClose}>
            <Ionicons name="close" size={28} color={Colors.text} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>{t('games.compatibility')}</Text>
          <View style={{ width: 28 }} />
        </View>

        <Animated.View
          style={[
            s.resultContainer,
            { transform: [{ scale: revealScale }], opacity: revealOpacity },
          ]}
        >
          <View style={[s.pctCircle, { borderColor: pctColor }]}>
            <Text style={[s.pctNumber, { color: pctColor }]}>{pct}%</Text>
          </View>

          <Text style={s.compatLabel}>{t('games.matchPercentage', { percentage: pct })}</Text>

          <TouchableOpacity
            style={s.profileCard}
            activeOpacity={0.7}
            onPress={() => router.push(`/match-profile?userId=${result.user_id}` as any)}
          >
            {result.avatar_url ? (
              <Image source={{ uri: result.avatar_url }} style={s.avatar} />
            ) : (
              <View style={[s.avatar, s.avatarPlaceholder]}>
                <Ionicons name="person" size={32} color={Colors.primary} />
              </View>
            )}
            <View style={s.profileInfo}>
              <View style={s.nameRow}>
                <Text style={s.profileName}>{result.name}</Text>
                {result.is_verified && (
                  <Ionicons name="checkmark-circle" size={18} color={Colors.primary} />
                )}
              </View>
              <Text style={s.profileSub}>{t('games.compatViewProfile')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color={Colors.textSecondary} />
          </TouchableOpacity>

          {/* Action buttons: like / superlike / ice breaker (only if NOT already matched) */}
          {!result.is_match && !actionDone && (
            <View style={s.actions}>
              {availableIceBreakers > 0 && (
                <TouchableOpacity
                  style={[s.actionButton, { backgroundColor: '#6C63FF18' }]}
                  onPress={() => setIceBreakerVisible(true)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="chatbubble-outline" size={26} color="#6C63FF" />
                </TouchableOpacity>
              )}
              {availableSuperlikes > 0 && (
                <TouchableOpacity
                  style={[s.actionButton, { backgroundColor: '#FFD60A18' }]}
                  onPress={async () => {
                    await superlikeProfile(result.user_id);
                    setActionDone(true);
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="star" size={26} color={Colors.goldAccent} />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[s.actionButton, { backgroundColor: Colors.primaryPastel }]}
                onPress={async () => {
                  await likeProfile(result.user_id);
                  setActionDone(true);
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="heart" size={26} color={Colors.primary} />
              </TouchableOpacity>
            </View>
          )}

          {actionDone && (
            <Text style={s.actionDoneText}>{t('games.compatLikeSent')}</Text>
          )}

          <TouchableOpacity style={s.retryButton} onPress={() => { reset(); setActionDone(false); setPhase('searching'); findMostCompatible(); }}>
            <Text style={s.retryText}>{t('games.compatRetry')}</Text>
          </TouchableOpacity>
        </Animated.View>

        <IceBreakerModal
          visible={iceBreakerVisible}
          onClose={() => setIceBreakerVisible(false)}
          onSend={async (message: string) => {
            setIceBreakerVisible(false);
            await sendIceBreaker(result.user_id, message);
            setActionDone(true);
          }}
        />
      </ResponsiveContainer>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  ringContainer: {
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  ring: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
  },
  centerDot: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

function makeStyles(c: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 24,
      paddingTop: 12,
      paddingBottom: 8,
    },
    headerTitle: { fontSize: 18, fontFamily: Fonts.bodySemiBold, color: c.text },
    searchText: {
      fontSize: 18,
      fontFamily: Fonts.bodySemiBold,
      color: c.textSecondary,
      textAlign: 'center',
    },
    foundText: {
      fontSize: 22,
      fontFamily: Fonts.heading,
      color: c.primary,
      textAlign: 'center',
      marginTop: 24,
    },
    emptyText: {
      fontSize: 15,
      fontFamily: Fonts.body,
      color: c.textSecondary,
      textAlign: 'center',
      marginTop: 16,
    },
    backButton: {
      marginTop: 24,
      backgroundColor: c.surface,
      paddingHorizontal: 28,
      paddingVertical: 12,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: c.border,
    },
    backButtonText: { fontSize: 16, fontFamily: Fonts.bodySemiBold, color: c.text },
    resultContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 24,
      gap: 20,
    },
    pctCircle: {
      width: 130,
      height: 130,
      borderRadius: 65,
      borderWidth: 6,
      justifyContent: 'center',
      alignItems: 'center',
    },
    pctNumber: { fontSize: 40, fontFamily: Fonts.heading },
    compatLabel: { fontSize: 16, fontFamily: Fonts.bodyMedium, color: c.textSecondary },
    profileCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.surface,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: c.borderLight,
      gap: 14,
      width: '100%',
      marginTop: 8,
    },
    avatar: { width: 56, height: 56, borderRadius: 28 },
    avatarPlaceholder: {
      backgroundColor: c.primaryPastel,
      justifyContent: 'center',
      alignItems: 'center',
    },
    profileInfo: { flex: 1, gap: 2 },
    nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    profileName: { fontSize: 18, fontFamily: Fonts.bodySemiBold, color: c.text },
    profileSub: { fontSize: 13, fontFamily: Fonts.body, color: c.textSecondary },
    retryButton: {
      marginTop: 12,
      paddingHorizontal: 24,
      paddingVertical: 10,
    },
    retryText: { fontSize: 14, fontFamily: Fonts.bodyMedium, color: c.primary },
    actions: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 16,
      marginTop: 4,
    },
    actionButton: {
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: 'center',
      alignItems: 'center',
    },
    actionDoneText: {
      fontSize: 14,
      fontFamily: Fonts.bodySemiBold,
      color: c.primary,
      marginTop: 4,
    },
  });
}
