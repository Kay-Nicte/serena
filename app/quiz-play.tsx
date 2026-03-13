import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import i18n from '@/i18n';
import { useColors } from '@/hooks/useColors';
import { Fonts } from '@/constants/fonts';
import { ResponsiveContainer } from '@/components/ResponsiveContainer';
import { useQuizStore, type LeaderboardEntry } from '@/stores/quizStore';

export default function QuizPlayScreen() {
  const { t } = useTranslation();
  const Colors = useColors();
  const s = makeStyles(Colors);
  const router = useRouter();
  const lang = i18n.language?.split('-')[0] || 'es';

  const {
    questions, answers, alreadyPlayed, score, total, myLastScore,
    leaderboard, loading, submitting,
    fetchDailyQuiz, setAnswer, submitQuiz, fetchLeaderboard, reset,
  } = useQuizStore();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState<string | null>(null); // question_id of currently revealed answer
  const [showResults, setShowResults] = useState(false);

  // Feedback animation
  const feedbackScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    fetchDailyQuiz();
    return () => reset();
  }, []);

  // If already played, go directly to leaderboard
  useEffect(() => {
    if (alreadyPlayed && score === null) {
      fetchLeaderboard();
      setShowResults(true);
    }
  }, [alreadyPlayed]);

  // After submitting, fetch leaderboard
  useEffect(() => {
    if (score !== null) {
      fetchLeaderboard();
      setShowResults(true);
    }
  }, [score]);

  const question = questions[currentIndex];
  const totalQuestions = questions.length;

  const handleSelect = (optionIndex: number) => {
    if (!question || revealed) return;
    setAnswer(question.id, optionIndex);
    setRevealed(question.id);

    // Brief feedback then advance
    Animated.sequence([
      Animated.timing(feedbackScale, { toValue: 1.05, duration: 150, useNativeDriver: true }),
      Animated.timing(feedbackScale, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();

    setTimeout(() => {
      if (currentIndex < totalQuestions - 1) {
        setCurrentIndex((i) => i + 1);
      }
      setRevealed(null);
    }, 1200);
  };

  const handleClose = () => {
    reset();
    router.back();
  };

  const allAnswered = totalQuestions > 0 && Object.keys(answers).length >= totalQuestions;

  // ==================== Results + Leaderboard ====================
  if (showResults) {
    const displayScore = score ?? myLastScore?.score ?? 0;
    const displayTotal = total ?? myLastScore?.total ?? 10;
    const pctColor = displayScore >= 7 ? '#4CAF50' : displayScore >= 4 ? '#FF9800' : '#F44336';

    return (
      <SafeAreaView style={s.container}>
        <ResponsiveContainer>
          <View style={s.header}>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={28} color={Colors.text} />
            </TouchableOpacity>
            <Text style={s.headerTitle}>{t('games.quiz')}</Text>
            <View style={{ width: 28 }} />
          </View>

          <FlatList
            data={leaderboard}
            keyExtractor={(item) => item.user_id}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <View style={s.resultsHeader}>
                <View style={[s.scoreCircle, { borderColor: pctColor }]}>
                  <Text style={[s.scoreNumber, { color: pctColor }]}>
                    {displayScore}/{displayTotal}
                  </Text>
                </View>
                <Text style={s.scoreLabel}>
                  {score !== null ? t('games.quizYourScore') : t('games.quizLastScore')}
                </Text>
                {leaderboard.length > 0 && (
                  <Text style={s.leaderboardTitle}>{t('games.quizLeaderboard')}</Text>
                )}
              </View>
            }
            renderItem={({ item, index }: { item: LeaderboardEntry; index: number }) => (
              <TouchableOpacity
                style={s.leaderboardRow}
                activeOpacity={0.7}
                onPress={() => router.push(`/match-profile?userId=${item.user_id}` as any)}
              >
                <Text style={s.rank}>{index + 1}</Text>
                {item.avatar_url ? (
                  <Image source={{ uri: item.avatar_url }} style={s.avatar} />
                ) : (
                  <View style={[s.avatar, s.avatarPlaceholder]}>
                    <Ionicons name="person" size={20} color={Colors.primary} />
                  </View>
                )}
                <View style={s.leaderboardInfo}>
                  <View style={s.nameRow}>
                    <Text style={s.leaderboardName} numberOfLines={1}>{item.name}</Text>
                    {item.is_verified && (
                      <Ionicons name="checkmark-circle" size={14} color={Colors.primary} />
                    )}
                  </View>
                </View>
                <View style={s.scoreBadge}>
                  <Text style={s.scoreBadgeText}>{item.score}/{item.total}</Text>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={null}
            contentContainerStyle={s.leaderboardList}
          />
        </ResponsiveContainer>
      </SafeAreaView>
    );
  }

  // ==================== Loading ====================
  if (loading || !question) {
    return (
      <SafeAreaView style={s.container}>
        <View style={s.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  // ==================== Quiz Questions ====================
  const questionText = question.question[lang] || question.question['es'] || '';
  const options = question.options || [];
  const selected = answers[question.id];
  const isRevealed = revealed === question.id;

  // Find correct_option - we don't have it client-side, but we show feedback via color after submit
  // Actually we need it for feedback. Let me check... The RPC doesn't return correct_option.
  // Feedback will only be available after submit. For now, just highlight selected.
  // UPDATE: We show correct/incorrect after submitting all answers. During play, just show selected.

  return (
    <SafeAreaView style={s.container}>
      <ResponsiveContainer>
        <View style={s.header}>
          <TouchableOpacity onPress={handleClose}>
            <Ionicons name="close" size={28} color={Colors.text} />
          </TouchableOpacity>
          <Text style={s.progress}>
            {t('games.questionOf', { current: currentIndex + 1, total: totalQuestions })}
          </Text>
          <View style={{ width: 28 }} />
        </View>

        <View style={s.progressBar}>
          <View style={[s.progressFill, { width: `${((currentIndex + 1) / totalQuestions) * 100}%` }]} />
        </View>

        {question.category && (
          <Text style={s.category}>{t(`games.quizCat_${question.category}`, question.category)}</Text>
        )}

        <View style={s.questionContainer}>
          <Text style={s.questionText}>{questionText}</Text>
        </View>

        <Animated.View style={[s.options, { transform: [{ scale: feedbackScale }] }]}>
          {options.map((opt: Record<string, string>, i: number) => {
            const optText = opt[lang] || opt['es'] || `${i + 1}`;
            const isSelected = selected === i;

            return (
              <TouchableOpacity
                key={i}
                style={[
                  s.option,
                  isSelected && s.optionSelected,
                ]}
                onPress={() => handleSelect(i)}
                activeOpacity={0.7}
                disabled={isRevealed}
              >
                <View style={[s.optionLetter, isSelected && s.optionLetterSelected]}>
                  <Text style={[s.optionLetterText, isSelected && s.optionLetterTextSelected]}>
                    {String.fromCharCode(65 + i)}
                  </Text>
                </View>
                <Text style={[s.optionText, isSelected && s.optionTextSelected]} numberOfLines={2}>
                  {optText}
                </Text>
              </TouchableOpacity>
            );
          })}
        </Animated.View>

        <View style={s.nav}>
          <View style={{ flex: 1 }} />
          {allAnswered && !isRevealed && (
            <TouchableOpacity style={s.submitButton} onPress={submitQuiz} disabled={submitting}>
              {submitting ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={s.submitText}>{t('common.done')}</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </ResponsiveContainer>
    </SafeAreaView>
  );
}

function makeStyles(c: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingHorizontal: 24, paddingTop: 12, paddingBottom: 8,
    },
    headerTitle: { fontSize: 18, fontFamily: Fonts.bodySemiBold, color: c.text },
    progress: { fontSize: 14, fontFamily: Fonts.bodyMedium, color: c.textSecondary },
    progressBar: { height: 4, backgroundColor: c.borderLight, marginHorizontal: 24, borderRadius: 2 },
    progressFill: { height: 4, backgroundColor: c.primary, borderRadius: 2 },
    category: {
      fontSize: 12, fontFamily: Fonts.bodyMedium, color: c.primary, textTransform: 'uppercase',
      textAlign: 'center', marginTop: 16, letterSpacing: 1,
    },
    questionContainer: {
      flex: 1, justifyContent: 'center', alignItems: 'center',
      paddingHorizontal: 28, paddingVertical: 24,
    },
    questionText: { fontSize: 22, fontFamily: Fonts.heading, color: c.text, textAlign: 'center' },
    options: { paddingHorizontal: 24, gap: 10 },
    option: {
      flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 14,
      borderWidth: 2, borderColor: c.border, backgroundColor: c.surface, gap: 12,
    },
    optionSelected: { borderColor: c.primary, backgroundColor: c.primaryPastel },
    optionLetter: {
      width: 32, height: 32, borderRadius: 16, backgroundColor: c.borderLight,
      justifyContent: 'center', alignItems: 'center',
    },
    optionLetterSelected: { backgroundColor: c.primary },
    optionLetterText: { fontSize: 14, fontFamily: Fonts.bodyBold, color: c.textSecondary },
    optionLetterTextSelected: { color: '#FFF' },
    optionText: { fontSize: 15, fontFamily: Fonts.bodySemiBold, color: c.text, flex: 1 },
    optionTextSelected: { color: c.primary },
    nav: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 16 },
    submitButton: { backgroundColor: c.primary, paddingHorizontal: 28, paddingVertical: 12, borderRadius: 24 },
    submitText: { fontSize: 16, fontFamily: Fonts.bodySemiBold, color: '#FFFFFF' },
    // Results
    resultsHeader: { alignItems: 'center', paddingVertical: 24, gap: 8 },
    scoreCircle: {
      width: 120, height: 120, borderRadius: 60, borderWidth: 6,
      justifyContent: 'center', alignItems: 'center',
    },
    scoreNumber: { fontSize: 32, fontFamily: Fonts.heading },
    scoreLabel: { fontSize: 15, fontFamily: Fonts.bodyMedium, color: c.textSecondary },
    leaderboardTitle: {
      fontSize: 16, fontFamily: Fonts.bodySemiBold, color: c.text,
      marginTop: 20, alignSelf: 'flex-start', paddingHorizontal: 24,
    },
    leaderboardList: { paddingHorizontal: 24, paddingBottom: 40 },
    leaderboardRow: {
      flexDirection: 'row', alignItems: 'center', backgroundColor: c.surface,
      borderRadius: 12, padding: 12, borderWidth: 1, borderColor: c.borderLight,
      gap: 10, marginBottom: 8,
    },
    rank: { fontSize: 14, fontFamily: Fonts.bodyBold, color: c.textSecondary, width: 24, textAlign: 'center' },
    avatar: { width: 42, height: 42, borderRadius: 21 },
    avatarPlaceholder: { backgroundColor: c.primaryPastel, justifyContent: 'center', alignItems: 'center' },
    leaderboardInfo: { flex: 1, gap: 2 },
    nameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    leaderboardName: { fontSize: 15, fontFamily: Fonts.bodySemiBold, color: c.text },
    scoreBadge: { backgroundColor: c.primaryPastel, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
    scoreBadgeText: { fontSize: 14, fontFamily: Fonts.bodyBold, color: c.primary },
    emptyLeaderboard: { alignItems: 'center', paddingVertical: 32 },
    emptyText: { fontSize: 14, fontFamily: Fonts.body, color: c.textSecondary, textAlign: 'center' },
  });
}
