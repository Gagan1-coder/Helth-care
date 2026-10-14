import React from 'react';
import { Shield, AlertTriangle, Phone } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer style={{
      marginTop: 'auto',
      borderTop: '1px solid var(--bg-card-border)',
      background: '#FFFFFF',
      padding: '40px 20px 24px',
      color: 'var(--text-secondary)',
      fontSize: '0.88rem'
    }}>
      <div className="container">
        {/* Urgent Statutory Warning Banner in Accessible Light Red */}
        <div style={{
          background: 'var(--color-emergency-light)',
          border: '1px solid #FECACA',
          borderRadius: 'var(--border-radius-md)',
          padding: '16px 20px',
          marginBottom: '32px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '14px'
        }}>
          <AlertTriangle color="var(--color-emergency)" size={24} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ fontWeight: 700, color: '#B91C1C', marginBottom: '4px' }}>
              CRITICAL EMERGENCY NOTICE & MEDICAL DISCLAIMER
            </div>
            <p style={{ color: 'var(--text-primary)', fontSize: '0.85rem', lineHeight: '1.5' }}>
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
            <p style={{ fontSize: '0.82rem', lineHeight: '1.5', color: 'var(--text-secondary)' }}>
              Intelligent Emergency Healthcare Coordination Using Agentic AI and Federated Learning. Built from zero to tested deployment.
            </p>
          </div>

          <div>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>Emergency Hotlines (India)</div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
              <li><a href="tel:108" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>🚑 108 — Medical Ambulance</a></li>
              <li><a href="tel:112" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>🚨 112 — National Unified Emergency</a></li>
              <li><a href="tel:102" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>👶 102 — Pregnancy & Infant Transit</a></li>
              <li><a href="tel:1077" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>🌊 1077 — District Disaster Help</a></li>
            </ul>
          </div>

          <div>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>Regional Coverage</div>
            <p style={{ fontSize: '0.82rem', lineHeight: '1.5', color: 'var(--text-secondary)' }}>
              Optimized for Bhatkal, Uttara Kannada, Coastal Karnataka, and rural-urban emergency connectivity. Real OpenStreetMap Overpass live queries worldwide.
            </p>
          </div>

          <div>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>Privacy & Security</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-success)', fontSize: '0.82rem', marginBottom: '8px', fontWeight: 600 }}>
              <Shield size={16} />
              <span>Zero Raw Patient Data Transfer</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Complies with DPDP standards: explicit consent controls, encrypted transit, and immediate deletion rights.
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
          fontSize: '0.8rem',
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
