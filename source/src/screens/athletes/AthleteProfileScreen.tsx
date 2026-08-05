import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { ArrowLeft, TrendingUp, Edit3, Cpu, CheckCircle, FileText } from 'lucide-react-native';
import { Athlete } from '../../types/app';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { TestResultRow } from '../../components/ui/TestResultRow';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { colors } from '../../theme/colors';
import { layout } from '../../theme/layout';

interface AthleteProfileScreenProps {
  athlete: Athlete;
  onBack: () => void;
  onOpenProgress: (athlete: Athlete) => void;
  onOpenReportCard?: (athlete: Athlete) => void;
  onEditAthlete: (athlete: Athlete) => void;
}

export const AthleteProfileScreen: React.FC<AthleteProfileScreenProps> = ({
  athlete,
  onBack,
  onOpenProgress,
  onOpenReportCard,
  onEditAthlete,
}) => {
  const confidence = athlete.aiConfidence || 92;

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <ArrowLeft size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Athlete Profile</Text>
        <TouchableOpacity style={styles.progressLink} onPress={() => onOpenProgress(athlete)}>
          <TrendingUp size={16} color={colors.primary} style={{ marginRight: 4 }} />
          <Text style={styles.progressText}>Progress</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Header Card */}
        <View style={[styles.headerCard, layout.shadowSubtle]}>
          <View style={styles.headerTopRow}>
            <View style={styles.avatarLarge}>
              <Text style={styles.avatarInitials}>{athlete.initials}</Text>
            </View>
            <TouchableOpacity style={styles.editBtn} onPress={() => onEditAthlete(athlete)}>
              <Edit3 size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.athleteName}>{athlete.name}</Text>
          <Text style={styles.athleteSubText}>
            {athlete.sport} · {athlete.school}
          </Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 8 }}>
            <StatusBadge status={athlete.status} />
            {onOpenReportCard && (
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#002B66',
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 14,
                }}
                onPress={() => onOpenReportCard(athlete)}
              >
                <FileText size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
                <Text style={{ fontSize: 12, fontWeight: '700', color: '#FFFFFF' }}>
                  Report Card
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Stats Row (Overall Score numeric value strictly inside Profile stats row) */}
        <View style={styles.statsGrid}>
          <View style={[styles.statTile, layout.shadowSubtle]}>
            <Text style={styles.statVal}>{athlete.overallScore || 85}</Text>
            <Text style={styles.statLbl}>Overall Score</Text>
          </View>
          <View style={[styles.statTile, layout.shadowSubtle]}>
            <Text style={styles.statVal}>{athlete.bmi || 21.4}</Text>
            <Text style={styles.statLbl}>BMI</Text>
          </View>
          <View style={[styles.statTile, layout.shadowSubtle]}>
            <Text style={styles.statVal}>{athlete.age}</Text>
            <Text style={styles.statLbl}>Age</Text>
          </View>
          <View style={[styles.statTile, layout.shadowSubtle]}>
            <Text style={styles.statVal}>{athlete.height || 172} cm</Text>
            <Text style={styles.statLbl}>Height</Text>
          </View>
        </View>

        <View style={[styles.statsGrid, { marginTop: 10 }]}>
          <View style={[styles.statTile, layout.shadowSubtle]}>
            <Text style={styles.statVal}>{athlete.weight || 64} kg</Text>
            <Text style={styles.statLbl}>Weight</Text>
          </View>
          <View style={[styles.statTile, layout.shadowSubtle]}>
            <Text style={styles.statVal}>{athlete.gender}</Text>
            <Text style={styles.statLbl}>Gender</Text>
          </View>
          <View style={[styles.statTile, layout.shadowSubtle]}>
            <Text style={styles.statVal}>{athlete.assessmentDate || '04 Aug'}</Text>
            <Text style={styles.statLbl}>Assessed Date</Text>
          </View>
          <View style={[styles.statTile, layout.shadowSubtle]}>
            <Text style={styles.statVal} numberOfLines={1}>
              {athlete.coachName || 'Rajesh K.'}
            </Text>
            <Text style={styles.statLbl}>Coach</Text>
          </View>
        </View>

        {/* AI Confidence Card */}
        <View style={[styles.card, layout.shadowSubtle, { marginTop: 16 }]}>
          <View style={styles.cardHeaderRow}>
            <Cpu size={18} color={colors.primary} style={{ marginRight: 8 }} />
            <Text style={styles.cardTitle}>AI Confidence</Text>
            <Text style={styles.confidenceScore}>{confidence}%</Text>
          </View>

          <ProgressBar progress={confidence} color={colors.success} height={8} />
          <Text style={styles.confidenceNote}>
            Computer vision & sensor posture alignment validation high precision score.
          </Text>
        </View>

        {/* Test Results (List all 10 tests) */}
        <View style={[styles.card, layout.shadowSubtle, { marginTop: 16 }]}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>10 Test Battery Results</Text>
            <Text style={styles.testProgressText}>
              {athlete.testsCompleted}/10 Completed
            </Text>
          </View>

          {athlete.testResults.map(tr => (
            <TestResultRow key={tr.testId} test={tr} />
          ))}
        </View>

        {/* Recommendations Section */}
        <View style={[styles.card, layout.shadowSubtle, { marginTop: 16, marginBottom: 24 }]}>
          <Text style={styles.cardTitle}>AI-Generated Recommendations</Text>
          {(athlete.recommendations || [
            'Focus on endurance training — below average for age group',
            'Sprint drills 3× per week recommended',
            'Excellent flexibility — maintain with yoga sessions',
            'Maintain current BMI with balanced diet',
            'Hydration & recovery protocol recommended',
          ]).map((rec, i) => (
            <View key={i} style={styles.recItem}>
              <CheckCircle size={15} color={colors.success} style={styles.recDot} />
              <Text style={styles.recText}>{rec}</Text>
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
  progressLink: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  scrollContent: {
    padding: 16,
  },
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: layout.cardRadius,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    alignItems: 'center',
  },
  headerTopRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  avatarLarge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.primary,
  },
  editBtn: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  athleteName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  athleteSubText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  statTile: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 10,
    alignItems: 'center',
    marginHorizontal: 3,
  },
  statVal: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  statLbl: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: layout.cardRadius,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1,
  },
  confidenceScore: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.success,
  },
  confidenceNote: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 8,
  },
  testProgressText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  recItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 10,
  },
  recDot: {
    marginRight: 8,
    marginTop: 2,
  },
  recText: {
    flex: 1,
    fontSize: 13,
    color: colors.textPrimary,
    lineHeight: 18,
  },
});
