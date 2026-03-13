import { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ResponsiveContainer } from '@/components/ResponsiveContainer';
import { useColors } from '@/hooks/useColors';
import { Fonts } from '@/constants/fonts';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { useGroupsStore, type GroupMember } from '@/stores/groupsStore';
import { useGroupChatStore, type GroupMessage } from '@/stores/groupChatStore';
import { useAuthStore } from '@/stores/authStore';
import { ChatInput } from '@/components/ChatInput';
import { checkToxicity } from '@/lib/moderation';
import { showToast } from '@/stores/toastStore';

function formatTime(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function GroupChatBubble({
  message,
  isMine,
  showSender,
  Colors,
  onAvatarPress,
}: {
  message: GroupMessage;
  isMine: boolean;
  showSender: boolean;
  Colors: ReturnType<typeof useColors>;
  onAvatarPress: () => void;
}) {
  const s = makeBubbleStyles(Colors);

  return (
    <View style={[s.row, isMine ? s.rowMine : s.rowTheirs]}>
      {!isMine && showSender && (
        <TouchableOpacity onPress={onAvatarPress} activeOpacity={0.7}>
          {message.sender_avatar ? (
            <Image source={{ uri: message.sender_avatar }} style={s.avatar} />
          ) : (
            <View style={[s.avatar, s.avatarPlaceholder]}>
              <Ionicons name="person" size={14} color={Colors.primaryLight} />
            </View>
          )}
        </TouchableOpacity>
      )}
      {!isMine && !showSender && <View style={s.avatarSpacer} />}
      <View style={s.bubbleCol}>
        {!isMine && showSender && (
          <TouchableOpacity onPress={onAvatarPress} activeOpacity={0.7}>
            <Text style={s.senderName}>{message.sender_name}</Text>
          </TouchableOpacity>
        )}
        <View style={[s.bubble, isMine ? s.bubbleMine : s.bubbleTheirs]}>
          {message.image_url ? (
            <Image
              source={{ uri: message.image_url }}
              style={s.image}
              contentFit="cover"
              transition={200}
            />
          ) : null}
          {message.content ? (
            <Text style={[s.text, isMine ? s.textMine : s.textTheirs]}>
              {message.content}
            </Text>
          ) : null}
          <Text style={[s.time, isMine ? s.timeMine : s.timeTheirs]}>
            {formatTime(message.created_at)}
          </Text>
        </View>
      </View>
    </View>
  );
}

export default function GroupDetailScreen() {
  const { t } = useTranslation();
  const Colors = useColors();
  const styles = makeStyles(Colors);
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const groups = useGroupsStore((s) => s.groups);
  const members = useGroupsStore((s) => s.members);
  const membersLoading = useGroupsStore((s) => s.membersLoading);
  const fetchMembers = useGroupsStore((s) => s.fetchMembers);
  const joinGroup = useGroupsStore((s) => s.joinGroup);
  const leaveGroup = useGroupsStore((s) => s.leaveGroup);

  const userId = useAuthStore((s) => s.user?.id);
  const { messages, isLoading: chatLoading, isLoadingOlder, hasOlderMessages, fetchMessages, fetchOlderMessages, sendMessage, subscribe, unsubscribe, reset: resetChat } = useGroupChatStore();

  const group = groups.find((g) => g.id === id);
  const [showMembers, setShowMembers] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!id || !group) return;
    if (group.is_member) {
      fetchMessages(id);
      subscribe(id);
      fetchMembers(id);
      return () => {
        unsubscribe();
        resetChat();
      };
    } else {
      fetchMembers(id);
    }
  }, [id, group?.is_member]);

  // Auto-scroll on new messages
  const prevCount = useRef(messages.length);
  useEffect(() => {
    if (messages.length > prevCount.current) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
    prevCount.current = messages.length;
  }, [messages.length]);

  const handleSend = useCallback(
    (content: string, imageUrl?: string) => {
      if (!id) return;
      if (content && checkToxicity(content).toxic) {
        showToast(t('chat.toxicMessage'), 'error');
        return;
      }
      sendMessage(id, content, imageUrl);
    },
    [id, sendMessage, t]
  );

  const handleLoadOlder = useCallback(() => {
    if (id && hasOlderMessages && !isLoadingOlder) {
      fetchOlderMessages(id);
    }
  }, [id, hasOlderMessages, isLoadingOlder, fetchOlderMessages]);

  const renderMessage = useCallback(
    ({ item, index }: { item: GroupMessage; index: number }) => {
      const isMine = item.sender_id === userId;
      const prev = index > 0 ? messages[index - 1] : null;
      const showSender = !isMine && (!prev || prev.sender_id !== item.sender_id);

      return (
        <GroupChatBubble
          message={item}
          isMine={isMine}
          showSender={showSender}
          Colors={Colors}
          onAvatarPress={() =>
            router.push({ pathname: '/match-profile', params: { userId: item.sender_id } } as any)
          }
        />
      );
    },
    [userId, messages, Colors, router]
  );

  const renderMember = useCallback(
    ({ item }: { item: GroupMember }) => (
      <TouchableOpacity
        style={styles.memberItem}
        onPress={() => router.push({ pathname: '/match-profile', params: { userId: item.id } } as any)}
        activeOpacity={0.7}
      >
        {item.avatar_url ? (
          <Image source={{ uri: item.avatar_url }} style={styles.memberAvatar} contentFit="cover" transition={150} />
        ) : (
          <View style={[styles.memberAvatar, styles.memberAvatarPlaceholder]}>
            <Ionicons name="person" size={22} color={Colors.primaryLight} />
          </View>
        )}
        <View style={styles.memberInfo}>
          <View style={styles.memberNameRow}>
            <Text style={styles.memberName} numberOfLines={1}>{item.name}</Text>
            {item.is_verified && <Ionicons name="shield-checkmark" size={14} color={Colors.primary} />}
          </View>
          {(item.age || item.hometown) && (
            <Text style={styles.memberDetail} numberOfLines={1}>
              {[item.age && `${item.age}`, item.hometown].filter(Boolean).join(' \u00b7 ')}
            </Text>
          )}
        </View>
        <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
      </TouchableOpacity>
    ),
    [Colors, styles, router]
  );

  if (!group) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ResponsiveContainer>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} hitSlop={8}>
              <Ionicons name="chevron-back" size={26} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t('groups.title')}</Text>
            <View style={{ width: 26 }} />
          </View>
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        </ResponsiveContainer>
      </SafeAreaView>
    );
  }

  // ===== NOT A MEMBER: show join screen =====
  if (!group.is_member) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ResponsiveContainer>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} hitSlop={8}>
              <Ionicons name="chevron-back" size={26} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t(`groups.${group.slug}`)}</Text>
            <View style={{ width: 26 }} />
          </View>

          <View style={styles.groupHeader}>
            <Text style={styles.groupIcon}>{group.icon}</Text>
            <Text style={styles.groupName}>{t(`groups.${group.slug}`)}</Text>
            <Text style={styles.groupMemberCount}>
              {t('groups.memberCount', { count: group.member_count })}
            </Text>
            <Button
              title={t('groups.join')}
              onPress={() => joinGroup(group.id)}
              style={{ marginTop: 12, minWidth: 160 }}
            />
          </View>

          <Text style={styles.sectionTitle}>{t('groups.members')}</Text>

          {membersLoading ? (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color={Colors.primary} />
            </View>
          ) : members.length === 0 ? (
            <View style={styles.centered}>
              <Text style={styles.emptyText}>{t('groups.noMembers')}</Text>
            </View>
          ) : (
            <FlatList
              data={members}
              keyExtractor={(item) => item.id}
              renderItem={renderMember}
              contentContainerStyle={styles.membersList}
            />
          )}
        </ResponsiveContainer>
      </SafeAreaView>
    );
  }

  // ===== MEMBER: show members overlay =====
  if (showMembers) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ResponsiveContainer>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setShowMembers(false)} activeOpacity={0.7} hitSlop={8}>
              <Ionicons name="chevron-back" size={26} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t('groups.members')}</Text>
            <View style={{ width: 26 }} />
          </View>

          {membersLoading ? (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color={Colors.primary} />
            </View>
          ) : members.length === 0 ? (
            <View style={styles.centered}>
              <Text style={styles.emptyText}>{t('groups.noMembers')}</Text>
            </View>
          ) : (
            <FlatList
              data={members}
              keyExtractor={(item) => item.id}
              renderItem={renderMember}
              contentContainerStyle={styles.membersList}
            />
          )}
        </ResponsiveContainer>
      </SafeAreaView>
    );
  }

  // ===== MEMBER: show chat (default) =====
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="chevron-back" size={26} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerIcon}>{group.icon}</Text>
          <Text style={styles.headerTitle} numberOfLines={1}>{t(`groups.${group.slug}`)}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => setShowMembers(true)} activeOpacity={0.7} hitSlop={8}>
            <Ionicons name="people-outline" size={24} color={Colors.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => leaveGroup(group.id)} activeOpacity={0.7} hitSlop={8}>
            <Ionicons name="exit-outline" size={24} color={Colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {chatLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            contentContainerStyle={styles.messagesList}
            onStartReached={handleLoadOlder}
            onStartReachedThreshold={0.3}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            ListHeaderComponent={
              isLoadingOlder ? (
                <ActivityIndicator size="small" color={Colors.primary} style={{ marginVertical: 12 }} />
              ) : null
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="chatbubbles-outline" size={48} color={Colors.textTertiary} />
                <Text style={styles.emptyText}>{t('groups.chatEmpty')}</Text>
              </View>
            }
          />
        )}

        <SafeAreaView edges={['bottom']} style={{ backgroundColor: Colors.surface }}>
          <ChatInput
            onSend={handleSend}
            matchId={id ?? ''}
            isPremium={false}
          />
        </SafeAreaView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function makeBubbleStyles(c: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    row: { flexDirection: 'row', paddingHorizontal: 12, marginVertical: 2 },
    rowMine: { justifyContent: 'flex-end' },
    rowTheirs: { justifyContent: 'flex-start', alignItems: 'flex-end' },
    avatar: { width: 28, height: 28, borderRadius: 14, marginRight: 6 },
    avatarPlaceholder: { backgroundColor: c.surfaceSecondary, justifyContent: 'center', alignItems: 'center', marginRight: 6 },
    avatarSpacer: { width: 34 },
    bubbleCol: { maxWidth: '78%' },
    senderName: { fontSize: 12, fontFamily: Fonts.bodySemiBold, color: c.primary, marginBottom: 2, marginLeft: 4 },
    bubble: { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
    bubbleMine: { backgroundColor: c.primary, borderBottomRightRadius: 4 },
    bubbleTheirs: { backgroundColor: c.surfaceSecondary, borderBottomLeftRadius: 4 },
    image: { width: 200, height: 260, borderRadius: 14, marginBottom: 4 },
    text: { fontSize: 15, fontFamily: Fonts.body, lineHeight: 21 },
    textMine: { color: c.textOnPrimary },
    textTheirs: { color: c.text },
    time: { fontSize: 11, fontFamily: Fonts.body, alignSelf: 'flex-end', marginTop: 4 },
    timeMine: { color: 'rgba(255,255,255,0.7)' },
    timeTheirs: { color: c.textTertiary },
  });
}

function makeStyles(c: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
    headerTitle: { fontSize: 18, fontFamily: Fonts.bodySemiBold, color: c.text },
    headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, justifyContent: 'center' },
    headerIcon: { fontSize: 20 },
    headerActions: { flexDirection: 'row', gap: 16 },
    centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    groupHeader: { alignItems: 'center', paddingVertical: 20, paddingHorizontal: 24 },
    groupIcon: { fontSize: 48 },
    groupName: { fontSize: 22, fontFamily: Fonts.heading, color: c.text, marginTop: 8 },
    groupMemberCount: { fontSize: 14, fontFamily: Fonts.body, color: c.textSecondary, marginTop: 4 },
    sectionTitle: { fontSize: 16, fontFamily: Fonts.bodySemiBold, color: c.text, paddingHorizontal: 24, marginTop: 8, marginBottom: 12 },
    membersList: { paddingHorizontal: 24, paddingBottom: 24 },
    memberItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12 },
    memberAvatar: { width: 48, height: 48, borderRadius: 24 },
    memberAvatarPlaceholder: { backgroundColor: c.surfaceSecondary, justifyContent: 'center', alignItems: 'center' },
    memberInfo: { flex: 1, gap: 2 },
    memberNameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    memberName: { fontSize: 15, fontFamily: Fonts.bodySemiBold, color: c.text },
    memberDetail: { fontSize: 13, fontFamily: Fonts.body, color: c.textSecondary },
    emptyText: { fontSize: 15, fontFamily: Fonts.body, color: c.textTertiary },
    messagesList: { paddingVertical: 8, flexGrow: 1 },
    emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 12 },
  });
}
