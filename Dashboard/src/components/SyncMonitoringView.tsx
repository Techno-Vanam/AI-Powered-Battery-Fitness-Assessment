import React, { useState } from 'react';
import { RefreshCw, Server, CheckCircle, Smartphone, Zap } from 'lucide-react';
import { SyncLog } from '../types';

interface SyncMonitoringViewProps {
  logs: SyncLog[];
  onTriggerSync: () => Promise<void>;
}

export const SyncMonitoringView: React.FC<SyncMonitoringViewProps> = ({ logs, onTriggerSync }) => {
  const [syncing, setSyncing] = useState(false);

  const handleSyncClick = async () => {
    setSyncing(true);
    await onTriggerSync();
    setTimeout(() => {
      setSyncing(false);
    }, 600);
  };

  return (
    <div className="animate-fade-in">
      {/* Sync Status Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '20px',
        marginBottom: '28px',
      }}>
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>SYNC GATEWAY STATUS</span>
            <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <Server size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#34d399', fontFamily: 'var(--font-heading)' }}>
            ONLINE & ACTIVE
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '6px' }}>
            PostgreSQL WAL Write-Ahead Logging Active
          </div>
        </div>

        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>OFFLINE QUEUE COUNT</span>
            <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
              <RefreshCw size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-heading)' }}>
            0 Pending Items
          </div>
          <div style={{ fontSize: '0.78rem', color: '#34d399', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle size={14} /> All Offline Data Synchronized
          </div>
        </div>

        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <button
            className="btn btn-primary"
            onClick={handleSyncClick}
            disabled={syncing}
            style={{ width: '100%', padding: '14px', fontSize: '0.95rem' }}
          >
            <Zap size={18} className={syncing ? 'animate-spin' : ''} />
            {syncing ? 'Synchronizing Gateway...' : 'Trigger Gateway Sync Now'}
          </button>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '8px' }}>
            Executes idempotent duplicate skipping batch upload
          </span>
        </div>
      </div>

      {/* Sync Logs Table */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px', color: '#ffffff' }}>
          Recent Gateway Offline Sync Logs
        </h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Sync Log ID</th>
                <th>Device ID</th>
                <th>Athletes Synced</th>
                <th>Height Tests Synced</th>
                <th>Skipped Duplicates</th>
                <th>Sync Status</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 600, color: '#34d399' }}>{log.id}</td>
                  <td style={{ fontWeight: 600 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Smartphone size={16} color="#9ca3af" />
                      {log.deviceId}
                    </div>
                  </td>
                  <td>{log.athleteCount} Athletes</td>
                  <td>{log.heightTestCount} Measurements</td>
                  <td style={{ color: log.skippedDuplicateCount > 0 ? '#fbbf24' : 'var(--text-muted)' }}>
                    {log.skippedDuplicateCount} Skipped
                  </td>
                  <td>
                    <span className="badge badge-success">{log.status}</span>
                  </td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    {new Date(log.syncedAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
