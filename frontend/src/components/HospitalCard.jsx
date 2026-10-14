import React from 'react';
import { Hospital, Phone, Navigation, Clock, ShieldCheck, MapPin, ExternalLink, Calendar } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export function HospitalCard({ facility, onViewOnMap, isSelected }) {
  const { t } = useLanguage();

  const getSourceBadge = () => {
    const src = (facility.source || '').toLowerCase();
    if (src.includes('google')) {
      return { label: 'Google Maps Places Verified', bg: '#EAF4FF', color: '#1769AA', border: '#BAE6FD' };
    }
    if (src.includes('openstreetmap') || src.includes('osm')) {
      return { label: 'OpenStreetMap Verified', bg: '#F0FDF4', color: '#166534', border: '#BBF7D0' };
    }
    if (src.includes('official') || src.includes('karnataka')) {
      return { label: 'Official Health Registry', bg: '#FEF3C7', color: '#92400E', border: '#FDE68A' };
    }
    return { label: facility.source || 'Regional Directory', bg: '#F1F5F9', color: '#475569', border: '#E2E8F0' };
  };

  const sourceBadge = getSourceBadge();
  const directMapsUrl = facility.google_maps_url || (facility.latitude && facility.longitude
    ? `https://www.google.com/maps?q=${facility.latitude},${facility.longitude}`
    : null);

  return (
    <div 
      className="card" 
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'space-between', 
        background: '#FFFFFF',
        border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--bg-card-border)',
        boxShadow: isSelected ? '0 4px 12px rgba(23, 105, 170, 0.15)' : 'var(--shadow-sm)',
        transition: 'all 0.2s ease'
      }}
    >
      <div>
        {/* Source & Place ID Badges */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
          <span style={{
            fontSize: '0.72rem',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '4px',
            background: sourceBadge.bg,
            color: sourceBadge.color,
            border: `1px solid ${sourceBadge.border}`
          }}>
            {sourceBadge.label}
          </span>
          {facility.place_id && (
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
              Place ID: {facility.place_id.slice(0, 12)}...
            </span>
          )}
        </div>

        {/* Facility Name */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>
            {facility.name}
          </h3>
        </div>

        {/* Full Address */}
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '10px', lineHeight: 1.4 }}>
          {facility.address || 'Address provided by verified provider'}
        </p>

        {/* Spatial Stats: Distance & Drive Time */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-soft-blue)',
          border: '1px solid #BAE6FD',
          padding: '8px 12px',
          borderRadius: 'var(--border-radius-sm)',
          marginBottom: '10px',
          fontSize: '0.82rem',
          color: 'var(--color-primary)'
        }}>
          {facility.distance_km !== null && facility.distance_km !== undefined ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Navigation size={14} color="var(--color-primary)" />
              <span><strong>{facility.distance_km.toFixed(1)} km</strong> from your coordinates</span>
            </div>
          ) : (
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
              Distance based on selected regional area
            </span>
          )}

          {facility.drive_time_minutes ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem' }}>
              <Clock size={13} color="var(--color-warning)" />
              <span>~{facility.drive_time_minutes} min drive</span>
            </div>
          ) : null}
        </div>

        {/* Verified Services - Only show if confirmed by provider */}
        {facility.emergency_services && facility.emergency_services.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '10px' }}>
            {facility.emergency_services.map((svc, idx) => (
              <span
                key={idx}
                style={{
                  fontSize: '0.72rem',
                  padding: '2px 7px',
                  borderRadius: '4px',
                  background: '#F8FAFC',
                  border: '1px solid var(--bg-card-border)',
                  color: 'var(--text-secondary)',
                  fontWeight: 500
                }}
              >
                {svc}
              </span>
            ))}
          </div>
        )}

        {/* Coordinates and Retrieval Timestamp */}
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px' }}>
          <span>Coords: <strong>{facility.latitude?.toFixed(4)}, {facility.longitude?.toFixed(4)}</strong></span>
          {facility.retrieval_timestamp && (
            <span>Verified: {new Date(facility.retrieval_timestamp).toLocaleDateString()}</span>
          )}
        </div>
      </div>

      {/* Action Buttons: View on Map, Get Directions, Call */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', paddingTop: '10px', borderTop: '1px solid var(--bg-card-border)' }}>
        {/* 1. View on Map */}
        <button
          onClick={() => onViewOnMap && onViewOnMap(facility)}
          className="btn btn-outline"
          style={{ fontSize: '0.78rem', padding: '6px 8px', justifyContent: 'center' }}
          title="Highlight and focus this hospital on the map"
        >
          <MapPin size={13} />
          <span>View on Map</span>
        </button>

        {/* 2. Get Directions */}
        <a
          href={facility.directions_url || `https://www.google.com/maps/dir/?api=1&destination=${facility.latitude},${facility.longitude}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary"
          style={{ fontSize: '0.78rem', padding: '6px 8px', justifyContent: 'center' }}
          title="Open directions in Google Maps"
        >
          <Navigation size={13} />
          <span>Directions</span>
        </a>

        {/* 3. Call (Only enabled when verified phone exists) */}
        {facility.phone ? (
          <a
            href={`tel:${facility.phone}`}
            className="btn btn-emergency"
            style={{ fontSize: '0.78rem', padding: '6px 8px', justifyContent: 'center' }}
            title={`Call ${facility.phone}`}
          >
            <Phone size={13} />
            <span>Call</span>
          </a>
        ) : (
          <button
            disabled
            className="btn btn-secondary"
            style={{ fontSize: '0.75rem', padding: '6px 8px', opacity: 0.6, cursor: 'not-allowed', justifyContent: 'center' }}
            title="No verified telephone number available from provider"
          >
            <span>No Phone</span>
          </button>
        )}
      </div>
    </div>
  );
}
