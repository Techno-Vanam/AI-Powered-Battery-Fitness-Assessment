import React, { useState } from 'react';
import { ShieldCheck, Lock, User, Activity } from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (username: string) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('coach_vikram');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }

    setLoading(true);
    setError('');

    setTimeout(() => {
      setLoading(false);
      onLoginSuccess(username);
    }, 600);
  };

  const fillDemo = () => {
    setUsername('coach_vikram');
    setPassword('password123');
    setError('');
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'radial-gradient(circle at top right, #1e1b4b 0%, #0b0f19 60%)',
      padding: '20px',
    }}>
      <div className="glass-card animate-fade-in" style={{
        width: '100%',
        maxWidth: '440px',
        padding: '40px 32px',
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.12)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(59, 130, 246, 0.2))',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            marginBottom: '16px',
          }}>
            <Activity size={32} color="#10b981" />
          </div>
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.75rem',
            fontWeight: 800,
            background: 'linear-gradient(to right, #ffffff, #9ca3af)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '6px',
          }}>Coach Portal</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            AI-Powered Battery Fitness Assessment Platform
          </p>
        </div>

        {error && (
          <div style={{
            padding: '12px 16px',
            borderRadius: '10px',
            background: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            color: '#f87171',
            fontSize: '0.85rem',
            marginBottom: '20px',
            textAlign: 'center',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
              USERNAME / COACH ID
            </label>
            <div style={{ position: 'relative' }}>
              <User size={18} color="#6b7280" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                className="input-field"
                style={{ paddingLeft: '42px' }}
                placeholder="Enter coach username"
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div style={{ marginBottom: '28px' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
              PASSWORD
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="#6b7280" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="password"
                className="input-field"
                style={{ paddingLeft: '42px' }}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '13px', fontSize: '1rem', marginBottom: '16px' }}
          >
            {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <button
            onClick={fillDemo}
            style={{
              background: 'none',
              border: 'none',
              color: '#60a5fa',
              fontSize: '0.82rem',
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Fill Demo Credentials
          </button>
        </div>

        <div style={{
          marginTop: '32px',
          paddingTop: '20px',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          color: 'var(--text-dim)',
          fontSize: '0.78rem',
        }}>
          <ShieldCheck size={16} color="#10b981" />
          JWT 256-Bit Authenticated Security Session
        </div>
      </div>
    </div>
  );
};
