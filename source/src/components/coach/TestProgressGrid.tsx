import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CheckCircle2, Clock, CircleDot } from 'lucide-react-native';
import { TestProgressItem } from '../../services/dashboardService';

interface TestProgressGridProps {
  tests: TestProgressItem[];
  onSelectTest?: (test: TestProgressItem) => void;
}

export const TestProgressGrid: React.FC<TestProgressGridProps> = ({
  tests,
  onSelectTest,
}) => {
  const getStatusChip = (status: TestProgressItem['status']) => {
    switch (status) {
      case 'complete':
        return {
          label: 'Complete',
          bgColor: '#ECFDF5',
          textColor: '#10B981',
          icon: <CheckCircle2 size={12} color="#10B981" />,
        };
      case 'in_progress':
        return {
          label: 'In Progress',
          bgColor: '#FFFBEB',
          textColor: '#D97706',
          icon: <Clock size={12} color="#D97706" />,
        };
      default:
        return {
          label: 'Not Started',
          bgColor: '#F1F5F9',
          textColor: '#64748B',
          icon: <CircleDot size={12} color="#64748B" />,
        };
    }
  };

  return (
    <View style={styles.grid}>
      {tests.map((item) => {
        const chip = getStatusChip(item.status);
        return (
          <TouchableOpacity
            key={item.id || item.test_key}
            style={styles.card}
            onPress={() => onSelectTest?.(item)}
            activeOpacity={0.7}
          >
            <View style={styles.topRow}>
              <Text style={styles.testName} numberOfLines={1}>{item.test_name}</Text>
              <View style={[styles.chip, { backgroundColor: chip.bgColor }]}>
                {chip.icon}
                <Text style={[styles.chipText, { color: chip.textColor }]}>{chip.label}</Text>
              </View>
            </View>

            <View style={styles.bottomRow}>
              <Text style={styles.countText}>
                {item.completed_count}/{item.total_students} completed
              </Text>
              {item.best_value !== undefined && item.best_value !== null && (
                <Text style={styles.bestText}>
                  Best: <Text style={styles.bestVal}>{item.best_value} {item.unit || ''}</Text>
                </Text>
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    gap: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  testName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  chipText: {
    fontSize: 10,
    fontWeight: '700',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  countText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  bestText: {
    fontSize: 11,
    color: '#64748B',
  },
  bestVal: {
    fontWeight: '700',
    color: '#7C3AED',
  },
});
