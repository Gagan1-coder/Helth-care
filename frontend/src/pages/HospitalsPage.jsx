import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useEmergency } from '../context/EmergencyContext';
import { HospitalCard } from '../components/HospitalCard';
import { HospitalMap } from '../components/HospitalMap';
import { api } from '../services/api';
import { 
  Search, 
  MapPin, 
  Navigation, 
  Filter, 
  AlertCircle, 
  RefreshCw, 
  Map as MapIcon, 
  Layers,
  ChevronDown,
  CheckCircle2
} from 'lucide-react';

export function HospitalsPage() {
  const { t } = useLanguage();
  const { 
    location, 
    fetchLocation, 
    locationLoading, 
    selectManualLocation, 
    regionalLocations,
    permissionState
  } = useEmergency();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [dataSource, setDataSource] = useState('');
  const [selectedHospitalId, setSelectedHospitalId] = useState(null);
  const [showMap, setShowMap] = useState(true);

  const mapSectionRef = useRef(null);

  const cities = [
    { label: 'Auto (Nearby Your Coordinates)', value: '' },
    { label: 'Bhatkal (ಉತ್ತರ ಕನ್ನಡ)', value: 'Bhatkal' },
    { label: 'Honnavar (Uttara Kannada)', value: 'Honnavar' },
    { label: 'Kumta (Uttara Kannada)', value: 'Kumta' },
    { label: 'Kundapura (Udupi)', value: 'Kundapura' },
    { label: 'Manipal (KMC Hub)', value: 'Manipal' },
    { label: 'Karwar (District HQ)', value: 'Karwar' },
    { label: 'Bengaluru (Specialty Hub)', value: 'Bengaluru' },
  ];

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const payload = {
        latitude: selectedCity ? null : location?.latitude,
        longitude: selectedCity ? null : location?.longitude,
        city_district: selectedCity || null,
        query: searchQuery || null,
        category: selectedCategory || null,
        radius_km: 60.0
      };

      const res = await api.searchHospitals(payload);
      setHospitals(res.facilities || []);
      setDataSource(res.data_source || 'Verified Regional Healthcare Registry');
    } catch (err) {
      console.warn('Hospital search failed:', err);
      setErrorMsg('Unable to retrieve facilities. Check backend connection or try selecting a city manually.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, [selectedCity, selectedCategory, location?.latitude, location?.longitude]);

  const handleViewOnMap = (facility) => {
    setSelectedHospitalId(facility.id);
    if (!showMap) setShowMap(true);
    // Smooth scroll to map
    if (mapSectionRef.current) {
      mapSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="container" style={{ padding: '30px 20px 60px' }}>
      {/* Page Title & Status Pill */}
      <div style={{ marginBottom: '22px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '8px', color: 'var(--text-primary)', fontWeight: 800 }}>
            {t('hospital_search_title')}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Real-time verified hospital discovery across Bhatkal, Uttara Kannada, and Karnataka. Physical GPS coordinates, official Place IDs, and verified phone lines.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => setShowMap(!showMap)}
            className="btn btn-outline"
            style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <MapIcon size={15} color="var(--color-primary)" />
            <span>{showMap ? 'Hide Map' : 'Show Interactive Map'}</span>
          </button>
          <span className="badge badge-info" style={{ fontSize: '0.82rem', padding: '6px 12px' }}>
            {hospitals.length} Verified Facilities Found
          </span>
        </div>
      </div>

      {/* Geolocation Status / Manual Location Bar */}
      <div style={{
        background: location?.status === 'success' ? '#F0FDF4' : '#FFFBEB',
        border: location?.status === 'success' ? '1px solid #BBF7D0' : '1px solid #FDE68A',
        borderRadius: 'var(--border-radius-sm)',
        padding: '10px 16px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.84rem',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MapPin size={16} color={location?.status === 'success' ? '#166534' : '#B45309'} />
          {location?.status === 'success' ? (
            <span style={{ color: '#166534' }}>
              <strong>Origin:</strong> {location.is_manual ? `Manual Area: ${location.source}` : `Device Geolocation (${location.latitude}, ${location.longitude})`} • Accuracy ~{location.accuracy_meters}m
            </span>
          ) : (
            <span style={{ color: '#92400E' }}>
              <strong>Device location unavailable:</strong> {location?.error || 'Grant browser location permission or choose an area manually.'}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={fetchLocation}
            disabled={locationLoading}
            className="btn btn-outline"
            style={{ fontSize: '0.78rem', padding: '4px 10px', background: '#FFFFFF' }}
          >
            <RefreshCw size={12} className={locationLoading ? 'spin' : ''} />
            <span>{locationLoading ? 'Querying...' : 'Refresh GPS'}</span>
          </button>

          <select
            onChange={(e) => e.target.value && selectManualLocation(e.target.value)}
            defaultValue=""
            style={{ fontSize: '0.78rem', padding: '4px 8px', background: '#FFFFFF' }}
          >
            <option value="" disabled>Manual Override Area...</option>
            {regionalLocations?.map((loc) => (
              <option key={loc.id} value={loc.id}>{loc.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Interactive Leaflet Map Section */}
      {showMap && (
        <div ref={mapSectionRef} style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Layers size={16} color="var(--color-primary)" />
              <span>Interactive Healthcare Map (Bhatkal & Regional Facilities)</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              🔵 Blue marker: Your GPS • 🔴 Red marker: Verified Hospital
            </div>
          </div>
          <HospitalMap
            userLocation={location?.status === 'success' ? location : null}
            hospitals={hospitals}
            selectedHospitalId={selectedHospitalId}
            onSelectHospital={(id) => setSelectedHospitalId(id)}
            height="380px"
          />
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="card" style={{ marginBottom: '24px', background: '#FFFFFF', border: '1px solid var(--bg-card-border)', boxShadow: 'var(--shadow-sm)' }}>
        <form onSubmit={handleSearch} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
          {/* Query input */}
          <div style={{ position: 'relative' }}>
            <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', top: '12px', left: '12px' }} />
            <input
              type="text"
              placeholder="Search by hospital name or specialty..."
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
            <option value="cardiac">Cardiac & Cath Lab</option>
            <option value="road_accident">Trauma & Casualty</option>
            <option value="respiratory">Respiratory & ICU</option>
            <option value="stroke">Neurology & Stroke</option>
            <option value="maternal">Maternal & Obstetrics</option>
          </select>

          {/* Search Button */}
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ justifyContent: 'center' }}>
            <Search size={16} />
            <span>{loading ? 'Searching...' : 'Filter Facilities'}</span>
          </button>
        </form>

        {/* Origin / Data Source Info */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--bg-card-border)', fontSize: '0.8rem', color: 'var(--text-secondary)', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            Data Source: <strong style={{ color: 'var(--text-primary)' }}>{dataSource || 'Verified Regional Registry & Live Overpass'}</strong>
          </div>
          <div style={{ color: 'var(--text-muted)' }}>
            Distances computed using Haversine formula from verified coordinates
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div style={{ background: 'var(--color-emergency-light)', border: '1px solid #FECACA', color: '#991B1B', padding: '12px 16px', borderRadius: 'var(--border-radius-sm)', marginBottom: '20px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Facilities Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
          <RefreshCw size={32} className="spin" style={{ margin: '0 auto 12px', color: 'var(--color-primary)' }} />
          <p style={{ fontWeight: 600 }}>Querying verified regional directory and live hospital coordinates...</p>
        </div>
      ) : hospitals.length > 0 ? (
        <div className="grid grid-cols-2 gap-6">
          {hospitals.map((hosp) => (
            <HospitalCard
              key={hosp.id}
              facility={hosp}
              isSelected={hosp.id === selectedHospitalId}
              onViewOnMap={handleViewOnMap}
            />
          ))}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '40px 20px', background: '#FFFFFF', border: '1px solid var(--bg-card-border)' }}>
          <AlertCircle size={40} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ marginBottom: '8px', color: 'var(--text-primary)', fontWeight: 700 }}>No facilities found matching query</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', maxWidth: '420px', margin: '0 auto 16px' }}>
            Try expanding your search radius, removing category filters, or selecting a nearby town like Bhatkal, Honnavar, or Kumta.
          </p>
          <button
            onClick={() => { setSelectedCity(''); setSelectedCategory(''); setSearchQuery(''); }}
            className="btn btn-primary"
            style={{ margin: '0 auto' }}
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
