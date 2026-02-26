import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors } from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';

const REPORT_REASONS = [
  'inappropriate_content',
  'fake_profile',
  'harassment',
  'spam',
  'other',
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number];

interface ReportModalProps {
  visible: boolean;
  targetUserName: string;
  onReport: (reason: ReportReason, description: string, alsoBlock: boolean) => void;
  onBlockOnly: () => void;
  onClose: () => void;
  loading?: boolean;
}

export function ReportModal({
  visible,
  targetUserName,
  onReport,
  onBlockOnly,
  onClose,
  loading = false,
}: ReportModalProps) {
  const { t } = useTranslation();
  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null);
  const [description, setDescription] = useState('');
  const [alsoBlock, setAlsoBlock] = useState(true);

  const handleClose = () => {
    setSelectedReason(null);
    setDescription('');
    setAlsoBlock(true);
    onClose();
  };

  const handleSubmit = () => {
    if (!selectedReason) return;
    onReport(selectedReason, description.trim(), alsoBlock);
    setSelectedReason(null);
    setDescription('');
    setAlsoBlock(true);
  };

  const handleBlockOnly = () => {
    onBlockOnly();
    setSelectedReason(null);
    setDescription('');
    setAlsoBlock(true);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>
                {t('report.title', { name: targetUserName })}
              </Text>
              <TouchableOpacity
                onPress={handleClose}
                style={styles.closeButton}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={22} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Reason selection */}
            <Text style={styles.sectionLabel}>{t('report.selectReason')}</Text>
            <View style={styles.reasons}>
              {REPORT_REASONS.map((reason) => (
                <TouchableOpacity
                  key={reason}
                  style={styles.reasonRow}
                  onPress={() => setSelectedReason(reason)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.radio,
                      selectedReason === reason && styles.radioSelected,
                    ]}
                  >
                    {selectedReason === reason && (
                      <View style={styles.radioInner} />
                    )}
                  </View>
                  <Text style={styles.reasonText}>
                    {t(`report.reason_${reason}`)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Description */}
            <TextInput
              style={styles.descriptionInput}
              placeholder={t('report.descriptionPlaceholder')}
              placeholderTextColor={Colors.textTertiary}
              value={description}
              onChangeText={setDescription}
              multiline
              maxLength={500}
              textAlignVertical="top"
            />

            {/* Also block checkbox */}
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setAlsoBlock(!alsoBlock)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, alsoBlock && styles.checkboxChecked]}>
                {alsoBlock && (
                  <Ionicons name="checkmark" size={14} color={Colors.textOnPrimary} />
                )}
              </View>
              <Text style={styles.checkboxLabel}>{t('report.alsoBlock')}</Text>
            </TouchableOpacity>

            {/* Privacy notice */}
            <View style={styles.privacyNotice}>
              <Ionicons name="eye-outline" size={16} color={Colors.textTertiary} />
              <Text style={styles.privacyText}>{t('report.privacyNotice')}</Text>
            </View>

            {/* Buttons */}
            <View style={styles.buttons}>
              <Button
                title={t('report.submit')}
                onPress={handleSubmit}
                variant="primary"
                disabled={!selectedReason}
                loading={loading}
              />
              <Button
                title={t('report.blockOnly')}
                onPress={handleBlockOnly}
                variant="ghost"
                textStyle={styles.blockOnlyText}
              />
            </View>
          </ScrollView>
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
    padding: 24,
  },
  content: {
    backgroundColor: Colors.surface,
    borderRadius: 28,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontFamily: Fonts.heading,
    color: Colors.text,
    flex: 1,
    marginRight: 8,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionLabel: {
    fontSize: 15,
    fontFamily: Fonts.bodyMedium,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  reasons: {
    gap: 4,
    marginBottom: 16,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    gap: 12,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: Colors.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
  reasonText: {
    fontSize: 15,
    fontFamily: Fonts.body,
    color: Colors.text,
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    padding: 14,
    fontSize: 15,
    fontFamily: Fonts.body,
    color: Colors.text,
    minHeight: 80,
    marginBottom: 16,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkboxLabel: {
    fontSize: 15,
    fontFamily: Fonts.body,
    color: Colors.text,
  },
  privacyNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  privacyText: {
    flex: 1,
    fontSize: 13,
    fontFamily: Fonts.body,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  buttons: {
    gap: 8,
  },
  blockOnlyText: {
    color: Colors.error,
  },
});
