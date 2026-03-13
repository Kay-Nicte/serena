import { TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { useColors } from '@/hooks/useColors';

export function ProfileAvatarButton() {
  const router = useRouter();
  const avatarUrl = useAuthStore((s) => s.profile?.avatar_url);
  const Colors = useColors();

  return (
    <TouchableOpacity
      onPress={() => router.push('/(tabs)/profile')}
      activeOpacity={0.7}
      hitSlop={8}
    >
      {avatarUrl ? (
        <Image
          source={{ uri: avatarUrl }}
          style={[styles.avatar, { borderColor: Colors.border }]}
          contentFit="cover"
          transition={150}
        />
      ) : (
        <Ionicons name="person-circle-outline" size={32} color={Colors.textSecondary} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
  },
});
