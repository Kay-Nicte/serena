import { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { Fonts } from '@/constants/fonts';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({ label, error, secureTextEntry, multiline, style, ...props }: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [hidden, setHidden] = useState(true);
  const Colors = useColors();
  const styles = makeStyles(Colors);

  const isPassword = secureTextEntry !== undefined;

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[
        styles.inputWrapper,
        multiline && styles.inputWrapperMultiline,
        isFocused && styles.inputFocused,
        error && styles.inputError,
      ]}>
        <TextInput
          style={[styles.input, multiline && styles.inputMultiline, isPassword && styles.inputWithIcon, style]}
          placeholderTextColor={Colors.textTertiary}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={isPassword ? hidden : false}
          multiline={multiline}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity
            onPress={() => setHidden(!hidden)}
            style={styles.eyeButton}
            hitSlop={8}
          >
            <Ionicons
              name={hidden ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={Colors.textTertiary}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

function makeStyles(c: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    container: {
      gap: 6,
    },
    label: {
      fontSize: 14,
      fontFamily: Fonts.bodyMedium,
      color: c.textSecondary,
      marginLeft: 4,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: 52,
      borderRadius: 16,
      borderWidth: 1.5,
      borderColor: c.border,
      backgroundColor: c.surface,
    },
    inputWrapperMultiline: {
      minHeight: 100,
      alignItems: 'flex-start',
    },
    input: {
      flex: 1,
      height: '100%',
      paddingHorizontal: 16,
      fontSize: 16,
      fontFamily: Fonts.body,
      color: c.text,
    },
    inputMultiline: {
      height: undefined,
      minHeight: 96,
      paddingTop: 14,
      paddingBottom: 14,
      textAlignVertical: 'top',
    },
    inputWithIcon: {
      paddingRight: 4,
    },
    inputFocused: {
      borderColor: c.primary,
    },
    inputError: {
      borderColor: c.error,
    },
    eyeButton: {
      paddingHorizontal: 12,
    },
    error: {
      fontSize: 12,
      fontFamily: Fonts.body,
      color: c.error,
      marginLeft: 4,
    },
  });
}
