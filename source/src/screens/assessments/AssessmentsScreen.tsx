import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { Plus, Play, ChevronRight, CheckCircle2, Clock } from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { StatCard } from '../../components/ui/StatCard';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { AthleteRow } from '../../components/ui/AthleteRow';
import { STANDARD_10_TESTS } from '../../data/mockData';
import { Athlete } from '../../types/app';
import { colors } from '../../theme/colors';
import { layout } from '../../theme/layout';

interface AssessmentsScreenProps {
  onNewAssessment: () => void;
  onResumeSession: (sessionId: string) => void;
  onSelectTest: (testId: string, testName: string) => void;
  onSelectAthlete: (athlete: Athlete) => void;
  onOpenCompleted: () => void;
  onOpenPending: () => void;
}

export const AssessmentsScreen: React.FC<AssessmentsScreenProps> = ({
  onNewAssessment,
  onResumeSession,
  onSelectTest,
  onSelectAthlete,
  onOpenCompleted,
  onOpenPending,
}) => {
  const { athletes, sessions } = useApp();
  const [selectedType, setSelectedType] = useState<'Test' | 'Athletes'>('Test');

  const completedCount = athletes.filter(a => a.status === 'Completed').length;
  const pendingCount = athletes.filter(a => a.status === 'Pending' || a.status === 'In Progress').length;

  const activeSession = sessions.find(s => s.status === 'In Progress' || s.status === 'Active') || sessions[0];

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Text style={styles.screenTitle}>Assessment</Text>
        <TouchableOpacity style={styles.newBtn} onPress={onNewAssessment}>
          <Plus size={18} color="#FFFFFF" style={{ marginRight: 4 }} />
          <Text style={styles.newBtnText}>New</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Active Session Banner */}
        {activeSession && (
          <View style={[styles.activeCard, layout.shadowSubtle]}>
            <View style={styles.activeHeader}>
              <View style={styles.activePill}>
                <Text style={styles.activePillText}>ACTIVE SESSION</Text>
              </View>
              <TouchableOpacity
                style={styles.resumeBtn}
                onPress={() => onResumeSession(activeSession.id)}
              >
                <Play size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
                <Text style={styles.resumeBtnText}>Resume</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.activeTitle}>{activeSession.sessionName}</Text>
            <Text style={styles.activeSubText}>
              {activeSession.schoolName} · Batch A
            </Text>

            <View style={styles.progressRow}>
              <Text style={styles.progressLabel}>
                {activeSession.assessedCount}/{activeSession.totalAthletes} Assessed
              </Text>
              <Text style={styles.progressPct}>{activeSession.progressPercentage}%</Text>
            </View>

            <ProgressBar progress={activeSession.progressPercentage} color="#FFFFFF" height={8} />
          </View>
        )}

        {/* Summary Cards (Completed Check & Pending Clock Icons) */}
        <View style={styles.summaryRow}>
          <TouchableOpacity style={{ flex: 1, marginRight: 6 }} onPress={onOpenCompleted}>
            <StatCard
              label="Completed Assessments"
              value={completedCount}
              color="#007AFF"
              bgColor="#E5F1FF"
              borderColor="#B3D7FF"
              icon={<CheckCircle2 size={20} color="#007AFF" />}
            />
          </TouchableOpacity>
          <TouchableOpacity style={{ flex: 1, marginLeft: 6 }} onPress={onOpenPending}>
            <StatCard
              label="Pending Assessments"
              value={pendingCount}
              color="#5856D6"
              bgColor="#F0F0FC"
              borderColor="#C6C4F4"
              icon={<Clock size={20} color="#5856D6" />}
            />
          </TouchableOpacity>
        </View>

        {/* Type Selector (Test vs Athletes) */}
        <View style={styles.typeSelectorSection}>
          <Text style={styles.sectionHeader}>Type</Text>
          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[styles.toggleBtn, selectedType === 'Test' && styles.toggleBtnActive]}
              onPress={() => setSelectedType('Test')}
            >
              <Text style={[styles.toggleText, selectedType === 'Test' && styles.toggleTextActive]}>
                Test
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.toggleBtn, selectedType === 'Athletes' && styles.toggleBtnActive]}
              onPress={() => setSelectedType('Athletes')}
            >
              <Text style={[styles.toggleText, selectedType === 'Athletes' && styles.toggleTextActive]}>
                Athletes
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Type Content Display */}
        {selectedType === 'Test' ? (
          <View style={styles.testListSection}>
            {STANDARD_10_TESTS.map(t => (
              <TouchableOpacity
                key={t.testId}
                activeOpacity={0.7}
                style={[styles.testRow, layout.shadowSubtle]}
                onPress={() => onSelectTest(t.testId, t.testName)}
              >
                <View style={styles.testInfo}>
                  <Text style={styles.testTitle}>{t.testName}</Text>
                  <Text style={styles.testCategory}>{t.category} · Unit ({t.unit})</Text>
                </View>
                <ChevronRight size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.athleteListSection}>
            {athletes.slice(0, 10).map(ath => (
              <AthleteRow key={ath.id} athlete={ath} onPress={() => onSelectAthlete(ath)} />
            ))}
          </View>
        )}

        {/* Sessions List */}
        <View style={styles.sessionsSection}>
          <Text style={styles.sectionHeader}>Assessment Sessions</Text>
          {sessions.map(s => (
            <View key={s.id} style={[styles.sessionCard, layout.shadowSubtle]}>
              <View style={styles.sessionTop}>
                <Text style={styles.sessionName}>{s.sessionName}</Text>
                <StatusBadge status={s.status} />
              </View>
              <Text style={styles.sessionSub}>
                {s.schoolName} · Coach {s.coachName} · {s.date}
              </Text>
              <View style={{ marginTop: 8 }}>
                <ProgressBar progress={s.progressPercentage} color={colors.primary} height={6} />
              </View>
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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  newBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: layout.buttonRadius, // 12px
  },
  newBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scrollContent: {
    padding: 16,
  },
  activeCard: {
    backgroundColor: colors.primary,
    borderRadius: layout.cardRadius,
    padding: 16,
    marginBottom: 16,
  },
  activeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  activePill: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  activePillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  resumeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  resumeBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  activeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  activeSubText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 12,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  progressPct: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  summaryRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  typeSelectorSection: {
    marginBottom: 14,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 10,
  },
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
    padding: 4,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  toggleBtnActive: {
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  toggleTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  testListSection: {
    marginBottom: 20,
  },
  testRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: layout.cardRadius,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 10,
  },
  testInfo: {
    flex: 1,
  },
  testTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  testCategory: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  athleteListSection: {
    marginBottom: 20,
  },
  sessionsSection: {
    marginBottom: 20,
  },
  sessionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: layout.cardRadius,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 10,
  },
  sessionTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sessionName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  sessionSub: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionTile: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  actionTileText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
});
