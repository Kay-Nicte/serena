import { useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ResponsiveContainer } from '@/components/ResponsiveContainer';
import { useResponsive } from '@/hooks/useResponsive';
import { useColors } from '@/hooks/useColors';
import { Fonts } from '@/constants/fonts';
import { Ionicons } from '@expo/vector-icons';
import { useMatches } from '@/hooks/useMatches';
import { useIceBreakerStore } from '@/stores/iceBreakerStore';
import { useMatchStore } from '@/stores/matchStore';
import { useBlockStore } from '@/stores/blockStore';
import { supabase } from '@/lib/supabase';
import { ActionSheet, type ActionSheetOption } from '@/components/ActionSheet';
import { SegmentedControl } from '@/components/SegmentedControl';
import { ProfileAvatarButton } from '@/components/ProfileAvatarButton';
import type { Match } from '@/stores/matchStore';
import type { IceBreaker } from '@/stores/iceBreakerStore';
import type { UserPresence } from '@/lib/presence';

const GRID_GAP = 12;
const GRID_PADDING = 16;

function formatMatchDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString([], { day: 'numeric', month: 'long' });
}

function formatRelativeTime(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'now';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

// ─── Match Card (grid view) ─────────────────────────────────────────────────

function MatchCard({ match, onPress, onLongPress, onToggleFavorite, deletedLabel, styles, Colors }: { match: Match; onPress: () => void; onLongPress: () => void; onToggleFavorite: () => void; deletedLabel: string; styles: any; Colors: ReturnType<typeof useColors> }) {
  return (
    <TouchableOpacity style={styles.matchCard} onPress={onPress} onLongPress={onLongPress} activeOpacity={0.7}>
      {match.otherUser.avatar_url ? (
        <Image source={{ uri: match.otherUser.avatar_url }} style={styles.matchAvatar} contentFit="cover" transition={200} />
      ) : (
        <View style={[styles.matchAvatar, styles.matchAvatarPlaceholder]}>
          <Ionicons name="person" size={40} color={Colors.primaryLight} />
        </View>
      )}
      <View style={styles.matchInfo}>
        <View style={styles.matchNameRow}>
          <Text style={[styles.matchName, !match.otherUser.name && styles.matchNameDeleted]} numberOfLines={1}>
            {match.otherUser.name ?? deletedLabel}
          </Text>
          {match.otherUser.is_verified && <Ionicons name="shield-checkmark" size={14} color={Colors.primary} />}
        </View>
        <Text style={styles.matchDate} numberOfLines={1}>
          <Ionicons name="heart" size={11} color={Colors.primary} /> {formatMatchDate(match.created_at)}
        </Text>
      </View>
      <TouchableOpacity style={styles.matchFavoriteButton} onPress={onToggleFavorite} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Ionicons name={match.isFavorite ? 'heart' : 'heart-outline'} size={20} color={match.isFavorite ? Colors.primary : Colors.textTertiary} />
      </TouchableOpacity>
      {match.unreadCount > 0 && (
        <View style={styles.matchBadge}><Text style={styles.matchBadgeText}>{match.unreadCount}</Text></View>
      )}
    </TouchableOpacity>
  );
}

// ─── Ice Breaker Card ────────────────────────────────────────────────────────

function IceBreakerCard({ iceBreaker, onAccept, onDecline, onViewProfile, styles, Colors }: { iceBreaker: IceBreaker; onAccept: () => void; onDecline: () => void; onViewProfile: () => void; styles: any; Colors: ReturnType<typeof useColors> }) {
  return (
    <View style={styles.ibCard}>
      <TouchableOpacity onPress={onViewProfile} activeOpacity={0.7}>
        {iceBreaker.sender.avatar_url ? (
          <Image source={{ uri: iceBreaker.sender.avatar_url }} style={styles.ibAvatar} contentFit="cover" transition={200} />
        ) : (
          <View style={[styles.ibAvatar, styles.ibAvatarPlaceholder]}>
            <Ionicons name="person" size={24} color={Colors.primaryLight} />
          </View>
        )}
        <Text style={styles.ibName} numberOfLines={1}>{iceBreaker.sender.name ?? ''}</Text>
      </TouchableOpacity>
      <Text style={styles.ibMessage} numberOfLines={2}>{iceBreaker.message}</Text>
      <View style={styles.ibActions}>
        <TouchableOpacity style={[styles.ibActionButton, styles.ibDeclineButton]} onPress={onDecline} activeOpacity={0.7}>
          <Ionicons name="close" size={18} color={Colors.error} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.ibActionButton, styles.ibAcceptButton]} onPress={onAccept} activeOpacity={0.7}>
          <Ionicons name="checkmark" size={18} color={Colors.textOnPrimary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Conversation Item (chat list) ──────────────────────────────────────────

function ConversationItem({ match, onPress, onToggleFavorite, isOnline, styles, Colors }: { match: Match; onPress: () => void; onToggleFavorite: () => void; isOnline: boolean; styles: any; Colors: ReturnType<typeof useColors> }) {
  const { t } = useTranslation();
  const timeStr = match.lastMessageAt ? formatRelativeTime(match.lastMessageAt) : formatRelativeTime(match.created_at);
  const previewText = match.lastMessage
    ? match.lastMessage
    : match.lastMessageAudioUrl
      ? t('chat.audioMessage')
      : match.lastMessageImageUrl
        ? match.lastMessageImageUrl.includes('giphy.com') ? t('chat.gifMessage') : t('chat.photoMessage')
        : '';

  return (
    <TouchableOpacity style={styles.convItem} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.convAvatarContainer}>
        {match.otherUser.avatar_url ? (
          <Image source={{ uri: match.otherUser.avatar_url }} style={styles.convAvatar} contentFit="cover" transition={200} />
        ) : (
          <View style={[styles.convAvatar, styles.convAvatarPlaceholder]}>
            <Ionicons name="person" size={24} color={Colors.primaryLight} />
          </View>
        )}
        {isOnline && <View style={styles.onlineDot} />}
      </View>
      <View style={styles.convContent}>
        <View style={styles.convHeader}>
          <Text style={[styles.convName, match.unreadCount > 0 && styles.convNameUnread]} numberOfLines={1}>
            {match.otherUser.name ?? ''}
          </Text>
          <TouchableOpacity onPress={onToggleFavorite} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={styles.convFavoriteButton}>
            <Ionicons name={match.isFavorite ? 'heart' : 'heart-outline'} size={16} color={match.isFavorite ? Colors.primary : Colors.textTertiary} />
          </TouchableOpacity>
          <Text style={styles.convTime}>{timeStr}</Text>
        </View>
        <View style={styles.convFooter}>
          <Text style={[styles.convMessage, match.unreadCount > 0 && styles.convMessageUnread]} numberOfLines={1}>
            {previewText}
          </Text>
          {match.unreadCount > 0 && (
            <View style={styles.unreadBadge}><Text style={styles.unreadBadgeText}>{match.unreadCount}</Text></View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function ConexionesScreen() {
  const { t } = useTranslation();
  const Colors = useColors();
  const { width } = useWindowDimensions();
  const { matchColumns: numColumns, isTablet, chatMaxWidth } = useResponsive();
  const itemWidth = (width - GRID_PADDING * 2 - GRID_GAP * (numColumns - 1)) / numColumns;
  const styles = makeStyles(Colors, itemWidth);
  const router = useRouter();

  const [segment, setSegment] = useState(0);
  const { matches, isLoading, refresh } = useMatches();
  const { pendingIceBreakers, isLoading: ibLoading, fetchPending, respondToIceBreaker } = useIceBreakerStore();
  const blockedIds = useBlockStore((s) => s.blockedIds);
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());
  const [blockedByIds, setBlockedByIds] = useState<Set<string>>(new Set());
  const [actionSheetMatch, setActionSheetMatch] = useState<Match | null>(null);

  useEffect(() => { fetchPending(); }, []);

  // Presence for chat
  useEffect(() => {
    supabase.rpc('get_users_who_blocked_me').then(({ data }) => {
      if (data) setBlockedByIds(new Set(data as string[]));
    });
  }, []);

  useEffect(() => {
    if (matches.length === 0) return;
    const userIds = matches.map((m) => m.otherUser.id).filter(Boolean);
    if (userIds.length === 0) return;

    const fetchPresence = async () => {
      const { data } = await supabase.from('user_presence').select('user_id, is_online').in('user_id', userIds).eq('is_online', true);
      if (data) setOnlineUserIds(new Set(data.map((p: { user_id: string }) => p.user_id)));
    };
    fetchPresence();

    const channel = supabase.channel('conexiones-presence')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_presence' }, (payload) => {
        const updated = payload.new as UserPresence;
        setOnlineUserIds((prev) => {
          const next = new Set(prev);
          if (updated.is_online) next.add(updated.user_id); else next.delete(updated.user_id);
          return next;
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [matches]);

  const handleMatchPress = (match: Match) => {
    router.push(`/(tabs)/conexiones/${match.id}`);
  };

  const handleLongPress = useCallback((match: Match) => { setActionSheetMatch(match); }, []);

  const actionSheetOptions: ActionSheetOption[] = actionSheetMatch ? [{
    label: t('matches.unmatch'), icon: 'heart-dislike-outline', destructive: true,
    onPress: async () => { await useMatchStore.getState().unmatchUser(actionSheetMatch.id); refresh(); },
  }] : [];

  const handleAcceptIceBreaker = useCallback(async (iceBreaker: IceBreaker) => {
    const result = await respondToIceBreaker(iceBreaker.id, true);
    if (result.matchId) { refresh(); router.push(`/(tabs)/conexiones/${result.matchId}`); }
  }, [respondToIceBreaker, refresh, router]);

  const handleDeclineIceBreaker = useCallback((iceBreaker: IceBreaker) => {
    Alert.alert(t('iceBreaker.decline'), '', [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('iceBreaker.decline'), style: 'destructive', onPress: () => respondToIceBreaker(iceBreaker.id, false) },
    ]);
  }, [respondToIceBreaker, t]);

  const handleRefresh = useCallback(() => { refresh(); fetchPending(); }, [refresh, fetchPending]);

  const renderIceBreakersHeader = useCallback(() => {
    if (pendingIceBreakers.length === 0) return null;
    return (
      <View style={styles.ibSection}>
        <Text style={styles.ibSectionTitle}>{t('iceBreaker.title')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.ibScrollContent}>
          {pendingIceBreakers.map((ib) => (
            <IceBreakerCard key={ib.id} iceBreaker={ib} onAccept={() => handleAcceptIceBreaker(ib)} onDecline={() => handleDeclineIceBreaker(ib)} onViewProfile={() => router.push({ pathname: '/match-profile', params: { userId: ib.sender.id } })} styles={styles} Colors={Colors} />
          ))}
        </ScrollView>
      </View>
    );
  }, [pendingIceBreakers, t, handleAcceptIceBreaker, handleDeclineIceBreaker, styles, Colors]);

  const hasMatchContent = matches.length > 0 || pendingIceBreakers.length > 0;
  const conversations = matches;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ResponsiveContainer>
        <View style={styles.header}>
          <Text style={styles.title}>{t('tabs.conexiones')}</Text>
          <ProfileAvatarButton />
        </View>

        <SegmentedControl
          segments={[t('tabs.matches'), t('tabs.chat')]}
          selectedIndex={segment}
          onSelect={setSegment}
        />

        {segment === 0 ? (
          /* ── Matches ── */
          isLoading && ibLoading && !hasMatchContent ? (
            <View style={styles.centered}><ActivityIndicator size="large" color={Colors.primary} /></View>
          ) : !hasMatchContent ? (
            <View style={styles.centered}>
              <Ionicons name="sparkles" size={64} color={Colors.primaryLight} />
              <Text style={styles.emptyText}>{t('matches.empty')}</Text>
            </View>
          ) : (
            <FlatList
              key={`matches-${numColumns}`}
              data={matches}
              keyExtractor={(item) => item.id}
              numColumns={numColumns}
              columnWrapperStyle={styles.matchRow}
              contentContainerStyle={styles.matchGrid}
              ListHeaderComponent={renderIceBreakersHeader}
              renderItem={({ item }) => (
                <MatchCard match={item} onPress={() => handleMatchPress(item)} onLongPress={() => handleLongPress(item)} onToggleFavorite={() => useMatchStore.getState().toggleFavorite(item.id)} deletedLabel={t('matches.deletedUser')} styles={styles} Colors={Colors} />
              )}
              onRefresh={handleRefresh}
              refreshing={isLoading}
            />
          )
        ) : (
          /* ── Chat ── */
          isLoading && conversations.length === 0 ? (
            <View style={styles.centered}><ActivityIndicator size="large" color={Colors.primary} /></View>
          ) : conversations.length === 0 ? (
            <View style={styles.centered}>
              <Ionicons name="chatbubbles" size={64} color={Colors.primaryLight} />
              <Text style={styles.emptyText}>{t('chat.noMessages')}</Text>
            </View>
          ) : (
            <FlatList
              data={conversations}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <ConversationItem
                  match={item}
                  onPress={() => handleMatchPress(item)}
                  onToggleFavorite={() => useMatchStore.getState().toggleFavorite(item.id)}
                  isOnline={onlineUserIds.has(item.otherUser.id) && !blockedIds.has(item.otherUser.id) && !blockedByIds.has(item.otherUser.id)}
                  styles={styles}
                  Colors={Colors}
                />
              )}
              onRefresh={refresh}
              refreshing={isLoading}
              style={isTablet ? { maxWidth: chatMaxWidth, alignSelf: 'center', width: '100%' } : undefined}
              contentContainerStyle={styles.chatList}
            />
          )
        )}

        <ActionSheet
          visible={!!actionSheetMatch}
          title={actionSheetMatch ? t('matches.unmatchConfirmMessage', { name: actionSheetMatch.otherUser.name }) : ''}
          options={actionSheetOptions}
          onClose={() => setActionSheetMatch(null)}
        />
      </ResponsiveContainer>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

function makeStyles(c: ReturnType<typeof useColors>, itemWidth: number = 150) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 12 },
    title: { fontSize: 28, fontFamily: Fonts.heading, color: c.text },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16, paddingHorizontal: 40 },
    emptyText: { fontSize: 16, fontFamily: Fonts.body, color: c.textSecondary, textAlign: 'center', lineHeight: 24 },

    // Match grid
    matchGrid: { paddingHorizontal: GRID_PADDING, paddingBottom: 24 },
    matchRow: { gap: GRID_GAP, marginBottom: GRID_GAP },
    matchCard: { width: itemWidth, backgroundColor: c.surface, borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
    matchAvatar: { width: '100%', aspectRatio: 1 },
    matchAvatarPlaceholder: { backgroundColor: c.surfaceSecondary, justifyContent: 'center', alignItems: 'center' },
    matchInfo: { paddingHorizontal: 12, paddingVertical: 10 },
    matchNameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    matchName: { fontSize: 15, fontFamily: Fonts.bodySemiBold, color: c.text, flexShrink: 1 },
    matchNameDeleted: { color: c.textTertiary, fontStyle: 'italic' },
    matchDate: { fontSize: 12, fontFamily: Fonts.body, color: c.textSecondary, marginTop: 2 },
    matchFavoriteButton: { position: 'absolute', top: 8, left: 8, backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: 14, width: 28, height: 28, justifyContent: 'center', alignItems: 'center' },
    matchBadge: { position: 'absolute', top: 8, right: 8, backgroundColor: c.primary, borderRadius: 12, minWidth: 24, height: 24, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 6 },
    matchBadgeText: { fontSize: 12, fontFamily: Fonts.bodyBold, color: c.textOnPrimary },

    // Ice Breakers
    ibSection: { marginBottom: 16, marginHorizontal: -GRID_PADDING },
    ibSectionTitle: { fontSize: 18, fontFamily: Fonts.heading, color: c.text, paddingHorizontal: GRID_PADDING, marginBottom: 12 },
    ibScrollContent: { paddingHorizontal: GRID_PADDING, gap: 12 },
    ibCard: { width: 160, backgroundColor: c.surface, borderRadius: 16, padding: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
    ibAvatar: { width: 48, height: 48, borderRadius: 24, alignSelf: 'center', marginBottom: 8 },
    ibAvatarPlaceholder: { backgroundColor: c.surfaceSecondary, justifyContent: 'center', alignItems: 'center' },
    ibName: { fontSize: 14, fontFamily: Fonts.bodySemiBold, color: c.text, textAlign: 'center', marginBottom: 4 },
    ibMessage: { fontSize: 13, fontFamily: Fonts.body, color: c.textSecondary, textAlign: 'center', lineHeight: 18, marginBottom: 10, minHeight: 36 },
    ibActions: { flexDirection: 'row', justifyContent: 'center', gap: 12 },
    ibActionButton: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
    ibDeclineButton: { backgroundColor: c.surfaceSecondary },
    ibAcceptButton: { backgroundColor: c.primary },

    // Chat list
    chatList: { paddingBottom: 24 },
    convItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 12, gap: 14 },
    convAvatarContainer: { position: 'relative' },
    convAvatar: { width: 54, height: 54, borderRadius: 27 },
    convAvatarPlaceholder: { backgroundColor: c.surfaceSecondary, justifyContent: 'center', alignItems: 'center' },
    onlineDot: { position: 'absolute', bottom: 1, right: 1, width: 14, height: 14, borderRadius: 7, backgroundColor: c.success, borderWidth: 2, borderColor: c.surface },
    convContent: { flex: 1, gap: 4 },
    convHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    convName: { fontSize: 16, fontFamily: Fonts.bodyMedium, color: c.text, flex: 1 },
    convNameUnread: { fontFamily: Fonts.bodyBold },
    convFavoriteButton: { marginLeft: 6 },
    convTime: { fontSize: 12, fontFamily: Fonts.body, color: c.textTertiary, marginLeft: 6 },
    convFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    convMessage: { fontSize: 14, fontFamily: Fonts.body, color: c.textSecondary, flex: 1 },
    convMessageUnread: { color: c.text, fontFamily: Fonts.bodyMedium },
    unreadBadge: { backgroundColor: c.primary, borderRadius: 10, minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 5, marginLeft: 8 },
    unreadBadgeText: { fontSize: 11, fontFamily: Fonts.bodyBold, color: c.textOnPrimary },
  });
}
