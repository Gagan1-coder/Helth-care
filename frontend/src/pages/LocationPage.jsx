import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useEmergency } from '../context/EmergencyContext';
import { HospitalMap } from '../components/HospitalMap';
import { 
  MapPin, 
  Navigation, 
  RefreshCw, 
  ExternalLink, 
  AlertTriangle, 
  Info,
  CheckCircle,
  Shield,
  Layers
} from 'lucide-react';

export function LocationPage() {
  const { t } = useLanguage();
  const { 
    location, 
    locationLoading, 
    fetchLocation, 
    detectNetworkLocation,
    selectManualLocation, 
    regionalLocations,
    permissionState
  } = useEmergency();

  return (
    <div className="container" style={{ padding: '30px 20px 60px', maxWidth: '940px' }}>
      <div style={{ marginBottom: '25px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
          Exact Device GPS & Spatial Confidence
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Inspect actual hardware geolocation coordinates, accuracy radius in metres, and spatial verification status.
        </p>
      </div>

      {/* Main Coordinate Card */}
      <div className="card" style={{ marginBottom: '25px', background: '#FFFFFF' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <MapPin size={24} color="var(--color-primary)" />
            <h2 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', fontWeight: 700 }}>
              Device Geolocation Sensor Reading
            </h2>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => fetchLocation(true)}
              disabled={locationLoading}
              className="btn btn-primary"
              style={{ fontSize: '0.85rem' }}
            >
              <RefreshCw size={14} className={locationLoading ? 'spin' : ''} />
              <span>{locationLoading ? 'Acquiring GPS Fix...' : 'Refresh Location'}</span>
            </button>
            <button
              onClick={detectNetworkLocation}
              disabled={locationLoading}
              className="btn btn-outline"
              style={{ fontSize: '0.85rem' }}
              title="Detect location using network IP triangulation"
            >
              <span>Auto-Detect IP</span>
            </button>
          </div>
        </div>

        {/* Browser Permission Denied Warning & Instructions */}
        {permissionState === 'denied' && (
          <div style={{ padding: '14px 16px', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '8px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#B45309', fontWeight: 700, marginBottom: '6px' }}>
              <AlertTriangle size={18} />
              <span>Browser Location Denied — Operating in Regional/Network Mode</span>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#92400E', lineHeight: 1.5, marginBottom: '10px' }}>
              Your browser or Windows has location blocked for this site. The system is currently active using your selected regional coordinates below.
            </p>
            <div style={{ background: '#FFFFFF', padding: '10px 14px', borderRadius: '6px', border: '1px solid #FCD34D', fontSize: '0.78rem', color: '#78350F', lineHeight: 1.5 }}>
              <strong>To allow exact device GPS in Chrome/Edge:</strong>
              <ol style={{ paddingLeft: '18px', margin: '4px 0' }}>
                <li>Click the <strong>Lock / Tune icon (🔒)</strong> next to <code>localhost:5173</code> in the address bar.</li>
                <li>Set <strong>Location</strong> from <em>Block</em> to <em>Allow</em>.</li>
                <li>In Windows 11/10: Ensure <em>Settings &gt; Privacy &amp; security &gt; Location</em> is turned <strong>ON</strong>.</li>
                <li>Click <strong>Retry Geolocation</strong>.</li>
              </ol>
            </div>
            <div style={{ marginTop: '10px' }}>
              <button onClick={() => fetchLocation(true)} disabled={locationLoading} className="btn btn-primary" style={{ fontSize: '0.82rem' }}>
                <RefreshCw size={13} className={locationLoading ? 'spin' : ''} />
                <span>Retry Geolocation</span>
              </button>
            </div>
          </div>
        )}

        {/* 1-Click Fast Presets */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>
            1-Click Coastal Karnataka Location Presets:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {regionalLocations?.map((loc) => (
              <button
                key={loc.id}
                type="button"
                onClick={() => selectManualLocation(loc.id)}
                style={{
                  fontSize: '0.78rem',
                  padding: '6px 12px',
                  borderRadius: 'var(--border-radius-sm)',
                  background: location?.source?.includes(loc.name) ? 'var(--bg-soft-blue)' : '#F8FAFC',
                  border: location?.source?.includes(loc.name) ? '1.5px solid var(--color-primary)' : '1px solid var(--bg-card-border)',
                  color: location?.source?.includes(loc.name) ? 'var(--color-primary)' : 'var(--text-primary)',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                📍 {loc.name}
              </button>
            ))}
          </div>
        </div>

        {location && (
          <div>
            {/* Status Pill */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <span className={`badge ${location.is_manual ? 'badge-warning' : location.confidence === 'precise' ? 'badge-success' : 'badge-info'}`} style={{ fontSize: '0.85rem', padding: '5px 12px' }}>
                {location.is_manual ? 'MANUAL SELECTION' : `CONFIDENCE: ${location.confidence.toUpperCase()}`}
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Accuracy Radius: <strong>~{location.accuracy_meters} metres</strong>
              </span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Source: <strong>{location.source}</strong>
              </span>
            </div>

            {/* Coordinates Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '24px' }}>
              <div style={{ background: '#F8FAFC', border: '1px solid var(--bg-card-border)', padding: '16px', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Latitude</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {location.latitude}
                </div>
              </div>

              <div style={{ background: '#F8FAFC', border: '1px solid var(--bg-card-border)', padding: '16px', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Longitude</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {location.longitude}
                </div>
              </div>

              <div style={{ background: '#F8FAFC', border: '1px solid var(--bg-card-border)', padding: '16px', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Timestamp (UTC/Local)</div>
                <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
                  {new Date(location.timestamp).toLocaleTimeString()} ({new Date(location.timestamp).toLocaleDateString()})
                </div>
              </div>
            </div>

            {/* Working Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
              <a
                href={location.google_maps_url || `https://www.google.com/maps?q=${location.latitude},${location.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-emergency"
              >
                <ExternalLink size={16} />
                <span>Open in Google Maps</span>
              </a>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline"
              >
                <Navigation size={16} />
                <span>Get Directions to Coordinates</span>
              </a>
            </div>

            {/* Live Visual Map of Current Coordinates */}
            <div style={{ marginTop: '16px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Layers size={16} color="var(--color-primary)" />
                <span>Live Location Pin on Map</span>
              </div>
              <HospitalMap
                userLocation={location}
                hospitals={[]}
                height="280px"
              />
            </div>
          </div>
        )}
      </div>

      {/* Technical Guidance: Desktop vs Mobile GPS Hardware */}
      <div className="card" style={{ background: '#FFFFFF' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <Info size={22} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h3 style={{ fontSize: '1.05rem', marginBottom: '6px', color: 'var(--text-primary)', fontWeight: 700 }}>
              Hardware GPS Accuracy & Truthful Disclosure
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '8px' }}>
              Desktop computers and laptops rarely contain dedicated GPS satellite receivers. Desktop browsers infer location through Wi-Fi BSSID triangulation or ISP gateway IP geolocation, resulting in an accuracy radius of 20m - 2000m. Mobile phones equipped with dedicated GNSS/GPS chips achieve street-level accuracy (&lt;10m).
            </p>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              LifeLink never silently fabricates fake default coordinates. When GPS accuracy is wider than 250m, it is truthfully marked as <strong>APPROXIMATE</strong> to avoid misleading emergency responders. If you select a location manually, it is prominently marked as <strong>MANUAL SELECTION</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
