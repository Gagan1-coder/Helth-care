import React from 'react';
import { Shield, AlertTriangle, Phone } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer style={{
      marginTop: 'auto',
      borderTop: '1px solid var(--bg-card-border)',
      background: 'var(--bg-card)',
      padding: '40px 20px 20px',
      color: 'var(--text-secondary)',
      fontSize: '0.88rem'
    }}>
      <div className="container">
        {/* Urgent Statutory Warning Banner */}
        <div style={{
          background: 'rgba(220, 38, 38, 0.1)',
          border: '1px solid rgba(220, 38, 38, 0.3)',
          borderRadius: 'var(--border-radius-md)',
          padding: '16px 20px',
          marginBottom: '30px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '14px'
        }}>
          <AlertTriangle color="var(--color-emergency)" size={24} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ fontWeight: 700, color: '#fca5a5', marginBottom: '4px' }}>
              CRITICAL EMERGENCY NOTICE & DISCLAIMER
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.4' }}>
              LifeLink AI is an intelligent coordination and public safety support application. In any immediately life-threatening medical emergency, call <strong>108 (Emergency Ambulance)</strong> or <strong>112 (National Emergency Support)</strong> directly without delay. Never substitute software recommendations for on-scene medical professionals.
            </p>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '30px',
          paddingBottom: '30px',
          borderBottom: '1px solid var(--bg-card-border)'
        }}>
          <div>
            <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '1.1rem', marginBottom: '10px' }}>
              LifeLink AI
            </div>
            <p style={{ fontSize: '0.82rem', lineHeight: '1.5', color: 'var(--text-muted)' }}>
              Intelligent Emergency Healthcare Coordination Using Agentic AI and Federated Learning. Built from zero to tested deployment.
            </p>
          </div>

          <div>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>Emergency Hotlines (India)</div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
              <li><a href="tel:108" style={{ color: 'var(--color-primary)' }}>🚑 108 — Medical Ambulance</a></li>
              <li><a href="tel:112" style={{ color: 'var(--color-primary)' }}>🚨 112 — National Unified Emergency</a></li>
              <li><a href="tel:102" style={{ color: 'var(--color-primary)' }}>👶 102 — Free Pregnancy & Infant Transit</a></li>
              <li><a href="tel:1077" style={{ color: 'var(--color-primary)' }}>🌊 1077 — District Disaster Management</a></li>
            </ul>
          </div>

          <div>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>Regional Coverage</div>
            <p style={{ fontSize: '0.82rem', lineHeight: '1.5', color: 'var(--text-muted)' }}>
              Optimized for Bhatkal, Uttara Kannada, Coastal Karnataka, and rural-urban emergency connectivity. Real OpenStreetMap Overpass live queries worldwide.
            </p>
          </div>

          <div>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>Privacy & Security</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4ade80', fontSize: '0.82rem', marginBottom: '8px' }}>
              <Shield size={16} />
              <span>Zero Raw Data Upload in Federated Learning</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              End-to-end encrypted medical profile consent controls & immediate deletion rights.
            </p>
          </div>
        </div>

        <div style={{
          paddingTop: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px',
          fontSize: '0.78rem',
          color: 'var(--text-muted)'
        }}>
          <div>© {new Date().getFullYear()} LifeLink AI Emergency Coordination. All rights reserved.</div>
          <div style={{ display: 'flex', gap: '15px' }}>
            <span>Verified GPS Engine</span>
            <span>FedAvg Research Model</span>
            <span>Bhatkal Emergency Care</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
