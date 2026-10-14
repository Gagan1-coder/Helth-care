import React from 'react';
import { Hospital, Phone, Navigation, Clock, ShieldCheck, AlertCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export function HospitalCard({ facility }) {
  const { t } = useLanguage();

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>
            {facility.name}
          </h3>
          {facility.open_24x7 && (
            <span className="badge badge-emergency" style={{ flexShrink: 0, marginLeft: '8px' }}>
              24x7 Emergency
            </span>
          )}
        </div>

        {/* Address */}
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: 1.4 }}>
          {facility.address}
        </p>

        {/* Spatial Stats: Distance & Drive Time */}
        <div style={{
          display: 'flex',
          gap: '12px',
          background: 'rgba(2, 132, 199, 0.08)',
          padding: '8px 12px',
          borderRadius: 'var(--border-radius-sm)',
          marginBottom: '12px',
          fontSize: '0.85rem',
          color: 'var(--text-primary)'
        }}>
          {facility.distance_km !== null && facility.distance_km !== undefined ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Navigation size={15} color="var(--color-primary)" />
              <span><strong>{facility.distance_km} km</strong> away</span>
            </div>
          ) : (
            <span style={{ color: 'var(--text-muted)' }}>Distance based on selected area</span>
          )}

          {facility.drive_time_minutes && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={15} color="#f59e0b" />
              <span>~{facility.drive_time_minutes} mins</span>
            </div>
          )}
        </div>

        {/* Service Badges */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
          {facility.emergency_services?.map((svc, idx) => (
            <span
              key={idx}
              style={{
                fontSize: '0.72rem',
                padding: '3px 8px',
                borderRadius: '4px',
                background: 'var(--bg-main)',
                border: '1px solid var(--bg-card-border)',
                color: 'var(--text-secondary)'
              }}
            >
              {svc}
            </span>
          ))}
          {facility.has_icu && (
            <span style={{ fontSize: '0.72rem', padding: '3px 8px', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontWeight: 600 }}>
              ICU Equipped
            </span>
          )}
          {facility.has_ambulance && (
            <span style={{ fontSize: '0.72rem', padding: '3px 8px', borderRadius: '4px', background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', fontWeight: 600 }}>
              Ambulance Base
            </span>
          )}
        </div>

        {/* Explainability / Match Reason */}
        {facility.match_reason && (
          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '14px', fontStyle: 'italic', display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
            <ShieldCheck size={14} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{facility.match_reason}</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', paddingTop: '10px', borderTop: '1px solid var(--bg-card-border)' }}>
        {facility.phone ? (
          <a
            href={`tel:${facility.phone}`}
            className="btn btn-emergency"
            style={{ fontSize: '0.85rem', padding: '8px 12px' }}
          >
            <Phone size={15} />
            <span>Call</span>
          </a>
        ) : (
          <button
            disabled
            className="btn btn-secondary"
            style={{ fontSize: '0.82rem', padding: '8px 12px', opacity: 0.6 }}
          >
            <span>Direct Line N/A</span>
          </button>
        )}

        <a
          href={facility.directions_url || `https://www.google.com/maps/dir/?api=1&destination=${facility.latitude},${facility.longitude}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary"
          style={{ fontSize: '0.85rem', padding: '8px 12px' }}
        >
          <Navigation size={15} />
          <span>{t('get_directions')}</span>
        </a>
      </div>
    </div>
  );
}
