import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import { Ionicons } from '@expo/vector-icons';
import { useDailyProfiles } from '@/hooks/useDailyProfiles';
import { ProfileCard } from '@/components/ProfileCard';
import { MatchOverlay } from '@/components/MatchOverlay';

export default function TodayScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const {
    currentProfile,
    currentPhotos,
    hasMore,
    isLoading,
    error,
    matchResult,
    like,
    pass,
    clearMatchResult,
    refresh,
    resetPasses,
  } = useDailyProfiles();

  const handleChat = () => {
    if (matchResult?.match_id) {
      clearMatchResult();
      router.push(`/(tabs)/chat/${matchResult.match_id}`);
    }
  };

  const handleKeepExploring = () => {
    clearMatchResult();
  };

  const photos = currentPhotos.map((p) => ({ uri: p.url }));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('today.title')}</Text>
        {currentProfile && hasMore && !isLoading && (
          <TouchableOpacity onPress={refresh} style={styles.refreshButton} activeOpacity={0.7}>
            <Ionicons name="refresh" size={22} color={Colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.cardContainer}>
        {isLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>{t('today.loading')}</Text>
          </View>
        ) : error ? (
          <View style={styles.centered}>
            <Ionicons name="alert-circle-outline" size={64} color={Colors.primary} />
            <Text style={styles.errorText}>{t(error)}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={refresh} activeOpacity={0.7}>
              <Ionicons name="refresh" size={20} color={Colors.surface} />
              <Text style={styles.retryText}>{t('common.retry')}</Text>
            </TouchableOpacity>
          </View>
        ) : currentProfile && hasMore ? (
            <ProfileCard profile={currentProfile} photos={photos} />
        ) : (
          <View style={styles.centered}>
            <Ionicons name="heart" size={64} color={Colors.primaryLight} />
            <Text style={styles.emptyText}>{t('today.empty')}</Text>
            <TouchableOpacity style={styles.secondChanceButton} onPress={resetPasses} activeOpacity={0.7}>
              <Ionicons name="refresh-circle-outline" size={22} color={Colors.primary} />
              <Text style={styles.secondChanceText}>{t('today.secondChance')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {currentProfile && hasMore && !isLoading && !error && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.passButton]}
            onPress={pass}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={32} color={Colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.likeButton]}
            onPress={like}
            activeOpacity={0.7}
          >
            <Ionicons name="heart" size={32} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      )}

      <MatchOverlay
        visible={matchResult?.matched === true}
        onChat={handleChat}
        onKeepExploring={handleKeepExploring}
      />
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
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 4,
    zIndex: 1,
  },
  title: {
    fontSize: 28,
    fontFamily: Fonts.heading,
    color: Colors.text,
  },
  refreshButton: {
    padding: 8,
  },
  cardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    overflow: 'hidden',
  },
  centered: {
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 40,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: Fonts.body,
    color: Colors.textSecondary,
  },
  errorText: {
    fontSize: 16,
    fontFamily: Fonts.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: Fonts.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  secondChanceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primaryPastel,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    marginTop: 8,
  },
  secondChanceText: {
    fontSize: 15,
    fontFamily: Fonts.bodySemiBold,
    color: Colors.primary,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 8,
  },
  retryText: {
    fontSize: 15,
    fontFamily: Fonts.bodyMedium,
    color: Colors.surface,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
    paddingTop: 12,
    paddingBottom: 16,
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 72,
    height: 72,
    borderRadius: 36,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  passButton: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  likeButton: {
    backgroundColor: Colors.primaryPastel,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
  },
});
