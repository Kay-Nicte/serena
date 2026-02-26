import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors } from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';

const MAX_MESSAGE_LENGTH = 500;

interface IceBreakerModalProps {
  visible: boolean;
  onSend: (message: string) => void;
  onClose: () => void;
  recipientName: string;
}

export function IceBreakerModal({
  visible,
  onSend,
  onClose,
  recipientName,
}: IceBreakerModalProps) {
  const { t } = useTranslation();
  const [message, setMessage] = useState('');

  const handleSend = () => {
    const trimmed = message.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setMessage('');
  };

  const handleClose = () => {
    setMessage('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons name="chatbubble-ellipses" size={40} color={Colors.primary} />
          </View>

          <Text style={styles.title}>{t('iceBreaker.send')}</Text>
          <Text style={styles.subtitle}>{recipientName}</Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={message}
              onChangeText={setMessage}
              placeholder={t('iceBreaker.messagePlaceholder')}
              placeholderTextColor={Colors.textTertiary}
              multiline
              maxLength={MAX_MESSAGE_LENGTH}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>
              {t('iceBreaker.charCount', {
                current: message.length,
                max: MAX_MESSAGE_LENGTH,
              })}
            </Text>
          </View>

          <View style={styles.buttons}>
            <Button
              title={t('iceBreaker.send')}
              onPress={handleSend}
              variant="primary"
              disabled={!message.trim()}
            />
            <Button
              title={t('common.cancel')}
              onPress={handleClose}
              variant="ghost"
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    backgroundColor: Colors.surface,
    borderRadius: 28,
    padding: 28,
    alignItems: 'center',
    width: '100%',
    maxWidth: 380,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primaryPastel,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontFamily: Fonts.heading,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: Fonts.bodySemiBold,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    minHeight: 120,
    maxHeight: 180,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    fontSize: 15,
    fontFamily: Fonts.body,
    color: Colors.text,
  },
  charCount: {
    fontSize: 12,
    fontFamily: Fonts.body,
    color: Colors.textTertiary,
    textAlign: 'right',
    marginTop: 6,
    marginRight: 4,
  },
  buttons: {
    width: '100%',
    gap: 8,
  },
});
