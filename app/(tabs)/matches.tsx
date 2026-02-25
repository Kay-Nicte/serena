import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import { Ionicons } from '@expo/vector-icons';
import { useMatches } from '@/hooks/useMatches';
import { useResponsive } from '@/hooks/useResponsive';
import { ReportModal, type ReportReason } from '@/components/ReportModal';
import { ActionSheet, type ActionSheetOption } from '@/components/ActionSheet';
import { Toast, useToast } from '@/components/Toast';
import { useBlockStore } from '@/stores/blockStore';
import { useMatchStore } from '@/stores/matchStore';
import type { Match } from '@/stores/matchStore';

const GRID_GAP = 12;

function MatchCard({ match, onPress, onLongPress, itemWidth }: { match: Match; onPress: () => void; onLongPress: () => void; itemWidth: number }) {
  return (
    <TouchableOpacity
      style={[styles.matchCard, { width: itemWidth }]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      {match.otherUser.avatar_url ? (
        <Image
          source={{ uri: match.otherUser.avatar_url }}
          style={styles.avatar}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <View style={[styles.avatar, styles.avatarPlaceholder]}>
          <Ionicons name="person" size={40} color={Colors.primaryLight} />
        </View>
      )}
      <Text style={styles.matchName} numberOfLines={1}>
        {match.otherUser.name ?? ''}
      </Text>
      {match.unreadCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{match.unreadCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function MatchesScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { matches, isLoading, refresh } = useMatches();
  const { width: screenWidth, matchColumns, isTablet, horizontalPadding } = useResponsive();

  const effectiveWidth = isTablet ? Math.min(screenWidth, 700) : screenWidth;
  const itemWidth = (effectiveWidth - horizontalPadding * 2 - GRID_GAP * (matchColumns - 1)) / matchColumns;

  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [actionSheetVisible, setActionSheetVisible] = useState(false);
  const toast = useToast();

  const handleMatchPress = (match: Match) => {
    router.push(`/(tabs)/chat/${match.id}`);
  };

  const handleMatchLongPress = (match: Match) => {
    setSelectedMatch(match);
    setActionSheetVisible(true);
  };

  const matchActionOptions: ActionSheetOption[] = selectedMatch
    ? [
        {
          label: t('report.report'),
          icon: 'flag-outline',
          onPress: () => setReportModalVisible(true),
        },
        {
          label: t('block.block'),
          icon: 'ban',
          destructive: true,
          onPress: () => {
            Alert.alert(
              t('block.confirmTitle'),
              t('block.confirmMessage', { name: selectedMatch.otherUser.name ?? '' }),
              [
                { text: t('common.cancel'), style: 'cancel' },
                {
                  text: t('block.block'),
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await useBlockStore.getState().blockUser(selectedMatch.otherUser.id);
                      await useMatchStore.getState().fetchMatches();
                    } catch {
                      toast.show(t('block.errorBlocking'), 'error');
                    }
                  },
                },
              ],
            );
          },
        },
      ]
    : [];

  const handleMatchReport = async (reason: ReportReason, description: string, alsoBlock: boolean) => {
    if (!selectedMatch) return;
    setReportLoading(true);
    try {
      await useBlockStore.getState().reportUser(selectedMatch.otherUser.id, reason, description);
      if (alsoBlock) {
        await useBlockStore.getState().blockUser(selectedMatch.otherUser.id);
        await useMatchStore.getState().fetchMatches();
      }
      setReportModalVisible(false);
      toast.show(t('report.successMessage'));
    } catch (err: any) {
      toast.show(t(err?.message === 'DUPLICATE_REPORT' ? 'report.alreadyReported' : 'report.errorSubmitting'), 'error');
    } finally {
      setReportLoading(false);
    }
  };

  const handleMatchBlockOnly = () => {
    if (!selectedMatch) return;
    setReportModalVisible(false);
    Alert.alert(
      t('block.confirmTitle'),
      t('block.confirmMessage', { name: selectedMatch.otherUser.name ?? '' }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('block.block'),
          style: 'destructive',
          onPress: async () => {
            try {
              await useBlockStore.getState().blockUser(selectedMatch.otherUser.id);
              await useMatchStore.getState().fetchMatches();
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
      <Text style={[styles.title, { paddingHorizontal: horizontalPadding }]}>{t('matches.title')}</Text>

      {isLoading && matches.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : matches.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="sparkles" size={64} color={Colors.primaryLight} />
          <Text style={styles.emptyText}>{t('matches.empty')}</Text>
        </View>
      ) : (
        <FlatList
          key={`matches-${matchColumns}`}
          data={matches}
          keyExtractor={(item) => item.id}
          numColumns={matchColumns}
          columnWrapperStyle={styles.row}
          contentContainerStyle={[
            styles.grid,
            { paddingHorizontal: horizontalPadding },
            isTablet && { maxWidth: 700, alignSelf: 'center' as const, width: '100%' as const },
          ]}
          renderItem={({ item }) => (
            <MatchCard match={item} onPress={() => handleMatchPress(item)} onLongPress={() => handleMatchLongPress(item)} itemWidth={itemWidth} />
          )}
          onRefresh={refresh}
          refreshing={isLoading}
        />
      )}

      <Toast visible={toast.visible} message={toast.message} variant={toast.variant} onDismiss={toast.dismiss} />

      <ActionSheet
        visible={actionSheetVisible}
        title={selectedMatch?.otherUser.name ?? ''}
        options={matchActionOptions}
        onClose={() => setActionSheetVisible(false)}
      />

      {selectedMatch && (
        <ReportModal
          visible={reportModalVisible}
          targetUserName={selectedMatch.otherUser.name ?? ''}
          onReport={handleMatchReport}
          onBlockOnly={handleMatchBlockOnly}
          onClose={() => setReportModalVisible(false)}
          loading={reportLoading}
        />
      )}
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
    paddingTop: 16,
    paddingBottom: 12,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: Fonts.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  grid: {
    paddingBottom: 24,
  },
  row: {
    gap: GRID_GAP,
    marginBottom: GRID_GAP,
  },
  matchCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: '100%',
    aspectRatio: 1,
  },
  avatarPlaceholder: {
    backgroundColor: Colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  matchName: {
    fontSize: 15,
    fontFamily: Fonts.bodySemiBold,
    color: Colors.text,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: Fonts.bodyBold,
    color: Colors.textOnPrimary,
  },
});
