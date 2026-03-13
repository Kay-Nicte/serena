import { useCallback, useEffect } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { useColors } from '@/hooks/useColors';
import { Fonts } from '@/constants/fonts';
import { ResponsiveContainer } from '@/components/ResponsiveContainer';
import { useMatchStore, type Match } from '@/stores/matchStore';
import { useTriviaStore } from '@/stores/triviaStore';
import { showToast } from '@/stores/toastStore';

export default function TriviaInviteScreen() {
  const { t } = useTranslation();
  const Colors = useColors();
  const s = makeStyles(Colors);
  const router = useRouter();

  const matches = useMatchStore((s) => s.matches);
  const fetchMatches = useMatchStore((s) => s.fetchMatches);
  const { pendingInvites, loading, sendInvite, fetchPendingInvites, respondToInvite } = useTriviaStore();

  useFocusEffect(
    useCallback(() => {
      fetchMatches();
      fetchPendingInvites();
    }, [fetchMatches, fetchPendingInvites])
  );

  const handleSendInvite = async (match: Match) => {
    const result = await sendInvite(match.otherUser.id);
    if (result.success) {
      showToast(t('games.inviteSent'), 'success');
      router.push('/trivia-play' as any);
    }
  };

  const handleAccept = async (sessionId: string) => {
    const result = await respondToInvite(sessionId, true);
    if (result.accepted) {
      router.push('/trivia-play' as any);
    }
  };

  const handleDecline = async (sessionId: string) => {
    await respondToInvite(sessionId, false);
  };

  return (
    <SafeAreaView style={s.container}>
      <ResponsiveContainer>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>{t('games.affinity')}</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Pending invites */}
        {pendingInvites.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>{t('games.pendingInvites')}</Text>
            {pendingInvites.map((invite) => (
              <View key={invite.session_id} style={s.inviteCard}>
                {invite.inviter.avatar_url ? (
                  <Image source={{ uri: invite.inviter.avatar_url }} style={s.avatar} />
                ) : (
                  <View style={[s.avatar, s.avatarPlaceholder]}>
                    <Ionicons name="person" size={20} color={Colors.primary} />
                  </View>
                )}
                <View style={s.inviteInfo}>
                  <Text style={s.inviteName}>{invite.inviter.name}</Text>
                  <Text style={s.inviteSubtext}>{t('games.challengedYou')}</Text>
                </View>
                <TouchableOpacity style={s.acceptBtn} onPress={() => handleAccept(invite.session_id)}>
                  <Text style={s.acceptBtnText}>{t('games.acceptInvite')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.declineBtn} onPress={() => handleDecline(invite.session_id)}>
                  <Ionicons name="close" size={18} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Pick a match */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>{t('games.selectMatch')}</Text>
        </View>

        {loading ? (
          <View style={s.centered}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : matches.length === 0 ? (
          <View style={s.centered}>
            <Text style={s.emptyText}>{t('games.noMatches')}</Text>
          </View>
        ) : (
          <FlatList
            data={matches}
            keyExtractor={(item) => item.id}
            contentContainerStyle={s.list}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={s.matchCard}
                activeOpacity={0.7}
                onPress={() => handleSendInvite(item)}
              >
                {item.otherUser.avatar_url ? (
                  <Image source={{ uri: item.otherUser.avatar_url }} style={s.avatar} />
                ) : (
                  <View style={[s.avatar, s.avatarPlaceholder]}>
                    <Ionicons name="person" size={20} color={Colors.primary} />
                  </View>
                )}
                <Text style={s.matchName}>{item.otherUser.name}</Text>
                <Ionicons name="game-controller-outline" size={20} color={Colors.primary} />
              </TouchableOpacity>
            )}
          />
        )}
      </ResponsiveContainer>
    </SafeAreaView>
  );
}

function makeStyles(c: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 12, paddingBottom: 16 },
    headerTitle: { fontSize: 18, fontFamily: Fonts.bodySemiBold, color: c.text },
    section: { paddingHorizontal: 24, marginBottom: 12 },
    sectionTitle: { fontSize: 14, fontFamily: Fonts.bodySemiBold, color: c.textSecondary, textTransform: 'uppercase', marginBottom: 12 },
    inviteCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: c.primaryLight, gap: 12, marginBottom: 8 },
    inviteInfo: { flex: 1, gap: 2 },
    inviteName: { fontSize: 15, fontFamily: Fonts.bodySemiBold, color: c.text },
    inviteSubtext: { fontSize: 12, fontFamily: Fonts.body, color: c.textSecondary },
    acceptBtn: { backgroundColor: c.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16 },
    acceptBtnText: { fontSize: 12, fontFamily: Fonts.bodySemiBold, color: '#FFFFFF' },
    declineBtn: { padding: 6 },
    list: { paddingHorizontal: 24, paddingBottom: 40, gap: 8 },
    matchCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: c.borderLight, gap: 12 },
    avatar: { width: 44, height: 44, borderRadius: 22 },
    avatarPlaceholder: { backgroundColor: c.primaryPastel, justifyContent: 'center', alignItems: 'center' },
    matchName: { flex: 1, fontSize: 15, fontFamily: Fonts.bodySemiBold, color: c.text },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
    emptyText: { fontSize: 15, fontFamily: Fonts.body, color: c.textSecondary, textAlign: 'center' },
  });
}
