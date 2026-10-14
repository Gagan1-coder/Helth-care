import React, { useState, useEffect } from 'react';
import { useEmergency } from '../context/EmergencyContext';
import { api } from '../services/api';
import { HeartHandshake, Shield, Trash2, CheckCircle2, AlertTriangle, Save } from 'lucide-react';

export function MedicalProfilePage() {
  const { userId } = useEmergency();

  const [bloodGroup, setBloodGroup] = useState('O+');
  const [allergies, setAllergies] = useState('Penicillin, Sulfa drugs');
  const [conditions, setConditions] = useState('Hypertension, Mild Asthma');
  const [medications, setMedications] = useState('Amlodipine 5mg OD, Salbutamol Inhaler PRN');
  const [emergencyNotes, setEmergencyNotes] = useState('Patient has cardiac pacemaker implanted in 2022.');
  const [consentSharing, setConsentSharing] = useState(false);
  const [retentionDays, setRetentionDays] = useState(365);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await api.getMedicalProfile(userId);
        if (res && res.has_profile) {
          setBloodGroup(res.blood_group || 'O+');
          setAllergies((res.allergies || []).join(', '));
          setConditions((res.chronic_conditions || []).join(', '));
          setMedications((res.current_medications || []).join(', '));
          setEmergencyNotes(res.emergency_notes || '');
          setConsentSharing(res.consent_emergency_sharing || false);
          setRetentionDays(res.data_retention_days || 365);
        }
      } catch (e) {
        console.warn('Failed to load profile:', e);
      }
    }
    loadProfile();
  }, [userId]);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSaveSuccess(false);

    try {
      const payload = {
        user_id: userId,
        blood_group: bloodGroup,
        allergies: allergies.split(',').map(s => s.trim()).filter(Boolean),
        chronic_conditions: conditions.split(',').map(s => s.trim()).filter(Boolean),
        current_medications: medications.split(',').map(s => s.trim()).filter(Boolean),
        emergency_notes: emergencyNotes,
        consent_emergency_sharing: consentSharing,
        data_retention_days: Number(retentionDays)
      };

      await api.saveMedicalProfile(payload);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert(`Save error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePurge = async () => {
    if (window.confirm('Are you sure you want to permanently delete your medical profile? This action cannot be undone.')) {
      try {
        await api.deleteMedicalProfile(userId);
        setBloodGroup('O+');
        setAllergies('');
        setConditions('');
        setMedications('');
        setEmergencyNotes('');
        setConsentSharing(false);
        alert('Medical profile permanently deleted.');
      } catch (e) {
        alert('Delete failed.');
      }
    }
  };

  return (
    <div className="container" style={{ padding: '30px 20px 60px', maxWidth: '780px' }}>
      <div style={{ marginBottom: '25px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Emergency Medical Profile</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Voluntary clinical information transmitted to emergency physicians only during an active SOS.
        </p>
      </div>

      <div className="card" style={{ marginBottom: '25px', background: 'var(--bg-soft-blue)', borderColor: '#BAE6FD', boxShadow: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Shield size={20} color="var(--color-primary)" />
          <span style={{ fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: 600 }}>
            Strict Privacy Safeguard: Medical profile data is never made public or used for marketing.
          </span>
        </div>
      </div>

      {saveSuccess && (
        <div style={{ background: '#DCFCE7', border: '1px solid #86EFAC', color: 'var(--color-success)', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={18} />
          <span>Medical profile saved securely with consent status updated.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '15px' }}>
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Blood Group
            </label>
            <select value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)} style={{ width: '100%' }}>
              <option value="O+">O Positive (O+)</option>
              <option value="O-">O Negative (O-)</option>
              <option value="A+">A Positive (A+)</option>
              <option value="A-">A Negative (A-)</option>
              <option value="B+">B Positive (B+)</option>
              <option value="B-">B Negative (B-)</option>
              <option value="AB+">AB Positive (AB+)</option>
              <option value="AB-">AB Negative (AB-)</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Drug & Environmental Allergies (comma-separated)
            </label>
            <input
              type="text"
              placeholder="e.g. Penicillin, Peanuts, Sulfa"
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
        </div>

        <div>
          <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
            Pre-Existing / Chronic Conditions (comma-separated)
          </label>
          <input
            type="text"
            placeholder="e.g. Asthma, Type-2 Diabetes, Cardiac Stent"
            value={conditions}
            onChange={(e) => setConditions(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>

        <div>
          <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
            Current Medications & Dosages
          </label>
          <input
            type="text"
            placeholder="e.g. Metformin 500mg, Atorvastatin 20mg"
            value={medications}
            onChange={(e) => setMedications(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>

        <div>
          <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
            Critical Emergency Notes for First Responders
          </label>
          <textarea
            rows="3"
            placeholder="e.g. Diabetic shock risk, pacemaker present, blind in left eye"
            value={emergencyNotes}
            onChange={(e) => setEmergencyNotes(e.target.value)}
            style={{ width: '100%', resize: 'none' }}
          />
        </div>

        {/* Explicit Consent Checkbox */}
        <div style={{ background: 'var(--bg-soft-blue)', padding: '14px', borderRadius: '8px', border: '1px solid #BAE6FD' }}>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={consentSharing}
              onChange={(e) => setConsentSharing(e.target.checked)}
              style={{ marginTop: '3px' }}
            />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
              <strong>Explicit Emergency Consent:</strong> I voluntarily authorize LifeLink AI to transmit my blood group, allergies, and critical medical notes to verified emergency physicians and responding ambulances during an active SOS.
            </span>
          </label>
        </div>

        {/* Data Retention Period */}
        <div>
          <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
            Data Retention Period
          </label>
          <select value={retentionDays} onChange={(e) => setRetentionDays(e.target.value)} style={{ width: '100%' }}>
            <option value="90">90 Days (Quarterly purge)</option>
            <option value="365">365 Days (1 Year)</option>
            <option value="730">730 Days (2 Years)</option>
          </select>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', paddingTop: '14px', borderTop: '1px solid var(--border-color)' }}>
          <button
            type="button"
            onClick={handlePurge}
            className="btn"
            style={{ background: '#FEE2E2', color: 'var(--color-danger)', border: '1px solid #FECACA', fontSize: '0.85rem' }}
          >
            <Trash2 size={16} />
            <span>Purge My Medical Data</span>
          </button>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            <Save size={16} />
            <span>{loading ? 'Saving...' : 'Save Medical Profile'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
