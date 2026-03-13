import { useCallback } from 'react';
import { useColors } from '@/hooks/useColors';
import { Fonts } from '@/constants/fonts';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import i18n from '@/i18n';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ResponsiveContainer } from '@/components/ResponsiveContainer';
import { ProfileAvatarButton } from '@/components/ProfileAvatarButton';
import { useWyrStore } from '@/stores/wyrStore';
import { useTriviaStore } from '@/stores/triviaStore';

export default function JuegosScreen() {
  const { t } = useTranslation();
  const Colors = useColors();
  const s = makeStyles(Colors);
  const router = useRouter();
  const lang = i18n.language?.split('-')[0] || 'es';

  const { dailyQuestion, userAnswer, stats, loading: wyrLoading, fetchDaily, submitAnswer } = useWyrStore();
  const pendingInvites = useTriviaStore((s) => s.pendingInvites);
  const fetchPendingInvites = useTriviaStore((s) => s.fetchPendingInvites);

  useFocusEffect(
    useCallback(() => {
      fetchDaily();
      fetchPendingInvites();
    }, [fetchDaily, fetchPendingInvites])
  );

  const optionAText = dailyQuestion?.option_a?.[lang] || dailyQuestion?.option_a?.['es'] || 'A';
  const optionBText = dailyQuestion?.option_b?.[lang] || dailyQuestion?.option_b?.['es'] || 'B';
  const questionText = dailyQuestion?.question?.[lang] || dailyQuestion?.question?.['es'] || '';

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <ResponsiveContainer>
        <View style={s.header}>
          <Text style={s.headerTitle}>{t('games.title')}</Text>
          <ProfileAvatarButton />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
          {/* Daily WYR */}
          {dailyQuestion && (
            <View style={s.wyrCard}>
              <Text style={s.wyrLabel}>{t('games.wyrDaily')}</Text>
              <Text style={s.wyrQuestion}>{questionText}</Text>

              {!userAnswer ? (
                <View style={s.wyrOptions}>
                  <TouchableOpacity
                    style={s.wyrOption}
                    onPress={() => submitAnswer(dailyQuestion.id, 'a')}
                    activeOpacity={0.7}
                  >
                    <Text style={s.wyrOptionText}>{optionAText}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={s.wyrOption}
                    onPress={() => submitAnswer(dailyQuestion.id, 'b')}
                    activeOpacity={0.7}
                  >
                    <Text style={s.wyrOptionText}>{optionBText}</Text>
                  </TouchableOpacity>
                </View>
              ) : stats ? (
                <View style={s.wyrStats}>
                  <View style={s.wyrStatRow}>
                    <Text style={[s.wyrStatLabel, userAnswer === 'a' && s.wyrStatLabelSelected]}>
                      {optionAText}
                    </Text>
                    <View style={s.wyrBar}>
                      <View style={[s.wyrBarFill, { width: `${stats.pct_a}%`, backgroundColor: Colors.primary }]} />
                    </View>
                    <Text style={s.wyrStatPct}>{stats.pct_a}%</Text>
                  </View>
                  <View style={s.wyrStatRow}>
                    <Text style={[s.wyrStatLabel, userAnswer === 'b' && s.wyrStatLabelSelected]}>
                      {optionBText}
                    </Text>
                    <View style={s.wyrBar}>
                      <View style={[s.wyrBarFill, { width: `${stats.pct_b}%`, backgroundColor: Colors.primaryLight }]} />
                    </View>
                    <Text style={s.wyrStatPct}>{stats.pct_b}%</Text>
                  </View>
                  <Text style={s.wyrVotes}>
                    {t('games.wyrTotalVotes', { count: stats.total_votes })}
                  </Text>
                </View>
              ) : (
                <ActivityIndicator size="small" color={Colors.primary} />
              )}
            </View>
          )}

          {wyrLoading && !dailyQuestion && (
            <View style={s.wyrCard}>
              <ActivityIndicator size="small" color={Colors.primary} />
            </View>
          )}

          {/* Game cards */}
          <View style={s.cards}>
            {/* Affinity - play with a match */}
            <TouchableOpacity
              style={[s.card, { borderLeftColor: '#7B61FF', borderLeftWidth: 4 }]}
              activeOpacity={0.7}
              onPress={() => router.push('/trivia-invite' as any)}
            >
              <View style={[s.cardIconWrap, { backgroundColor: '#7B61FF18' }]}>
                <Ionicons name="flash-outline" size={28} color="#7B61FF" />
                {pendingInvites.length > 0 && (
                  <View style={s.badge}>
                    <Text style={s.badgeText}>{pendingInvites.length}</Text>
                  </View>
                )}
              </View>
              <View style={s.cardContent}>
                <Text style={s.cardTitle}>{t('games.affinity')}</Text>
                <Text style={s.cardDesc}>{t('games.affinityDesc')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>

            {/* Compatibility - discover your most compatible person */}
            <TouchableOpacity
              style={[s.card, { borderLeftColor: '#FF6B6B', borderLeftWidth: 4 }]}
              activeOpacity={0.7}
              onPress={() => router.push('/compatibility-play' as any)}
            >
              <View style={[s.cardIconWrap, { backgroundColor: '#FF6B6B18' }]}>
                <Ionicons name="heart-half-outline" size={28} color="#FF6B6B" />
              </View>
              <View style={s.cardContent}>
                <Text style={s.cardTitle}>{t('games.compatibility')}</Text>
                <Text style={s.cardDesc}>{t('games.compatibilityDesc')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>

            {/* Quiz - daily culture quiz */}
            <TouchableOpacity
              style={[s.card, { borderLeftColor: '#4CAF50', borderLeftWidth: 4 }]}
              activeOpacity={0.7}
              onPress={() => router.push('/quiz-play' as any)}
            >
              <View style={[s.cardIconWrap, { backgroundColor: '#4CAF5018' }]}>
                <Ionicons name="school-outline" size={28} color="#4CAF50" />
              </View>
              <View style={s.cardContent}>
                <Text style={s.cardTitle}>{t('games.quiz')}</Text>
                <Text style={s.cardDesc}>{t('games.quizDesc')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ResponsiveContainer>
    </SafeAreaView>
  );
}

function makeStyles(c: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 12 },
    headerTitle: { fontSize: 28, fontFamily: Fonts.heading, color: c.text },
    scrollContent: { paddingHorizontal: 24, paddingBottom: 40, gap: 20 },
    // WYR daily
    wyrCard: { backgroundColor: c.surface, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: c.borderLight },
    wyrLabel: { fontSize: 12, fontFamily: Fonts.bodySemiBold, color: c.primary, textTransform: 'uppercase', marginBottom: 8 },
    wyrQuestion: { fontSize: 18, fontFamily: Fonts.heading, color: c.text, marginBottom: 16 },
    wyrOptions: { gap: 10 },
    wyrOption: { padding: 14, borderRadius: 12, borderWidth: 2, borderColor: c.border, alignItems: 'center' },
    wyrOptionText: { fontSize: 15, fontFamily: Fonts.bodySemiBold, color: c.text },
    wyrStats: { gap: 10 },
    wyrStatRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    wyrStatLabel: { width: 80, fontSize: 13, fontFamily: Fonts.body, color: c.textSecondary },
    wyrStatLabelSelected: { fontFamily: Fonts.bodySemiBold, color: c.primary },
    wyrBar: { flex: 1, height: 8, backgroundColor: c.borderLight, borderRadius: 4, overflow: 'hidden' },
    wyrBarFill: { height: 8, borderRadius: 4 },
    wyrStatPct: { width: 40, fontSize: 13, fontFamily: Fonts.bodySemiBold, color: c.text, textAlign: 'right' },
    wyrVotes: { fontSize: 12, fontFamily: Fonts.body, color: c.textSecondary, textAlign: 'center', marginTop: 4 },
    // Game cards
    cards: { gap: 16 },
    card: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.surface, borderRadius: 16, padding: 18, borderWidth: 1, borderColor: c.borderLight, gap: 14 },
    cardIconWrap: { width: 52, height: 52, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    cardContent: { flex: 1, gap: 4 },
    cardTitle: { fontSize: 17, fontFamily: Fonts.bodyBold, color: c.text },
    cardDesc: { fontSize: 13, fontFamily: Fonts.body, color: c.textSecondary },
    badge: { position: 'absolute', top: -4, right: -4, backgroundColor: c.primary, borderRadius: 9, minWidth: 18, height: 18, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4 },
    badgeText: { fontSize: 10, fontFamily: Fonts.bodyBold, color: c.textOnPrimary },
  });
}
