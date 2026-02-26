import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
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
import { subscribeToPresence, getPresence } from '@/lib/presence';
import { usePremium } from '@/hooks/usePremium';
import type { TFunction } from 'i18next';

function formatLastSeen(lastSeen: string, t: TFunction): string {
  const diff = Date.now() - new Date(lastSeen).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);

  if (minutes < 2) return t('chat.lastSeenNow');
  if (minutes < 60) return t('chat.lastSeenMinutes', { n: minutes });
  if (hours < 24) return t('chat.lastSeenHours', { n: hours });
  return t('chat.lastSeenLong');
}

export default function ChatScreen() {
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const { isPremium } = usePremium();
  const { messages, isLoading, sendMessage, markAsRead } = useChat(matchId!);
  const flatListRef = useRef<FlatList>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [otherUserName, setOtherUserName] = useState<string>('');
  const [otherUserId, setOtherUserId] = useState<string | null>(null);
  const [otherPresence, setOtherPresence] = useState<{
    is_online: boolean;
    last_seen: string;
    typing_in_match: string | null;
  } | null>(null);

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
        .select('user_a_id, user_b_id')
        .eq('id', matchId)
        .single();

      if (!match) return;

      const otherId = match.user_a_id === user.id
        ? match.user_b_id
        : match.user_a_id;

      setOtherUserId(otherId);

      const { data: profile } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', otherId)
        .single();

      setOtherUserName(profile?.name ?? '');
    };
    loadMatchInfo();
  }, [matchId]);

  // Subscribe to other user's presence
  useEffect(() => {
    if (!otherUserId) return;
    getPresence(otherUserId).then(setOtherPresence);
    const channel = subscribeToPresence(otherUserId, setOtherPresence);
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

  const handleSend = async (content: string) => {
    await sendMessage(content);
  };

  const renderPresenceSubtitle = () => {
    if (!otherPresence) return null;

    if (otherPresence.is_online) {
      return (
        <View style={styles.presenceRow}>
          <View style={styles.onlineDot} />
          <Text style={styles.presenceText}>{t('chat.online')}</Text>
        </View>
      );
    }

    if (otherPresence.last_seen) {
      return (
        <Text style={styles.presenceText}>
          {formatLastSeen(otherPresence.last_seen, t)}
        </Text>
      );
    }

    return null;
  };

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
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {otherUserName}
          </Text>
          {renderPresenceSubtitle()}
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {isLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : messages.length === 0 ? (
          <View style={styles.centered}>
            <Text style={styles.emptyText}>{t('chat.noMessages')}</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ChatBubble
                content={item.content}
                isMine={item.sender_id === userId}
                timestamp={item.created_at}
                readAt={item.read_at}
                showReadReceipt={isPremium}
              />
            )}
            contentContainerStyle={styles.messagesList}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: false })
            }
            onLayout={() =>
              flatListRef.current?.scrollToEnd({ animated: false })
            }
          />
        )}

        {otherPresence?.typing_in_match === matchId && <TypingIndicator />}

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
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: Fonts.bodySemiBold,
    color: Colors.text,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  presenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.success,
  },
  presenceText: {
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
  messagesList: {
    paddingVertical: 12,
  },
});
