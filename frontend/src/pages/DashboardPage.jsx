import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useEmergency } from '../context/EmergencyContext';
import { SosButton } from '../components/SosButton';
import { HospitalCard } from '../components/HospitalCard';
import { api } from '../services/api';
import { 
  Heart, 
  Car, 
  Activity, 
  Wind, 
  Brain, 
  Baby, 
  AlertTriangle, 
  MapPin, 
  RefreshCw, 
  XCircle, 
  CheckCircle, 
  Clock, 
  ShieldAlert,
  Smartphone,
  Sliders,
  ExternalLink,
  Volume2,
  Hospital,
  Users,
  History,
  CheckCircle2,
  Wifi,
  Radio
} from 'lucide-react';

export function DashboardPage() {
  const { t } = useLanguage();
  const { 
    userId, 
    activeEmergency, 
    location, 
    locationLoading, 
    fetchLocation, 
    selectedCategory, 
    setSelectedCategory, 
    cancelEmergency, 
    resolveEmergency, 
    triggerSOS,
    contacts,
    networkOnline
  } = useEmergency();

  const [activeTab, setActiveTab] = useState('thumb'); // thumb, gesture, backtap, volume, power
  const [gestureTriggered, setGestureTriggered] = useState(false);
  const [volumeSequence, setVolumeSequence] = useState([]);
  const [nearbyHospitals, setNearbyHospitals] = useState([]);
  const [hospitalsLoading, setHospitalsLoading] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);

  const categories = [
    { id: 'cardiac', label: t('cat_cardiac'), icon: Heart, color: '#E53945' },
    { id: 'road_accident', label: t('cat_road_accident'), icon: Car, color: '#EA580C' },
    { id: 'severe_trauma', label: t('cat_severe_trauma'), icon: Activity, color: '#DC2626' },
    { id: 'respiratory', label: t('cat_respiratory'), icon: Wind, color: '#0284C7' },
    { id: 'stroke', label: t('cat_stroke'), icon: Brain, color: '#7C3AED' },
    { id: 'maternal', label: t('cat_maternal'), icon: Baby, color: '#DB2777' },
    { id: 'general', label: t('cat_general'), icon: AlertTriangle, color: '#D97706' },
  ];

  // Load nearby hospitals whenever location or category updates
  useEffect(() => {
    async function loadNearby() {
      setHospitalsLoading(true);
      try {
        const res = await api.searchHospitals({
          latitude: location?.latitude,
          longitude: location?.longitude,
          city_district: location?.latitude ? null : 'Bhatkal',
          category: selectedCategory,
          radius_km: 30.0
        });
        setNearbyHospitals(res.facilities?.slice(0, 2) || []);
      } catch (e) {
        console.warn('Failed to load initial hospitals:', e);
      } finally {
        setHospitalsLoading(false);
      }
    }
    loadNearby();
  }, [location, selectedCategory]);

  // Method 2: Device Motion / Shake simulation
  const handleTestShake = () => {
    setGestureTriggered(true);
    triggerSOS('hidden_gesture');
    setTimeout(() => setGestureTriggered(false), 2000);
  };

  // Method 4: Volume sequence trigger (Up - Up - Down)
  const handleVolumeKey = (key) => {
    const updated = [...volumeSequence, key].slice(-3);
    setVolumeSequence(updated);
    if (updated.join('-') === 'up-up-down') {
      triggerSOS('volume_pattern');
      setVolumeSequence([]);
    }
  };

  return (
    <div className="container" style={{ padding: '30px 20px 60px' }}>
      {/* Welcoming Header Section */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px', letterSpacing: '-0.02em' }}>
          Emergency Help, When You Need It.
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.98rem', maxWidth: '750px', lineHeight: 1.5 }}>
          Intelligent emergency healthcare coordination. Trigger an immediate SOS, broadcast real device GPS, find verified 24x7 hospitals, notify trusted contacts, and receive clinical first-aid guidance.
        </p>
      </div>

      {/* Top Active Emergency Alert Card (if triggered) */}
      {activeEmergency && (
        <div className="card" style={{
          background: '#FFF5F5',
          border: '2px solid var(--color-emergency)',
          padding: '20px 24px',
          marginBottom: '30px',
          boxShadow: 'var(--shadow-emergency)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '15px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <ShieldAlert size={28} color="var(--color-emergency)" />
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-emergency)' }}>
                  {t('sos_activated_title')}
                </h2>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '12px' }}>
                Event ID: <strong>{activeEmergency.id}</strong> • Category: <strong>{activeEmergency.category?.toUpperCase()}</strong> • Triggered via: <strong>{activeEmergency.sos_method?.replace('_', ' ')}</strong>
              </p>

              {/* Active Emergency Timeline items */}
              <div style={{ background: '#FFFFFF', border: '1px solid #FECACA', padding: '12px 16px', borderRadius: '8px', marginBottom: '14px' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-emergency)', marginBottom: '6px' }}>
                  Live Emergency Coordination Timeline:
                </div>
                {activeEmergency.timeline?.map((item, idx) => (
                  <div key={idx} style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', color: 'var(--text-primary)' }}>
                    <Clock size={13} color="var(--text-muted)" />
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{new Date(item.timestamp).toLocaleTimeString()}</span>
                    <span>{item.message}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Emergency Action Buttons */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setShowCancelModal(true)}
                className="btn btn-secondary"
                style={{ color: 'var(--color-emergency)', borderColor: '#FECACA', background: '#FFFFFF', fontWeight: 700 }}
              >
                <XCircle size={16} />
                <span>{t('cancel_emergency_btn')}</span>
              </button>
              <button
                onClick={() => resolveEmergency('Resolved safely on scene')}
                className="btn"
                style={{ background: 'var(--color-success)', color: '#FFFFFF', fontWeight: 700 }}
              >
                <CheckCircle size={16} />
                <span>{t('mark_resolved_btn')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: SOS Hub & Location / Facilities */}
      <div className="grid grid-cols-3 gap-6" style={{ marginBottom: '30px' }}>
        {/* Left Column: 2 Spans -> SOS Console & Category Selection */}
        <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Emergency Category Selector Card */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>Select Emergency Type</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Tailors clinical guidance and hospital priority</span>
              </div>
              <span className="badge badge-info" style={{ fontSize: '0.75rem' }}>
                Active: {selectedCategory.replace('_', ' ').toUpperCase()}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px 10px',
                      borderRadius: 'var(--border-radius-sm)',
                      background: isSelected ? 'var(--bg-soft-blue)' : '#FFFFFF',
                      border: isSelected ? `2px solid var(--color-primary)` : '1px solid var(--bg-card-border)',
                      color: isSelected ? 'var(--color-primary)' : 'var(--text-primary)',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? 'var(--shadow-sm)' : 'none'
                    }}
                  >
                    <Icon size={22} color={isSelected ? 'var(--color-primary)' : cat.color} />
                    <span style={{ fontSize: '0.78rem', fontWeight: isSelected ? 700 : 500 }}>
                      {cat.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SOS Activation Hub with 5 Methods */}
          <div className="card">
            {/* 5 Methods Tab Switcher */}
            <div style={{
              display: 'flex',
              borderBottom: '1px solid var(--bg-card-border)',
              paddingBottom: '12px',
              marginBottom: '20px',
              gap: '8px',
              overflowX: 'auto'
            }}>
              <button
                onClick={() => setActiveTab('thumb')}
                className={`btn ${activeTab === 'thumb' ? 'btn-primary' : 'btn-outline'}`}
                style={{ fontSize: '0.82rem', padding: '6px 14px' }}
              >
                1. Thumb Press
              </button>
              <button
                onClick={() => setActiveTab('gesture')}
                className={`btn ${activeTab === 'gesture' ? 'btn-primary' : 'btn-outline'}`}
                style={{ fontSize: '0.82rem', padding: '6px 14px' }}
              >
                2. Hidden Gesture
              </button>
              <button
                onClick={() => setActiveTab('backtap')}
                className={`btn ${activeTab === 'backtap' ? 'btn-primary' : 'btn-outline'}`}
                style={{ fontSize: '0.82rem', padding: '6px 14px' }}
              >
                3. Back-Tap (Android)
              </button>
              <button
                onClick={() => setActiveTab('volume')}
                className={`btn ${activeTab === 'volume' ? 'btn-primary' : 'btn-outline'}`}
                style={{ fontSize: '0.82rem', padding: '6px 14px' }}
              >
                4. Volume Pattern
              </button>
              <button
                onClick={() => setActiveTab('power')}
                className={`btn ${activeTab === 'power' ? 'btn-primary' : 'btn-outline'}`}
                style={{ fontSize: '0.82rem', padding: '6px 14px' }}
              >
                5. Power Button
              </button>
            </div>

            {/* Tab 1: Thumb Press Flagship Button */}
            {activeTab === 'thumb' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 0 10px' }}>
                <SosButton />
              </div>
            )}

            {/* Tab 2: Hidden Gesture */}
            {activeTab === 'gesture' && (
              <div style={{ padding: '20px 10px', textAlign: 'center' }}>
                <Smartphone size={38} color="var(--color-primary)" style={{ marginBottom: '8px' }} />
                <h4 style={{ fontSize: '1.05rem', marginBottom: '6px' }}>Method 2: Hidden Motion Gesture SOS</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto 16px', lineHeight: 1.5 }}>
                  Utilizes device accelerometer via DeviceMotionEvent API. Shake device firmly 3 times to trigger a discreet emergency alert.
                </p>
                <button onClick={handleTestShake} className="btn btn-emergency">
                  <span>{gestureTriggered ? '⚡ Shake Detected!' : 'Test Shake Motion Trigger'}</span>
                </button>
              </div>
            )}

            {/* Tab 3: Back-Tap SOS */}
            {activeTab === 'backtap' && (
              <div style={{ padding: '20px 10px', textAlign: 'center' }}>
                <Sliders size={38} color="var(--color-primary)" style={{ marginBottom: '8px' }} />
                <h4 style={{ fontSize: '1.05rem', marginBottom: '6px' }}>Method 3: Native Android Back-Tap</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto 16px', lineHeight: 1.5 }}>
                  Requires Android 12+ Accessibility Service companion. Two firm taps on phone back dispatches background SOS broadcast.
                </p>
                <div style={{ display: 'inline-block', background: 'var(--bg-soft-blue)', border: '1px solid #BAE6FD', padding: '8px 14px', borderRadius: '6px', fontSize: '0.8rem', color: 'var(--color-primary)', marginBottom: '16px' }}>
                  Architecture Spec: See <code>android-companion/README.md</code>
                </div>
                <div>
                  <button onClick={() => triggerSOS('back_tap')} className="btn btn-outline">
                    <span>Simulate Back-Tap Double Pulse</span>
                  </button>
                </div>
              </div>
            )}

            {/* Tab 4: Volume Pattern */}
            {activeTab === 'volume' && (
              <div style={{ padding: '20px 10px', textAlign: 'center' }}>
                <Volume2 size={38} color="var(--color-warning)" style={{ marginBottom: '8px' }} />
                <h4 style={{ fontSize: '1.05rem', marginBottom: '6px' }}>Method 4: Volume Key Sequence (Up - Up - Down)</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto 16px', lineHeight: 1.5 }}>
                  Discreet emergency trigger in pocket. Pressing Volume Up twice followed by Volume Down triggers covert dispatch.
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '14px' }}>
                  <button onClick={() => handleVolumeKey('up')} className="btn btn-secondary">▲ Vol Up</button>
                  <button onClick={() => handleVolumeKey('down')} className="btn btn-secondary">▼ Vol Down</button>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  Current Sequence: <strong>{volumeSequence.join(' ➔ ') || '(None)'}</strong>
                </div>
              </div>
            )}

            {/* Tab 5: Power Button */}
            {activeTab === 'power' && (
              <div style={{ padding: '20px 10px', textAlign: 'center' }}>
                <ShieldAlert size={38} color="var(--color-emergency)" style={{ marginBottom: '8px' }} />
                <h4 style={{ fontSize: '1.05rem', marginBottom: '6px' }}>Method 5: Power Button Multi-Press</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto 16px', lineHeight: 1.5 }}>
                  Browser sandboxes cannot intercept hardware power buttons. On Android, LifeLink Companion registers a BroadcastReceiver for 4x screen state pulses.
                </p>
                <button onClick={() => triggerSOS('power_button')} className="btn btn-outline">
                  <span>Simulate 4x Power Button Sequence</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Location & Live Facility Recommendations */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Location Card showing actual location, accuracy, and last update */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={18} color="var(--color-primary)" />
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Your Actual Location</h3>
              </div>
              <button
                onClick={fetchLocation}
                disabled={locationLoading}
                style={{ color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', fontWeight: 600 }}
              >
                <RefreshCw size={13} className={locationLoading ? 'spin' : ''} />
                <span>{locationLoading ? 'Locating...' : 'Refresh'}</span>
              </button>
            </div>

            {location && location.status === 'success' ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <span className={`badge ${location.confidence === 'precise' ? 'badge-success' : 'badge-warning'}`}>
                    {location.confidence === 'precise' ? 'Precise GPS' : 'Approximate'}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    Accuracy: <strong>~{location.accuracy_meters}m</strong>
                  </span>
                </div>

                <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '10px', background: '#F8FAFC', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--bg-card-border)' }}>
                  <div>Latitude: <strong>{location.latitude}</strong></div>
                  <div>Longitude: <strong>{location.longitude}</strong></div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Updated: {new Date(location.timestamp).toLocaleTimeString()}
                  </div>
                </div>

                <a
                  href={location.google_maps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.82rem',
                    color: 'var(--color-primary)',
                    fontWeight: 600
                  }}
                >
                  <ExternalLink size={14} />
                  <span>{t('open_google_maps')}</span>
                </a>
              </div>
            ) : (
              <div>
                <div className="badge badge-emergency" style={{ marginBottom: '8px' }}>
                  {t('loc_unavailable')}
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {location?.error || 'GPS signal not yet acquired. Click Refresh or grant location permission.'}
                </p>
              </div>
            )}
          </div>

          {/* Quick-Access Cards: Find Hospitals, Emergency Contacts, Emergency History */}
          <div className="card">
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '14px', color: 'var(--text-primary)' }}>
              Quick Emergency Actions
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link
                to="/hospitals"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  borderRadius: 'var(--border-radius-sm)',
                  background: '#F8FAFC',
                  border: '1px solid var(--bg-card-border)',
                  color: 'var(--text-primary)',
                  fontSize: '0.88rem',
                  fontWeight: 600
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Hospital size={16} color="var(--color-primary)" />
                  <span>Find Nearby Hospitals</span>
                </div>
                <span style={{ color: 'var(--color-primary)', fontSize: '0.8rem' }}>Browse →</span>
              </Link>

              <Link
                to="/contacts"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  borderRadius: 'var(--border-radius-sm)',
                  background: '#F8FAFC',
                  border: '1px solid var(--bg-card-border)',
                  color: 'var(--text-primary)',
                  fontSize: '0.88rem',
                  fontWeight: 600
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Users size={16} color="var(--color-primary)" />
                  <span>Emergency Contacts ({contacts.length})</span>
                </div>
                <span style={{ color: 'var(--color-primary)', fontSize: '0.8rem' }}>Manage →</span>
              </Link>

              <Link
                to="/history"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  borderRadius: 'var(--border-radius-sm)',
                  background: '#F8FAFC',
                  border: '1px solid var(--bg-card-border)',
                  color: 'var(--text-primary)',
                  fontSize: '0.88rem',
                  fontWeight: 600
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <History size={16} color="var(--color-primary)" />
                  <span>Emergency Event History</span>
                </div>
                <span style={{ color: 'var(--color-primary)', fontSize: '0.8rem' }}>View →</span>
              </Link>
            </div>
          </div>

          {/* Closest Verified Emergency Hospital Preview */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Nearest Emergency Care</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Bhatkal / Uttara Kannada</span>
            </div>

            {nearbyHospitals.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {nearbyHospitals.map((hosp) => (
                  <HospitalCard key={hosp.id} facility={hosp} />
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                {hospitalsLoading ? 'Searching verified facilities...' : 'No facilities found within radius.'}
              </p>
            )}
          </div>

          {/* Small, Readable System-Status Section for Connectivity and Availability */}
          <div className="card" style={{ background: '#F8FAFC' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Radio size={14} color="var(--color-primary)" />
              <span>System & Service Status</span>
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.78rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Network Connectivity:</span>
                <strong style={{ color: networkOnline ? 'var(--color-success)' : 'var(--color-emergency)' }}>
                  {networkOnline ? 'Online (Connected)' : 'Offline Cache Active'}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Hospital Directory:</span>
                <strong style={{ color: 'var(--color-success)' }}>Bhatkal & Regional Active</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>AI Coordinator:</span>
                <strong style={{ color: 'var(--color-primary)' }}>Rules & Triage Ready</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>SMS Gateway:</span>
                <strong style={{ color: 'var(--text-primary)' }}>Verified Local Sandbox</strong>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Cancellation Modal with Accessible Light Styling */}
      {showCancelModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.45)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="card" style={{ maxWidth: '440px', width: '100%', background: '#FFFFFF', boxShadow: 'var(--shadow-lg)' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', color: 'var(--color-emergency)' }}>Cancel Emergency Call</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              Please specify the cancellation reason to maintain an accurate audit log for emergency response.
            </p>
            <input
              type="text"
              placeholder="e.g. Accidental click, false alarm, or resolved"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              style={{ width: '100%', marginBottom: '16px' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setShowCancelModal(false)} className="btn btn-secondary">
                Back
              </button>
              <button
                onClick={() => {
                  cancelEmergency(cancelReason || 'False alarm cancelled by user');
                  setShowCancelModal(false);
                }}
                className="btn btn-emergency"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
