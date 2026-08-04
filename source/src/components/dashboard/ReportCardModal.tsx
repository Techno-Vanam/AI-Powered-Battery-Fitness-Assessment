import React from 'react';
import {
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppText from '../ui/AppText';
import SFSymbol from '../ui/SFSymbol';
import AthleteReportCard from './AthleteReportCard';
import type { AthleteDashboardData } from '../../types/athleteDashboard';

type Props = {
  visible: boolean;
  onClose: () => void;
  data?: AthleteDashboardData | null;
  onDownload?: () => void;
  onShare?: () => void;
};

export default function ReportCardModal({
  visible,
  onClose,
  data,
  onDownload,
}: Props) {
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(insets.top + 8, 48);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent />
      <View style={styles.container}>
        {/* TOP TOOLBAR WITH SAFE AREA PADDING (ICON ONLY BUTTONS) */}
        <View style={[styles.toolbar, { paddingTop: topPadding }]}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.8}>
            <SFSymbol name="xmark" size={18} color="#0F172A" />
          </TouchableOpacity>

          <View style={styles.titleBox}>
            <AppText style={styles.modalTitle} numberOfLines={1}>Athlete Report Card</AppText>
            <AppText style={styles.modalSub}>ASMT-2026-0804-001</AppText>
          </View>

          {onDownload ? (
            <TouchableOpacity style={styles.downloadBtn} onPress={onDownload} activeOpacity={0.8}>
              <SFSymbol name="arrow.down.doc" size={18} color="#2563EB" />
            </TouchableOpacity>
          ) : (
            <View style={styles.spacerRight} />
          )}
        </View>

        {/* VERTICAL-ONLY SCROLLABLE REPORT CARD */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
          bounces={false}
        >
          <AthleteReportCard data={data} reportId="ASMT-2026-0804-001" assessmentDate="04 Aug 2026" />
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  titleBox: {
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSub: {
    fontSize: 11,
    color: '#64748B',
  },
  downloadBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  spacerRight: {
    width: 36,
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    padding: 12,
    paddingBottom: 40,
  },
});
