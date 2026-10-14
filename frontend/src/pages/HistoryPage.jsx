import React, { useState, useEffect } from 'react';
import { useEmergency } from '../context/EmergencyContext';
import { api } from '../services/api';
import { Clock, ShieldAlert, CheckCircle, XCircle, MapPin, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';

export function HistoryPage() {
  const { userId } = useEmergency();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    async function loadHistory() {
      setLoading(true);
      try {
        const data = await api.getUserEmergencies(userId);
        setEvents(data);
      } catch (e) {
        console.warn('Failed to load emergency history:', e);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, [userId]);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'resolved':
        return <span className="badge badge-success">Resolved</span>;
      case 'cancelled':
        return <span className="badge" style={{ background: '#F1F5F9', color: '#475569', border: '1px solid #CBD5E1' }}>Cancelled</span>;
      case 'notification_sent':
        return <span className="badge badge-info">Alerts Sent</span>;
      case 'created':
      case 'processing':
        return <span className="badge badge-warning">In Progress</span>;
      default:
        return <span className="badge badge-emergency">{status}</span>;
    }
  };

  return (
    <div className="container" style={{ padding: '30px 20px 60px', maxWidth: '850px' }}>
      <div style={{ marginBottom: '25px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '8px', color: 'var(--text-primary)' }}>Emergency Event History</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Historical record and forensic timeline of emergency calls initiated from this account.
        </p>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Loading history records...</p>
      ) : events.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {events.map((ev) => {
            const isExpanded = expandedId === ev.id;
            return (
              <div key={ev.id} className="card" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                <div
                  onClick={() => toggleExpand(ev.id)}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', flexWrap: 'wrap', gap: '10px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      background: ev.status === 'resolved' ? '#DCFCE7' : ev.status === 'cancelled' ? '#F1F5F9' : '#FEE2E2',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {ev.status === 'resolved' ? (
                        <CheckCircle size={20} color="#16A34A" />
                      ) : ev.status === 'cancelled' ? (
                        <XCircle size={20} color="#64748B" />
                      ) : (
                        <ShieldAlert size={20} color="#DC2626" />
                      )}
                    </div>

                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                        {ev.category?.replace('_', ' ').toUpperCase()} EMERGENCY
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        ID: {ev.id} • {new Date(ev.created_at).toLocaleString()} • Method: {ev.sos_method}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {getStatusBadge(ev.status)}
                    {isExpanded ? <ChevronUp size={18} color="var(--text-muted)" /> : <ChevronDown size={18} color="var(--text-muted)" />}
                  </div>
                </div>

                {/* Expanded Details and Timeline */}
                {isExpanded && (
                  <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                    {ev.location && (
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <MapPin size={15} color="var(--color-primary)" />
                        <span>Coordinates: {ev.location.latitude}, {ev.location.longitude} (Confidence: {ev.location.confidence})</span>
                      </div>
                    )}

                    <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '8px', color: 'var(--text-primary)' }}>
                      Audit Timeline:
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: '#F8FAFC', border: '1px solid var(--border-color)', padding: '12px', borderRadius: '6px' }}>
                      {ev.timeline?.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '8px', fontSize: '0.8rem' }}>
                          <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
                            {new Date(item.timestamp).toLocaleTimeString()}
                          </span>
                          <span style={{ color: 'var(--text-primary)' }}>
                            {item.message}
                          </span>
                        </div>
                      ))}
                    </div>

                    {ev.cancellation_reason && (
                      <div style={{ marginTop: '10px', fontSize: '0.8rem', color: 'var(--color-danger)', fontWeight: 600 }}>
                        Cancellation Reason: {ev.cancellation_reason}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-secondary)', background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
          <Clock size={40} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ marginBottom: '6px', color: 'var(--text-primary)' }}>No Emergency History</h3>
          <p style={{ fontSize: '0.85rem' }}>Your past SOS calls and timeline actions will be archived here.</p>
        </div>
      )}
    </div>
  );
}
