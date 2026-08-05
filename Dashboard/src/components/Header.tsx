import React from 'react';
import { UserCheck, Signal, ShieldAlert } from 'lucide-react';
import { ActiveTab } from '../types';

interface HeaderProps {
  activeTab: ActiveTab;
  username: string;
  onlineStatus: boolean;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, username, onlineStatus }) => {
  const titles: Record<ActiveTab, string> = {
    analytics: 'Analytics & Performance Overview',
    athletes: 'Athlete Registry & Management',
    history: 'Height Measurement History Logs',
    sync: 'Offline Sync & Gateway Monitoring',
  };

  return (
    <header style={{
      height: '70px',
      background: 'rgba(17, 24, 39, 0.8)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--glass-border)',
      padding: '0 28px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      <div>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700, color: '#ffffff' }}>
          {titles[activeTab]}
        </h1>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          Real-time AI Fitness Assessment Hub
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {/* Connection Status Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          borderRadius: '9999px',
          background: onlineStatus ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.12)',
          border: `1px solid ${onlineStatus ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
          fontSize: '0.8rem',
          fontWeight: 600,
          color: onlineStatus ? '#34d399' : '#f87171',
        }}>
          {onlineStatus ? <Signal size={14} color="#34d399" /> : <ShieldAlert size={14} color="#f87171" />}
          {onlineStatus ? 'Backend Online (JWT 200 OK)' : 'Offline Mode (Local Cache)'}
        </div>

        {/* Coach Profile Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '6px 14px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '12px',
          border: '1px solid var(--glass-border)',
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <UserCheck size={18} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ffffff' }}>{username}</div>
            <div style={{ fontSize: '0.7rem', color: '#34d399', fontWeight: 500 }}>Certified Coach</div>
          </div>
        </div>
      </div>
    </header>
  );
};
