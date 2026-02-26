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
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import { useChat } from '@/hooks/useChat';
import { ChatBubble } from '@/components/ChatBubble';
import { ChatInput } from '@/components/ChatInput';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';
import { useMatchStore } from '@/stores/matchStore';

export default function ChatScreen() {
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const { messages, isLoading, sendMessage, markAsRead } = useChat(matchId!);
  const flatListRef = useRef<FlatList>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [otherUserId, setOtherUserId] = useState<string | null>(null);
  const [otherUserName, setOtherUserName] = useState<string>('');
  const unmatchUser = useMatchStore((s) => s.unmatchUser);

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

  // Mark messages as read when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      markAsRead();
    }
  }, [messages.length, markAsRead]);

  const handleSend = async (content: string) => {
    await sendMessage(content);
  };

  const handleHeaderPress = () => {
    if (otherUserId) {
      router.push(`/match-profile?userId=${otherUserId}`);
    }
  };

  const handleMorePress = () => {
    Alert.alert(
      otherUserName,
      undefined,
      [
        {
          text: t('matches.viewProfile'),
          onPress: () => {
            if (otherUserId) {
              router.push(`/match-profile?userId=${otherUserId}`);
            }
          },
        },
        {
          text: t('matches.unmatch'),
          style: 'destructive',
          onPress: () => confirmUnmatch(),
        },
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
      ]
    );
  };

  const confirmUnmatch = () => {
    Alert.alert(
      t('matches.unmatchConfirmTitle'),
      t('matches.unmatchConfirmMessage', { name: otherUserName }),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('matches.unmatch'),
          style: 'destructive',
          onPress: async () => {
            try {
              await unmatchUser(matchId!);
              router.back();
            } catch (error) {
              console.error('Error unmatching:', error);
              Alert.alert(t('common.error'), t('common.error'));
            }
          },
        },
      ]
    );
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
        <TouchableOpacity
          style={styles.headerCenter}
          onPress={handleHeaderPress}
          activeOpacity={0.7}
        >
          <Text style={styles.headerTitle} numberOfLines={1}>
            {otherUserName}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleMorePress}
          style={styles.moreButton}
          activeOpacity={0.7}
        >
          <Ionicons name="ellipsis-vertical" size={20} color={Colors.text} />
        </TouchableOpacity>
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
                showReadReceipt={false} // TODO: true for premium users
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
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: Fonts.bodySemiBold,
    color: Colors.text,
    textAlign: 'center',
  },
  moreButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
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
