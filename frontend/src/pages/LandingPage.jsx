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
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  Radio
} from 'lucide-react';

export function LandingPage() {
  const { t } = useLanguage();
  const { location } = useEmergency();

  return (
    <div style={{ paddingBottom: '60px' }}>
      {/* Hero Section */}
      <section style={{
        background: 'radial-gradient(circle at 50% 20%, rgba(220, 38, 38, 0.15) 0%, rgba(11, 17, 32, 0) 70%)',
        padding: '60px 20px 40px',
        textAlign: 'center'
      }}>
        <div className="container" style={{ maxWidth: '900px' }}>
          {/* Top Pill */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: 'var(--border-radius-full)',
            background: 'rgba(220, 38, 38, 0.12)',
            border: '1px solid rgba(220, 38, 38, 0.3)',
            color: '#ef4444',
            fontSize: '0.85rem',
            fontWeight: 700,
            marginBottom: '20px'
          }}>
            <Radio size={15} className="spin" style={{ animationDuration: '3s' }} />
            <span>Autonomous Emergency Healthcare Coordination</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(2.2rem, 5vw, 3.6rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            marginBottom: '20px',
            color: 'var(--text-primary)'
          }}>
            Instant Emergency Response <br />
            <span style={{
              background: 'linear-gradient(135deg, #ef4444 0%, #38bdf8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Powered by Agentic AI & Federated Learning
            </span>
          </h1>

          <p style={{
            fontSize: '1.15rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            marginBottom: '40px',
            maxWidth: '720px',
            margin: '0 auto 40px'
          }}>
            LifeLink bridges the golden hour in medical emergencies. Broadcast high-accuracy GPS coordinates, discover specialized 24x7 hospitals, notify trusted contacts, and receive clinical first-aid guidance.
          </p>

          {/* Interactive Hero SOS Trigger */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--bg-card-border)',
            borderRadius: 'var(--border-radius-lg)',
            padding: '40px 20px',
            boxShadow: 'var(--shadow-lg)',
            maxWidth: '520px',
            margin: '0 auto 40px',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              top: '-12px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'var(--color-emergency)',
              color: 'white',
              fontSize: '0.75rem',
              fontWeight: 800,
              padding: '3px 12px',
              borderRadius: 'var(--border-radius-full)',
              letterSpacing: '0.05em'
            }}>
              PRESS & HOLD SOS DEMO
            </div>

            <SosButton />

            <div style={{
              marginTop: '25px',
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
            gap: '15px',
            flexWrap: 'wrap'
          }}>
            <a href="tel:108" className="btn btn-outline" style={{ background: 'var(--bg-card)', borderColor: '#ef4444' }}>
              <PhoneCall size={18} color="#ef4444" />
              <span>Call 108 (Ambulance)</span>
            </a>
            <a href="tel:112" className="btn btn-outline" style={{ background: 'var(--bg-card)', borderColor: '#0284c7' }}>
              <PhoneCall size={18} color="#0284c7" />
              <span>Call 112 (National Police/Fire)</span>
            </a>
            <Link to="/judge-demo" className="btn btn-outline" style={{ borderColor: '#f59e0b', color: '#f59e0b' }}>
              <span>⚖️ Run Judge Demo Mode</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 5 Core Pillars Section */}
      <section style={{ padding: '60px 20px', background: 'var(--bg-main)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '45px' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '12px' }}>Core System Architecture</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
              Engineered for low-latency rural accessibility, explainable medical decision-making, and privacy preservation.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="card">
              <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(220, 38, 38, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <ShieldAlert size={24} color="#ef4444" />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>5 SOS Activation Methods</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5 }}>
                Thumb-press countdown, hidden motion gesture, Android back-tap, volume key pattern, and OS power button shortcuts with false-alarm cancellation.
              </p>
            </div>

            <div className="card">
              <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(2, 132, 199, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Hospital size={24} color="#0284c7" />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Geospatial Healthcare Matching</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5 }}>
                Real-time Haversine distance calculations and OpenStreetMap Overpass live queries across Bhatkal, Uttara Kannada, and beyond. Never fabricates hospital beds.
              </p>
            </div>

            <div className="card">
              <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Bot size={24} color="#10b981" />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Explainable Agentic AI</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5 }}>
                Multi-tool reasoning engine with clinical triage rating, WHO/Red Cross first-aid guidance, and explicit user authorization gates before consequential actions.
              </p>
            </div>

            <div className="card">
              <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(168, 85, 247, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Cpu size={24} color="#a855f7" />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Privacy Federated Learning</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5 }}>
                PyTorch/Flower multi-client FedAvg training for ICU urgency triage without transferring raw patient clinical records off hospital devices.
              </p>
            </div>

            <div className="card">
              <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Users size={24} color="#f59e0b" />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Trusted Contact Alerts</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5 }}>
                Automated SMS gateway, WhatsApp click-to-chat links with live Google Maps URLs, and strict distinction between delivery and human acknowledgement.
              </p>
            </div>

            <div className="card">
              <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <MapPin size={24} color="#3b82f6" />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Kannada & Offline PWA</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5 }}>
                Complete bilingual interface in English and Kannada (ಕನ್ನಡ), Service Worker emergency caching, and high-contrast accessibility.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
