import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useEmergency } from '../context/EmergencyContext';
import { Globe, Eye, Shield, Trash2, Wifi, Bell, Sliders } from 'lucide-react';

export function SettingsPage() {
  const { lang, setLang, t } = useLanguage();
  const { userId, isJudgeDemo, setIsJudgeDemo } = useEmergency();

  const [highContrast, setHighContrast] = useState(() => {
    return document.documentElement.getAttribute('data-contrast') === 'high';
  });

  const [theme, setTheme] = useState(() => {
    return document.documentElement.getAttribute('data-theme') || 'dark';
  });

  const toggleHighContrast = (e) => {
    const isChecked = e.target.checked;
    setHighContrast(isChecked);
    if (isChecked) {
      document.documentElement.setAttribute('data-contrast', 'high');
    } else {
      document.documentElement.removeAttribute('data-contrast');
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <div className="container" style={{ padding: '30px 20px 60px', maxWidth: '780px' }}>
      <div style={{ marginBottom: '25px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>{t('settings')} & Accessibility</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Personalize language, visual contrast, rural low-bandwidth mode, and privacy preferences.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Language Selection Card */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <Globe size={20} color="var(--color-primary)" />
            <h3 style={{ fontSize: '1.1rem' }}>Language / ಭಾಷೆ</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <button
              onClick={() => setLang('en')}
              className={`btn ${lang === 'en' ? 'btn-primary' : 'btn-outline'}`}
              style={{ justifyContent: 'flex-start', padding: '14px' }}
            >
              <div>
                <div style={{ fontWeight: 700 }}>English</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Standard Clinical Interface</div>
              </div>
            </button>

            <button
              onClick={() => setLang('kn')}
              className={`btn ${lang === 'kn' ? 'btn-primary' : 'btn-outline'}`}
              style={{ justifyContent: 'flex-start', padding: '14px' }}
            >
              <div>
                <div style={{ fontWeight: 700 }}>ಕನ್ನಡ (Kannada)</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>ಕರ್ನಾಟಕ ಪ್ರಾದೇಶಿಕ ಭಾಷೆ</div>
              </div>
            </button>
          </div>
        </div>

        {/* Visual Accessibility Card */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <Eye size={20} color="#f59e0b" />
            <h3 style={{ fontSize: '1.1rem' }}>Visual Accessibility & Contrast</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>High-Contrast Emergency Mode</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Maximizes text contrast on sunlight-exposed mobile screens.
                </div>
              </div>
              <input
                type="checkbox"
                checked={highContrast}
                onChange={toggleHighContrast}
                style={{ width: '20px', height: '20px' }}
              />
            </label>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--bg-card-border)' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Color Theme</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Current: {theme === 'dark' ? 'OLED Dark Slate' : 'Clean Surgical Light'}
                </div>
              </div>
              <button onClick={toggleTheme} className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
                Toggle {theme === 'dark' ? 'Light' : 'Dark'} Mode
              </button>
            </div>
          </div>
        </div>

        {/* Evaluation Mode Switcher */}
        <div className="card" style={{ borderColor: 'rgba(245, 158, 11, 0.4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <Sliders size={20} color="#f59e0b" />
            <h3 style={{ fontSize: '1.1rem' }}>Evaluator & Demonstration Controls</h3>
          </div>

          <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Enable Judge Demo Sandbox</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Suppresses live carrier cellular SMS bills and logs dispatches to local sandbox.
              </div>
            </div>
            <input
              type="checkbox"
              checked={isJudgeDemo}
              onChange={(e) => setIsJudgeDemo(e.target.checked)}
              style={{ width: '20px', height: '20px' }}
            />
          </label>
        </div>

        {/* Account & Right to be Forgotten */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <Shield size={20} color="#10b981" />
            <h3 style={{ fontSize: '1.1rem' }}>Account & Data Privacy Rights</h3>
          </div>

          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.5 }}>
            Active User ID: <strong>{userId}</strong>. Under Indian Digital Personal Data Protection (DPDP) and healthcare privacy standards, you maintain the right to delete all medical profile data at any time.
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="btn"
              style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontSize: '0.82rem' }}
            >
              <Trash2 size={15} />
              <span>Reset Local Cache & Session</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
