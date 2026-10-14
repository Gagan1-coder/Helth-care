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
  PlayCircle,
  History
} from 'lucide-react';

export function Navbar() {
  const { lang, setLang, t } = useLanguage();
  const { activeEmergency, networkOnline, isJudgeDemo } = useEmergency();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { to: '/dashboard', label: t('emergency_dashboard'), icon: AlertCircle },
    { to: '/hospitals', label: t('hospitals'), icon: Hospital },
    { to: '/contacts', label: t('contacts'), icon: Users },
    { to: '/history', label: 'History', icon: History },
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
      background: '#FFFFFF',
      borderBottom: '1px solid var(--bg-card-border)',
      boxShadow: 'var(--shadow-sm)'
    }}>
      {/* Top Urgent Emergency Alert & Hotline Bar */}
      <div style={{
        background: activeEmergency ? 'var(--color-emergency)' : 'var(--bg-soft-blue)',
        color: activeEmergency ? '#FFFFFF' : 'var(--text-primary)',
        fontSize: '0.8rem',
        padding: '6px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontWeight: 600,
        borderBottom: activeEmergency ? 'none' : '1px solid #BAE6FD'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span>
            {activeEmergency ? `🚨 ${t('active_emergency')} (ID: ${activeEmergency.id?.slice(0, 8)})` : '🛡️ LifeLink Emergency Healthcare System Active'}
          </span>
          {isJudgeDemo && (
            <span style={{
              background: '#FEF3C7',
              color: '#B45309',
              border: '1px solid #FDE68A',
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '0.72rem',
              fontWeight: 700
            }}>
              ⚖️ JUDGE DEMO MODE (Safe Sandbox)
            </span>
          )}
        </div>

        {/* Quick Emergency Hotlines */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <a
            href="tel:108"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: activeEmergency ? '#FFFFFF' : 'var(--color-emergency)',
              fontWeight: 700
            }}
          >
            <PhoneCall size={12} /> {t('quick_call_ambulance')}
          </a>
          <a
            href="tel:112"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: activeEmergency ? '#FFFFFF' : 'var(--color-primary)',
              fontWeight: 700
            }}
          >
            <PhoneCall size={12} /> {t('quick_call_police')}
          </a>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: networkOnline ? 'var(--color-success)' : 'var(--color-emergency)' }}>
            {networkOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
            {networkOnline ? 'Online' : 'Offline'}
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
            background: 'var(--color-emergency)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            fontWeight: 900,
            fontSize: '1.2rem',
            boxShadow: '0 2px 6px rgba(229, 57, 69, 0.3)'
          }}>
            +
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: 'var(--text-primary)' }}>LifeLink</span>
              <span style={{
                color: 'var(--color-primary)',
                background: 'var(--bg-soft-blue)',
                fontSize: '0.8rem',
                border: '1px solid #BAE6FD',
                borderRadius: '4px',
                padding: '1px 6px',
                fontWeight: 700
              }}>
                AI
              </span>
            </div>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '4px' }} className="desktop-nav">
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
                  color: isActive ? 'var(--color-primary)' : item.highlight ? 'var(--color-warning)' : 'var(--text-secondary)',
                  background: isActive ? 'var(--bg-soft-blue)' : item.highlight ? 'var(--color-warning-light)' : 'transparent',
                  border: item.highlight ? '1px solid #FDE68A' : 'none',
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
              background: '#FFFFFF',
              border: '1px solid var(--bg-card-border)',
              color: 'var(--text-primary)',
              fontSize: '0.82rem',
              fontWeight: 600,
              boxShadow: 'var(--shadow-sm)'
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
          background: '#FFFFFF',
          borderBottom: '1px solid var(--bg-card-border)',
          padding: '15px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          boxShadow: 'var(--shadow-md)'
        }}>
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  borderRadius: 'var(--border-radius-sm)',
                  fontSize: '0.92rem',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? 'var(--color-primary)' : 'var(--text-primary)',
                  background: isActive ? 'var(--bg-soft-blue)' : 'transparent'
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
        @media (max-width: 1024px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </header>
  );
}
