import React, { useState, useEffect } from 'react';
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
  Volume2
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
    contacts
  } = useEmergency();

  const [activeTab, setActiveTab] = useState('thumb'); // thumb, gesture, backtap, volume, power
  const [gestureTriggered, setGestureTriggered] = useState(false);
  const [volumeSequence, setVolumeSequence] = useState([]);
  const [nearbyHospitals, setNearbyHospitals] = useState([]);
  const [hospitalsLoading, setHospitalsLoading] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);

  const categories = [
    { id: 'cardiac', label: t('cat_cardiac'), icon: Heart, color: '#ef4444' },
    { id: 'road_accident', label: t('cat_road_accident'), icon: Car, color: '#f97316' },
    { id: 'severe_trauma', label: t('cat_severe_trauma'), icon: Activity, color: '#dc2626' },
    { id: 'respiratory', label: t('cat_respiratory'), icon: Wind, color: '#38bdf8' },
    { id: 'stroke', label: t('cat_stroke'), icon: Brain, color: '#a855f7' },
    { id: 'maternal', label: t('cat_maternal'), icon: Baby, color: '#ec4899' },
    { id: 'general', label: t('cat_general'), icon: AlertTriangle, color: '#eab308' },
  ];

  // Load nearby hospitals whenever location updates
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

  // Method 2: Device Motion / Shake Listener simulation
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
      {/* Top Notification if Emergency is Active */}
      {activeEmergency && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.95) 0%, rgba(153, 27, 27, 0.95) 100%)',
          color: 'white',
          borderRadius: 'var(--border-radius-md)',
          padding: '20px',
          marginBottom: '30px',
          boxShadow: 'var(--shadow-emergency)',
          border: '1px solid #fca5a5'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '15px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <ShieldAlert size={28} />
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'white' }}>
                  {t('sos_activated_title')}
                </h2>
              </div>
              <p style={{ fontSize: '0.9rem', opacity: 0.95, marginBottom: '12px' }}>
                Event ID: <strong>{activeEmergency.id}</strong> • Category: <strong>{activeEmergency.category?.toUpperCase()}</strong> • Triggered via: <strong>{activeEmergency.sos_method?.replace('_', ' ')}</strong>
              </p>

              {/* Active Emergency Timeline items */}
              <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '12px 16px', borderRadius: '8px', marginBottom: '15px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                  Live Coordination Timeline:
                </div>
                {activeEmergency.timeline?.map((item, idx) => (
                  <div key={idx} style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <Clock size={13} opacity={0.8} />
                    <span style={{ opacity: 0.8 }}>{new Date(item.timestamp).toLocaleTimeString()}</span>
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
                style={{ background: 'white', color: '#dc2626', fontWeight: 700 }}
              >
                <XCircle size={16} />
                <span>{t('cancel_emergency_btn')}</span>
              </button>
              <button
                onClick={() => resolveEmergency('Resolved by user on scene')}
                className="btn"
                style={{ background: '#16a34a', color: 'white', fontWeight: 700 }}
              >
                <CheckCircle size={16} />
                <span>{t('mark_resolved_btn')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grid: Main SOS Console + Location & Facilities */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left Column: 2 Spans -> SOS Console */}
        <div style={{ gridColumn: 'span 2' }}>
          {/* Emergency Category Selector Bar */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Select Emergency Category</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tailors first-aid and hospital matching</span>
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
                      background: isSelected ? 'rgba(2, 132, 199, 0.15)' : 'var(--bg-main)',
                      border: isSelected ? `2px solid ${cat.color}` : '1px solid var(--bg-card-border)',
                      color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <Icon size={24} color={cat.color} />
                    <span style={{ fontSize: '0.78rem', fontWeight: isSelected ? 700 : 500 }}>
                      {cat.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5 SOS Methods Tabs */}
          <div className="card">
            <div style={{ display: 'flex', borderBottom: '1px solid var(--bg-card-border)', paddingBottom: '12px', marginBottom: '20px', gap: '8px', overflowX: 'auto' }}>
              <button
                onClick={() => setActiveTab('thumb')}
                className={`btn ${activeTab === 'thumb' ? 'btn-primary' : 'btn-outline'}`}
                style={{ fontSize: '0.82rem', padding: '6px 12px' }}
              >
                1. Thumb Press
              </button>
              <button
                onClick={() => setActiveTab('gesture')}
                className={`btn ${activeTab === 'gesture' ? 'btn-primary' : 'btn-outline'}`}
                style={{ fontSize: '0.82rem', padding: '6px 12px' }}
              >
                2. Hidden Gesture
              </button>
              <button
                onClick={() => setActiveTab('backtap')}
                className={`btn ${activeTab === 'backtap' ? 'btn-primary' : 'btn-outline'}`}
                style={{ fontSize: '0.82rem', padding: '6px 12px' }}
              >
                3. Back-Tap (Android)
              </button>
              <button
                onClick={() => setActiveTab('volume')}
                className={`btn ${activeTab === 'volume' ? 'btn-primary' : 'btn-outline'}`}
                style={{ fontSize: '0.82rem', padding: '6px 12px' }}
              >
                4. Volume Pattern
              </button>
              <button
                onClick={() => setActiveTab('power')}
                className={`btn ${activeTab === 'power' ? 'btn-primary' : 'btn-outline'}`}
                style={{ fontSize: '0.82rem', padding: '6px 12px' }}
              >
                5. Power Button
              </button>
            </div>

            {/* Tab 1: Thumb Press */}
            {activeTab === 'thumb' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0' }}>
                <SosButton />
              </div>
            )}

            {/* Tab 2: Hidden Gesture */}
            {activeTab === 'gesture' && (
              <div style={{ padding: '15px', textAlign: 'center' }}>
                <Smartphone size={40} color="#38bdf8" style={{ marginBottom: '10px' }} />
                <h4 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Method 2: Hidden Motion Gesture SOS</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto 20px', lineHeight: 1.5 }}>
                  Utilizes device accelerometer via DeviceMotionEvent API. Shake phone vigorously 3 times to trigger discreet alert.
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
                  <button onClick={handleTestShake} className="btn btn-emergency">
                    <span>{gestureTriggered ? '⚡ SHAKE DETECTED!' : 'Test Shake Motion Trigger'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Tab 3: Back-Tap SOS */}
            {activeTab === 'backtap' && (
              <div style={{ padding: '15px', textAlign: 'center' }}>
                <Sliders size={40} color="#a855f7" style={{ marginBottom: '10px' }} />
                <h4 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Method 3: Native Android Back-Tap</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto 15px', lineHeight: 1.5 }}>
                  Requires Android 12+ Quick Tap / Accessibility Service companion. When hardware sensor triggers two taps on back of phone, native service dispatches SOS broadcast.
                </p>
                <div style={{ display: 'inline-block', background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.3)', padding: '10px 16px', borderRadius: '8px', fontSize: '0.8rem', color: '#c084fc', marginBottom: '15px' }}>
                  Android Companion Service Spec: See <code>android-companion/README.md</code>
                </div>
                <div>
                  <button onClick={() => triggerSOS('back_tap')} className="btn btn-outline" style={{ borderColor: '#a855f7', color: '#a855f7' }}>
                    <span>Simulate Back-Tap Double Pulse</span>
                  </button>
                </div>
              </div>
            )}

            {/* Tab 4: Volume Pattern */}
            {activeTab === 'volume' && (
              <div style={{ padding: '15px', textAlign: 'center' }}>
                <Volume2 size={40} color="#f59e0b" style={{ marginBottom: '10px' }} />
                <h4 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Method 4: Volume Key Sequence (Up - Up - Down)</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto 15px', lineHeight: 1.5 }}>
                  Discreet emergency trigger in pocket. Pressing Volume Up twice followed by Volume Down triggers covert dispatch.
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '15px' }}>
                  <button onClick={() => handleVolumeKey('up')} className="btn btn-secondary">▲ Vol Up</button>
                  <button onClick={() => handleVolumeKey('down')} className="btn btn-secondary">▼ Vol Down</button>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Current Sequence: <strong>{volumeSequence.join(' ➔ ') || '(None)'}</strong>
                </div>
              </div>
            )}

            {/* Tab 5: Power Button */}
            {activeTab === 'power' && (
              <div style={{ padding: '15px', textAlign: 'center' }}>
                <ShieldAlert size={40} color="#ef4444" style={{ marginBottom: '10px' }} />
                <h4 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Method 5: Power Button Multi-Press</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto 15px', lineHeight: 1.5 }}>
                  Browser security sandboxes cannot intercept OS hardware power button presses directly. On Android, LifeLink Companion registers a BroadcastReceiver for <code>ACTION_SCREEN_ON</code> 4x pulses.
                </p>
                <button onClick={() => triggerSOS('power_button')} className="btn btn-outline" style={{ borderColor: '#ef4444', color: '#ef4444' }}>
                  <span>Simulate 4x Power Button Sequence</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Spatial & Facility Intelligence */}
        <div>
          {/* Live GPS Card */}
          <div className="card" style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={20} color="var(--color-primary)" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{t('location_title')}</h3>
              </div>
              <button
                onClick={fetchLocation}
                disabled={locationLoading}
                style={{ color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem' }}
              >
                <RefreshCw size={14} className={locationLoading ? 'spin' : ''} />
                <span>{locationLoading ? 'Locating...' : 'Refresh'}</span>
              </button>
            </div>

            {location && location.status === 'success' ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span className={`badge ${location.confidence === 'precise' ? 'badge-success' : 'badge-warning'}`}>
                    {location.confidence === 'precise' ? t('loc_precise') : t('loc_approximate')}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Acc: ~{location.accuracy_meters}m
                  </span>
                </div>

                <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '8px' }}>
                  <div>Latitude: <strong>{location.latitude}</strong></div>
                  <div>Longitude: <strong>{location.longitude}</strong></div>
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
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {location?.error || 'GPS signal not yet acquired. Click Refresh or grant location permission.'}
                </p>
              </div>
            )}
          </div>

          {/* Nearest Hospitals Preview */}
          <div className="card" style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Closest Emergency Care</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Bhatkal / Uttara Kannada</span>
            </div>

            {nearbyHospitals.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {nearbyHospitals.map((hosp) => (
                  <HospitalCard key={hosp.id} facility={hosp} />
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {hospitalsLoading ? 'Searching verified facilities...' : 'No facilities found within radius.'}
              </p>
            )}
          </div>

          {/* Trusted Contacts Quick Bar */}
          <div className="card">
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '10px' }}>
              Alert Recipients ({contacts.length})
            </h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem' }}>
              {contacts.map((c) => (
                <li key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--bg-card-border)' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.phone}</div>
                  </div>
                  <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>
                    SMS & WhatsApp
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Cancellation Modal */}
      {showCancelModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="card" style={{ maxWidth: '440px', width: '100%', background: 'var(--bg-card)' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '10px', color: '#ef4444' }}>Cancel Emergency Call</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              Please specify the cancellation reason to maintain an audit trail for emergency services.
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
