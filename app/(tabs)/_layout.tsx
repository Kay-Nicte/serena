import { useCallback, useEffect, useState } from 'react';
import { Tabs, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { Fonts } from '@/constants/fonts';
import { useAuthStore } from '@/stores/authStore';
import { useIceBreakerStore } from '@/stores/iceBreakerStore';
import { useTriviaStore } from '@/stores/triviaStore';
import { PremiumExpiryModal } from '@/components/PremiumExpiryModal';
import { supabase } from '@/lib/supabase';

function useAdminPendingCount(isStaff: boolean) {
  const [count, setCount] = useState(0);

  const fetchCounts = useCallback(async () => {
    if (!isStaff) {
      setCount(0);
      return;
    }
    try {
      const [reportsRes, verificationsRes] = await Promise.all([
        supabase.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.rpc('admin_get_pending_verifications'),
      ]);

      const reportCount = reportsRes.count ?? 0;
      const verificationCount = Array.isArray(verificationsRes.data) ? verificationsRes.data.length : 0;
      setCount(reportCount + verificationCount);
    } catch {
      // Non-critical
    }
  }, [isStaff]);

  useFocusEffect(
    useCallback(() => {
      fetchCounts();
    }, [fetchCounts])
  );

  useEffect(() => {
    if (!isStaff) return;
    const interval = setInterval(fetchCounts, 60_000);
    return () => clearInterval(interval);
  }, [isStaff, fetchCounts]);

  return count;
}

export default function TabLayout() {
  const { t } = useTranslation();
  const Colors = useColors();
  const profile = useAuthStore((s) => s.profile);
  const isAdmin = profile?.is_admin === true;
  const isModerator = profile?.is_moderator === true;
  const isStaff = isAdmin || isModerator;
  const pendingCount = useIceBreakerStore((s) => s.pendingIceBreakers.length);
  const triviaInviteCount = useTriviaStore((s) => s.pendingInvites.length);
  const fetchPendingInvites = useTriviaStore((s) => s.fetchPendingInvites);
  const adminPendingCount = useAdminPendingCount(isStaff);
  const tabStyles = makeStyles(Colors);

  useFocusEffect(
    useCallback(() => {
      fetchPendingInvites();
    }, [fetchPendingInvites])
  );

  return (
    <>
    <PremiumExpiryModal />
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.tabBarActive,
        tabBarInactiveTintColor: Colors.tabBarInactive,
        tabBarStyle: {
          backgroundColor: Colors.tabBar,
          borderTopColor: Colors.borderLight,
        },
        tabBarLabelStyle: {
          fontFamily: Fonts.bodyMedium,
          fontSize: 11,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.today'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="conexiones"
        options={{
          title: t('tabs.conexiones'),
          tabBarIcon: ({ color, size }) => (
            <View>
              <Ionicons name="chatbubble-ellipses-outline" size={size} color={color} />
              {pendingCount > 0 && (
                <View style={tabStyles.badge}>
                  <Text style={tabStyles.badgeText}>
                    {pendingCount > 9 ? '9+' : pendingCount}
                  </Text>
                </View>
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="comunidad"
        options={{
          title: t('tabs.comunidad'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="juegos"
        options={{
          title: t('games.title'),
          tabBarIcon: ({ color, size }) => (
            <View>
              <Ionicons name="game-controller-outline" size={size} color={color} />
              {triviaInviteCount > 0 && (
                <View style={tabStyles.badge}>
                  <Text style={tabStyles.badgeText}>
                    {triviaInviteCount > 9 ? '9+' : triviaInviteCount}
                  </Text>
                </View>
              )}
            </View>
          ),
        }}
      />
      {/* Hidden tabs - still accessible via router.push but not in tab bar */}
      <Tabs.Screen
        name="profile"
        options={{
          href: null,
          title: t('tabs.profile'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="matches"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="chat"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="plans"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="admin"
        options={{
          title: t('tabs.admin'),
          href: isStaff ? '/(tabs)/admin' : null,
          tabBarIcon: ({ color, size }) => (
            <View>
              <Ionicons name="shield-outline" size={size} color={color} />
              {adminPendingCount > 0 && (
                <View style={tabStyles.badge}>
                  <Text style={tabStyles.badgeText}>
                    {adminPendingCount > 9 ? '9+' : adminPendingCount}
                  </Text>
                </View>
              )}
            </View>
          ),
        }}
      />
    </Tabs>
    </>
  );
}

function makeStyles(c: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    badge: {
      position: 'absolute',
      top: -4,
      right: -10,
      backgroundColor: c.primary,
      borderRadius: 9,
      minWidth: 18,
      height: 18,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 4,
    },
    badgeText: {
      fontSize: 10,
      fontFamily: Fonts.bodyBold,
      color: c.textOnPrimary,
    },
  });
}
