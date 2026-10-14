import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ExternalLink, Navigation, Phone, MapPin } from 'lucide-react';

export function HospitalMap({
  userLocation,
  hospitals = [],
  selectedHospitalId = null,
  onSelectHospital = () => {},
  height = '420px'
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Default center on Bhatkal Coastal Corridor if no coordinates yet
    const initialLat = userLocation?.latitude || 13.9856;
    const initialLng = userLocation?.longitude || 74.5512;
    const initialZoom = userLocation?.latitude ? 13 : 11;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: initialZoom,
      zoomControl: true,
      attributionControl: true
    });

    // High quality light OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();
    const bounds = L.latLngBounds();
    let hasPoints = false;

    // 1. User Location Marker (ONLY rendered when valid coordinates exist)
    if (userLocation && typeof userLocation.latitude === 'number' && typeof userLocation.longitude === 'number') {
      const userLatLng = [userLocation.latitude, userLocation.longitude];
      bounds.extend(userLatLng);
      hasPoints = true;

      const userIcon = L.divIcon({
        className: 'user-location-marker',
        html: `
          <div style="position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 28px; height: 28px; background: rgba(23, 105, 170, 0.25); border-radius: 50%; animation: pulse-ring 2s infinite ease-out;"></div>
            <div style="position: absolute; width: 14px; height: 14px; background: #1769AA; border: 2.5px solid #FFFFFF; border-radius: 50%; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const userMarker = L.marker(userLatLng, { icon: userIcon, zIndexOffset: 1000 });
      const userPopupContent = `
        <div style="font-family: inherit; font-size: 13px; color: #1F2937; padding: 4px;">
          <div style="font-weight: 700; color: #1769AA; margin-bottom: 2px;">📍 Your Current Location</div>
          <div style="font-size: 11px; color: #64748B;">Source: ${userLocation.source || 'Device Geolocation'}</div>
          <div style="font-size: 11px; color: #64748B; margin-bottom: 6px;">
            ${userLocation.is_manual ? 'Manual Selection' : `Accuracy: ~${userLocation.accuracy_meters || 'N/A'}m`}
          </div>
          <a href="${userLocation.google_maps_url || `https://www.google.com/maps?q=${userLocation.latitude},${userLocation.longitude}`}" target="_blank" rel="noopener noreferrer" style="color: #1769AA; text-decoration: underline; font-size: 11px; font-weight: 600;">
            Open in Google Maps ↗
          </a>
        </div>
      `;
      userMarker.bindPopup(userPopupContent);
      layer.addLayer(userMarker);
    }

    // 2. Hospital Markers (Provider coordinates)
    hospitals.forEach((hosp) => {
      if (typeof hosp.latitude !== 'number' || typeof hosp.longitude !== 'number') return;
      const hospLatLng = [hosp.latitude, hosp.longitude];
      bounds.extend(hospLatLng);
      hasPoints = true;

      const isSelected = hosp.id === selectedHospitalId;

      const hospitalIcon = L.divIcon({
        className: `hospital-marker ${isSelected ? 'selected' : ''}`,
        html: `
          <div style="
            position: relative;
            width: ${isSelected ? '36px' : '30px'};
            height: ${isSelected ? '36px' : '30px'};
            background: ${isSelected ? '#DC2626' : '#E53945'};
            border: 2px solid #FFFFFF;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            box-shadow: 0 3px 8px rgba(229, 57, 69, 0.45);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
            cursor: pointer;
          ">
            <span style="
              transform: rotate(45deg);
              color: #FFFFFF;
              font-weight: 800;
              font-size: ${isSelected ? '16px' : '14px'};
              line-height: 1;
            ">+</span>
          </div>
        `,
        iconSize: [isSelected ? 36 : 30, isSelected ? 36 : 30],
        iconAnchor: [isSelected ? 18 : 15, isSelected ? 36 : 30]
      });

      const directionsUrl = userLocation?.latitude
        ? `https://www.google.com/maps/dir/?api=1&origin=${userLocation.latitude},${userLocation.longitude}&destination=${hosp.latitude},${hosp.longitude}`
        : hosp.google_maps_url || `https://www.google.com/maps?q=${hosp.latitude},${hosp.longitude}`;

      const popupHtml = `
        <div style="font-family: inherit; font-size: 13px; color: #1F2937; min-width: 220px; padding: 4px;">
          <div style="font-weight: 800; color: #1F2937; margin-bottom: 3px; line-height: 1.3;">${hosp.name}</div>
          <div style="font-size: 11px; color: #64748B; margin-bottom: 6px;">${hosp.address || 'Address provided by registry'}</div>
          
          <div style="display: flex; gap: 6px; margin-bottom: 8px; flex-wrap: wrap;">
            ${hosp.distance_km ? `<span style="background: #EAF4FF; color: #1769AA; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px;">${hosp.distance_km.toFixed(1)} km away</span>` : ''}
            <span style="background: #F1F5F9; color: #475569; font-size: 10px; font-weight: 600; padding: 2px 6px; border-radius: 4px;">${hosp.source || 'Provider'}</span>
          </div>

          <div style="display: flex; gap: 8px; border-top: 1px solid #E2E8F0; padding-top: 8px; margin-top: 4px;">
            <a href="${directionsUrl}" target="_blank" rel="noopener noreferrer" style="background: #1769AA; color: #FFFFFF; text-decoration: none; font-size: 11px; font-weight: 600; padding: 4px 8px; border-radius: 4px; display: inline-flex; align-items: center; gap: 4px;">
              Directions ➔
            </a>
            ${hosp.phone ? `<a href="tel:${hosp.phone}" style="background: #ECFDF5; color: #059669; text-decoration: none; font-size: 11px; font-weight: 600; padding: 4px 8px; border-radius: 4px;">Call 📞</a>` : ''}
          </div>
        </div>
      `;

      const marker = L.marker(hospLatLng, { icon: hospitalIcon });
      marker.bindPopup(popupHtml);
      marker.on('click', () => {
        onSelectHospital(hosp.id);
      });

      layer.addLayer(marker);

      if (isSelected) {
        marker.openPopup();
        map.setView(hospLatLng, 14, { animate: true });
      }
    });

    if (hasPoints && !selectedHospitalId) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [userLocation, hospitals, selectedHospitalId]);

  return (
    <div style={{ position: 'relative', width: '100%', height, borderRadius: 'var(--border-radius-md)', overflow: 'hidden', border: '1px solid var(--bg-card-border)', boxShadow: 'var(--shadow-sm)' }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
      <style>{`
        @keyframes pulse-ring {
          0% { transform: scale(0.6); opacity: 0.9; }
          100% { transform: scale(2.4); opacity: 0; }
        }
        .leaflet-popup-content-wrapper {
          border-radius: 8px;
          box-shadow: 0 4px 14px rgba(0,0,0,0.12);
        }
      `}</style>
    </div>
  );
}
