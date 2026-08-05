import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { ArrowLeft, Activity, ShieldCheck } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { layout } from '../../theme/layout';
import { useTranslation } from '../../i18n';

interface AboutAppScreenProps {
  onBack: () => void;
}

export const AboutAppScreen: React.FC<AboutAppScreenProps> = ({ onBack }) => {
  const t = useTranslation();
  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <ArrowLeft size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('about_title')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, layout.shadowSubtle]}>
          <View style={styles.logoCircle}>
            <Activity size={40} color={colors.primary} />
          </View>
          <Text style={styles.appName}>AI Battery Fitness Assessment</Text>
          <Text style={styles.appVersion}>{t('about_version')} 1.0.0 ({t('about_build')} 2026.07)</Text>

          <Text style={styles.description}>
            {t('about_description')}
          </Text>

          <View style={styles.infoBadge}>
            <ShieldCheck size={16} color={colors.success} style={{ marginRight: 6 }} />
            <Text style={styles.badgeText}>Official MYAS / SAI Assessment Protocol Compliant</Text>
          </View>
        </View>
      </ScrollView>
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
  scrollContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: layout.cardRadius,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 24,
    alignItems: 'center',
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
    textAlign: 'center',
  },
  appVersion: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  description: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.successBg,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.success,
  },
});
