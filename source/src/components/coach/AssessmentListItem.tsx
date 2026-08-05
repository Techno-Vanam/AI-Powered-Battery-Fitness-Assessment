import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronRight, Users, Play, CheckCircle } from 'lucide-react-native';
import { CurrentAssessment } from '../../services/dashboardService';

interface AssessmentListItemProps {
  assessment: CurrentAssessment;
  onPress: (assessment: CurrentAssessment) => void;
}

export const AssessmentListItem: React.FC<AssessmentListItemProps> = ({
  assessment,
  onPress,
}) => {
  const isCompleted = assessment.status === 'completed';
  const statusColor = isCompleted ? '#10B981' : '#F59E0B';

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(assessment)}
      activeOpacity={0.7}
    >
      <View style={styles.headerRow}>
        <View style={styles.titleColumn}>
          <Text style={styles.title} numberOfLines={1}>{assessment.title}</Text>
          <View style={styles.subRow}>
            <Users size={13} color="#64748B" />
            <Text style={styles.className}>{assessment.class_name}</Text>
            <Text style={styles.dot}>•</Text>
            <Text style={styles.studentCount}>{assessment.student_count} Athletes</Text>
          </View>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
          {isCompleted ? (
            <CheckCircle size={12} color="#10B981" />
          ) : (
            <Play size={12} color="#F59E0B" />
          )}
          <Text style={[styles.statusText, { color: statusColor }]}>
            {isCompleted ? 'Complete' : 'In Progress'}
          </Text>
        </View>
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressLabels}>
          <Text style={styles.progressText}>
            Progress: <Text style={styles.highlightText}>{assessment.completed_count}/{assessment.student_count}</Text>
          </Text>
          <Text style={styles.percentText}>{assessment.progress_percent}%</Text>
        </View>

        <View style={styles.track}>
          <View
            style={[
              styles.bar,
              { width: `${Math.min(100, Math.max(0, assessment.progress_percent))}%`, backgroundColor: statusColor },
            ]}
          />
        </View>
      </View>

      <View style={styles.actionRow}>
        <Text style={styles.actionLabel}>
          {isCompleted ? 'View Full Scorecard' : 'Continue Battery Assessment'}
        </Text>
        <ChevronRight size={16} color="#7C3AED" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  titleColumn: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  className: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  dot: {
    fontSize: 12,
    color: '#94A3B8',
  },
  studentCount: {
    fontSize: 12,
    color: '#64748B',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  progressSection: {
    marginTop: 14,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressText: {
    fontSize: 12,
    color: '#64748B',
  },
  highlightText: {
    fontWeight: '700',
    color: '#0F172A',
  },
  percentText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  track: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 4,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#7C3AED',
  },
});
