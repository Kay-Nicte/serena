import { View, Text, StyleSheet, Modal } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors } from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';

interface MatchOverlayProps {
  visible: boolean;
  onChat: () => void;
  onKeepExploring: () => void;
}

export function MatchOverlay({ visible, onChat, onKeepExploring }: MatchOverlayProps) {
  const { t } = useTranslation();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons name="heart" size={64} color={Colors.primary} />
          </View>

          <Text style={styles.title}>{t('match.title')}</Text>
          <Text style={styles.subtitle}>{t('match.subtitle')}</Text>

          <View style={styles.buttons}>
            <Button
              title={t('match.sendMessage')}
              onPress={onChat}
              variant="primary"
              style={styles.chatButton}
            />
            <Button
              title={t('match.keepExploring')}
              onPress={onKeepExploring}
              variant="outline"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  content: {
    backgroundColor: Colors.surface,
    borderRadius: 28,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primaryPastel,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: Fonts.heading,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: Fonts.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 28,
  },
  buttons: {
    width: '100%',
    gap: 12,
  },
  chatButton: {
    width: '100%',
  },
});
