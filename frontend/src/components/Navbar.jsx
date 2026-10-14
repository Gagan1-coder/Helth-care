import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useEmergency } from '../context/EmergencyContext';
import { 
  AlertCircle, 
  Hospital, 
  Users, 
  Bot, 
  Cpu, 
  Activity, 
  Settings as SettingsIcon, 
  PhoneCall, 
  Globe, 
  Wifi, 
  WifiOff,
  Menu,
  X,
  PlayCircle
} from 'lucide-react';

export function Navbar() {
  const { lang, setLang, t } = useLanguage();
  const { activeEmergency, networkOnline, isJudgeDemo, setIsJudgeDemo } = useEmergency();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { to: '/dashboard', label: t('emergency_dashboard'), icon: AlertCircle },
    { to: '/hospitals', label: t('hospitals'), icon: Hospital },
    { to: '/contacts', label: t('contacts'), icon: Users },
    { to: '/agent', label: t('ai_coordinator'), icon: Bot },
    { to: '/federated', label: t('federated_learning'), icon: Cpu },
    { to: '/analytics', label: t('analytics'), icon: Activity },
    { to: '/judge-demo', label: t('judge_demo'), icon: PlayCircle, highlight: true },
    { to: '/settings', label: t('settings'), icon: SettingsIcon },
  ];

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'var(--bg-glass)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--bg-card-border)'
    }}>
      {/* Top Urgent Emergency Alert Bar */}
      <div style={{
        background: activeEmergency ? 'var(--color-emergency)' : '#1e293b',
        color: 'white',
        fontSize: '0.82rem',
        padding: '5px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontWeight: 600
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span>{activeEmergency ? `🚨 ${t('active_emergency')} (ID: ${activeEmergency.id?.slice(0, 8)})` : '🛡️ LifeLink Emergency Response Ready'}</span>
          {isJudgeDemo && (
            <span style={{
              background: '#f59e0b',
              color: '#000',
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '0.75rem',
              fontWeight: 800
            }}>
              ⚖️ JUDGE DEMO MODE (Zero Live SMS Charges)
            </span>
          )}
        </div>

        {/* Quick Emergency Hotlines */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <a href="tel:108" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#fef08a' }}>
            <PhoneCall size={13} /> {t('quick_call_ambulance')}
          </a>
          <a href="tel:112" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#93c5fd' }}>
            <PhoneCall size={13} /> {t('quick_call_police')}
          </a>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: networkOnline ? '#4ade80' : '#f87171' }}>
            {networkOnline ? <Wifi size={13} /> : <WifiOff size={13} />}
            {networkOnline ? 'Online' : 'Offline Cache'}
          </span>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #ef4444 0%, #991b1b 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 900,
            boxShadow: '0 0 15px rgba(239, 68, 68, 0.4)'
          }}>
            +
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>LifeLink</span>
              <span style={{ color: 'var(--color-primary)', fontSize: '0.9rem', border: '1px solid var(--color-primary)', borderRadius: '4px', padding: '1px 5px' }}>AI</span>
            </div>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '6px' }} className="desktop-nav">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 12px',
                  borderRadius: 'var(--border-radius-sm)',
                  fontSize: '0.88rem',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? 'var(--color-primary)' : item.highlight ? '#f59e0b' : 'var(--text-secondary)',
                  background: isActive ? 'rgba(2, 132, 199, 0.12)' : item.highlight ? 'rgba(245, 158, 11, 0.1)' : 'transparent',
                  border: item.highlight ? '1px dashed rgba(245, 158, 11, 0.4)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Controls: Language Switcher & Mobile Menu Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => setLang(lang === 'en' ? 'kn' : 'en')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: 'var(--border-radius-full)',
              background: 'var(--bg-card)',
              border: '1px solid var(--bg-card-border)',
              color: 'var(--text-primary)',
              fontSize: '0.82rem',
              fontWeight: 600
            }}
            title="Switch Language / ಭಾಷೆ ಬದಲಾಯಿಸಿ"
          >
            <Globe size={14} color="var(--color-primary)" />
            <span>{lang === 'en' ? 'ಕನ್ನಡ' : 'English'}</span>
          </button>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ display: 'none', padding: '6px', color: 'var(--text-primary)' }}
            className="mobile-menu-btn"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div style={{
          background: 'var(--bg-card)',
          borderBottom: '1px solid var(--bg-card-border)',
          padding: '15px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px',
                  borderRadius: 'var(--border-radius-sm)',
                  fontSize: '0.95rem',
                  color: 'var(--text-primary)'
                }}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}

      <style>{`
        @media (max-width: 992px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </header>
  );
}
