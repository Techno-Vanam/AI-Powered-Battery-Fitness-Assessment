import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ArrowLeft, Check } from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { useTranslation } from '../../i18n';
import { colors } from '../../theme/colors';

interface LanguageSelectionScreenProps {
  onBack: () => void;
}

export const LanguageSelectionScreen: React.FC<LanguageSelectionScreenProps> = ({ onBack }) => {
  const { settings, updateSettings } = useApp();
  const t = useTranslation();

  const handleSelect = (lang: 'English' | 'Hindi') => {
    updateSettings({ language: lang });
    onBack();
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <ArrowLeft size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('language_selection')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        {(['English', 'Hindi'] as const).map(lang => {
          const isSel = settings.language === lang;
          return (
            <TouchableOpacity
              key={lang}
              style={[styles.row, isSel && styles.rowActive]}
              onPress={() => handleSelect(lang)}
            >
              <Text style={[styles.langText, isSel && styles.langTextActive]}>
              {lang === 'English' ? t('lang_english') : t('lang_hindi')}
              </Text>
              {isSel && <Check size={18} color={colors.primary} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  backBtn: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  content: {
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 10,
  },
  rowActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  langText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  langTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
});
