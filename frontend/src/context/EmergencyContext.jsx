import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  getCurrentLocation, 
  getPermissionStatus, 
  getNetworkLocation,
  createManualLocation, 
  REGIONAL_MANUAL_LOCATIONS,
  DEFAULT_FALLBACK_LOCATION
} from '../services/geolocation';

const EmergencyContext = createContext();

export function EmergencyProvider({ children }) {
  const [userId, setUserId] = useState(() => localStorage.getItem('lifelink_user_id') || 'demo_user');
  const [activeEmergency, setActiveEmergency] = useState(null);
  
  // Restore saved location if present, else fallback to Bhatkal Taluka preset so app is always functional
  const [location, setLocation] = useState(() => {
    try {
      const saved = localStorage.getItem('lifelink_saved_location');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_FALLBACK_LOCATION;
  });

  const [locationLoading, setLocationLoading] = useState(false);
  const [permissionState, setPermissionState] = useState('prompt');
  const [selectedCategory, setSelectedCategory] = useState('cardiac');
  const [isJudgeDemo, setIsJudgeDemo] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [networkOnline, setNetworkOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Monitor Network Online / Offline status
  useEffect(() => {
    const handleOnline = () => setNetworkOnline(true);
    const handleOffline = () => setNetworkOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Monitor permission changes and attempt high-accuracy GPS
  useEffect(() => {
    let permissionObj = null;

    if (typeof navigator !== 'undefined' && navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' }).then((status) => {
        permissionObj = status;
        setPermissionState(status.state);

        status.onchange = () => {
          setPermissionState(status.state);
          if (status.state === 'granted') {
            fetchLocation(true);
          }
        };

        // If already granted, refresh automatically
        if (status.state === 'granted') {
          fetchLocation(false);
        } else if (status.state === 'denied') {
          // If denied and current location is not yet set or is error, try network IP
          tryNetworkFallback();
        }
      }).catch(() => {
        fetchLocation(false);
      });
    } else {
      fetchLocation(false);
    }

    fetchContacts();
  }, [userId]);

  const tryNetworkFallback = async () => {
    const netLoc = await getNetworkLocation();
    if (netLoc) {
      setLocation(netLoc);
      localStorage.setItem('lifelink_saved_location', JSON.stringify(netLoc));
    }
  };

  const fetchLocation = async (forcePrompt = true) => {
    setLocationLoading(true);
    const status = await getPermissionStatus();
    setPermissionState(status);

    const loc = await getCurrentLocation();
    
    if (loc.status === 'success') {
      setLocation(loc);
      localStorage.setItem('lifelink_saved_location', JSON.stringify(loc));
    } else if (status === 'denied') {
      // Keep existing saved location or try network IP so UI remains functional
      const saved = localStorage.getItem('lifelink_saved_location');
      if (saved) {
        try {
          setLocation(JSON.parse(saved));
        } catch (e) {
          setLocation(DEFAULT_FALLBACK_LOCATION);
        }
      } else {
        const netLoc = await getNetworkLocation();
        if (netLoc) {
          setLocation(netLoc);
          localStorage.setItem('lifelink_saved_location', JSON.stringify(netLoc));
        } else {
          setLocation(DEFAULT_FALLBACK_LOCATION);
        }
      }
    } else {
      setLocation(loc);
    }

    setLocationLoading(false);
    const updatedStatus = await getPermissionStatus();
    setPermissionState(updatedStatus);
    return loc;
  };

  const detectNetworkLocation = async () => {
    setLocationLoading(true);
    const netLoc = await getNetworkLocation();
    if (netLoc) {
      setLocation(netLoc);
      localStorage.setItem('lifelink_saved_location', JSON.stringify(netLoc));
    }
    setLocationLoading(false);
    return netLoc;
  };

  const selectManualLocation = (presetId) => {
    const preset = REGIONAL_MANUAL_LOCATIONS.find((p) => p.id === presetId);
    if (!preset) return null;
    const manualLoc = createManualLocation(preset);
    setLocation(manualLoc);
    localStorage.setItem('lifelink_saved_location', JSON.stringify(manualLoc));
    return manualLoc;
  };

  const fetchContacts = async () => {
    try {
      const data = await api.getUserContacts(userId);
      setContacts(data);
    } catch (e) {
      console.warn('Failed to load contacts:', e);
    }
  };

  const triggerSOS = async (sosMethod = 'thumb_press', category = selectedCategory, isSimulation = isJudgeDemo) => {
    let currentLoc = location;
    if (!currentLoc || currentLoc.status !== 'success') {
      currentLoc = await getCurrentLocation();
      if (currentLoc.status === 'success') {
        setLocation(currentLoc);
      } else {
        currentLoc = DEFAULT_FALLBACK_LOCATION;
        setLocation(currentLoc);
      }
    }

    const payload = {
      user_id: userId,
      category: category || selectedCategory,
      sos_method: sosMethod,
      location: currentLoc && currentLoc.status === 'success' ? {
        latitude: currentLoc.latitude,
        longitude: currentLoc.longitude,
        accuracy_meters: currentLoc.accuracy_meters,
        confidence: currentLoc.confidence,
        source: currentLoc.source,
        google_maps_url: currentLoc.google_maps_url
      } : null,
      is_simulation: isSimulation
    };

    try {
      const res = await api.createEmergency(payload);
      setActiveEmergency(res);
      playEmergencyChime();
      return res;
    } catch (err) {
      console.error('SOS Trigger Error:', err);
      const offlineEmergency = {
        id: `offline_${Date.now()}`,
        user_id: userId,
        category,
        sos_method: sosMethod,
        status: 'created',
        location: currentLoc,
        timeline: [
          {
            timestamp: new Date().toISOString(),
            status: 'created',
            message: 'SOS created in offline/local emergency mode.'
          }
        ],
        is_simulation: isSimulation,
        recommended_hospitals: []
      };
      setActiveEmergency(offlineEmergency);
      return offlineEmergency;
    }
  };

  const cancelEmergency = async (reason = 'False alarm cancelled by user') => {
    if (!activeEmergency) return;
    try {
      if (activeEmergency.id && !activeEmergency.id.startsWith('offline_')) {
        await api.cancelEmergency(activeEmergency.id, reason, userId);
      }
    } catch (e) {
      console.warn('Cancel emergency call failed:', e);
    }
    setActiveEmergency(null);
  };

  const resolveEmergency = async (notes) => {
    if (!activeEmergency) return;
    try {
      if (activeEmergency.id && !activeEmergency.id.startsWith('offline_')) {
        await api.resolveEmergency(activeEmergency.id, notes);
      }
    } catch (e) {
      console.warn('Resolve emergency call failed:', e);
    }
    setActiveEmergency(null);
  };

  const playEmergencyChime = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(440, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {}
  };

  return (
    <EmergencyContext.Provider
      value={{
        userId,
        setUserId,
        activeEmergency,
        location,
        locationLoading,
        permissionState,
        regionalLocations: REGIONAL_MANUAL_LOCATIONS,
        fetchLocation,
        detectNetworkLocation,
        selectManualLocation,
        selectedCategory,
        setSelectedCategory,
        isJudgeDemo,
        setIsJudgeDemo,
        contacts,
        fetchContacts,
        triggerSOS,
        cancelEmergency,
        resolveEmergency,
        networkOnline
      }}
    >
      {children}
    </EmergencyContext.Provider>
  );
}

export function useEmergency() {
  const context = useContext(EmergencyContext);
  if (!context) {
    throw new Error('useEmergency must be used within an EmergencyProvider');
  }
  return context;
}
