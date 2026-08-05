import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CheckCircle, FileText, RefreshCw, UserPlus } from 'lucide-react-native';
import { ActivityItem } from '../../services/dashboardService';

interface ActivityFeedItemProps {
  activity: ActivityItem;
}

export const ActivityFeedItem: React.FC<ActivityFeedItemProps> = ({ activity }) => {
  const getIconAndColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'test_completed':
        return {
          icon: <CheckCircle size={16} color="#10B981" />,
          bgColor: '#ECFDF5',
        };
      case 'report_generated':
        return {
          icon: <FileText size={16} color="#7C3AED" />,
          bgColor: '#F5F3FF',
        };
      case 'sync_completed':
        return {
          icon: <RefreshCw size={16} color="#0284C7" />,
          bgColor: '#F0F9FF',
        };
      case 'athlete_added':
        return {
          icon: <UserPlus size={16} color="#D97706" />,
          bgColor: '#FFFBEB',
        };
      default:
        return {
          icon: <CheckCircle size={16} color="#64748B" />,
          bgColor: '#F1F5F9',
        };
    }
  };

  const { icon, bgColor } = getIconAndColor(activity.type);

  return (
    <View style={styles.container}>
      <View style={[styles.iconBox, { backgroundColor: bgColor }]}>{icon}</View>
      <View style={styles.textContainer}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>{activity.title}</Text>
          <Text style={styles.time}>{activity.timestamp}</Text>
        </View>
        <Text style={styles.description} numberOfLines={2}>{activity.description}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },
  time: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '500',
  },
  description: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 16,
  },
});
