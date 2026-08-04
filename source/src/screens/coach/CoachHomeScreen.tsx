import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { Bell, Users, Activity, Clock, CheckCircle2 } from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { useTranslation } from '../../i18n';
import { StatCard } from '../../components/ui/StatCard';
import { QuickActionCard } from '../../components/ui/QuickActionCard';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { colors } from '../../theme/colors';
import { layout } from '../../theme/layout';

interface CoachHomeScreenProps {
  onOpenNotifications: () => void;
  onNavigateAddAthlete: () => void;
  onNavigateViewAthletes: () => void;
  onNavigateViewAllSessions: () => void;
}

export const CoachHomeScreen: React.FC<CoachHomeScreenProps> = ({
  onOpenNotifications,
  onNavigateAddAthlete,
  onNavigateViewAthletes,
  onNavigateViewAllSessions,
}) => {
  const { unreadNotifCount, athletes, sessions, coachProfile } = useApp();
  const t = useTranslation();

  const totalAthletes = athletes.length; // 250
  const completedAthletes = athletes.filter(a => a.status === 'Completed').length; // 142
  const pendingAthletes = athletes.filter(a => a.status === 'Pending').length;     // 18
  const totalAssessments = completedAthletes + pendingAthletes;                    // 160

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('greeting_morning');
    if (hour < 17) return t('greeting_afternoon');
    return t('greeting_evening');
  };

  const coachNameDisplay = coachProfile.name
    ? `Coach ${coachProfile.name.split(' ')[0]}`
    : 'Coach Rajesh';

  return (
    <View style={styles.container}>
      {/* Top Navigation Header with Time Greeting */}
      <View style={styles.topBar}>
        <View style={styles.greetingCol}>
          <Text style={styles.greetingText}>{getGreeting()}</Text>
          <Text style={styles.coachNameText}>{coachNameDisplay}</Text>
        </View>

        <TouchableOpacity style={styles.bellBtn} onPress={onOpenNotifications}>
          <Bell size={22} color={colors.textPrimary} />
          {unreadNotifCount > 0 && (
            <View style={styles.redBadge}>
              <Text style={styles.redBadgeText}>{unreadNotifCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Dashboard Statistics (2x2 Equal Size Grid with Distinct Colors & Icons) */}
        <View style={styles.statsSection}>
          <View style={styles.statsRow}>
            <StatCard
              label={t('stat_total_athletes')}
              value={totalAthletes}
              color="#007AFF"
              bgColor="#E5F1FF"
              borderColor="#B3D7FF"
              icon={<Users size={20} color="#007AFF" />}
            />
            <View style={styles.gridSpacer} />
            <StatCard
              label={t('stat_total_assessments')}
              value={totalAssessments}
              color="#5856D6"
              bgColor="#F0F0FC"
              borderColor="#C6C4F4"
              icon={<Activity size={20} color="#5856D6" />}
            />
          </View>

          <View style={[styles.statsRow, { marginTop: 12 }]}>
            <StatCard
              label={t('stat_pending_assessments')}
              value={pendingAthletes}
              color="#FF9500"
              bgColor="#FFF5E6"
              borderColor="#FFD699"
              icon={<Clock size={20} color="#FF9500" />}
            />
            <View style={styles.gridSpacer} />
            <StatCard
              label={t('stat_completed_assessments')}
              value={completedAthletes}
              color="#34C759"
              bgColor="#E8F9ED"
              borderColor="#A3E9B8"
              icon={<CheckCircle2 size={20} color="#34C759" />}
            />
          </View>
        </View>

        {/* Quick Action Cards (Formatted in App Colors) */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionHeader}>{t('quick_actions')}</Text>
          <QuickActionCard
            title={t('add_athlete')}
            subtitle={t('add_athlete_sub')}
            type="add"
            onPress={onNavigateAddAthlete}
          />
          <QuickActionCard
            title={t('view_athletes')}
            subtitle={t('view_athletes_sub')}
            type="view"
            onPress={onNavigateViewAthletes}
          />
        </View>

        {/* Recent Sessions */}
        <View style={styles.sessionsSection}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionHeader}>{t('recent_sessions')}</Text>
            <TouchableOpacity onPress={onNavigateViewAllSessions}>
              <Text style={styles.viewAllText}>{t('view_all')}</Text>
            </TouchableOpacity>
          </View>

          {sessions.slice(0, 4).map(session => (
            <View key={session.id} style={[styles.sessionCard, layout.shadowSubtle]}>
              <View style={styles.sessionHeaderRow}>
                <Text style={sessionDateStyle(session.status)}>{session.date}</Text>
                <StatusBadge status={session.status} />
              </View>

              <Text style={styles.sessionTitle}>{session.sessionName}</Text>
              <Text style={styles.sessionSubText}>
                {session.schoolName} · Coach {session.coachName}
              </Text>

              <View style={styles.progressRow}>
                <Text style={styles.assessedCountText}>
                  {session.assessedCount}/{session.totalAthletes} {t('athletes_assessed')}
                </Text>
                <Text style={styles.progressPctText}>{session.progressPercentage}{t('complete')}</Text>
              </View>

              <ProgressBar progress={session.progressPercentage} color={colors.primary} height={6} />
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

function sessionDateStyle(_status: string) {
  return styles.sessionDate;
}

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
  greetingCol: {
    flexDirection: 'column',
  },
  greetingText: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.textSecondary,
    marginBottom: 1,
  },
  coachNameText: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.4,
  },
  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  redBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: colors.error,
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  redBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  scrollContent: {
    paddingTop: 12,
    paddingBottom: 24,
  },
  statsSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gridSpacer: {
    width: 12,
  },
  quickActionsSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  sessionsSection: {
    paddingHorizontal: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  sessionCard: {
    backgroundColor: colors.surface,
    borderRadius: layout.cardRadius,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 12,
  },
  sessionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  sessionDate: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  sessionSubText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  assessedCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  progressPctText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
});
