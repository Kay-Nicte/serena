import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
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
import { useBlockStore } from '@/stores/blockStore';
import { supabase } from '@/lib/supabase';
import type { Match } from '@/stores/matchStore';
import type { UserPresence } from '@/lib/presence';

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

function ConversationItem({ match, onPress, isOnline }: { match: Match; onPress: () => void; isOnline: boolean }) {
  const { t } = useTranslation();
  const timeStr = match.lastMessageAt
    ? formatRelativeTime(match.lastMessageAt)
    : formatRelativeTime(match.created_at);

  const previewText = match.lastMessage
    ? match.lastMessage
    : match.lastMessageImageUrl
      ? t('chat.photoMessage')
      : '';

  return (
    <TouchableOpacity
      style={styles.conversationItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        {match.otherUser.avatar_url ? (
          <Image
            source={{ uri: match.otherUser.avatar_url }}
            style={styles.avatar}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Ionicons name="person" size={24} color={Colors.primaryLight} />
          </View>
        )}
        {isOnline && <View style={styles.onlineDot} />}
      </View>

      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text
            style={[
              styles.conversationName,
              match.unreadCount > 0 && styles.conversationNameUnread,
            ]}
            numberOfLines={1}
          >
            {match.otherUser.name ?? ''}
          </Text>
          <Text style={styles.conversationTime}>{timeStr}</Text>
        </View>
        <View style={styles.conversationFooter}>
          <Text
            style={[
              styles.conversationMessage,
              match.unreadCount > 0 && styles.conversationMessageUnread,
            ]}
            numberOfLines={1}
          >
            {previewText}
          </Text>
          {match.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{match.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function ChatListScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { matches, isLoading, refresh } = useMatches();
  const { isTablet, chatMaxWidth } = useResponsive();
  const blockedIds = useBlockStore((s) => s.blockedIds);
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());
  const [blockedByIds, setBlockedByIds] = useState<Set<string>>(new Set());

  // Fetch who blocked me (reverse direction — RLS doesn't allow seeing this)
  useEffect(() => {
    supabase.rpc('get_users_who_blocked_me').then(({ data }) => {
      if (data) setBlockedByIds(new Set(data as string[]));
    });
  }, []);

  // Fetch online status for all matched users
  useEffect(() => {
    if (matches.length === 0) return;

    const userIds = matches.map((m) => m.otherUser.id).filter(Boolean);
    if (userIds.length === 0) return;

    const fetchPresence = async () => {
      const { data } = await supabase
        .from('user_presence')
        .select('user_id, is_online')
        .in('user_id', userIds)
        .eq('is_online', true);

      if (data) {
        setOnlineUserIds(new Set(data.map((p: { user_id: string }) => p.user_id)));
      }
    };

    fetchPresence();

    // Subscribe to presence changes
    const channel = supabase
      .channel('chat-list-presence')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_presence',
        },
        (payload) => {
          const updated = payload.new as UserPresence;
          setOnlineUserIds((prev) => {
            const next = new Set(prev);
            if (updated.is_online) {
              next.add(updated.user_id);
            } else {
              next.delete(updated.user_id);
            }
            return next;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matches]);

  const conversations = matches;

  const handleConversationPress = (match: Match) => {
    router.push(`/(tabs)/chat/${match.id}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{t('chat.title')}</Text>

      {isLoading && conversations.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
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
              onPress={() => handleConversationPress(item)}
              isOnline={
                onlineUserIds.has(item.otherUser.id) &&
                !blockedIds.has(item.otherUser.id) &&
                !blockedByIds.has(item.otherUser.id)
              }
            />
          )}
          onRefresh={refresh}
          refreshing={isLoading}
          style={isTablet ? { maxWidth: chatMaxWidth, alignSelf: 'center', width: '100%' } : undefined}
          contentContainerStyle={styles.list}
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
    paddingHorizontal: 24,
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
  list: {
    paddingBottom: 24,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 14,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  avatarPlaceholder: {
    backgroundColor: Colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.success,
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  conversationContent: {
    flex: 1,
    gap: 4,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  conversationName: {
    fontSize: 16,
    fontFamily: Fonts.bodyMedium,
    color: Colors.text,
    flex: 1,
  },
  conversationNameUnread: {
    fontFamily: Fonts.bodyBold,
  },
  conversationTime: {
    fontSize: 12,
    fontFamily: Fonts.body,
    color: Colors.textTertiary,
    marginLeft: 8,
  },
  conversationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  conversationMessage: {
    fontSize: 14,
    fontFamily: Fonts.body,
    color: Colors.textSecondary,
    flex: 1,
  },
  conversationMessageUnread: {
    color: Colors.text,
    fontFamily: Fonts.bodyMedium,
  },
  unreadBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
    marginLeft: 8,
  },
  unreadBadgeText: {
    fontSize: 11,
    fontFamily: Fonts.bodyBold,
    color: Colors.textOnPrimary,
  },
});
