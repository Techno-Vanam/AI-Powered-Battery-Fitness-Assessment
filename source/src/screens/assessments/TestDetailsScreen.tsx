import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, FlatList } from 'react-native';
import { ArrowLeft, Play } from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { Athlete } from '../../types/app';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { colors } from '../../theme/colors';
import { layout } from '../../theme/layout';

interface TestDetailsScreenProps {
  testId: string;
  testName: string;
  onBack: () => void;
  onStartAssessment: (athlete: Athlete, testId: string) => void;
}

export const TestDetailsScreen: React.FC<TestDetailsScreenProps> = ({
  testId,
  testName,
  onBack,
  onStartAssessment,
}) => {
  const { athletes } = useApp();

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <ArrowLeft size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{testName} Test</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={athletes}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const testRes = item.testResults.find(r => r.testId === testId);
          const isComp = testRes?.isCompleted;

          return (
            <View style={[styles.card, layout.shadowSubtle]}>
              <View style={styles.avatarCircle}>
                <Text style={styles.initials}>{item.initials}</Text>
              </View>

              <View style={styles.infoCol}>
                <Text style={styles.athleteName}>{item.name}</Text>
                <Text style={styles.schoolText}>{item.school}</Text>
                <View style={{ marginTop: 4 }}>
                  <StatusBadge status={isComp ? 'Completed' : 'Pending'} />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.actionBtn, isComp && styles.actionBtnCont]}
                onPress={() => onStartAssessment(item, testId)}
              >
                <Play size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
                <Text style={styles.actionBtnText}>
                  {isComp ? 'Continue' : 'Start'}
                </Text>
              </TouchableOpacity>
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
  listContent: {
    padding: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: layout.cardRadius,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 10,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  initials: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  infoCol: {
    flex: 1,
    marginRight: 8,
  },
  athleteName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  schoolText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: layout.buttonRadius, // 12px
  },
  actionBtnCont: {
    backgroundColor: colors.success,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
