import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RefreshCw, Wifi, WifiOff, CheckCircle2 } from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { colors } from '../../theme/colors';

export const SyncBanner: React.FC = () => {
  const { isOnline, pendingSyncCount, isSyncing, triggerSync, toastMessage } = useApp();

  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <View style={styles.wrapper}>
      {toastMessage && (
        <View style={[styles.banner, styles.toastBanner]}>
          <CheckCircle2 size={18} color={colors.success} style={styles.icon} />
          <Text style={styles.toastText} numberOfLines={1}>
            {toastMessage}
          </Text>
        </View>
      )}

      {!toastMessage && isOnline && pendingSyncCount === 0 && (
        <View style={[styles.banner, styles.onlineBanner]}>
          <View style={styles.leftRow}>
            <Wifi size={16} color={colors.success} style={styles.icon} />
            <Text style={styles.onlineText}>All data synced — Today, {currentTime}</Text>
          </View>
          <TouchableOpacity onPress={triggerSync} disabled={isSyncing}>
            <RefreshCw size={16} color={colors.success} style={isSyncing ? styles.spinIcon : undefined} />
          </TouchableOpacity>
        </View>
      )}

      {!toastMessage && (!isOnline || pendingSyncCount > 0) && (
        <View style={[styles.banner, styles.offlineBanner]}>
          <View style={styles.leftRow}>
            <WifiOff size={16} color={colors.warning} style={styles.icon} />
            <Text style={styles.offlineText}>
              Offline Mode — {pendingSyncCount} Assessment{pendingSyncCount === 1 ? '' : 's'} waiting to sync
            </Text>
          </View>
          {isOnline && (
            <TouchableOpacity onPress={triggerSync} disabled={isSyncing} style={styles.syncBtn}>
              <Text style={styles.syncBtnText}>{isSyncing ? 'Syncing...' : 'Sync Now'}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    marginRight: 8,
  },
  onlineBanner: {
    backgroundColor: colors.successBg,
    borderColor: colors.successBorder,
  },
  onlineText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.success,
  },
  offlineBanner: {
    backgroundColor: colors.warningBg,
    borderColor: colors.warningBorder,
  },
  offlineText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.warning,
    flex: 1,
  },
  toastBanner: {
    backgroundColor: colors.successBg,
    borderColor: colors.successBorder,
  },
  toastText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.success,
    flex: 1,
  },
  syncBtn: {
    backgroundColor: colors.warning,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  syncBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  spinIcon: {
    opacity: 0.6,
  },
});
