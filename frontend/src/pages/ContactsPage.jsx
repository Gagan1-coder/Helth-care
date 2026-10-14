import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useEmergency } from '../context/EmergencyContext';
import { api } from '../services/api';
import { Users, UserPlus, Trash2, Eye, Phone, ShieldCheck, Check, MessageSquare, Send } from 'lucide-react';

export function ContactsPage() {
  const { t } = useLanguage();
  const { userId, contacts, fetchContacts, location } = useEmergency();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+91');
  const [relationship, setRelationship] = useState('Family');
  const [notifySms, setNotifySms] = useState(true);
  const [notifyWhatsapp, setNotifyWhatsapp] = useState(true);
  const [consentLocation, setConsentLocation] = useState(true);
  const [consentMedical, setConsentMedical] = useState(false);
  const [formError, setFormError] = useState('');

  const handleAddContact = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim()) {
      setFormError('Contact name is required.');
      return;
    }
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    if (!/^\+?[0-9]{10,15}$/.test(cleanPhone)) {
      setFormError('Phone number must have 10 to 15 digits (e.g. +919876543210).');
      return;
    }

    try {
      await api.addContact({
        user_id: userId,
        name: name.trim(),
        phone: cleanPhone,
        relationship,
        is_trusted: true,
        notify_sms: notifySms,
        notify_whatsapp: notifyWhatsapp,
        consent_to_share_location: consentLocation,
        consent_to_share_medical: consentMedical
      });
      await fetchContacts();
      setShowAddModal(false);
      setName('');
      setPhone('+91');
    } catch (err) {
      setFormError(err.message || 'Failed to save contact.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Remove this emergency contact?')) {
      try {
        await api.deleteContact(id);
        await fetchContacts();
      } catch (err) {
        alert('Failed to delete contact');
      }
    }
  };

  const handlePreviewAlert = async (contact) => {
    setPreviewLoading(true);
    setShowPreviewModal(true);
    try {
      const res = await api.previewAlert({
        contact_name: contact.name,
        category: 'cardiac',
        latitude: location?.latitude || 13.9824,
        longitude: location?.longitude || 74.5516,
        location_address: 'Near Bhatkal Municipal Circle',
        include_medical: contact.consent_to_share_medical
      });
      setPreviewData(res);
    } catch (e) {
      console.warn('Preview alert failed:', e);
    } finally {
      setPreviewLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '30px 20px 60px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '6px' }}>{t('contacts')}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Trusted individuals notified automatically during an emergency SOS broadcast.
          </p>
        </div>

        <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
          <UserPlus size={18} />
          <span>Add Emergency Contact</span>
        </button>
      </div>

      {/* Contacts List */}
      <div className="grid grid-cols-2 gap-6">
        {contacts.map((c) => (
          <div key={c.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>{c.name}</h3>
                  <span className="badge badge-info" style={{ marginTop: '4px' }}>{c.relationship}</span>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={() => handlePreviewAlert(c)}
                    className="btn btn-secondary"
                    style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                    title="Preview Emergency Message"
                  >
                    <Eye size={15} />
                    <span>Preview</span>
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="btn"
                    style={{ background: '#FEE2E2', color: 'var(--color-danger)', border: '1px solid #FECACA', padding: '6px 10px' }}
                    title="Delete Contact"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', marginBottom: '12px', fontSize: '0.95rem' }}>
                <Phone size={16} color="var(--color-primary)" />
                <strong>{c.phone}</strong>
              </div>

              {/* Consent and Notification Badges */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', fontSize: '0.78rem' }}>
                {c.notify_sms && <span className="badge badge-success">SMS Alerts Active</span>}
                {c.notify_whatsapp && <span className="badge badge-info">WhatsApp Active</span>}
                {c.consent_to_share_location && <span className="badge badge-warning">Location Shared</span>}
              </div>
            </div>

            <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <span>Verified Contact</span>
              <a
                href={`tel:${c.phone}`}
                style={{ color: 'var(--color-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                Direct Call
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Add Contact Modal */}
      {showAddModal && (
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
          <div className="card" style={{ maxWidth: '480px', width: '100%', background: '#FFFFFF', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-lg)' }}>
            <h2 style={{ fontSize: '1.3rem', marginBottom: '16px', color: 'var(--text-primary)' }}>Add Trusted Emergency Contact</h2>

            {formError && (
              <div style={{ background: '#FEE2E2', border: '1px solid #FECACA', color: 'var(--color-danger)', padding: '10px 14px', borderRadius: '6px', marginBottom: '14px', fontSize: '0.85rem' }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleAddContact} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Ramesh Rao / Anita Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ width: '100%' }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Phone Number (with Country Code)</label>
                <input
                  type="tel"
                  placeholder="+919876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{ width: '100%' }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Relationship</label>
                <select value={relationship} onChange={(e) => setRelationship(e.target.value)} style={{ width: '100%' }}>
                  <option value="Family">Family / Parent / Sibling</option>
                  <option value="Spouse">Spouse / Partner</option>
                  <option value="Doctor">Family Doctor / Physician</option>
                  <option value="Neighbor">Neighbor / Colleague</option>
                  <option value="Emergency Guardian">Emergency Guardian</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '6px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer', color: 'var(--text-primary)' }}>
                  <input type="checkbox" checked={notifySms} onChange={(e) => setNotifySms(e.target.checked)} />
                  <span>Send Urgent SMS Broadcast during SOS</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer', color: 'var(--text-primary)' }}>
                  <input type="checkbox" checked={notifyWhatsapp} onChange={(e) => setNotifyWhatsapp(e.target.checked)} />
                  <span>Generate Pre-filled WhatsApp Alert Link</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer', color: 'var(--text-primary)' }}>
                  <input type="checkbox" checked={consentLocation} onChange={(e) => setConsentLocation(e.target.checked)} />
                  <span>Consent to share live GPS coordinates link</span>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--border-color)' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Alert Preview Modal */}
      {showPreviewModal && (
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
          <div className="card" style={{ maxWidth: '520px', width: '100%', background: '#FFFFFF', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-lg)' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
              <Eye size={20} color="var(--color-primary)" />
              <span>Emergency Alert Message Preview</span>
            </h3>

            {previewLoading ? (
              <p style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)' }}>Generating preview...</p>
            ) : previewData ? (
              <div>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>SMS Text:</div>
                  <pre style={{
                    background: '#F8FAFC',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--border-radius-sm)',
                    padding: '14px',
                    whiteSpace: 'pre-wrap',
                    fontSize: '0.82rem',
                    color: 'var(--text-primary)',
                    fontFamily: 'monospace',
                    lineHeight: 1.5
                  }}>
                    {previewData.sms_text}
                  </pre>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '10px', borderTop: '1px solid var(--border-color)' }}>
                  <a
                    href={previewData.whatsapp_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn"
                    style={{ background: '#25d366', color: 'white', fontWeight: 600, fontSize: '0.85rem' }}
                  >
                    <MessageSquare size={16} />
                    <span>Test Open in WhatsApp</span>
                  </a>

                  <button onClick={() => setShowPreviewModal(false)} className="btn btn-secondary">
                    Close Preview
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
