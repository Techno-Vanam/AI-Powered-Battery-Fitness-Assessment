import React, { createContext, useContext, useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { Athlete, Session, NotificationItem, CoachProfile, AppSettings, TestResult } from '../types/app';
import { INITIAL_ATHLETES, INITIAL_SESSIONS, INITIAL_NOTIFICATIONS, INITIAL_COACH_PROFILE, INITIAL_SETTINGS } from '../data/mockData';

import { getThemeColors } from '../theme/colors';

export type MainTabType = 'Home' | 'Athletes' | 'Assess' | 'Reports' | 'Settings';

interface AppContextType {
  selectedTab: MainTabType;
  setSelectedTab: (tab: MainTabType) => void;
  isOnline: boolean;
  setIsOnline: (online: boolean) => void;
  pendingSyncCount: number;
  isSyncing: boolean;
  toastMessage: string | null;
  setToastMessage: (msg: string | null) => void;
  triggerSync: () => void;
  
  athletes: Athlete[];
  sessions: Session[];
  notifications: NotificationItem[];
  unreadNotifCount: number;
  coachProfile: CoachProfile;
  settings: AppSettings;
  themeColors: ReturnType<typeof getThemeColors>;
  
  addAthlete: (athlete: Partial<Athlete>) => Athlete;
  updateAthlete: (athlete: Athlete) => void;
  saveTestResult: (athleteId: string, testId: string, value: string, score?: number) => void;
  markAllNotificationsRead: () => void;
  addNotification: (title: string, body: string, type?: NotificationItem['type']) => void;
  updateCoachProfile: (profile: Partial<CoachProfile>) => void;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  toggleNotificationPref: (key: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedTab, setSelectedTab] = useState<MainTabType>('Home');
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(18);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [athletes, setAthletes] = useState<Athlete[]>(INITIAL_ATHLETES);
  const [sessions, setSessions] = useState<Session[]>(INITIAL_SESSIONS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [coachProfile, setCoachProfile] = useState<CoachProfile>(INITIAL_COACH_PROFILE);
  const [settings, setSettings] = useState<AppSettings>(INITIAL_SETTINGS);

  // Monitor net info for connection change
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const online = Boolean(state.isConnected && state.isInternetReachable !== false);
      setIsOnline(prev => {
        if (!prev && online && pendingSyncCount > 0) {
          // Connectivity restored! Trigger sync notification per requirement
          triggerSync();
        }
        return online;
      });
    });
    return () => unsubscribe();
  }, [pendingSyncCount]);

  const triggerSync = () => {
    if (pendingSyncCount === 0) return;
    setIsSyncing(true);
    const countToSync = pendingSyncCount;

    setTimeout(() => {
      setPendingSyncCount(0);
      setIsSyncing(false);
      const syncMsg = `Sync Complete — ${countToSync} Assessments uploaded successfully.`;
      setToastMessage(syncMsg);

      // Append sync notification per spec: "All pending athlete assessments have been synchronized successfully."
      setNotifications(prev => [
        {
          id: `sync-${Date.now()}`,
          title: 'Offline data synced successfully',
          body: 'All pending athlete assessments have been synchronized successfully.',
          timestamp: 'Just now',
          isRead: false,
          type: 'sync_complete',
        },
        ...prev,
      ]);

      setTimeout(() => setToastMessage(null), 4000);
    }, 1200);
  };

  const unreadNotifCount = notifications.filter(n => !n.isRead).length;

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const addNotification = (title: string, body: string, type: NotificationItem['type'] = 'general') => {
    setNotifications(prev => [
      {
        id: `n-${Date.now()}`,
        title,
        body,
        timestamp: 'Just now',
        isRead: false,
        type,
      },
      ...prev,
    ]);
  };

  const addAthlete = (newAthData: Partial<Athlete>): Athlete => {
    const num = athletes.length + 1;
    const name = newAthData.name || 'New Athlete';
    const initials = name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(n => n[0].toUpperCase())
      .join('');

    const newAth: Athlete = {
      id: `ath-${num}`,
      name,
      initials: initials || 'NA',
      age: newAthData.age || 16,
      gender: newAthData.gender || 'Male',
      school: newAthData.school || 'Delhi Public School',
      sport: newAthData.sport || 'Athletics',
      status: 'Pending',
      testsCompleted: 0,
      totalTests: 10,
      overallScore: 0,
      bmi: newAthData.bmi || 21.0,
      height: newAthData.height || 170,
      weight: newAthData.weight || 62,
      assessmentDate: '04 Aug 2026',
      coachName: coachProfile.name,
      aiConfidence: 90,
      recommendations: [
        'Initial baseline assessment scheduled',
        'Focus on warm-up routine and flexibility',
      ],
      testResults: INITIAL_ATHLETES[0].testResults.map(t => ({
        ...t,
        value: 'Pending',
        score: 0,
        isCompleted: false,
        statusDot: 'gray',
      })),
      phone: newAthData.phone || '',
      nsrsAadhaarId: newAthData.nsrsAadhaarId || `NSRS-2026-${2000 + num}`,
      createdAt: new Date().toISOString(),
    };

    setAthletes(prev => [newAth, ...prev]);
    addNotification('New athlete added', `Athlete ${newAth.name} was registered successfully.`);
    return newAth;
  };

  const updateAthlete = (updated: Athlete) => {
    setAthletes(prev => prev.map(a => (a.id === updated.id ? updated : a)));
  };

  const saveTestResult = (athleteId: string, testId: string, value: string, score: number = 8) => {
    setAthletes(prev =>
      prev.map(ath => {
        if (ath.id !== athleteId) return ath;

        const updatedResults = ath.testResults.map(t => {
          if (t.testId === testId) {
            return {
              ...t,
              value,
              score,
              isCompleted: true,
              statusDot: 'green' as const,
              updatedAt: new Date().toISOString(),
            };
          }
          return t;
        });

        const completedCount = updatedResults.filter(r => r.isCompleted).length;
        const newStatus: Athlete['status'] =
          completedCount === 10 ? 'Completed' : completedCount > 0 ? 'In Progress' : 'Pending';

        return {
          ...ath,
          testResults: updatedResults,
          testsCompleted: completedCount,
          status: newStatus,
        };
      })
    );

    if (!isOnline) {
      setPendingSyncCount(prev => prev + 1);
    }
  };

  const updateCoachProfile = (profile: Partial<CoachProfile>) => {
    setCoachProfile(prev => ({ ...prev, ...profile }));
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const toggleNotificationPref = (key: string) => {
    setSettings(prev => ({
      ...prev,
      notificationPreferences: {
        ...prev.notificationPreferences,
        [key]: !prev.notificationPreferences[key],
      },
    }));
  };

  return (
    <AppContext.Provider
      value={{
        selectedTab,
        setSelectedTab,
        isOnline,
        setIsOnline,
        pendingSyncCount,
        isSyncing,
        toastMessage,
        setToastMessage,
        triggerSync,
        athletes,
        sessions,
        notifications,
        unreadNotifCount,
        coachProfile,
        settings,
        themeColors: getThemeColors(settings.darkMode),
        addAthlete,
        updateAthlete,
        saveTestResult,
        markAllNotificationsRead,
        addNotification,
        updateCoachProfile,
        updateSettings,
        toggleNotificationPref,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
