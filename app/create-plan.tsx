import { useColors } from '@/hooks/useColors';
import { Fonts } from '@/constants/fonts';
import { usePlansStore } from '@/stores/plansStore';
import { showToast } from '@/stores/toastStore';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ResponsiveContainer } from '@/components/ResponsiveContainer';

type Category = 'viajes' | 'ocio' | 'cultura';

const CATEGORIES: { key: Category; label: string }[] = [
  { key: 'viajes', label: 'Viajes' },
  { key: 'ocio', label: 'Ocio' },
  { key: 'cultura', label: 'Cultura' },
];

export default function CreatePlanScreen() {
  const { t } = useTranslation();
  const Colors = useColors();
  const styles = makeStyles(Colors);
  const router = useRouter();
  const createPlan = usePlansStore((s) => s.createPlan);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState('');
  const [category, setCategory] = useState<Category>('ocio');
  const [date, setDate] = useState('');
  const [maxAttendees, setMaxAttendees] = useState('');
  const [loading, setLoading] = useState(false);

  const getCategoryColor = (cat: Category) => {
    if (cat === 'viajes') return '#C8956C';
    if (cat === 'cultura') return Colors.primary;
    return Colors.primaryDark;
  };

  const handleSubmit = async () => {
    if (!title.trim() || !locationName.trim() || !date.trim()) {
      showToast('Rellena los campos obligatorios', 'error');
      return;
    }

    setLoading(true);
    try {
      const result = await createPlan({
        title: title.trim(),
        description: description.trim() || null,
        category,
        location_name: locationName.trim(),
        event_date: date,
        max_attendees: maxAttendees ? parseInt(maxAttendees, 10) : null,
      });

      if (result.success) {
        showToast('Plan creado', 'success');
        router.back();
      } else {
        showToast('Error al crear el plan', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ResponsiveContainer>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} hitSlop={8}>
              <Ionicons name="chevron-back" size={26} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.title}>Crear plan</Text>
            <View style={{ width: 26 }} />
          </View>

          <ScrollView
            contentContainerStyle={styles.form}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Input
              label="T\u00EDtulo *"
              placeholder="Ej: Ruta por los Pirineos"
              value={title}
              onChangeText={setTitle}
            />

            <Input
              label="Descripci\u00F3n"
              placeholder="Cu\u00E9ntanos m\u00E1s sobre el plan..."
              value={description}
              onChangeText={setDescription}
              multiline
            />

            <Input
              label="Ubicaci\u00F3n *"
              placeholder="Ej: Barcelona, Espa\u00F1a"
              value={locationName}
              onChangeText={setLocationName}
            />

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Categor\u00EDa</Text>
              <View style={styles.categoryRow}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat.key}
                    style={[
                      styles.categoryButton,
                      category === cat.key && {
                        backgroundColor: getCategoryColor(cat.key),
                        borderColor: getCategoryColor(cat.key),
                      },
                    ]}
                    onPress={() => setCategory(cat.key)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.categoryButtonText,
                        category === cat.key && styles.categoryButtonTextSelected,
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <Input
              label="Fecha *"
              placeholder="AAAA-MM-DD"
              value={date}
              onChangeText={setDate}
            />

            <Input
              label="M\u00E1ximo de asistentes (opcional)"
              placeholder="Ej: 10"
              value={maxAttendees}
              onChangeText={setMaxAttendees}
              keyboardType="number-pad"
            />

            <Button
              title="Crear plan"
              onPress={handleSubmit}
              loading={loading}
              disabled={!title.trim() || !locationName.trim() || !date.trim()}
              style={{ marginTop: 8 }}
            />
          </ScrollView>
        </KeyboardAvoidingView>
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
    title: {
      fontSize: 20,
      fontFamily: Fonts.heading,
      color: c.text,
    },
    form: {
      paddingHorizontal: 24,
      paddingTop: 8,
      paddingBottom: 40,
      gap: 18,
    },
    fieldGroup: {
      gap: 6,
    },
    label: {
      fontSize: 14,
      fontFamily: Fonts.bodyMedium,
      color: c.textSecondary,
      marginLeft: 4,
    },
    categoryRow: {
      flexDirection: 'row',
      gap: 10,
    },
    categoryButton: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 16,
      borderWidth: 1.5,
      borderColor: c.border,
      alignItems: 'center',
    },
    categoryButtonText: {
      fontSize: 14,
      fontFamily: Fonts.bodySemiBold,
      color: c.text,
    },
    categoryButtonTextSelected: {
      color: '#FFFFFF',
    },
  });
}
