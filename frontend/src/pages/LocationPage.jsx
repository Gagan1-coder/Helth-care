import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useEmergency } from '../context/EmergencyContext';
import { 
  MapPin, 
  Navigation, 
  RefreshCw, 
  ExternalLink, 
  AlertTriangle, 
  Info
} from 'lucide-react';

export function LocationPage() {
  const { t } = useLanguage();
  const { location, locationLoading, fetchLocation } = useEmergency();

  return (
    <div className="container" style={{ padding: '30px 20px 60px', maxWidth: '880px' }}>
      <div style={{ marginBottom: '25px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
          Real GPS & Location Confidence
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Inspect actual device geolocation parameters, accuracy radius, and spatial verification status.
        </p>
      </div>

      {/* Main Coordinate Card */}
      <div className="card" style={{ marginBottom: '25px', background: '#FFFFFF' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <MapPin size={24} color="var(--color-primary)" />
            <h2 style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>Active Device Geolocation Sensor</h2>
          </div>
          <button onClick={fetchLocation} disabled={locationLoading} className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
            <RefreshCw size={14} className={locationLoading ? 'spin' : ''} />
            <span>{locationLoading ? 'Acquiring GPS Fix...' : 'Refresh GPS Reading'}</span>
          </button>
        </div>

        {location && location.status === 'success' ? (
          <div>
            {/* Status Pill */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <span className={`badge ${location.confidence === 'precise' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.85rem', padding: '5px 12px' }}>
                Confidence: {location.confidence.toUpperCase()}
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Accuracy Radius: <strong>~{location.accuracy_meters} meters</strong>
              </span>
            </div>

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
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Last Updated</div>
                <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
                  {new Date(location.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>

            {/* Direct Google Maps Link */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <a
                href={location.google_maps_url}
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
                <span>Get Driving Route to Coordinates</span>
              </a>
            </div>
          </div>
        ) : (
          <div style={{ padding: '16px 20px', background: 'var(--color-emergency-light)', border: '1px solid #FECACA', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-emergency)', fontWeight: 700, marginBottom: '4px' }}>
              <AlertTriangle size={18} />
              <span>Location Hardware / Permission Status: UNAVAILABLE</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#B91C1C', lineHeight: 1.5 }}>
              {location?.error || 'GPS signal could not be acquired. Ensure location permissions are enabled in your browser.'}
            </p>
          </div>
        )}
      </div>

      {/* Technical Guidance: Desktop vs Mobile GPS Hardware */}
      <div className="card" style={{ background: '#FFFFFF' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <Info size={22} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h3 style={{ fontSize: '1.05rem', marginBottom: '6px', color: 'var(--text-primary)' }}>Hardware GPS Accuracy Notes</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '8px' }}>
              Desktop computers and laptops rarely contain dedicated GPS satellite receivers. Desktop browsers infer location through Wi-Fi BSSID mapping or ISP gateway IP geolocation, resulting in an accuracy radius of 20m - 2000m. Mobile phones equipped with dedicated GNSS/GPS chips achieve street-level accuracy (&lt;10m).
            </p>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              LifeLink never silently fabricates default coordinates. When GPS accuracy is wider than 250m, it is truthfully marked as <strong>APPROXIMATE</strong> to avoid misleading emergency personnel.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
