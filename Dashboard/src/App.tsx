import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { AnalyticsView } from './components/AnalyticsView';
import { AthleteManagementView } from './components/AthleteManagementView';
import { MeasurementHistoryView } from './components/MeasurementHistoryView';
import { SyncMonitoringView } from './components/SyncMonitoringView';
import { apiService } from './services/apiService';
import { Athlete, HeightTest, SyncLog, ReportSummary, ActiveTab } from './types';

export const App: React.FC = () => {
  const [username] = useState<string>('coach');
  const [activeTab, setActiveTab] = useState<ActiveTab>('analytics');

  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [tests, setTests] = useState<HeightTest[]>([]);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [summary, setSummary] = useState<ReportSummary>({
    totalAthletesRegistered: 0,
    totalHeightTestsConducted: 0,
    averageHeightCm: 0,
    minHeightCm: 0,
    maxHeightCm: 0,
    distinctAthletesAssessed: 0,
  });

  const [loading, setLoading] = useState<boolean>(true);

  const loadData = async () => {
    setLoading(true);
    const [athData, testData, logData, sumData] = await Promise.all([
      apiService.getAthletes(),
      apiService.getHeightTests(),
      apiService.getSyncLogs(),
      apiService.getReportSummary(),
    ]);

    setAthletes(athData);
    setTests(testData);
    setSyncLogs(logData);
    setSummary(sumData);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddAthlete = async (athleteData: Omit<Athlete, 'id' | 'createdAt' | 'updatedAt'>) => {
    const created = await apiService.createAthlete(athleteData);
    setAthletes(prev => [created, ...prev]);
    const updatedSummary = await apiService.getReportSummary();
    setSummary(updatedSummary);
  };

  const handleTriggerSync = async () => {
    const newLog = await apiService.triggerManualSync();
    setSyncLogs(prev => [newLog, ...prev]);
  };

  return (
    <div className="dashboard-layout">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={() => {}}
      />

      <div className="main-content">
        <Header
          activeTab={activeTab}
          username={username}
          onlineStatus={true}
        />

        <main className="content-body">
          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading Dashboard Data...
            </div>
          ) : (
            <>
              {activeTab === 'analytics' && (
                <AnalyticsView summary={summary} athletes={athletes} tests={tests} />
              )}
              {activeTab === 'athletes' && (
                <AthleteManagementView athletes={athletes} onAddAthlete={handleAddAthlete} />
              )}
              {activeTab === 'history' && (
                <MeasurementHistoryView tests={tests} />
              )}
              {activeTab === 'sync' && (
                <SyncMonitoringView logs={syncLogs} onTriggerSync={handleTriggerSync} />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
