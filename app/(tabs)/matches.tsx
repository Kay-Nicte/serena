import { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
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
import { useIceBreakerStore } from '@/stores/iceBreakerStore';
import type { Match } from '@/stores/matchStore';
import type { IceBreaker } from '@/stores/iceBreakerStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_GAP = 12;
const GRID_PADDING = 24;
const ITEM_WIDTH = (SCREEN_WIDTH - GRID_PADDING * 2 - GRID_GAP) / 2;

function MatchCard({ match, onPress }: { match: Match; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={styles.matchCard}
      onPress={onPress}
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

function IceBreakerCard({
  iceBreaker,
  onAccept,
  onDecline,
}: {
  iceBreaker: IceBreaker;
  onAccept: () => void;
  onDecline: () => void;
}) {
  return (
    <View style={styles.ibCard}>
      {iceBreaker.sender.avatar_url ? (
        <Image
          source={{ uri: iceBreaker.sender.avatar_url }}
          style={styles.ibAvatar}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <View style={[styles.ibAvatar, styles.ibAvatarPlaceholder]}>
          <Ionicons name="person" size={24} color={Colors.primaryLight} />
        </View>
      )}
      <Text style={styles.ibName} numberOfLines={1}>
        {iceBreaker.sender.name ?? ''}
      </Text>
      <Text style={styles.ibMessage} numberOfLines={2}>
        {iceBreaker.message}
      </Text>
      <View style={styles.ibActions}>
        <TouchableOpacity
          style={[styles.ibActionButton, styles.ibDeclineButton]}
          onPress={onDecline}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={18} color={Colors.error} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.ibActionButton, styles.ibAcceptButton]}
          onPress={onAccept}
          activeOpacity={0.7}
        >
          <Ionicons name="checkmark" size={18} color={Colors.textOnPrimary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function MatchesScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { matches, isLoading, refresh } = useMatches();
  const {
    pendingIceBreakers,
    isLoading: ibLoading,
    fetchPending,
    respondToIceBreaker,
  } = useIceBreakerStore();

  useEffect(() => {
    fetchPending();
  }, []);

  const handleMatchPress = (match: Match) => {
    router.push(`/(tabs)/chat/${match.id}`);
  };

  const handleAcceptIceBreaker = useCallback(
    async (iceBreaker: IceBreaker) => {
      const result = await respondToIceBreaker(iceBreaker.id, true);
      if (result.matchId) {
        refresh();
        router.push(`/(tabs)/chat/${result.matchId}`);
      }
    },
    [respondToIceBreaker, refresh, router]
  );

  const handleDeclineIceBreaker = useCallback(
    (iceBreaker: IceBreaker) => {
      Alert.alert(
        t('iceBreaker.decline'),
        '',
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('iceBreaker.decline'),
            style: 'destructive',
            onPress: () => respondToIceBreaker(iceBreaker.id, false),
          },
        ]
      );
    },
    [respondToIceBreaker, t]
  );

  const handleRefresh = useCallback(() => {
    refresh();
    fetchPending();
  }, [refresh, fetchPending]);

  const renderIceBreakersHeader = useCallback(() => {
    if (pendingIceBreakers.length === 0) return null;

    return (
      <View style={styles.ibSection}>
        <Text style={styles.ibSectionTitle}>{t('iceBreaker.title')}</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.ibScrollContent}
        >
          {pendingIceBreakers.map((ib) => (
            <IceBreakerCard
              key={ib.id}
              iceBreaker={ib}
              onAccept={() => handleAcceptIceBreaker(ib)}
              onDecline={() => handleDeclineIceBreaker(ib)}
            />
          ))}
        </ScrollView>
      </View>
    );
  }, [pendingIceBreakers, t, handleAcceptIceBreaker, handleDeclineIceBreaker]);

  const hasContent = matches.length > 0 || pendingIceBreakers.length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{t('matches.title')}</Text>

      {isLoading && ibLoading && !hasContent ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : !hasContent ? (
        <View style={styles.centered}>
          <Ionicons name="sparkles" size={64} color={Colors.primaryLight} />
          <Text style={styles.emptyText}>{t('matches.empty')}</Text>
        </View>
      ) : (
        <FlatList
          data={matches}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.grid}
          ListHeaderComponent={renderIceBreakersHeader}
          renderItem={({ item }) => (
            <MatchCard match={item} onPress={() => handleMatchPress(item)} />
          )}
          onRefresh={handleRefresh}
          refreshing={isLoading}
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
    paddingHorizontal: GRID_PADDING,
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
    paddingHorizontal: GRID_PADDING,
    paddingBottom: 24,
  },
  row: {
    gap: GRID_GAP,
    marginBottom: GRID_GAP,
  },
  matchCard: {
    width: ITEM_WIDTH,
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
  // Ice Breaker styles
  ibSection: {
    marginBottom: 16,
    marginHorizontal: -GRID_PADDING,
  },
  ibSectionTitle: {
    fontSize: 18,
    fontFamily: Fonts.heading,
    color: Colors.text,
    paddingHorizontal: GRID_PADDING,
    marginBottom: 12,
  },
  ibScrollContent: {
    paddingHorizontal: GRID_PADDING,
    gap: 12,
  },
  ibCard: {
    width: 160,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  ibAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignSelf: 'center',
    marginBottom: 8,
  },
  ibAvatarPlaceholder: {
    backgroundColor: Colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ibName: {
    fontSize: 14,
    fontFamily: Fonts.bodySemiBold,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  ibMessage: {
    fontSize: 13,
    fontFamily: Fonts.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 10,
    minHeight: 36,
  },
  ibActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  ibActionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ibDeclineButton: {
    backgroundColor: Colors.surfaceSecondary,
  },
  ibAcceptButton: {
    backgroundColor: Colors.primary,
  },
});
