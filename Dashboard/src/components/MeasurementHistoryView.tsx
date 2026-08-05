import React, { useState } from 'react';
import { Search, Filter, FileSpreadsheet, FileText, CheckCircle2, ShieldCheck, Smartphone } from 'lucide-react';
import { HeightTest } from '../types';
import { exportToCSV, printFormattedPDF } from '../utils/ExportUtils';

interface MeasurementHistoryViewProps {
  tests: HeightTest[];
}

export const MeasurementHistoryView: React.FC<MeasurementHistoryViewProps> = ({ tests }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [confidenceFilter, setConfidenceFilter] = useState<string>('all');

  const filteredTests = tests.filter(t => {
    const matchesSearch = (t.athleteName && t.athleteName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.athleteId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesConf = confidenceFilter === 'all' ||
                        (confidenceFilter === 'high' && t.overallConfidence >= 90) ||
                        (confidenceFilter === 'medium' && t.overallConfidence >= 80 && t.overallConfidence < 90);
    return matchesSearch && matchesConf;
  });

  const handleExportCSV = () => {
    exportToCSV('Height_Measurement_History', filteredTests);
  };

  const handleExportPDF = () => {
    const headers = ['Measurement ID', 'Athlete', 'Height (cm)', 'ArUco Conf', 'Pose Conf', 'Device ID', 'Timestamp'];
    const rows = filteredTests.map(t => [
      t.id, t.athleteName || t.athleteId, `${t.heightCm} cm`, `${t.markerConfidence}%`, `${t.poseConfidence}%`, t.deviceId, new Date(t.createdAt).toLocaleString()
    ]);
    printFormattedPDF('Official Height Assessment Log Report', headers, rows);
  };

  return (
    <div className="animate-fade-in">
      {/* Top Filter & Export Bar */}
      <div className="glass-card" style={{ padding: '20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Search Input */}
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search size={18} color="#9ca3af" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="input-field"
              style={{ paddingLeft: '42px' }}
              placeholder="Search by Athlete Name, Measurement ID..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Confidence Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={16} color="#9ca3af" />
            <select
              className="input-field"
              style={{ width: 'auto', padding: '9px 14px' }}
              value={confidenceFilter}
              onChange={e => setConfidenceFilter(e.target.value)}
            >
              <option value="all">All Confidence Levels</option>
              <option value="high">High Confidence (≥90%)</option>
              <option value="medium">Medium Confidence (80–89%)</option>
            </select>
          </div>

          {/* Export Actions */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-secondary" onClick={handleExportCSV}>
              <FileSpreadsheet size={18} color="#34d399" /> Excel / CSV
            </button>
            <button className="btn btn-secondary" onClick={handleExportPDF}>
              <FileText size={18} color="#f87171" /> PDF Log
            </button>
          </div>
        </div>
      </div>

      {/* Measurement History Table */}
      <div className="table-container glass-card">
        <table>
          <thead>
            <tr>
              <th>Assessment ID</th>
              <th>Athlete Name</th>
              <th>Measured Height</th>
              <th>ArUco Marker Conf</th>
              <th>MediaPipe Pose Conf</th>
              <th>Overall Quality</th>
              <th>Device Used</th>
              <th>Assessment Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredTests.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  No height test measurements found matching current search parameters.
                </td>
              </tr>
            ) : (
              filteredTests.map(t => (
                <tr key={t.id}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 600, color: '#34d399' }}>{t.id}</td>
                  <td style={{ fontWeight: 600, color: '#ffffff' }}>
                    {t.athleteName || t.athleteId}
                  </td>
                  <td>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#34d399', fontFamily: 'var(--font-heading)' }}>
                      {t.heightCm} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>cm</span>
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle2 size={14} color="#34d399" />
                      <span>{t.markerConfidence}%</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <ShieldCheck size={14} color="#60a5fa" />
                      <span>{t.poseConfidence}%</span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${t.overallConfidence >= 90 ? 'badge-success' : 'badge-warning'}`}>
                      {t.overallConfidence >= 90 ? 'EXCELLENT' : 'GOOD'} ({t.overallConfidence}%)
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Smartphone size={14} color="#9ca3af" />
                      {t.deviceId}
                    </div>
                  </td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    {new Date(t.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
