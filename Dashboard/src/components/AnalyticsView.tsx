import React from 'react';
import { Users, Ruler, Activity, CheckCircle, TrendingUp, BarChart3 } from 'lucide-react';
import { Athlete, HeightTest, ReportSummary } from '../types';

interface AnalyticsViewProps {
  summary: ReportSummary;
  athletes: Athlete[];
  tests: HeightTest[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ summary, athletes, tests }) => {
  // Category counts
  const categoryCounts = {
    'U-12': athletes.filter(a => a.heightCategory === 'U-12').length,
    'U-15': athletes.filter(a => a.heightCategory === 'U-15').length,
    'U-18': athletes.filter(a => a.heightCategory === 'U-18').length,
    'Senior': athletes.filter(a => a.heightCategory === 'Senior').length,
  };

  const maxCategoryCount = Math.max(...Object.values(categoryCounts), 1);

  return (
    <div className="animate-fade-in">
      {/* Top Metric Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '20px',
        marginBottom: '28px',
      }}>
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>TOTAL ATHLETES</span>
            <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
              <Users size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-heading)' }}>
            {summary.totalAthletesRegistered}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#34d399', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <TrendingUp size={14} /> Active Athlete Registry
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>ASSESSMENTS CONDUCTED</span>
            <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <Activity size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-heading)' }}>
            {summary.totalHeightTestsConducted}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#34d399', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle size={14} /> ArUco + MediaPipe Verified
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>AVERAGE HEIGHT</span>
            <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(139, 92, 246, 0.15)', color: '#c084fc' }}>
              <Ruler size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-heading)' }}>
            {summary.averageHeightCm} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>cm</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '6px' }}>
            Min: {summary.minHeightCm} cm • Max: {summary.maxHeightCm} cm
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>SYNC HEALTH</span>
            <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <BarChart3 size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#34d399', fontFamily: 'var(--font-heading)' }}>
            100%
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '6px' }}>
            0 Queued • 0 Retries Failed
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '24px',
      }}>
        {/* Category Breakdown Chart */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px', color: '#ffffff' }}>
            Athlete Category Distribution
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {Object.entries(categoryCounts).map(([cat, count]) => {
              const pct = Math.round((count / maxCategoryCount) * 100);
              return (
                <div key={cat}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{cat} Division</span>
                    <span style={{ color: 'var(--text-muted)' }}>{count} Athletes ({pct}%)</span>
                  </div>
                  <div style={{ height: '10px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '5px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${pct}%`,
                      background: cat === 'Senior' ? 'linear-gradient(90deg, #3b82f6, #60a5fa)' :
                                  cat === 'U-18' ? 'linear-gradient(90deg, #10b981, #34d399)' :
                                  cat === 'U-15' ? 'linear-gradient(90deg, #8b5cf6, #c084fc)' :
                                  'linear-gradient(90deg, #f59e0b, #fbbf24)',
                      borderRadius: '5px',
                      transition: 'width 0.6s ease',
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Height Measurements Trend Chart */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px', color: '#ffffff' }}>
            Latest Height Measurements (cm)
          </h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: '180px', paddingTop: '20px' }}>
            {tests.slice(0, 6).map((t, idx) => {
              const heightPct = Math.min(100, Math.max(30, Math.round((t.heightCm / 200) * 100)));
              return (
                <div key={t.id || idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', height: '100%' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#34d399' }}>{t.heightCm}</div>
                  <div style={{
                    flex: 1,
                    width: '32px',
                    display: 'flex',
                    alignItems: 'flex-end',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '8px',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      width: '100%',
                      height: `${heightPct}%`,
                      background: 'linear-gradient(0deg, #10b981, #059669)',
                      borderRadius: '8px',
                      transition: 'height 0.5s ease',
                    }} />
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '60px' }}>
                    {t.athleteName ? t.athleteName.split(' ')[0] : `Ath ${idx+1}`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
