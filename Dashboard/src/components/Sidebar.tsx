import React from 'react';
import { LayoutDashboard, Users, History, RefreshCw, LogOut, Activity } from 'lucide-react';
import { ActiveTab } from '../types';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, onLogout }) => {
  const menuItems = [
    { id: 'analytics' as ActiveTab, label: 'Analytics Dashboard', icon: LayoutDashboard },
    { id: 'athletes' as ActiveTab, label: 'Athlete Management', icon: Users },
    { id: 'history' as ActiveTab, label: 'Measurement History', icon: History },
    { id: 'sync' as ActiveTab, label: 'Sync Monitoring', icon: RefreshCw },
  ];

  return (
    <aside style={{
      width: '260px',
      background: 'rgba(17, 24, 39, 0.95)',
      borderRight: '1px solid var(--glass-border)',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 16px',
    }}>
      {/* Brand Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 12px 28px 12px', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #10b981, #3b82f6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Activity size={24} color="#ffffff" />
        </div>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.2 }}>
            AI FITNESS
          </h2>
          <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600, letterSpacing: '0.05em' }}>
            COACH PORTAL
          </span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav style={{ marginTop: '24px', flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '12px',
                border: 'none',
                background: isActive ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(59, 130, 246, 0.15))' : 'transparent',
                color: isActive ? '#34d399' : 'var(--text-muted)',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.92rem',
                cursor: 'pointer',
                transition: 'var(--transition-fast)',
                textAlign: 'left',
              }}
            >
              <Icon size={20} color={isActive ? '#34d399' : '#9ca3af'} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Logout Action */}
      <div style={{ paddingTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
        <button
          onClick={onLogout}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            borderRadius: '12px',
            border: '1px solid rgba(244, 63, 94, 0.2)',
            background: 'rgba(244, 63, 94, 0.08)',
            color: '#f87171',
            fontWeight: 600,
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'var(--transition-fast)',
          }}
        >
          <LogOut size={18} color="#f87171" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};
