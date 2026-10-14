import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEmergency } from '../context/EmergencyContext';
import { 
  UserCheck, 
  Lock, 
  Mail, 
  User, 
  AlertCircle, 
  CheckCircle, 
  LogOut, 
  RefreshCw, 
  KeyRound,
  ArrowRight,
  Shield,
  Send
} from 'lucide-react';

export function AuthPage() {
  const { 
    currentUser, 
    loading, 
    authError, 
    authSuccess, 
    clearMessages,
    loginWithEmail, 
    registerWithEmail, 
    loginWithGoogle, 
    resetPassword, 
    resendVerification, 
    logout, 
    setDemoProfile,
    isFirebaseConfigured
  } = useAuth();

  const { setUserId } = useEmergency();
  const navigate = useNavigate();

  // Mode: 'login' | 'register' | 'forgot_password'
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [localValidation, setLocalValidation] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const demoProfiles = [
    { id: 'demo_user', name: 'Demo Patient (Bhatkal Town)', role: 'General Citizen', location: 'Bhatkal, Karnataka' },
    { id: 'elderly_patient_1', name: 'Smt. Parvati Rao (Senior)', role: 'Cardiac Patient', location: 'Honnavar, Uttara Kannada' },
    { id: 'highway_commuter', name: 'Rajesh Naik', role: 'Daily Highway Commuter', location: 'NH-66 Coastal Corridor' },
    { id: 'responder_dr_sarah', name: 'Dr. Sarah (Physician)', role: 'Emergency Responder', location: 'Taluka Hospital Bhatkal' }
  ];

  const handleSelectDemo = (profile) => {
    setDemoProfile(profile);
    setUserId(profile.id);
    navigate('/dashboard');
  };

  const handleGoogleSignIn = async () => {
    setSubmitting(true);
    setLocalValidation('');
    try {
      const user = await loginWithGoogle();
      if (user) {
        setUserId(user.uid);
        navigate('/dashboard');
      }
    } catch (err) {
      // AuthContext handles error message
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearMessages();
    setLocalValidation('');

    // Form Validations
    if (!email || !email.includes('@')) {
      setLocalValidation('Please provide a valid email address.');
      return;
    }

    if (mode === 'forgot_password') {
      setSubmitting(true);
      try {
        await resetPassword(email);
      } catch (err) {
        // Handled in AuthContext
      } finally {
        setSubmitting(false);
      }
      return;
    }

    if (!password || password.length < 6) {
      setLocalValidation('Password must be at least 6 characters long.');
      return;
    }

    if (mode === 'register' && password !== confirmPassword) {
      setLocalValidation('Passwords do not match. Please re-enter.');
      return;
    }

    setSubmitting(true);
    try {
      if (mode === 'register') {
        const user = await registerWithEmail(email, password, displayName);
        if (user) {
          setUserId(user.uid);
          // Navigate to dashboard
          navigate('/dashboard');
        }
      } else {
        const user = await loginWithEmail(email, password);
        if (user) {
          setUserId(user.uid);
          navigate('/dashboard');
        }
      }
    } catch (err) {
      // Handled in AuthContext
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUserId('demo_user');
  };

  return (
    <div className="container" style={{ padding: '40px 20px 80px', maxWidth: '880px' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
          LifeLink AI Authentication
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '580px', margin: '0 auto' }}>
          Real Firebase Authentication for secure patient identity, encrypted medical records, and authorized emergency coordination.
        </p>
      </div>

      {/* Screen 6: Signed-in User State */}
      {currentUser && (
        <div className="card" style={{ marginBottom: '24px', background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#166534', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.1rem' }}>
                {(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 800, color: '#166534', fontSize: '1rem' }}>
                  Currently Signed In: {currentUser.displayName || 'LifeLink Patient'}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#15803D' }}>
                  {currentUser.email} • UID: <code style={{ fontSize: '0.78rem' }}>{currentUser.uid.slice(0, 12)}...</code>
                </div>
                {/* Screen 5: Email verification status */}
                <div style={{ marginTop: '4px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {currentUser.emailVerified ? (
                    <span style={{ color: '#166534', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle size={13} /> Email Verified
                    </span>
                  ) : (
                    <span style={{ color: '#B45309', fontWeight: 600 }}>
                      ⚠️ Email Not Verified
                    </span>
                  )}
                  {!currentUser.emailVerified && (
                    <button
                      onClick={resendVerification}
                      style={{ color: 'var(--color-primary)', textDecoration: 'underline', fontSize: '0.75rem', fontWeight: 600 }}
                    >
                      Resend Verification Link
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => navigate('/dashboard')} className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
                <span>Go to Dashboard</span>
                <ArrowRight size={14} />
              </button>
              <button onClick={handleLogout} className="btn btn-outline" style={{ fontSize: '0.85rem' }}>
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Screen 7: Authentication Alerts & Feedback */}
      {(authError || localValidation) && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'var(--color-emergency-light)',
          border: '1px solid #FECACA',
          color: '#991B1B',
          padding: '12px 16px',
          borderRadius: 'var(--border-radius-sm)',
          marginBottom: '20px',
          fontSize: '0.88rem'
        }}>
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <div style={{ flex: 1 }}>{authError || localValidation}</div>
        </div>
      )}

      {authSuccess && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'var(--color-success-light)',
          border: '1px solid #BBF7D0',
          color: '#166534',
          padding: '12px 16px',
          borderRadius: 'var(--border-radius-sm)',
          marginBottom: '20px',
          fontSize: '0.88rem'
        }}>
          <CheckCircle size={18} style={{ flexShrink: 0 }} />
          <div style={{ flex: 1 }}>{authSuccess}</div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
        {/* Left Column: Firebase Authentication Card */}
        <div className="card" style={{ background: '#FFFFFF' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', fontWeight: 800 }}>
              {mode === 'login' && '1. Sign In to LifeLink'}
              {mode === 'register' && '2. Create Patient Account'}
              {mode === 'forgot_password' && '4. Reset Password'}
            </h2>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {isFirebaseConfigured ? '🟢 Live Firebase' : '🟡 Dev Sandbox'}
            </span>
          </div>

          {/* Screen 3: Continue with Google Button */}
          {mode !== 'forgot_password' && (
            <div style={{ marginBottom: '18px' }}>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={submitting || loading}
                className="btn btn-outline"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  background: '#FFFFFF',
                  border: '1px solid var(--bg-card-border)',
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  padding: '10px 16px',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" style={{ marginRight: '8px' }}>
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div style={{ display: 'flex', alignItems: 'center', margin: '16px 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                <div style={{ flex: 1, height: '1px', background: 'var(--bg-card-border)' }} />
                <span style={{ padding: '0 10px' }}>OR USE EMAIL</span>
                <div style={{ flex: 1, height: '1px', background: 'var(--bg-card-border)' }} />
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {mode === 'register' && (
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Full Legal Name
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={16} color="var(--text-muted)" style={{ position: 'absolute', top: '12px', left: '12px' }} />
                  <input
                    type="text"
                    placeholder="e.g. Ramesh Bhat"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    style={{ width: '100%', paddingLeft: '38px' }}
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', top: '12px', left: '12px' }} />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: '100%', paddingLeft: '38px' }}
                  required
                />
              </div>
            </div>

            {mode !== 'forgot_password' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    Password
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => { setMode('forgot_password'); clearMessages(); }}
                      style={{ fontSize: '0.78rem', color: 'var(--color-primary)', fontWeight: 600 }}
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', top: '12px', left: '12px' }} />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ width: '100%', paddingLeft: '38px' }}
                    required
                  />
                </div>
              </div>
            )}

            {mode === 'register' && (
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Confirm Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', top: '12px', left: '12px' }} />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{ width: '100%', paddingLeft: '38px' }}
                    required
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || loading}
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', marginTop: '6px' }}
            >
              {submitting ? (
                <>
                  <RefreshCw size={16} className="spin" />
                  <span>Processing...</span>
                </>
              ) : mode === 'login' ? (
                <span>Sign In to LifeLink</span>
              ) : mode === 'register' ? (
                <span>Register Account & Send Verification</span>
              ) : (
                <span>Send Password Reset Email</span>
              )}
            </button>
          </form>

          {/* Screen Switchers */}
          <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            {mode === 'login' && (
              <div>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('register'); clearMessages(); }}
                  style={{ color: 'var(--color-primary)', fontWeight: 700, textDecoration: 'underline' }}
                >
                  Create Account
                </button>
              </div>
            )}

            {mode === 'register' && (
              <div>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('login'); clearMessages(); }}
                  style={{ color: 'var(--color-primary)', fontWeight: 700, textDecoration: 'underline' }}
                >
                  Sign In
                </button>
              </div>
            )}

            {mode === 'forgot_password' && (
              <div>
                Remember your password?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('login'); clearMessages(); }}
                  style={{ color: 'var(--color-primary)', fontWeight: 700, textDecoration: 'underline' }}
                >
                  Back to Sign In
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Quick Demo Profiles for Evaluators */}
        <div className="card" style={{ background: '#FFFFFF' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <UserCheck size={20} color="var(--color-primary)" />
            <h2 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', fontWeight: 700 }}>
              Evaluator Quick-Access Profiles
            </h2>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.4 }}>
            Instantly evaluate LifeLink AI features without manual typing. Pre-configured with simulated medical profiles, verified emergency contacts, and coastal Karnataka location presets.
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
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s ease'
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{p.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{p.location}</div>
                </div>
                <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>{p.role}</span>
              </button>
            ))}
          </div>

          <div style={{ marginTop: '20px', padding: '12px', background: 'var(--bg-soft-blue)', borderRadius: '6px', border: '1px solid #BAE6FD', fontSize: '0.78rem', color: 'var(--color-primary)', lineHeight: 1.4 }}>
            <strong>Backend Security Note:</strong> Protected FastAPI endpoints verify Firebase ID tokens or sandbox demo tokens and enforce user-level data isolation.
          </div>
        </div>
      </div>
    </div>
  );
}
