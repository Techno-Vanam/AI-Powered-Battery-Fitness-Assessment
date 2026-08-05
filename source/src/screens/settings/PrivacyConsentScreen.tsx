import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { ArrowLeft, ShieldCheck, Lock } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { layout } from '../../theme/layout';

interface PrivacyConsentScreenProps {
  onBack: () => void;
}

export const PrivacyConsentScreen: React.FC<PrivacyConsentScreenProps> = ({ onBack }) => {
  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <ArrowLeft size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy & Data Protection</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, layout.shadowSubtle]}>
          <ShieldCheck size={36} color={colors.success} style={{ marginBottom: 12 }} />
          <Text style={styles.title}>Data Security & Parental Consent</Text>
          <Text style={styles.paragraph}>
            This application complies with Digital Personal Data Protection (DPDP) Act requirements
            and National Sports Repository System (NSRS) compliance frameworks.
          </Text>

          <Text style={styles.subTitle}>1. Minor Data Protection</Text>
          <Text style={styles.paragraph}>
            All athlete assessment data for individuals under 18 years of age requires mandatory digital
            parental or legal guardian authorization prior to record creation.
          </Text>

          <Text style={styles.subTitle}>2. On-Device Encryption & SQLite Sync</Text>
          <Text style={styles.paragraph}>
            Offline local cache stored on mobile devices is encrypted with AES-256 standards. Central synchronization
            utilizes TLS 1.3 protocol with idempotency token verification.
          </Text>

          <View style={styles.lockBox}>
            <Lock size={16} color={colors.primary} style={{ marginRight: 6 }} />
            <Text style={styles.lockText}>Zero raw video files saved on public cloud servers.</Text>
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
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  subTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 14,
    marginBottom: 4,
  },
  paragraph: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  lockBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: 10,
    padding: 12,
    marginTop: 16,
  },
  lockText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
});
