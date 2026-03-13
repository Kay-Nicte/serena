import { useEffect } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import i18n from '@/i18n';
import { useColors } from '@/hooks/useColors';
import { Fonts } from '@/constants/fonts';
import { ResponsiveContainer } from '@/components/ResponsiveContainer';
import { useTriviaStore } from '@/stores/triviaStore';

export default function TriviaResultsScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const { t } = useTranslation();
  const Colors = useColors();
  const s = makeStyles(Colors);
  const router = useRouter();
  const lang = i18n.language?.split('-')[0] || 'es';

  const { result, questions, getResults, reset } = useTriviaStore();

  useEffect(() => {
    if (sessionId && !result) getResults(sessionId);
  }, [sessionId]);

  if (!result) {
    return (
      <SafeAreaView style={s.container}>
        <View style={s.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const pct = result.match_percentage;
  const pctColor = pct >= 70 ? '#4CAF50' : pct >= 40 ? '#FF9800' : '#F44336';

  return (
    <SafeAreaView style={s.container}>
      <ResponsiveContainer>
        <View style={s.header}>
          <TouchableOpacity onPress={() => { reset(); router.back(); }}>
            <Ionicons name="close" size={28} color={Colors.text} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>{t('games.results')}</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
          <View style={s.matchSection}>
            <View style={[s.matchCircle, { borderColor: pctColor }]}>
              <Text style={[s.matchPct, { color: pctColor }]}>{pct}%</Text>
            </View>
            <Text style={s.matchLabel}>{t('games.matchPercentage', { percentage: pct })}</Text>
          </View>

          <View style={s.partnerRow}>
            {result.partner.avatar_url ? (
              <Image source={{ uri: result.partner.avatar_url }} style={s.partnerAvatar} />
            ) : (
              <View style={[s.partnerAvatar, s.avatarPlaceholder]}>
                <Ionicons name="person" size={24} color={Colors.primary} />
              </View>
            )}
            <Text style={s.partnerName}>{result.partner.name}</Text>
            {result.partner.is_verified && (
              <Ionicons name="checkmark-circle" size={18} color={Colors.primary} />
            )}
          </View>

          <View style={s.answersSection}>
            {result.answers?.map((a, i) => {
              const q = questions.find((q) => q.id === a.question_id);
              const qText = q?.question[lang] || q?.question['es'] || `Q${i + 1}`;
              const myLabel = a.my_answer === 'a' ? (q?.option_a?.[lang] || 'A') : (q?.option_b?.[lang] || 'B');
              const theirLabel = a.their_answer === 'a' ? (q?.option_a?.[lang] || 'A') : (q?.option_b?.[lang] || 'B');
              const isMatch = a.my_answer === a.their_answer;

              return (
                <View key={a.question_id} style={s.answerCard}>
                  <Text style={s.answerQuestion}>{qText}</Text>
                  <View style={s.answerRow}>
                    <View style={s.answerCol}>
                      <Text style={s.answerLabel}>{t('games.yourAnswer')}</Text>
                      <Text style={s.answerValue}>{myLabel}</Text>
                    </View>
                    <Ionicons
                      name={isMatch ? 'checkmark-circle' : 'close-circle'}
                      size={24}
                      color={isMatch ? '#4CAF50' : '#F44336'}
                    />
                    <View style={s.answerCol}>
                      <Text style={s.answerLabel}>{t('games.theirAnswer')}</Text>
                      <Text style={s.answerValue}>{theirLabel}</Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>

          <View style={s.actions}>
            <TouchableOpacity
              style={s.primaryButton}
              onPress={() => { reset(); router.replace('/trivia-invite' as any); }}
              activeOpacity={0.7}
            >
              <Text style={s.primaryButtonText}>{t('games.playAgain')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={s.secondaryButton}
              onPress={() => { reset(); router.push(`/match-profile?userId=${result.partner.id}` as any); }}
              activeOpacity={0.7}
            >
              <Text style={s.secondaryButtonText}>{t('games.viewProfile')}</Text>
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
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 12, paddingBottom: 8 },
    headerTitle: { fontSize: 18, fontFamily: Fonts.bodySemiBold, color: c.text },
    scrollContent: { paddingBottom: 40 },
    matchSection: { alignItems: 'center', paddingVertical: 24, gap: 12 },
    matchCircle: { width: 120, height: 120, borderRadius: 60, borderWidth: 6, justifyContent: 'center', alignItems: 'center' },
    matchPct: { fontSize: 36, fontFamily: Fonts.heading },
    matchLabel: { fontSize: 16, fontFamily: Fonts.bodyMedium, color: c.textSecondary },
    partnerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingBottom: 20 },
    partnerAvatar: { width: 44, height: 44, borderRadius: 22 },
    avatarPlaceholder: { backgroundColor: c.primaryPastel, justifyContent: 'center', alignItems: 'center' },
    partnerName: { fontSize: 18, fontFamily: Fonts.bodySemiBold, color: c.text },
    answersSection: { paddingHorizontal: 24, gap: 12, paddingBottom: 24 },
    answerCard: { backgroundColor: c.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: c.borderLight, gap: 10 },
    answerQuestion: { fontSize: 14, fontFamily: Fonts.bodySemiBold, color: c.text },
    answerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    answerCol: { flex: 1, alignItems: 'center', gap: 2 },
    answerLabel: { fontSize: 11, fontFamily: Fonts.body, color: c.textSecondary },
    answerValue: { fontSize: 14, fontFamily: Fonts.bodyMedium, color: c.text },
    actions: { paddingHorizontal: 24, gap: 12 },
    primaryButton: { backgroundColor: c.primary, paddingVertical: 14, borderRadius: 24, alignItems: 'center' },
    primaryButtonText: { fontSize: 16, fontFamily: Fonts.bodySemiBold, color: '#FFFFFF' },
    secondaryButton: { backgroundColor: c.surface, paddingVertical: 14, borderRadius: 24, alignItems: 'center', borderWidth: 1, borderColor: c.border },
    secondaryButtonText: { fontSize: 16, fontFamily: Fonts.bodySemiBold, color: c.text },
  });
}
