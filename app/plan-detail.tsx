import { useColors } from '@/hooks/useColors';
import { Fonts } from '@/constants/fonts';
import { usePlansStore } from '@/stores/plansStore';
import { showToast } from '@/stores/toastStore';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ResponsiveContainer } from '@/components/ResponsiveContainer';

interface Attendee {
  id: string;
  name: string;
  avatar_url: string | null;
}

const AVATAR_COLORS = ['#E8A0BF', '#BA90C6', '#C0DBEA', '#DCCCBB', '#A8D8B9', '#F2C57C'];

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function PlanDetailScreen() {
  const { t } = useTranslation();
  const Colors = useColors();
  const styles = makeStyles(Colors);
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const plans = usePlansStore((s) => s.plans);
  const joinPlan = usePlansStore((s) => s.joinPlan);
  const leavePlan = usePlansStore((s) => s.leavePlan);
  const deletePlan = usePlansStore((s) => s.deletePlan);

  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loadingAttendees, setLoadingAttendees] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const plan = plans.find((p) => p.id === id);

  const fetchAttendees = useCallback(async () => {
    if (!id) return;
    setLoadingAttendees(true);
    try {
      const { data, error } = await supabase.rpc('get_plan_attendees', { p_plan_id: id });
      if (error) throw error;
      setAttendees((data as Attendee[]) ?? []);
    } catch {
      // silent
    } finally {
      setLoadingAttendees(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAttendees();
  }, [fetchAttendees]);

  const getCategoryColor = (cat: string) => {
    if (cat === 'viajes') return '#C8956C';
    if (cat === 'cultura') return Colors.primary;
    return Colors.primaryDark;
  };

  const handleJoin = async () => {
    if (!id) return;
    setActionLoading(true);
    const result = await joinPlan(id);
    if (result.success) {
      showToast('Te has unido al plan', 'success');
      fetchAttendees();
    } else {
      showToast('Error al unirte', 'error');
    }
    setActionLoading(false);
  };

  const handleLeave = async () => {
    if (!id) return;
    setActionLoading(true);
    const result = await leavePlan(id);
    if (result.success) {
      showToast('Has salido del plan', 'success');
      fetchAttendees();
    } else {
      showToast('Error al salir', 'error');
    }
    setActionLoading(false);
  };

  const handleDelete = () => {
    Alert.alert('Eliminar plan', '\u00BFEst\u00E1s seguro de que quieres eliminar este plan?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          if (!id) return;
          setActionLoading(true);
          const result = await deletePlan(id);
          if (result.success) {
            showToast('Plan eliminado', 'success');
            router.back();
          } else {
            showToast('Error al eliminar', 'error');
          }
          setActionLoading(false);
        },
      },
    ]);
  };

  if (!plan) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ResponsiveContainer>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} hitSlop={8}>
              <Ionicons name="chevron-back" size={26} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Plan</Text>
            <View style={{ width: 26 }} />
          </View>
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        </ResponsiveContainer>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ResponsiveContainer>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} hitSlop={8}>
            <Ionicons name="chevron-back" size={26} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Plan</Text>
          <View style={{ width: 26 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(plan.category) }]}>
            <Text style={styles.categoryBadgeText}>
              {plan.category.charAt(0).toUpperCase() + plan.category.slice(1)}
            </Text>
          </View>

          <Text style={styles.title}>{plan.title}</Text>

          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={16} color={Colors.textSecondary} />
            <Text style={styles.infoText}>Creado por {plan.creator_name}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={16} color={Colors.textSecondary} />
            <Text style={styles.infoText}>{plan.location_name}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={16} color={Colors.textSecondary} />
            <Text style={styles.infoText}>
              {new Date(plan.event_date).toLocaleDateString('es-ES', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </Text>
          </View>

          {plan.max_attendees != null && (
            <View style={styles.infoRow}>
              <Ionicons name="people-outline" size={16} color={Colors.textSecondary} />
              <Text style={styles.infoText}>
                {plan.attendee_count}/{plan.max_attendees} asistentes
              </Text>
            </View>
          )}

          {plan.description ? (
            <View style={styles.descriptionSection}>
              <Text style={styles.sectionTitle}>Descripci\u00F3n</Text>
              <Text style={styles.description}>{plan.description}</Text>
            </View>
          ) : null}

          <View style={styles.attendeesSection}>
            <Text style={styles.sectionTitle}>
              Asistentes ({plan.attendee_count})
            </Text>
            {loadingAttendees ? (
              <ActivityIndicator size="small" color={Colors.primary} style={{ marginTop: 12 }} />
            ) : attendees.length === 0 ? (
              <Text style={styles.noAttendeesText}>A\u00FAn no hay asistentes</Text>
            ) : (
              <View style={styles.attendeesList}>
                {attendees.map((a, i) => (
                  <View key={a.id} style={styles.attendeeItem}>
                    <View
                      style={[
                        styles.attendeeAvatar,
                        { backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length] },
                      ]}
                    >
                      <Text style={styles.attendeeInitials}>{getInitials(a.name)}</Text>
                    </View>
                    <Text style={styles.attendeeName}>{a.name}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          <View style={styles.actions}>
            {plan.is_creator ? (
              <Button
                title="Eliminar plan"
                onPress={handleDelete}
                variant="outline"
                loading={actionLoading}
                textStyle={{ color: Colors.error }}
                style={{ borderColor: Colors.error }}
              />
            ) : plan.is_joined ? (
              <Button
                title="Salir del plan"
                onPress={handleLeave}
                variant="outline"
                loading={actionLoading}
              />
            ) : (
              <Button
                title="Unirme al plan"
                onPress={handleJoin}
                loading={actionLoading}
              />
            )}
          </View>
        </ScrollView>
      </ResponsiveContainer>
    </SafeAreaView>
  );
}

function makeStyles(c: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 8,
    },
    headerTitle: {
      fontSize: 18,
      fontFamily: Fonts.bodySemiBold,
      color: c.text,
    },
    centered: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    content: {
      paddingHorizontal: 24,
      paddingTop: 8,
      paddingBottom: 40,
    },
    categoryBadge: {
      alignSelf: 'flex-start',
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderRadius: 12,
      marginBottom: 12,
    },
    categoryBadgeText: {
      fontSize: 12,
      fontFamily: Fonts.bodySemiBold,
      color: '#FFFFFF',
    },
    title: {
      fontSize: 24,
      fontFamily: Fonts.heading,
      color: c.text,
      marginBottom: 16,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 8,
    },
    infoText: {
      fontSize: 14,
      fontFamily: Fonts.body,
      color: c.textSecondary,
      flex: 1,
    },
    descriptionSection: {
      marginTop: 20,
    },
    sectionTitle: {
      fontSize: 16,
      fontFamily: Fonts.bodySemiBold,
      color: c.text,
      marginBottom: 8,
    },
    description: {
      fontSize: 15,
      fontFamily: Fonts.body,
      color: c.textSecondary,
      lineHeight: 22,
    },
    attendeesSection: {
      marginTop: 24,
    },
    noAttendeesText: {
      fontSize: 14,
      fontFamily: Fonts.body,
      color: c.textTertiary,
      marginTop: 8,
    },
    attendeesList: {
      marginTop: 12,
      gap: 12,
    },
    attendeeItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    attendeeAvatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
    },
    attendeeInitials: {
      fontSize: 13,
      fontFamily: Fonts.bodySemiBold,
      color: '#FFFFFF',
    },
    attendeeName: {
      fontSize: 15,
      fontFamily: Fonts.bodyMedium,
      color: c.text,
    },
    actions: {
      marginTop: 32,
    },
  });
}
