import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import { useChat } from '@/hooks/useChat';
import { ChatBubble } from '@/components/ChatBubble';
import { ChatInput } from '@/components/ChatInput';
import { TypingIndicator } from '@/components/TypingIndicator';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';
import { subscribeToPresence, getPresence, type UserPresence } from '@/lib/presence';
import { useResponsive } from '@/hooks/useResponsive';
import type { Message } from '@/stores/chatStore';

type ChatItem =
  | { type: 'match-separator'; id: string; label: string }
  | { type: 'date-separator'; id: string; label: string }
  | { type: 'message'; id: string; data: Message };

function formatLastSeen(isoDate: string, t: (key: string) => string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);

  if (diffMins < 1) return t('chat.lastSeenNow');
  if (diffMins < 60) return t('chat.lastSeenMinutes').replace('{{n}}', String(diffMins));
  if (diffHours < 24) return t('chat.lastSeenHours').replace('{{n}}', String(diffHours));
  return t('chat.lastSeenLong');
}

function formatDateSeparator(isoDate: string, t: (key: string) => string): string {
  const date = new Date(isoDate);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return t('chat.today');
  if (date.toDateString() === yesterday.toDateString()) return t('chat.yesterday');
  return date.toLocaleDateString([], { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatMatchDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString([], { day: 'numeric', month: 'long' });
}

export default function ChatScreen() {
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const { messages, isLoading, sendMessage, markAsRead } = useChat(matchId!);
  const { isTablet, chatMaxWidth } = useResponsive();
  const flatListRef = useRef<FlatList>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [otherUserId, setOtherUserId] = useState<string | null>(null);
  const [otherUserName, setOtherUserName] = useState<string>('');
  const [otherUserAvatar, setOtherUserAvatar] = useState<string | null>(null);
  const [matchCreatedAt, setMatchCreatedAt] = useState<string | null>(null);
  const [otherPresence, setOtherPresence] = useState<UserPresence | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id ?? null);
    };
    loadUser();
  }, []);

  useEffect(() => {
    const loadMatchInfo = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !matchId) return;

      const { data: match } = await supabase
        .from('matches')
        .select('user_a_id, user_b_id, created_at')
        .eq('id', matchId)
        .single();

      if (!match) return;

      setMatchCreatedAt(match.created_at);

      const otherId = match.user_a_id === user.id
        ? match.user_b_id
        : match.user_a_id;

      setOtherUserId(otherId);

      const { data: profile } = await supabase
        .from('profiles')
        .select('name, avatar_url')
        .eq('id', otherId)
        .single();

      setOtherUserName(profile?.name ?? '');
      setOtherUserAvatar(profile?.avatar_url ?? null);

      // Fetch initial presence
      const presence = await getPresence(otherId);
      if (presence) setOtherPresence(presence);
    };
    loadMatchInfo();
  }, [matchId]);

  // Subscribe to other user's presence
  useEffect(() => {
    if (!otherUserId) return;

    const channel = subscribeToPresence(otherUserId, (presence) => {
      setOtherPresence(presence);
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [otherUserId]);

  // Mark messages as read when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      markAsRead();
    }
  }, [messages.length, markAsRead]);

  // Scroll to bottom when keyboard appears
  useEffect(() => {
    const event = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const sub = Keyboard.addListener(event, () => {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });
    return () => sub.remove();
  }, []);

  const handleSend = useCallback(async (content: string, imageUrl?: string) => {
    await sendMessage(content, imageUrl);
  }, [sendMessage]);

  const isTyping = otherPresence?.typing_in_match === matchId;
  const isOnline = otherPresence?.is_online ?? false;

  // Build subtitle text
  let subtitleText = '';
  if (isOnline) {
    subtitleText = t('chat.online');
  } else if (otherPresence?.last_seen) {
    subtitleText = formatLastSeen(otherPresence.last_seen, t);
  }

  // Match date for header
  const matchDateText = matchCreatedAt
    ? t('chat.matchedOn').replace('{{date}}', formatMatchDate(matchCreatedAt))
    : '';

  // Build chat items with date separators
  const chatItems: ChatItem[] = useMemo(() => {
    const items: ChatItem[] = [];

    // Match separator at the top
    if (matchCreatedAt) {
      items.push({
        type: 'match-separator',
        id: 'match-date',
        label: t('chat.matchedOn').replace('{{date}}', formatMatchDate(matchCreatedAt)),
      });
    }

    let lastDateStr = '';
    for (const msg of messages) {
      const msgDateStr = new Date(msg.created_at).toDateString();
      if (msgDateStr !== lastDateStr) {
        items.push({
          type: 'date-separator',
          id: `date-${msgDateStr}`,
          label: formatDateSeparator(msg.created_at, t),
        });
        lastDateStr = msgDateStr;
      }
      items.push({ type: 'message', id: msg.id, data: msg });
    }

    return items;
  }, [messages, matchCreatedAt, t]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        {otherUserAvatar ? (
          <Image
            source={{ uri: otherUserAvatar }}
            style={styles.headerAvatar}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View style={[styles.headerAvatar, styles.headerAvatarPlaceholder]}>
            <Ionicons name="person" size={18} color={Colors.primaryLight} />
          </View>
        )}
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {otherUserName}
          </Text>
          {subtitleText ? (
            <View style={styles.statusRow}>
              {isOnline && <View style={styles.onlineDot} />}
              <Text style={styles.statusText}>{subtitleText}</Text>
            </View>
          ) : null}
          {matchDateText ? (
            <Text style={styles.matchDateHeader}>{matchDateText}</Text>
          ) : null}
        </View>
      </View>

      <KeyboardAvoidingView
        style={[styles.keyboardView, isTablet && { maxWidth: chatMaxWidth, alignSelf: 'center' as const, width: '100%' as const }]}
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {isLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={chatItems}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              if (item.type === 'match-separator') {
                return (
                  <View style={styles.matchSeparator}>
                    <Ionicons name="heart" size={14} color={Colors.primary} />
                    <Text style={styles.matchSeparatorText}>{item.label}</Text>
                  </View>
                );
              }
              if (item.type === 'date-separator') {
                return (
                  <View style={styles.dateSeparator}>
                    <View style={styles.dateSeparatorLine} />
                    <Text style={styles.dateSeparatorText}>{item.label}</Text>
                    <View style={styles.dateSeparatorLine} />
                  </View>
                );
              }
              return (
                <ChatBubble
                  content={item.data.content}
                  imageUrl={item.data.image_url}
                  isMine={item.data.sender_id === userId}
                  timestamp={item.data.created_at}
                  readAt={item.data.read_at}
                  showReadReceipt={true}
                />
              );
            }}
            ListFooterComponent={messages.length === 0 ? (
              <View style={styles.emptyFooter}>
                <Text style={styles.emptyText}>{t('chat.noMessages')}</Text>
              </View>
            ) : null}
            contentContainerStyle={[
              styles.messagesList,
              messages.length === 0 && styles.messagesListEmpty,
            ]}
            onContentSizeChange={() =>
              messages.length > 0 && flatListRef.current?.scrollToEnd({ animated: false })
            }
            onLayout={() =>
              messages.length > 0 && flatListRef.current?.scrollToEnd({ animated: false })
            }
          />
        )}

        {isTyping && <TypingIndicator />}

        <ChatInput onSend={handleSend} matchId={matchId!} />
      </KeyboardAvoidingView>
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
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    backgroundColor: Colors.surface,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  headerAvatarPlaceholder: {
    backgroundColor: Colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    marginLeft: 10,
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: Fonts.bodySemiBold,
    color: Colors.text,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 1,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: Colors.success,
  },
  statusText: {
    fontSize: 12,
    fontFamily: Fonts.body,
    color: Colors.textSecondary,
  },
  keyboardView: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 15,
    fontFamily: Fonts.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  emptyFooter: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 40,
  },
  messagesListEmpty: {
    flexGrow: 1,
  },
  matchDateHeader: {
    fontSize: 11,
    fontFamily: Fonts.body,
    color: Colors.textTertiary,
    marginTop: 1,
  },
  messagesList: {
    paddingVertical: 12,
  },
  matchSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  matchSeparatorText: {
    fontSize: 13,
    fontFamily: Fonts.bodyMedium,
    color: Colors.primary,
  },
  dateSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 12,
  },
  dateSeparatorLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.borderLight,
  },
  dateSeparatorText: {
    fontSize: 12,
    fontFamily: Fonts.bodyMedium,
    color: Colors.textTertiary,
  },
});
