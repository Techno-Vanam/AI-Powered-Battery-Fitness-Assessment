import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { ArrowLeft, RefreshCw, Wifi, WifiOff, CheckCircle2 } from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { StatCard } from '../../components/ui/StatCard';
import { colors } from '../../theme/colors';
import { layout } from '../../theme/layout';

interface OfflineSyncScreenProps {
  onBack: () => void;
}

export const OfflineSyncScreen: React.FC<OfflineSyncScreenProps> = ({ onBack }) => {
  const { isOnline, pendingSyncCount, isSyncing, triggerSync } = useApp();

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <ArrowLeft size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Offline Sync & Queue</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Connection Card */}
        <View style={[styles.card, layout.shadowSubtle]}>
          <View style={styles.statusRow}>
            {isOnline ? (
              <Wifi size={24} color={colors.success} style={{ marginRight: 10 }} />
            ) : (
              <WifiOff size={24} color={colors.warning} style={{ marginRight: 10 }} />
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.statusTitle}>
                {isOnline ? 'Online — Server Connected' : 'Offline Mode Active'}
              </Text>
              <Text style={styles.statusSub}>
                {isOnline
                  ? 'All local SQLite changes automatically background synced'
                  : 'Assessment writes queued locally with idempotency key'}
              </Text>
            </View>
          </View>
        </View>

        {/* Sync Stats */}
        <View style={styles.statsRow}>
          <StatCard label="Pending Queue" value={pendingSyncCount} color={colors.warning} />
          <View style={{ width: 8 }} />
          <StatCard label="Deduplication Keys" value="Active" color={colors.success} />
        </View>

        {/* Action Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.syncBtn, isSyncing && styles.syncBtnDisabled]}
          onPress={triggerSync}
          disabled={isSyncing || pendingSyncCount === 0}
        >
          <RefreshCw size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.syncBtnText}>
            {isSyncing ? 'Syncing Queue...' : 'Force Sync Now'}
          </Text>
        </TouchableOpacity>

        {/* Log Stream Simulation */}
        <View style={[styles.card, layout.shadowSubtle, { marginTop: 16 }]}>
          <Text style={styles.logHeader}>SQLite Sync Log</Text>

          {[
            { id: 1, text: '[SQLite] Created idempotency key idempotency-ath-101-t1', time: '14:20:01' },
            { id: 2, text: '[SyncQueue] Append-only assessment record queued', time: '14:20:02' },
            { id: 3, text: '[NetInfo] NetInfo online signal detected', time: '14:20:10' },
            { id: 4, text: '[SyncService] Sync Complete - 18 Assessments uploaded', time: '14:20:12' },
          ].map(log => (
            <View key={log.id} style={styles.logItem}>
              <CheckCircle2 size={14} color={colors.success} style={{ marginRight: 8 }} />
              <Text style={styles.logText}>{log.text}</Text>
              <Text style={styles.logTime}>{log.time}</Text>
            </View>
          ))}
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
    padding: 16,
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  statusSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  syncBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: layout.buttonRadius, // 12px
    height: 50,
  },
  syncBtnDisabled: {
    opacity: 0.5,
  },
  syncBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  logHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 10,
  },
  logItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  logText: {
    flex: 1,
    fontSize: 11,
    fontFamily: 'monospace',
    color: colors.textPrimary,
  },
  logTime: {
    fontSize: 10,
    color: colors.textSecondary,
    marginLeft: 6,
  },
});
