import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, FlatList } from 'react-native';
import { ArrowLeft, Bell, Check, Wifi, AlertTriangle } from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { colors } from '../../theme/colors';

interface NotificationsScreenProps {
  onBack: () => void;
}

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ onBack }) => {
  const { notifications, markAllNotificationsRead } = useApp();

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <ArrowLeft size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notification Center</Text>
        <TouchableOpacity style={styles.markReadBtn} onPress={markAllNotificationsRead}>
          <Text style={styles.markReadText}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          let IconComponent = Bell;
          let iconBg = colors.primaryLight;
          let iconColor = colors.primary;

          if (item.type === 'sync_complete' || item.type === 'connection_restored') {
            IconComponent = Wifi;
            iconBg = colors.successBg;
            iconColor = colors.success;
          } else if (item.type === 'offline_alert') {
            IconComponent = AlertTriangle;
            iconBg = colors.warningBg;
            iconColor = colors.warning;
          }

          return (
            <View style={[styles.notifCard, !item.isRead && styles.unreadCard]}>
              <View style={[styles.iconCircle, { backgroundColor: iconBg }]}>
                <IconComponent size={20} color={iconColor} />
              </View>
              <View style={styles.cardContent}>
                <View style={styles.titleRow}>
                  <Text style={styles.notifTitle}>{item.title}</Text>
                  <Text style={styles.timestamp}>{item.timestamp}</Text>
                </View>
                <Text style={styles.notifBody}>{item.body}</Text>
              </View>
            </View>
          );
        }}
      />
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
  markReadBtn: {
    padding: 6,
  },
  markReadText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  listContent: {
    padding: 16,
  },
  notifCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 10,
  },
  unreadCard: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  notifTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  timestamp: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  notifBody: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});
