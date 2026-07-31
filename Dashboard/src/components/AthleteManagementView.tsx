import React, { useState } from 'react';
import { Search, Filter, Plus, FileSpreadsheet, FileText, User, Phone, MapPin, School } from 'lucide-react';
import { Athlete } from '../types';
import { exportToCSV, printFormattedPDF } from '../utils/ExportUtils';

interface AthleteManagementViewProps {
  athletes: Athlete[];
  onAddAthlete: (athlete: Omit<Athlete, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export const AthleteManagementView: React.FC<AthleteManagementViewProps> = ({ athletes, onAddAthlete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);

  // New Athlete Form State
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [dateOfBirth, setDateOfBirth] = useState('2008-01-01');
  const [phone, setPhone] = useState('');
  const [heightCategory, setHeightCategory] = useState<'U-12' | 'U-15' | 'U-18' | 'Senior'>('U-18');
  const [coachName, setCoachName] = useState('Coach Vikram');
  const [schoolAcademy, setSchoolAcademy] = useState('');
  const [state, setState] = useState('Delhi');

  const filteredAthletes = athletes.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          a.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (a.phone && a.phone.includes(searchTerm));
    const matchesGender = genderFilter === 'all' || a.gender === genderFilter;
    const matchesCategory = categoryFilter === 'all' || a.heightCategory === categoryFilter;
    return matchesSearch && matchesGender && matchesCategory;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    onAddAthlete({
      clientAthleteId: 'cli-' + Date.now(),
      name,
      gender,
      dateOfBirth,
      phone,
      heightCategory,
      coachName,
      schoolAcademy: schoolAcademy || 'Sports Excellence Academy',
      state,
      district: 'Central',
    });

    setShowModal(false);
    setName('');
    setPhone('');
  };

  const handleExportCSV = () => {
    exportToCSV('Athletes_Registry', filteredAthletes);
  };

  const handleExportPDF = () => {
    const headers = ['ID', 'Name', 'Gender', 'Category', 'Phone', 'Academy', 'State'];
    const rows = filteredAthletes.map(a => [
      a.id, a.name, a.gender.toUpperCase(), a.heightCategory, a.phone || 'N/A', a.schoolAcademy, a.state
    ]);
    printFormattedPDF('Official Athlete Registry Report', headers, rows);
  };

  return (
    <div className="animate-fade-in">
      {/* Top Action & Filter Toolbar */}
      <div className="glass-card" style={{ padding: '20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search size={18} color="#9ca3af" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="input-field"
              style={{ paddingLeft: '42px' }}
              placeholder="Search by Athlete Name, ID, or Phone..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Filter size={16} color="#9ca3af" />
              <select
                className="input-field"
                style={{ width: 'auto', padding: '9px 14px' }}
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
              >
                <option value="all">All Divisions</option>
                <option value="U-12">U-12 Division</option>
                <option value="U-15">U-15 Division</option>
                <option value="U-18">U-18 Division</option>
                <option value="Senior">Senior Division</option>
              </select>
            </div>

            <select
              className="input-field"
              style={{ width: 'auto', padding: '9px 14px' }}
              value={genderFilter}
              onChange={e => setGenderFilter(e.target.value)}
            >
              <option value="all">All Genders</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>

            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              <Plus size={18} /> Register Athlete
            </button>
          </div>

          {/* Export Buttons */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-secondary" onClick={handleExportCSV} title="Export CSV Data">
              <FileSpreadsheet size={18} color="#34d399" /> Excel / CSV
            </button>
            <button className="btn btn-secondary" onClick={handleExportPDF} title="Print PDF Report">
              <FileText size={18} color="#f87171" /> PDF Report
            </button>
          </div>
        </div>
      </div>

      {/* Athletes Data Table */}
      <div className="table-container glass-card">
        <table>
          <thead>
            <tr>
              <th>Athlete ID</th>
              <th>Full Name</th>
              <th>Gender</th>
              <th>Category</th>
              <th>Phone</th>
              <th>Academy / School</th>
              <th>State</th>
              <th>Registered</th>
            </tr>
          </thead>
          <tbody>
            {filteredAthletes.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  No athletes found matching the search filters.
                </td>
              </tr>
            ) : (
              filteredAthletes.map(a => (
                <tr key={a.id}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 600, color: '#34d399' }}>{a.id}</td>
                  <td style={{ fontWeight: 600 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: 'rgba(59, 130, 246, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#60a5fa',
                      }}>
                        <User size={16} />
                      </div>
                      {a.name}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${a.gender === 'female' ? 'badge-danger' : 'badge-blue'}`}>
                      {a.gender}
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-success">{a.heightCategory}</span>
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>{a.phone || 'N/A'}</td>
                  <td>{a.schoolAcademy}</td>
                  <td>{a.state}</td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {new Date(a.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Athlete Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px',
        }}>
          <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '520px', padding: '32px', borderRadius: '20px' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 700, marginBottom: '20px' }}>
              Register New Athlete
            </h2>
            <form onSubmit={handleCreateSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  FULL ATHLETE NAME *
                </label>
                <input
                  type="text"
                  className="input-field"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                    GENDER *
                  </label>
                  <select className="input-field" value={gender} onChange={e => setGender(e.target.value as any)}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                    DIVISION / CATEGORY *
                  </label>
                  <select className="input-field" value={heightCategory} onChange={e => setHeightCategory(e.target.value as any)}>
                    <option value="U-12">U-12 Division</option>
                    <option value="U-15">U-15 Division</option>
                    <option value="U-18">U-18 Division</option>
                    <option value="Senior">Senior Division</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                    DATE OF BIRTH
                  </label>
                  <input
                    type="date"
                    className="input-field"
                    value={dateOfBirth}
                    onChange={e => setDateOfBirth(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                    PHONE NUMBER
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  SCHOOL / SPORTS ACADEMY
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. National Sports Institute"
                  value={schoolAcademy}
                  onChange={e => setSchoolAcademy(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Athlete
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
