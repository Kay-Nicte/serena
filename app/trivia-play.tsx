import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import i18n from '@/i18n';
import { useColors } from '@/hooks/useColors';
import { Fonts } from '@/constants/fonts';
import { ResponsiveContainer } from '@/components/ResponsiveContainer';
import { useTriviaStore } from '@/stores/triviaStore';

export default function TriviaPlayScreen() {
  const { t } = useTranslation();
  const Colors = useColors();
  const s = makeStyles(Colors);
  const router = useRouter();
  const lang = i18n.language?.split('-')[0] || 'es';

  const { currentSessionId, questions, answers, submitting, setAnswer, submitAnswers, reset } = useTriviaStore();
  const [currentIndex, setCurrentIndex] = useState(0);

  const question = questions[currentIndex];
  const totalQuestions = questions.length;
  const allAnswered = totalQuestions > 0 && Object.keys(answers).length >= totalQuestions;

  const handleAnswer = (answer: string) => {
    if (!question) return;
    setAnswer(question.id, answer);
    if (currentIndex < totalQuestions - 1) {
      setTimeout(() => setCurrentIndex((i) => i + 1), 300);
    }
  };

  const handleSubmit = async () => {
    if (!currentSessionId) return;
    await submitAnswers();
    reset();
    router.back();
  };

  if (!question || !currentSessionId) {
    return (
      <SafeAreaView style={s.container}>
        <View style={s.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const questionText = question.question[lang] || question.question['es'] || '';
  const optionA = question.option_a?.[lang] || question.option_a?.['es'] || 'A';
  const optionB = question.option_b?.[lang] || question.option_b?.['es'] || 'B';
  const selected = answers[question.id];

  return (
    <SafeAreaView style={s.container}>
      <ResponsiveContainer>
        <View style={s.header}>
          <TouchableOpacity onPress={() => { reset(); router.back(); }}>
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

        <View style={s.questionContainer}>
          <Text style={s.questionText}>{questionText}</Text>
        </View>

        <View style={s.options}>
          <TouchableOpacity
            style={[s.option, selected === 'a' && s.optionSelected]}
            onPress={() => handleAnswer('a')}
            activeOpacity={0.7}
          >
            <Text style={[s.optionText, selected === 'a' && s.optionTextSelected]}>{optionA}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.option, selected === 'b' && s.optionSelected]}
            onPress={() => handleAnswer('b')}
            activeOpacity={0.7}
          >
            <Text style={[s.optionText, selected === 'b' && s.optionTextSelected]}>{optionB}</Text>
          </TouchableOpacity>
        </View>

        <View style={s.nav}>
          {currentIndex > 0 && (
            <TouchableOpacity style={s.navButton} onPress={() => setCurrentIndex((i) => i - 1)}>
              <Ionicons name="chevron-back" size={20} color={Colors.text} />
            </TouchableOpacity>
          )}
          <View style={{ flex: 1 }} />
          {allAnswered && (
            <TouchableOpacity style={s.submitButton} onPress={handleSubmit} disabled={submitting}>
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
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 12, paddingBottom: 8 },
    progress: { fontSize: 14, fontFamily: Fonts.bodyMedium, color: c.textSecondary },
    progressBar: { height: 4, backgroundColor: c.borderLight, marginHorizontal: 24, borderRadius: 2 },
    progressFill: { height: 4, backgroundColor: c.primary, borderRadius: 2 },
    questionContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32, paddingVertical: 40 },
    questionText: { fontSize: 24, fontFamily: Fonts.heading, color: c.text, textAlign: 'center' },
    options: { paddingHorizontal: 24, gap: 12 },
    option: { padding: 20, borderRadius: 16, borderWidth: 2, borderColor: c.border, backgroundColor: c.surface, alignItems: 'center' },
    optionSelected: { borderColor: c.primary, backgroundColor: c.primaryPastel },
    optionText: { fontSize: 17, fontFamily: Fonts.bodySemiBold, color: c.text },
    optionTextSelected: { color: c.primary },
    nav: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 20 },
    navButton: { padding: 10, borderRadius: 20, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border },
    submitButton: { backgroundColor: c.primary, paddingHorizontal: 28, paddingVertical: 12, borderRadius: 24 },
    submitText: { fontSize: 16, fontFamily: Fonts.bodySemiBold, color: '#FFFFFF' },
  });
}
