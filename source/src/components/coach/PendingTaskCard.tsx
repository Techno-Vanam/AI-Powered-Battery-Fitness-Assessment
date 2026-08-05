import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AlertCircle, RefreshCw, Clock, ArrowRight } from 'lucide-react-native';
import { PendingTaskItem } from '../../services/dashboardService';

interface PendingTaskCardProps {
  task: PendingTaskItem;
  onResolve: (task: PendingTaskItem) => void;
}

export const PendingTaskCard: React.FC<PendingTaskCardProps> = ({ task, onResolve }) => {
  const getTaskTheme = (type: PendingTaskItem['type']) => {
    switch (type) {
      case 'pending_sync':
        return {
          borderColor: '#F59E0B',
          bgColor: '#FFFBEB',
          badgeText: 'Sync Required',
          badgeColor: '#D97706',
          icon: <RefreshCw size={18} color="#D97706" />,
          actionText: 'Sync Now',
        };
      case 'incomplete_assessment':
        return {
          borderColor: '#3B82F6',
          bgColor: '#EFF6FF',
          badgeText: 'Incomplete',
          badgeColor: '#2563EB',
          icon: <Clock size={18} color="#2563EB" />,
          actionText: 'Resume Test',
        };
      case 'generate_report':
        return {
          borderColor: '#8B5CF6',
          bgColor: '#F5F3FF',
          badgeText: 'Report Ready',
          badgeColor: '#7C3AED',
          icon: <AlertCircle size={18} color="#7C3AED" />,
          actionText: 'Generate Report',
        };
      default:
        return {
          borderColor: '#EF4444',
          bgColor: '#FEF2F2',
          badgeText: 'Pending',
          badgeColor: '#DC2626',
          icon: <AlertCircle size={18} color="#DC2626" />,
          actionText: 'Resolve Task',
        };
    }
  };

  const theme = getTaskTheme(task.type);

  return (
    <View style={[styles.card, { borderColor: theme.borderColor, backgroundColor: theme.bgColor }]}>
      <View style={styles.topRow}>
        <View style={styles.iconTitleRow}>
          {theme.icon}
          <Text style={styles.title} numberOfLines={1}>{task.title}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: `${theme.badgeColor}20` }]}>
          <Text style={[styles.badgeText, { color: theme.badgeColor }]}>{theme.badgeText}</Text>
        </View>
      </View>

      <Text style={styles.subtitle}>{task.subtitle}</Text>

      <TouchableOpacity
        style={[styles.actionBtn, { backgroundColor: theme.badgeColor }]}
        onPress={() => onResolve(task)}
        activeOpacity={0.8}
      >
        <Text style={styles.actionBtnText}>{theme.actionText}</Text>
        <ArrowRight size={14} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    marginBottom: 10,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  iconTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 12,
    color: '#475569',
    marginTop: 6,
    lineHeight: 16,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
