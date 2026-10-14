import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useEmergency } from '../context/EmergencyContext';
import { HospitalCard } from '../components/HospitalCard';
import { api } from '../services/api';
import { Search, MapPin, Navigation, Filter, AlertCircle, RefreshCw } from 'lucide-react';

export function HospitalsPage() {
  const { t } = useLanguage();
  const { location, fetchLocation } = useEmergency();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState('');

  const cities = [
    { label: 'All Regional', value: '' },
    { label: 'Bhatkal (ಉತ್ತರ ಕನ್ನಡ)', value: 'Bhatkal' },
    { label: 'Honnavar', value: 'Honnavar' },
    { label: 'Kumta', value: 'Kumta' },
    { label: 'Kundapura', value: 'Kundapura' },
    { label: 'Udupi / Manipal', value: 'Manipal' },
    { label: 'Karwar (District HQ)', value: 'Karwar' },
    { label: 'Bengaluru', value: 'Bengaluru' },
  ];

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        latitude: selectedCity ? null : location?.latitude,
        longitude: selectedCity ? null : location?.longitude,
        city_district: selectedCity || null,
        query: searchQuery || null,
        category: selectedCategory || null,
        radius_km: 50.0
      };

      const res = await api.searchHospitals(payload);
      setHospitals(res.facilities || []);
      setDataSource(res.data_source || 'Verified Regional Healthcare Registry');
    } catch (err) {
      console.warn('Hospital search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, [selectedCity, selectedCategory]);

  return (
    <div className="container" style={{ padding: '30px 20px 60px' }}>
      <div style={{ marginBottom: '25px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>
          {t('hospital_search_title')}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Evidence-based discovery across Bhatkal, Uttara Kannada, and Karnataka. Ranked by verified distance and emergency readiness.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ marginBottom: '30px' }}>
        <form onSubmit={handleSearch} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          {/* Query input */}
          <div style={{ position: 'relative' }}>
            <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', top: '12px', left: '12px' }} />
            <input
              type="text"
              placeholder={t('search_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', paddingLeft: '38px' }}
            />
          </div>

          {/* City / District dropdown */}
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
          >
            {cities.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>

          {/* Category filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Emergency Specialties</option>
            <option value="cardiac">Cardiac / Cath Lab</option>
            <option value="road_accident">Trauma & Casualty</option>
            <option value="respiratory">Respiratory & ICU</option>
          </select>

          {/* Search Button */}
          <button type="submit" className="btn btn-primary" disabled={loading}>
            <Search size={16} />
            <span>{loading ? 'Searching...' : 'Search Facilities'}</span>
          </button>
        </form>

        {/* Location Origin Pill */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '15px', paddingTop: '12px', borderTop: '1px solid var(--bg-card-border)', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MapPin size={15} color="var(--color-primary)" />
            <span>
              Origin: {location?.latitude ? `Live GPS (${location.latitude}, ${location.longitude})` : selectedCity ? `City: ${selectedCity}` : 'Default Regional Reference (Bhatkal)'}
            </span>
          </div>
          <div>
            Data Source: <strong style={{ color: 'var(--text-primary)' }}>{dataSource}</strong>
          </div>
        </div>
      </div>

      {/* Facilities Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
          <RefreshCw size={32} className="spin" style={{ margin: '0 auto 12px', color: 'var(--color-primary)' }} />
          <p>Querying verified regional directory and live OpenStreetMap Overpass...</p>
        </div>
      ) : hospitals.length > 0 ? (
        <div className="grid grid-cols-2 gap-6">
          {hospitals.map((hosp) => (
            <HospitalCard key={hosp.id} facility={hosp} />
          ))}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <AlertCircle size={40} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ marginBottom: '8px' }}>No facilities found matching query</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            Try clearing filters or expanding search radius to Uttara Kannada / Coastal Karnataka.
          </p>
        </div>
      )}
    </div>
  );
}
