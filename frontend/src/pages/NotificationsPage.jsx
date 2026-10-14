import React, { useState, useEffect } from 'react';
import { useEmergency } from '../context/EmergencyContext';
import { api } from '../services/api';
import { 
  Bell, 
  CheckCheck, 
  Send, 
  MessageSquare, 
  UserCheck, 
  RefreshCw, 
  AlertCircle 
} from 'lucide-react';

export function NotificationsPage() {
  const { activeEmergency, contacts } = useEmergency();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ackSuccess, setAckSuccess] = useState('');

  // Generate notification state from active emergency or contacts
  useEffect(() => {
    if (activeEmergency?.dispatched_notifications?.length > 0) {
      setLogs(activeEmergency.dispatched_notifications);
    }
  }, [activeEmergency]);

  const handleSimulateAcknowledgement = async (contactId, contactName) => {
    try {
      await api.acknowledgeAlert({
        emergency_event_id: activeEmergency?.id || 'DEMO_EVENT',
        contact_id: contactId,
        acknowledged_by_name: contactName,
        note: 'Contact opened message and confirmed assistance en route.'
      });
      setAckSuccess(`Human acknowledgement confirmed by ${contactName}!`);
      setTimeout(() => setAckSuccess(''), 3500);
    } catch (e) {
      alert('Acknowledgement recording failed.');
    }
  };

  return (
    <div className="container" style={{ padding: '30px 20px 60px', maxWidth: '850px' }}>
      <div style={{ marginBottom: '25px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Emergency Alerts & Delivery Status</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Inspect carrier transmission states, WhatsApp click-to-chat links, and human contact acknowledgement.
        </p>
      </div>

      {ackSuccess && (
        <div style={{ background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.3)', color: '#4ade80', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <UserCheck size={18} />
          <span>{ackSuccess}</span>
        </div>
      )}

      {/* Critical Safety Rule Callout */}
      <div className="card" style={{ marginBottom: '25px', background: 'rgba(2, 132, 199, 0.05)', borderColor: 'rgba(2, 132, 199, 0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <AlertCircle size={22} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h3 style={{ fontSize: '1.05rem', marginBottom: '4px' }}>Delivery vs. Human Acknowledgement</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              LifeLink strictly differentiates between an SMS carrier queuing a message, message delivery to a tower, and an actual human reading and confirming the emergency. Software never claims a contact has received help until acknowledged.
            </p>
          </div>
        </div>
      </div>

      {contacts.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {contacts.map((contact) => (
            <div key={contact.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{contact.name}</h3>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    {contact.phone} • Relationship: {contact.relationship}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <span className="badge badge-success">
                    <CheckCheck size={14} /> SMS Ready
                  </span>
                  <span className="badge badge-info">
                    WhatsApp Ready
                  </span>
                </div>
              </div>

              {/* Status Row */}
              <div style={{ background: 'var(--bg-main)', padding: '12px 16px', borderRadius: '8px', marginBottom: '14px', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>SMS Dispatch Mode:</span>
                  <strong style={{ color: 'var(--text-primary)' }}>Verified Local Mock Sandbox (Safe Zero Cost)</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Human Confirmation:</span>
                  <span style={{ color: '#fb923c', fontWeight: 600 }}>Awaiting Response</span>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', flexWrap: 'wrap' }}>
                <a
                  href={`https://wa.me/${contact.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`🚨 LIFELINK EMERGENCY ALERT: Please confirm safety or call emergency services (112/108).`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn"
                  style={{ background: '#25d366', color: 'white', fontSize: '0.85rem' }}
                >
                  <MessageSquare size={16} />
                  <span>Send via WhatsApp</span>
                </a>

                <button
                  onClick={() => handleSimulateAcknowledgement(contact.id, contact.name)}
                  className="btn btn-outline"
                  style={{ fontSize: '0.85rem' }}
                >
                  <UserCheck size={16} color="#10b981" />
                  <span>Simulate Contact Acknowledgement</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
          <Bell size={40} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
          <h3>No Contacts Registered</h3>
          <p style={{ fontSize: '0.85rem' }}>Add trusted emergency contacts in the Contacts tab to receive dispatches.</p>
        </div>
      )}
    </div>
  );
}
