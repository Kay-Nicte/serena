import { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import { updatePresence } from '@/lib/presence';
import { pickImage, uploadChatImage } from '@/lib/storage';

interface ChatInputProps {
  onSend: (content: string, imageUrl?: string) => void;
  matchId: string;
  disabled?: boolean;
  disabledMessage?: string;
}

export function ChatInput({ onSend, matchId, disabled, disabledMessage }: ChatInputProps) {
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);

  const stopTyping = useCallback(() => {
    if (isTypingRef.current) {
      isTypingRef.current = false;
      updatePresence(true, null);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      stopTyping();
    };
  }, [stopTyping]);

  const handleChangeText = (value: string) => {
    setText(value);

    if (value.trim()) {
      if (!isTypingRef.current) {
        isTypingRef.current = true;
        updatePresence(true, matchId);
      }

      // Reset debounce timer
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping();
      }, 2000);
    } else {
      stopTyping();
    }
  };

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    stopTyping();
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    onSend(trimmed);
    setText('');
  };

  const handleImagePick = async () => {
    try {
      const uri = await pickImage();
      if (!uri) return;

      setIsUploading(true);
      const imageUrl = await uploadChatImage(matchId, uri);
      onSend('', imageUrl);
    } catch (error) {
      // Image send failed — error is shown via chat error state
    } finally {
      setIsUploading(false);
    }
  };

  if (disabled) {
    return (
      <View style={[styles.container, styles.containerDisabled]}>
        <Ionicons name="ban" size={18} color={Colors.textTertiary} />
        <Text style={styles.disabledText}>{disabledMessage ?? t('chat.blocked')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.imageButton}
        onPress={handleImagePick}
        disabled={isUploading}
        activeOpacity={0.7}
      >
        {isUploading ? (
          <ActivityIndicator size="small" color={Colors.primary} />
        ) : (
          <Ionicons name="image-outline" size={24} color={Colors.primary} />
        )}
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        value={text}
        onChangeText={handleChangeText}
        placeholder={t('chat.placeholder')}
        placeholderTextColor={Colors.textTertiary}
        multiline
        maxLength={1000}
        onSubmitEditing={handleSend}
        blurOnSubmit={false}
      />
      <TouchableOpacity
        style={[styles.sendButton, !text.trim() && styles.sendButtonDisabled]}
        onPress={handleSend}
        disabled={!text.trim()}
        activeOpacity={0.7}
      >
        <Ionicons
          name="send"
          size={20}
          color={text.trim() ? Colors.textOnPrimary : Colors.textTertiary}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    gap: 8,
  },
  imageButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    fontFamily: Fonts.body,
    color: Colors.text,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: Colors.borderLight,
  },
  containerDisabled: {
    justifyContent: 'center',
    gap: 6,
  },
  disabledText: {
    fontSize: 14,
    fontFamily: Fonts.body,
    color: Colors.textTertiary,
  },
});
