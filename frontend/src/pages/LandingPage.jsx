import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useEmergency } from '../context/EmergencyContext';
import { SosButton } from '../components/SosButton';
import { 
  ShieldAlert, 
  MapPin, 
  Hospital, 
  Users, 
  Bot, 
  Cpu, 
  PhoneCall, 
  ArrowRight,
  Radio,
  Clock,
  ShieldCheck
} from 'lucide-react';

export function LandingPage() {
  const { t } = useLanguage();
  const { location } = useEmergency();

  return (
    <div style={{ paddingBottom: '60px', background: 'var(--bg-main)' }}>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(180deg, #EAF4FF 0%, #F7FAFC 100%)',
        padding: '60px 20px 40px',
        textAlign: 'center',
        borderBottom: '1px solid var(--bg-card-border)'
      }}>
        <div className="container" style={{ maxWidth: '900px' }}>
          {/* Top Pill */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            borderRadius: 'var(--border-radius-full)',
            background: '#FFFFFF',
            border: '1px solid #BAE6FD',
            color: 'var(--color-primary)',
            fontSize: '0.82rem',
            fontWeight: 700,
            marginBottom: '20px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <Radio size={14} color="var(--color-primary)" />
            <span>Autonomous Emergency Healthcare Coordination</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(2.1rem, 4.8vw, 3.4rem)',
            fontWeight: 800,
            lineHeight: 1.18,
            marginBottom: '18px',
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em'
          }}>
            Emergency Help, <br />
            <span style={{ color: 'var(--color-primary)' }}>
              When You Need It Most.
            </span>
          </h1>

          <p style={{
            fontSize: '1.1rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            marginBottom: '36px',
            maxWidth: '700px',
            margin: '0 auto 36px'
          }}>
            LifeLink bridges the critical golden hour in medical crises. Broadcast validated GPS coordinates, discover specialized 24x7 hospitals, notify trusted contacts, and receive clinical first-aid guidance.
          </p>

          {/* Interactive Hero SOS Trigger Box */}
          <div style={{
            background: '#FFFFFF',
            border: '1px solid var(--bg-card-border)',
            borderRadius: 'var(--border-radius-lg)',
            padding: '36px 20px',
            boxShadow: 'var(--shadow-md)',
            maxWidth: '500px',
            margin: '0 auto 36px',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              top: '-12px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'var(--color-emergency)',
              color: '#FFFFFF',
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '3px 14px',
              borderRadius: 'var(--border-radius-full)',
              letterSpacing: '0.04em'
            }}>
              INTERACTIVE SOS DEMO
            </div>

            <SosButton />

            <div style={{
              marginTop: '22px',
              display: 'flex',
              justifyContent: 'center',
              gap: '12px'
            }}>
              <Link to="/dashboard" className="btn btn-emergency">
                <span>Enter Full Emergency Dashboard</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* Emergency Statutory Quick Call Bar */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '12px',
            flexWrap: 'wrap'
          }}>
            <a href="tel:108" className="btn btn-outline" style={{ background: '#FFFFFF', borderColor: '#FECACA', color: 'var(--color-emergency)', fontWeight: 700 }}>
              <PhoneCall size={16} color="var(--color-emergency)" />
              <span>Call 108 (Ambulance)</span>
            </a>
            <a href="tel:112" className="btn btn-outline" style={{ background: '#FFFFFF', borderColor: '#BAE6FD', color: 'var(--color-primary)', fontWeight: 700 }}>
              <PhoneCall size={16} color="var(--color-primary)" />
              <span>Call 112 (National Emergency)</span>
            </a>
            <Link to="/judge-demo" className="btn btn-outline" style={{ background: '#FFFFFF', borderColor: '#FDE68A', color: 'var(--color-warning)', fontWeight: 700 }}>
              <span>⚖️ Run Judge Demo Mode</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 6 Core Pillars Section */}
      <section style={{ padding: '60px 20px', background: 'var(--bg-main)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '45px' }}>
            <h2 style={{ fontSize: '1.9rem', marginBottom: '10px', color: 'var(--text-primary)' }}>
              Core Healthcare System Architecture
            </h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto', fontSize: '0.95rem' }}>
              Engineered for low-latency rural accessibility, explainable medical decision-making, and privacy preservation.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="card">
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'var(--color-emergency-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                <ShieldAlert size={22} color="var(--color-emergency)" />
              </div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '6px', color: 'var(--text-primary)' }}>5 SOS Activation Methods</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5 }}>
                Thumb-press countdown, hidden motion gesture, Android back-tap, volume key pattern, and OS power button shortcuts with false-alarm cancellation.
              </p>
            </div>

            <div className="card">
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'var(--bg-soft-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                <Hospital size={22} color="var(--color-primary)" />
              </div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '6px', color: 'var(--text-primary)' }}>Geospatial Healthcare Matching</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5 }}>
                Real-time Haversine distance calculations and OpenStreetMap Overpass live queries across Bhatkal, Uttara Kannada, and beyond. Never fabricates beds.
              </p>
            </div>

            <div className="card">
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'var(--color-success-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                <Bot size={22} color="var(--color-success)" />
              </div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '6px', color: 'var(--text-primary)' }}>Explainable Agentic AI</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5 }}>
                Multi-tool reasoning engine with clinical triage rating, WHO/Red Cross first-aid guidance, and explicit user authorization gates before consequential actions.
              </p>
            </div>

            <div className="card">
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#F3E8FF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                <Cpu size={22} color="#7C3AED" />
              </div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '6px', color: 'var(--text-primary)' }}>Privacy Federated Learning</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5 }}>
                Multi-hospital FedAvg model training for emergency triage risk without transferring raw patient clinical records off hospital devices.
              </p>
            </div>

            <div className="card">
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'var(--color-warning-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                <Users size={22} color="var(--color-warning)" />
              </div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '6px', color: 'var(--text-primary)' }}>Trusted Contact Alerts</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5 }}>
                Automated SMS gateway, WhatsApp click-to-chat links with live Google Maps URLs, and strict distinction between delivery and human acknowledgement.
              </p>
            </div>

            <div className="card">
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'var(--bg-soft-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                <MapPin size={22} color="var(--color-primary)" />
              </div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '6px', color: 'var(--text-primary)' }}>Kannada & Offline PWA</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5 }}>
                Complete bilingual interface in English and Kannada (ಕನ್ನಡ), Service Worker emergency caching, and high-contrast accessibility.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
