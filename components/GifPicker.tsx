import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Dimensions,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useColors } from '@/hooks/useColors';
import { Fonts } from '@/constants/fonts';
import { fetchTrendingGifs, searchGifs, type Gif } from '@/lib/giphy';

const SCREEN_WIDTH = Dimensions.get('window').width;
const NUM_COLUMNS = 2;
const GAP = 6;
const THUMB_WIDTH = (SCREEN_WIDTH - 32 - GAP) / NUM_COLUMNS;

interface GifPickerProps {
  visible: boolean;
  onSelect: (gifUrl: string) => void;
  onClose: () => void;
}

export function GifPicker({ visible, onSelect, onClose }: GifPickerProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [gifs, setGifs] = useState<Gif[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const Colors = useColors();
  const styles = makeStyles(Colors);

  const loadGifs = useCallback(async (search: string) => {
    setLoading(true);
    try {
      const results = search.trim()
        ? await searchGifs(search.trim())
        : await fetchTrendingGifs();
      setGifs(results);
    } catch {
      setGifs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (visible) {
      loadGifs('');
    } else {
      setQuery('');
      setGifs([]);
    }
  }, [visible, loadGifs]);

  const handleSearch = (text: string) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      loadGifs(text);
    }, 300);
  };

  const renderGif = ({ item }: { item: Gif }) => (
    <TouchableOpacity
      style={styles.gifItem}
      onPress={() => onSelect(item.url)}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: item.previewUrl }}
        style={styles.gifImage}
        contentFit="cover"
        transition={150}
      />
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>GIFs</Text>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
              <Ionicons name="close" size={24} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.searchRow}>
            <Ionicons name="search" size={18} color={Colors.textTertiary} />
            <TextInput
              style={styles.searchInput}
              value={query}
              onChangeText={handleSearch}
              placeholder={t('chat.searchGifs')}
              placeholderTextColor={Colors.textTertiary}
              autoCorrect={false}
            />
          </View>

          {loading ? (
            <View style={styles.centered}>
              <ActivityIndicator size="small" color={Colors.primary} />
            </View>
          ) : (
            <FlatList
              data={gifs}
              renderItem={renderGif}
              keyExtractor={(item) => item.id}
              numColumns={NUM_COLUMNS}
              contentContainerStyle={styles.grid}
              columnWrapperStyle={styles.row}
              showsVerticalScrollIndicator={false}
            />
          )}

          <Text style={styles.attribution}>{t('chat.poweredByGiphy')}</Text>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function makeStyles(c: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    backdrop: {
      flex: 1,
    },
    container: {
      backgroundColor: c.surface,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: '70%',
      paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 8,
    },
    title: {
      fontSize: 18,
      fontFamily: Fonts.heading,
      color: c.text,
    },
    searchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.surfaceSecondary,
      borderRadius: 12,
      marginHorizontal: 16,
      marginBottom: 8,
      paddingHorizontal: 12,
      gap: 8,
    },
    searchInput: {
      flex: 1,
      height: 40,
      fontSize: 15,
      fontFamily: Fonts.body,
      color: c.text,
    },
    centered: {
      paddingVertical: 40,
      alignItems: 'center',
    },
    grid: {
      paddingHorizontal: 16,
      paddingBottom: 8,
    },
    row: {
      gap: GAP,
      marginBottom: GAP,
    },
    gifItem: {
      width: THUMB_WIDTH,
      height: THUMB_WIDTH * 0.75,
      borderRadius: 8,
      overflow: 'hidden',
    },
    gifImage: {
      width: '100%',
      height: '100%',
    },
    attribution: {
      textAlign: 'center',
      fontSize: 11,
      fontFamily: Fonts.body,
      color: c.textTertiary,
      paddingVertical: 6,
    },
  });
}
