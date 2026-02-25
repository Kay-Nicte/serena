import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, type LayoutChangeEvent } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import { Ionicons } from '@expo/vector-icons';
import { useDailyProfiles } from '@/hooks/useDailyProfiles';
import { ProfileCard } from '@/components/ProfileCard';
import { MatchOverlay } from '@/components/MatchOverlay';
import { ReportModal, type ReportReason } from '@/components/ReportModal';
import { Toast, useToast } from '@/components/Toast';
import { useBlockStore } from '@/stores/blockStore';
import { supabase } from '@/lib/supabase';
import { getPhotoUrl } from '@/lib/storage';
import { useResponsive } from '@/hooks/useResponsive';

const ACTIONS_HEIGHT = 100; // 72px button + 20px paddingTop + 8px paddingBottom

export default function TodayScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { cardWidth, isTablet, contentMaxWidth } = useResponsive();
  const {
    currentProfile,
    hasMore,
    isLoading,
    matchResult,
    like,
    pass,
    clearMatchResult,
  } = useDailyProfiles();

  const [candidatePhotos, setCandidatePhotos] = useState<{ uri: string }[]>([]);
  const [containerHeight, setContainerHeight] = useState(0);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const toast = useToast();

  const handleContainerLayout = (e: LayoutChangeEvent) => {
    setContainerHeight(e.nativeEvent.layout.height);
  };

  // Available height for the card = container height minus the action buttons area
  const availableCardHeight = containerHeight > 0 ? containerHeight - ACTIONS_HEIGHT : 0;

  useEffect(() => {
    if (currentProfile) {
      supabase
        .from('photos')
        .select('storage_path, position')
        .eq('user_id', currentProfile.id)
        .order('position')
        .then(({ data }) => {
          if (data && data.length > 0) {
            setCandidatePhotos(data.map((p) => ({ uri: getPhotoUrl(p.storage_path) })));
          } else {
            setCandidatePhotos([]);
          }
        });
    } else {
      setCandidatePhotos([]);
    }
  }, [currentProfile?.id, currentProfile]);

  const handleChat = () => {
    if (matchResult?.match_id) {
      clearMatchResult();
      router.push(`/(tabs)/chat/${matchResult.match_id}`);
    }
  };

  const handleKeepExploring = () => {
    clearMatchResult();
  };

  const handleReport = async (reason: ReportReason, description: string, alsoBlock: boolean) => {
    if (!currentProfile) return;
    setReportLoading(true);
    try {
      await useBlockStore.getState().reportUser(currentProfile.id, reason, description);
      if (alsoBlock) {
        await useBlockStore.getState().blockUser(currentProfile.id);
      }
      setReportModalVisible(false);
      toast.show(t('report.successMessage'));
      pass();
    } catch (err: any) {
      toast.show(t(err?.message === 'DUPLICATE_REPORT' ? 'report.alreadyReported' : 'report.errorSubmitting'), 'error');
    } finally {
      setReportLoading(false);
    }
  };

  const handleBlockOnly = () => {
    if (!currentProfile) return;
    const name = currentProfile.name ?? '';
    setReportModalVisible(false);
    Alert.alert(
      t('block.confirmTitle'),
      t('block.confirmMessage', { name }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('block.block'),
          style: 'destructive',
          onPress: async () => {
            try {
              await useBlockStore.getState().blockUser(currentProfile.id);
              pass();
            } catch {
              toast.show(t('block.errorBlocking'), 'error');
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{t('today.title')}</Text>

      <View style={[styles.cardContainer, isTablet && { maxWidth: contentMaxWidth, alignSelf: 'center' as const, width: '100%' as const }]} onLayout={handleContainerLayout}>
        {isLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>{t('today.loading')}</Text>
          </View>
        ) : currentProfile && hasMore ? (
          <>
            <View>
              <ProfileCard
                profile={currentProfile}
                photos={candidatePhotos}
                cardWidth={cardWidth}
                maxHeight={availableCardHeight > 0 ? availableCardHeight : undefined}
              />
              <TouchableOpacity
                style={styles.reportButton}
                onPress={() => setReportModalVisible(true)}
                activeOpacity={0.7}
              >
                <Ionicons name="flag-outline" size={18} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
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
          </>
        ) : (
          <View style={styles.centered}>
            <Ionicons name="heart" size={64} color={Colors.primaryLight} />
            <Text style={styles.emptyText}>{t('today.empty')}</Text>
          </View>
        )}
      </View>

      <MatchOverlay
        visible={matchResult?.matched === true}
        onChat={handleChat}
        onKeepExploring={handleKeepExploring}
      />

      {currentProfile && (
        <ReportModal
          visible={reportModalVisible}
          targetUserName={currentProfile.name ?? ''}
          onReport={handleReport}
          onBlockOnly={handleBlockOnly}
          onClose={() => setReportModalVisible(false)}
          loading={reportLoading}
        />
      )}

      <Toast visible={toast.visible} message={toast.message} variant={toast.variant} onDismiss={toast.dismiss} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: 28,
    fontFamily: Fonts.heading,
    color: Colors.text,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  cardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
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
  emptyText: {
    fontSize: 16,
    fontFamily: Fonts.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
    paddingTop: 20,
    paddingBottom: 8,
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
  reportButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
});
