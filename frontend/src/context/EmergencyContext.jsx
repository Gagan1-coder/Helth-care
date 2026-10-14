import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { getCurrentLocation } from '../services/geolocation';

const EmergencyContext = createContext();

export function EmergencyProvider({ children }) {
  const [userId, setUserId] = useState(() => localStorage.getItem('lifelink_user_id') || 'demo_user');
  const [activeEmergency, setActiveEmergency] = useState(null);
  const [location, setLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('cardiac');
  const [isJudgeDemo, setIsJudgeDemo] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [networkOnline, setNetworkOnline] = useState(navigator.onLine);

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

  // Fetch initial location and contacts
  useEffect(() => {
    fetchLocation();
    fetchContacts();
  }, [userId]);

  const fetchLocation = async () => {
    setLocationLoading(true);
    const loc = await getCurrentLocation();
    setLocation(loc);
    setLocationLoading(false);
    return loc;
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
    // Refresh location if available
    let currentLoc = location;
    if (!currentLoc || currentLoc.status !== 'success') {
      currentLoc = await getCurrentLocation();
      setLocation(currentLoc);
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
      // Play brief audio alert beep using Web Audio API
      playEmergencyChime();
      return res;
    } catch (err) {
      console.error('SOS Trigger Error:', err);
      // Fallback local emergency object for offline resiliency
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
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
      osc.frequency.setValueAtTime(440, ctx.currentTime + 0.15); // A4
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {
      // Audio autoplay blocked or unsupported
    }
  };

  return (
    <EmergencyContext.Provider
      value={{
        userId,
        setUserId,
        activeEmergency,
        location,
        locationLoading,
        fetchLocation,
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
