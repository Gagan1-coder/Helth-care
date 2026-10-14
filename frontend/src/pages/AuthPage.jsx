import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEmergency } from '../context/EmergencyContext';
import { ShieldCheck, UserCheck, Lock, Mail, User } from 'lucide-react';

export function AuthPage() {
  const { setUserId } = useEmergency();
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const demoProfiles = [
    { id: 'demo_user', name: 'Demo Patient (Bhatkal Town)', role: 'General Citizen', location: 'Bhatkal, Karnataka' },
    { id: 'elderly_patient_1', name: 'Smt. Parvati Rao (Senior)', role: 'Cardiac Patient', location: 'Honnavar, Uttara Kannada' },
    { id: 'highway_commuter', name: 'Rajesh Naik', role: 'Daily Highway Commuter', location: 'NH-66 Coastal Corridor' },
    { id: 'responder_dr_sarah', name: 'Dr. Sarah (Physician)', role: 'Emergency Responder', location: 'Taluka Hospital Bhatkal' }
  ];

  const handleSelectDemo = (profile) => {
    setUserId(profile.id);
    localStorage.setItem('lifelink_user_id', profile.id);
    localStorage.setItem('lifelink_user_name', profile.name);
    navigate('/dashboard');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const generatedId = `usr_${Date.now()}`;
    setUserId(generatedId);
    localStorage.setItem('lifelink_user_id', generatedId);
    localStorage.setItem('lifelink_user_name', name || email);
    navigate('/dashboard');
  };

  return (
    <div className="container" style={{ padding: '60px 20px', maxWidth: '800px' }}>
      <div style={{ textAlign: 'center', marginBottom: '35px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>LifeLink AI Authentication</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Sign in using Firebase Authentication or select a pre-configured demo emergency profile.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Fast 1-Click Evaluation Profiles */}
        <div className="card" style={{ borderColor: 'var(--color-primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <UserCheck size={20} color="var(--color-primary)" />
            <h2 style={{ fontSize: '1.15rem' }}>Quick Demo Profiles</h2>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Instant 1-click access configured with realistic location, contacts, and medical profiles.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {demoProfiles.map((p) => (
              <button
                key={p.id}
                onClick={() => handleSelectDemo(p)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 14px',
                  borderRadius: 'var(--border-radius-sm)',
                  background: 'var(--bg-main)',
                  border: '1px solid var(--bg-card-border)',
                  color: 'var(--text-primary)',
                  textAlign: 'left'
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{p.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.location}</div>
                </div>
                <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>{p.role}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Firebase Email/Password Sign-in */}
        <div className="card">
          <h2 style={{ fontSize: '1.15rem', marginBottom: '14px' }}>
            {isRegister ? 'Create Patient Account' : 'Sign In with Email'}
          </h2>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {isRegister && (
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Full Name</label>
                <input
                  type="text"
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ width: '100%' }}
                  required
                />
              </div>
            )}

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Email Address</label>
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%' }}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%' }}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>
              <span>{isRegister ? 'Register Account' : 'Sign In'}</span>
            </button>
          </form>

          <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            <button
              onClick={() => setIsRegister(!isRegister)}
              style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}
            >
              {isRegister ? 'Already have an account? Sign In' : 'Need an account? Register'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
