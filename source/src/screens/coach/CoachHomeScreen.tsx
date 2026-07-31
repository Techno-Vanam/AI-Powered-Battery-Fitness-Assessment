import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  ActivityIndicator,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ClipboardList,
  CheckCircle,
  Users,
  RefreshCw,
  FileText,
  TrendingUp,
  Plus,
  Play,
  BarChart3,
  SlidersHorizontal,
  CloudUpload,
} from 'lucide-react-native';

import { CoachHeader } from '../../components/coach/CoachHeader';
import { StatCard } from '../../components/coach/StatCard';
import { PrimaryActionButton } from '../../components/coach/PrimaryActionButton';
import { AssessmentListItem } from '../../components/coach/AssessmentListItem';
import { TestProgressGrid } from '../../components/coach/TestProgressGrid';
import { QuickActionButton } from '../../components/coach/QuickActionButton';
import { ActivityFeedItem } from '../../components/coach/ActivityFeedItem';
import { PendingTaskCard } from '../../components/coach/PendingTaskCard';
import { AnalyticsSummaryCard } from '../../components/coach/AnalyticsSummaryCard';
import { BottomTabBar, TabKey } from '../../components/coach/BottomTabBar';

import {
  fetchCoachStats,
  fetchCurrentAssessments,
  fetchTestProgress,
  fetchRecentActivity,
  fetchPendingTasks,
  fetchAnalyticsPreview,
  INITIAL_COACH_STATS,
  INITIAL_CURRENT_ASSESSMENTS,
  INITIAL_TEST_PROGRESS,
  INITIAL_RECENT_ACTIVITIES,
  INITIAL_PENDING_TASKS,
  INITIAL_ANALYTICS_PREVIEW,
  CoachStats,
  CurrentAssessment,
  TestProgressItem,
  ActivityItem,
  PendingTaskItem,
  AnalyticsPreview,
} from '../../services/dashboardService';

export const CoachHomeScreen = ({ navigation }: any) => {
  const [activeTab, setActiveTab] = useState<TabKey>('Home');
  const [isOffline, setIsOffline] = useState(false);
  const [lastSynced, setLastSynced] = useState<string | undefined>();

  // Data states — pre-initialized for instant zero-flicker native rendering
  const [stats, setStats] = useState<CoachStats>(INITIAL_COACH_STATS);
  const [assessments, setAssessments] = useState<CurrentAssessment[]>(INITIAL_CURRENT_ASSESSMENTS);
  const [testProgress, setTestProgress] = useState<TestProgressItem[]>(INITIAL_TEST_PROGRESS);
  const [activities, setActivities] = useState<ActivityItem[]>(INITIAL_RECENT_ACTIVITIES);
  const [tasks, setTasks] = useState<PendingTaskItem[]>(INITIAL_PENDING_TASKS);
  const [analytics, setAnalytics] = useState<AnalyticsPreview>(INITIAL_ANALYTICS_PREVIEW);

  const coachId = 'coach_101';
  const coachName = 'Coach Rajesh Kumar';
  const institutionName = 'National Sports Academy, Delhi';

  const loadDashboardData = useCallback(async () => {
    try {
      const [statsRes, asmRes, actRes, taskRes, analyticsRes] = await Promise.all([
        fetchCoachStats(coachId),
        fetchCurrentAssessments(coachId),
        fetchRecentActivity(coachId),
        fetchPendingTasks(coachId),
        fetchAnalyticsPreview(coachId),
      ]);

      if (statsRes.data) setStats(statsRes.data);
      setIsOffline(statsRes.isOffline);
      if (statsRes.lastSynced) setLastSynced(statsRes.lastSynced);

      if (asmRes.data) setAssessments(asmRes.data);
      if (actRes.data) setActivities(actRes.data);
      if (taskRes.data) setTasks(taskRes.data);
      if (analyticsRes.data) setAnalytics(analyticsRes.data);

      // Fetch test progress for selected/first assessment
      const selectedAsmId = (asmRes.data && asmRes.data.length > 0) ? asmRes.data[0].id : undefined;
      const progressRes = await fetchTestProgress(coachId, selectedAsmId);
      if (progressRes.data) setTestProgress(progressRes.data);
    } catch (error) {
      console.warn('[CoachHomeScreen] Background sync completed with cache');
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);



  const handleResolveTask = (task: PendingTaskItem) => {
    Alert.alert('Action Triggered', `Resolving task: ${task.title}`);
  };

  const handlePrimaryAction = (actionName: string) => {
    Alert.alert(actionName, `Navigating to ${actionName}`);
  };

  const handleSelectTab = (tab: TabKey) => {
    setActiveTab(tab);
    if (tab !== 'Home') {
      Alert.alert(tab, `Switched to ${tab} screen.`);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* 1. Header */}
      <CoachHeader
        coachName={coachName}
        institutionName={institutionName}
        isOnline={!isOffline}
        unreadNotifications={3}
        onPressNotifications={() => Alert.alert('Notifications', 'You have 3 unread notifications')}
        onPressSettings={() => handlePrimaryAction('Settings')}
      />

      {isOffline && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineBannerText}>
            Offline Mode • Showing cached data {lastSynced ? `(Last synced: ${new Date(lastSynced).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})` : ''}
          </Text>
        </View>
      )}

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. Statistics Cards */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Overview Statistics</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsRow}>
            <StatCard
              title="Active Tests"
              value={stats?.active_assessments ?? 0}
              icon={<ClipboardList size={18} color="#7C3AED" />}
              accentColor="#7C3AED"
            />
            <StatCard
              title="Completed"
              value={stats?.completed_assessments ?? 0}
              icon={<CheckCircle size={18} color="#10B981" />}
              accentColor="#10B981"
            />
            <StatCard
              title="Registered Athletes"
              value={stats?.athletes_registered ?? 0}
              icon={<Users size={18} color="#0284C7" />}
              accentColor="#0284C7"
            />
            <StatCard
              title="Pending Sync"
              value={stats?.pending_sync ?? 0}
              icon={<RefreshCw size={18} color="#F59E0B" />}
              accentColor="#F59E0B"
            />
            <StatCard
              title="Reports Done"
              value={stats?.reports_generated ?? 0}
              icon={<FileText size={18} color="#8B5CF6" />}
              accentColor="#8B5CF6"
            />
            <StatCard
              title="Avg. Completion"
              value={`${stats?.avg_completion_pct ?? 0}%`}
              icon={<TrendingUp size={18} color="#10B981" />}
              accentColor="#10B981"
            />
          </ScrollView>

        {/* 3. Primary Actions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Primary Actions</Text>
        </View>
        <View style={styles.primaryGrid}>
          <PrimaryActionButton
            label="New Assessment"
            icon={<Plus size={22} color="#FFFFFF" />}
            onPress={() => handlePrimaryAction('New Assessment')}
            primary
          />
          <PrimaryActionButton
            label="Continue Test"
            icon={<Play size={22} color="#FFFFFF" />}
            onPress={() => handlePrimaryAction('Continue Assessment')}
            primary
            color="#6D28D9"
          />
          <PrimaryActionButton
            label="Athletes"
            icon={<Users size={22} color="#7C3AED" />}
            onPress={() => handlePrimaryAction('Athlete Management')}
          />
          <PrimaryActionButton
            label="Analytics"
            icon={<BarChart3 size={22} color="#7C3AED" />}
            onPress={() => handlePrimaryAction('Analytics')}
          />
          <PrimaryActionButton
            label="Reports"
            icon={<FileText size={22} color="#7C3AED" />}
            onPress={() => handlePrimaryAction('Reports')}
          />
          <PrimaryActionButton
            label="Sync Data"
            icon={<CloudUpload size={22} color="#7C3AED" />}
            badgeCount={stats?.pending_sync}
            onPress={() => handlePrimaryAction('Sync Data')}
          />
        </View>

        {/* 4. Current Assessments */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Current Assessments</Text>
          <Text style={styles.sectionSub}>In-progress fitness batches</Text>
        </View>
        <FlatList
          data={assessments}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <AssessmentListItem
              assessment={item}
              onPress={(asm) => Alert.alert('Assessment Selected', asm.title)}
            />
          )}
          scrollEnabled={false}
        />

        {/* 5. Test Progress */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>10-Test Battery Progress</Text>
          <Text style={styles.sectionSub}>Per-test status breakdown</Text>
        </View>
        <TestProgressGrid
          tests={testProgress}
          onSelectTest={(t) => Alert.alert('Test Details', `${t.test_name}: ${t.status}`)}
        />

        {/* 6. Quick Actions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Tools</Text>
        </View>
        <View style={styles.quickRow}>
          <QuickActionButton
            label="Athletes"
            icon={<Users size={20} color="#7C3AED" />}
            onPress={() => handlePrimaryAction('Athletes')}
          />
          <QuickActionButton
            label="Reports"
            icon={<FileText size={20} color="#7C3AED" />}
            onPress={() => handlePrimaryAction('Reports')}
          />
          <QuickActionButton
            label="Analytics"
            icon={<BarChart3 size={20} color="#7C3AED" />}
            onPress={() => handlePrimaryAction('Analytics')}
          />
          <QuickActionButton
            label="Sync Centre"
            icon={<RefreshCw size={20} color="#7C3AED" />}
            onPress={() => handlePrimaryAction('Sync Centre')}
          />
          <QuickActionButton
            label="Settings"
            icon={<SlidersHorizontal size={20} color="#7C3AED" />}
            onPress={() => handlePrimaryAction('Settings')}
          />
        </View>

        {/* 7. Pending Tasks */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Action Required</Text>
          <Text style={styles.sectionSub}>Pending tasks and sync alerts</Text>
        </View>
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PendingTaskCard task={item} onResolve={handleResolveTask} />
          )}
          scrollEnabled={false}
        />

        {/* 8. Recent Activity */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <Text style={styles.sectionSub}>Latest events and uploads</Text>
        </View>
        <View style={styles.cardBox}>
          <FlatList
            data={activities}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <ActivityFeedItem activity={item} />}
            scrollEnabled={false}
          />
        </View>

        {/* 9. Analytics Preview */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Analytics Summary</Text>
        </View>
        {analytics && (
          <AnalyticsSummaryCard
            analytics={analytics}
            onPressViewAll={() => handlePrimaryAction('Full Analytics')}
          />
        )}

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* 10. Bottom Navigation */}
      <BottomTabBar activeTab={activeTab} onSelectTab={handleSelectTab} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  offlineBanner: {
    backgroundColor: '#FEF3C7',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#FDE68A',
    alignItems: 'center',
  },
  offlineBannerText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  sectionHeader: {
    marginTop: 18,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  sectionSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  statsRow: {
    paddingVertical: 4,
  },
  primaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  loader: {
    paddingVertical: 20,
  },
});

export default CoachHomeScreen;
