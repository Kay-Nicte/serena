import { useColors } from '@/hooks/useColors';
import { Fonts } from '@/constants/fonts';
import { usePlansStore, Plan, PlanCategory } from '@/stores/plansStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ResponsiveContainer } from '@/components/ResponsiveContainer';
import { SegmentedControl } from '@/components/SegmentedControl';
import { ProfileAvatarButton } from '@/components/ProfileAvatarButton';
import { useGroupsStore, type Group } from '@/stores/groupsStore';

const FILTERS: PlanCategory[] = ['todos', 'cerca', 'viajes', 'ocio', 'cultura'];
function useFilterLabels(): Record<PlanCategory, string> {
  const { t } = useTranslation();
  return {
    todos: t('plans.categoryAll'),
    cerca: t('plans.categoryNearby'),
    viajes: t('plans.categoryTravel'),
    ocio: t('plans.categoryLeisure'),
    cultura: t('plans.categoryCulture'),
  };
}

export default function ComunidadScreen() {
  const { t } = useTranslation();
  const FILTER_LABELS = useFilterLabels();
  const Colors = useColors();
  const styles = makeStyles(Colors);
  const router = useRouter();
  const [segment, setSegment] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const groups = useGroupsStore((s) => s.groups);
  const groupsLoading = useGroupsStore((s) => s.loading);
  const fetchGroups = useGroupsStore((s) => s.fetchGroups);
  const joinGroupAction = useGroupsStore((s) => s.joinGroup);
  const leaveGroupAction = useGroupsStore((s) => s.leaveGroup);

  const plans = usePlansStore((s) => s.plans);
  const loading = usePlansStore((s) => s.loading);
  const category = usePlansStore((s) => s.category);
  const setCategory = usePlansStore((s) => s.setCategory);
  const fetchPlans = usePlansStore((s) => s.fetchPlans);
  const joinPlan = usePlansStore((s) => s.joinPlan);
  const leavePlan = usePlansStore((s) => s.leavePlan);

  useFocusEffect(
    useCallback(() => {
      fetchPlans();
      fetchGroups();
    }, [fetchPlans, fetchGroups])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try { await fetchPlans(); } finally { setRefreshing(false); }
  }, [fetchPlans]);

  const getCategoryColor = (cat: string) => {
    if (cat === 'viajes') return '#C8956C';
    if (cat === 'cultura') return Colors.primary;
    return Colors.primaryDark;
  };

  const renderPlanCard = ({ item }: { item: Plan }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => router.push(`/plan-detail?id=${item.id}` as any)}
    >
      <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(item.category) }]}>
        <Text style={styles.categoryBadgeText}>
          {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
        </Text>
      </View>

      <Text style={styles.cardTitle}>{item.title}</Text>

      <View style={styles.cardRow}>
        <Ionicons name="location-outline" size={15} color={Colors.textSecondary} />
        <Text style={styles.cardDetail}>{item.location_name}</Text>
      </View>
      <View style={styles.cardRow}>
        <Ionicons name="calendar-outline" size={15} color={Colors.textSecondary} />
        <Text style={styles.cardDetail}>
          {new Date(item.event_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
        </Text>
      </View>

      {item.distance_km != null && (
        <View style={styles.cardRow}>
          <Ionicons name="navigate-outline" size={15} color={Colors.textSecondary} />
          <Text style={styles.cardDetail}>
            {item.distance_km < 1 ? `${Math.round(item.distance_km * 1000)} m` : `${item.distance_km.toFixed(1)} km`}
          </Text>
        </View>
      )}

      <View style={styles.cardFooter}>
        <View style={styles.attendeesRow}>
          <Ionicons name="people-outline" size={16} color={Colors.textSecondary} />
          <Text style={styles.attendeeCount}>{item.attendee_count}{item.max_attendees ? `/${item.max_attendees}` : ''}</Text>
        </View>

        {item.is_creator ? (
          <View style={styles.creatorBadge}>
            <Text style={styles.creatorBadgeText}>{t('plans.yourPlan')}</Text>
          </View>
        ) : item.is_joined ? (
          <TouchableOpacity style={styles.leaveButton} onPress={() => leavePlan(item.id)} activeOpacity={0.7}>
            <Text style={styles.leaveButtonText}>{t('plans.leave')}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.joinButton} onPress={() => joinPlan(item.id)} activeOpacity={0.7}>
            <Text style={styles.joinButtonText}>{t('plans.join')}</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ResponsiveContainer>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('tabs.comunidad')}</Text>
          <ProfileAvatarButton />
        </View>

        <SegmentedControl
          segments={[t('tabs.plans'), t('tabs.groups')]}
          selectedIndex={segment}
          onSelect={setSegment}
        />

        {segment === 0 ? (
          /* ── Plans ── */
          <>
            <View style={styles.filtersWrapper}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersContent}>
                {FILTERS.map((f) => (
                  <TouchableOpacity
                    key={f}
                    style={[styles.chip, category === f && styles.chipSelected]}
                    onPress={() => setCategory(f)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.chipText, category === f && styles.chipTextSelected]}>
                      {FILTER_LABELS[f]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {loading && plans.length === 0 ? (
              <View style={styles.centered}>
                <ActivityIndicator size="large" color={Colors.primary} />
              </View>
            ) : plans.length === 0 ? (
              <View style={styles.centered}>
                <Ionicons name="calendar-outline" size={64} color={Colors.primaryLight} />
                <Text style={styles.emptyText}>{t('plans.empty')}</Text>
              </View>
            ) : (
              <FlatList
                data={plans}
                keyExtractor={(item) => item.id}
                renderItem={renderPlanCard}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
              />
            )}

            <TouchableOpacity
              style={styles.fab}
              onPress={() => router.push('/create-plan' as any)}
              activeOpacity={0.7}
            >
              <Ionicons name="add" size={28} color="#FFFFFF" />
            </TouchableOpacity>
          </>
        ) : (
          /* ── Groups ── */
          groupsLoading && groups.length === 0 ? (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color={Colors.primary} />
            </View>
          ) : groups.length === 0 ? (
            <View style={styles.centered}>
              <Ionicons name="people-outline" size={64} color={Colors.primaryLight} />
              <Text style={styles.emptyText}>{t('groups.empty')}</Text>
            </View>
          ) : (
            <FlatList
              data={groups}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.groupCard}
                  activeOpacity={0.7}
                  onPress={() => router.push(`/group-detail?id=${item.id}` as any)}
                >
                  <Text style={styles.groupIcon}>{item.icon}</Text>
                  <View style={styles.groupInfo}>
                    <Text style={styles.groupName}>{t(`groups.${item.slug}`)}</Text>
                    <Text style={styles.groupMembers}>
                      {t('groups.memberCount', { count: item.member_count })}
                    </Text>
                  </View>
                  {item.is_member ? (
                    <TouchableOpacity
                      style={styles.leaveButton}
                      onPress={(e) => { e.stopPropagation(); leaveGroupAction(item.id); }}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.leaveButtonText}>{t('groups.leave')}</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={styles.joinButton}
                      onPress={(e) => { e.stopPropagation(); joinGroupAction(item.id); }}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.joinButtonText}>{t('groups.join')}</Text>
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.groupsList}
              showsVerticalScrollIndicator={false}
            />
          )
        )}
      </ResponsiveContainer>
    </SafeAreaView>
  );
}

function makeStyles(c: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 12 },
    headerTitle: { fontSize: 28, fontFamily: Fonts.heading, color: c.text },
    filtersWrapper: { paddingBottom: 12 },
    filtersContent: { paddingHorizontal: 24, gap: 8 },
    chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: c.border, backgroundColor: c.background },
    chipSelected: { backgroundColor: c.primaryDark, borderColor: c.primaryDark },
    chipText: { fontSize: 14, fontFamily: Fonts.bodyMedium, color: c.text },
    chipTextSelected: { color: '#FFFFFF' },
    centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 40 },
    emptyText: { fontSize: 16, fontFamily: Fonts.bodySemiBold, color: c.textSecondary, textAlign: 'center' },
    listContent: { paddingHorizontal: 24, paddingBottom: 100, gap: 16 },
    card: { backgroundColor: c.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: c.borderLight },
    categoryBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginBottom: 10 },
    categoryBadgeText: { fontSize: 11, fontFamily: Fonts.bodySemiBold, color: '#FFFFFF' },
    cardTitle: { fontSize: 17, fontFamily: Fonts.bodyBold, color: c.text, marginBottom: 8 },
    cardRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
    cardDetail: { fontSize: 13, fontFamily: Fonts.body, color: c.textSecondary },
    cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 },
    attendeesRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    attendeeCount: { fontSize: 13, fontFamily: Fonts.bodyMedium, color: c.textSecondary },
    joinButton: { backgroundColor: c.primary, paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20 },
    joinButtonText: { fontSize: 13, fontFamily: Fonts.bodySemiBold, color: '#FFFFFF' },
    leaveButton: { backgroundColor: c.background, paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: c.border },
    leaveButtonText: { fontSize: 13, fontFamily: Fonts.bodySemiBold, color: c.textSecondary },
    creatorBadge: { backgroundColor: c.primaryPastel, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: c.primaryLight },
    creatorBadgeText: { fontSize: 12, fontFamily: Fonts.bodySemiBold, color: c.primary },
    fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5 },
    // Groups
    groupsList: { paddingHorizontal: 24, paddingBottom: 24, gap: 12 },
    groupCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: c.borderLight, gap: 14 },
    groupIcon: { fontSize: 32 },
    groupInfo: { flex: 1, gap: 2 },
    groupName: { fontSize: 16, fontFamily: Fonts.bodySemiBold, color: c.text },
    groupMembers: { fontSize: 13, fontFamily: Fonts.body, color: c.textSecondary },
  });
}
