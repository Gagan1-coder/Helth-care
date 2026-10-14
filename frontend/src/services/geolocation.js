// LifeLink AI - Real Device Geolocation Service, Network IP Lookup & Manual Fallback

export const REGIONAL_MANUAL_LOCATIONS = [
  {
    id: 'bhatkal_town',
    name: 'Bhatkal Town (Ranginkatte)',
    district: 'Uttara Kannada',
    latitude: 13.9785,
    longitude: 74.5534,
    source: 'Manual Selection: Bhatkal Town'
  },
  {
    id: 'bhatkal_taluka_hospital',
    name: 'Bhatkal Taluka Hospital Area',
    district: 'Uttara Kannada',
    latitude: 13.9856,
    longitude: 74.5512,
    source: 'Manual Selection: Bhatkal Taluka Hospital'
  },
  {
    id: 'murdeshwar',
    name: 'Murdeshwar Beach & Temple',
    district: 'Uttara Kannada',
    latitude: 14.0942,
    longitude: 74.4839,
    source: 'Manual Selection: Murdeshwar'
  },
  {
    id: 'honnavar',
    name: 'Honnavar (Sharavathi)',
    district: 'Uttara Kannada',
    latitude: 14.2798,
    longitude: 74.4439,
    source: 'Manual Selection: Honnavar'
  },
  {
    id: 'kumta',
    name: 'Kumta Town',
    district: 'Uttara Kannada',
    latitude: 14.4265,
    longitude: 74.4189,
    source: 'Manual Selection: Kumta'
  },
  {
    id: 'udupi_manipal',
    name: 'Udupi / Manipal KMC',
    district: 'Udupi',
    latitude: 13.3525,
    longitude: 74.7865,
    source: 'Manual Selection: Manipal'
  },
  {
    id: 'karwar',
    name: 'Karwar (KIMS / District HQ)',
    district: 'Uttara Kannada',
    latitude: 14.8136,
    longitude: 74.1298,
    source: 'Manual Selection: Karwar'
  }
];

export const DEFAULT_FALLBACK_LOCATION = {
  status: 'success',
  is_manual: true,
  latitude: 13.9856,
  longitude: 74.5512,
  accuracy_meters: 100,
  confidence: 'manual',
  source: 'Manual Preset: Bhatkal Taluka Hospital Area',
  timestamp: new Date().toISOString(),
  google_maps_url: 'https://www.google.com/maps?q=13.9856,74.5512'
};

export async function getPermissionStatus() {
  if (typeof navigator === 'undefined' || !navigator.permissions || !navigator.permissions.query) {
    return 'unsupported';
  }
  try {
    const status = await navigator.permissions.query({ name: 'geolocation' });
    return status.state; // 'granted', 'prompt', 'denied'
  } catch (err) {
    return 'unsupported';
  }
}

export async function getNetworkLocation() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch('https://ipapi.co/json/', { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error('IP geolocation non-200');
    const data = await res.json();
    if (data.latitude && data.longitude) {
      return {
        status: 'success',
        is_manual: false,
        latitude: Number(Number(data.latitude).toFixed(6)),
        longitude: Number(Number(data.longitude).toFixed(6)),
        accuracy_meters: 5000,
        confidence: 'coarse',
        source: `Network IP Location (${data.city || 'Regional'}, ${data.region || 'Karnataka'})`,
        timestamp: new Date().toISOString(),
        google_maps_url: `https://www.google.com/maps?q=${Number(data.latitude).toFixed(6)},${Number(data.longitude).toFixed(6)}`
      };
    }
  } catch (err) {
    console.warn('Network IP geolocation skipped:', err.message);
  }
  return null;
}

export async function getCurrentLocation() {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    return {
      status: 'unavailable',
      is_manual: false,
      error: 'Geolocation is not supported by your browser or operating system.',
      troubleshooting: 'Please use a modern browser (Chrome, Edge, Safari, Firefox) on an HTTPS or localhost connection.',
      confidence: 'unavailable'
    };
  }

  return new Promise((resolve) => {
    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        let confidence = 'approximate';
        if (accuracy <= 25) {
          confidence = 'precise';
        } else if (accuracy > 250) {
          confidence = 'coarse';
        }

        resolve({
          status: 'success',
          is_manual: false,
          latitude: Number(latitude.toFixed(6)),
          longitude: Number(longitude.toFixed(6)),
          accuracy_meters: Math.round(accuracy),
          confidence,
          source: 'Browser Geolocation (Network/Wi-Fi/Cellular/GNSS)',
          timestamp: new Date(position.timestamp).toISOString(),
          google_maps_url: `https://www.google.com/maps?q=${latitude.toFixed(6)},${longitude.toFixed(6)}`
        });
      },
      (error) => {
        let errorMsg = 'Failed to acquire location.';
        let troubleshooting = '';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMsg = 'Location permission was denied by the browser.';
            troubleshooting = 'Click the Lock / Tune icon next to the browser URL, switch Location to "Allow", and click Retry. On Windows, verify that Windows Settings > Privacy & security > Location is turned ON.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg = 'Device location signal or network triangulation is currently unavailable.';
            troubleshooting = 'Ensure Wi-Fi or cellular data is enabled. If indoors or on a desktop PC without GPS hardware, select your area manually.';
            break;
          case error.TIMEOUT:
            errorMsg = 'Location request timed out after 10 seconds.';
            troubleshooting = 'The browser could not obtain a fix in time. Click Retry or pick your location manually.';
            break;
        }

        resolve({
          status: 'error',
          is_manual: false,
          code: error.code,
          error: errorMsg,
          troubleshooting,
          confidence: 'unavailable'
        });
      },
      options
    );
  });
}

export function createManualLocation(preset) {
  return {
    status: 'success',
    is_manual: true,
    latitude: Number(preset.latitude.toFixed(6)),
    longitude: Number(preset.longitude.toFixed(6)),
    accuracy_meters: 100,
    confidence: 'manual',
    source: preset.source || `Manual Selection: ${preset.name}`,
    timestamp: new Date().toISOString(),
    google_maps_url: `https://www.google.com/maps?q=${preset.latitude.toFixed(6)},${preset.longitude.toFixed(6)}`
  };
}

export function watchLiveLocation(onUpdate, onError) {
  if (typeof navigator === 'undefined' || !navigator.geolocation) return null;

  return navigator.geolocation.watchPosition(
    (pos) => {
      onUpdate({
        status: 'success',
        is_manual: false,
        latitude: Number(pos.coords.latitude.toFixed(6)),
        longitude: Number(pos.coords.longitude.toFixed(6)),
        accuracy_meters: Math.round(pos.coords.accuracy),
        timestamp: new Date(pos.timestamp).toISOString()
      });
    },
    onError,
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
  );
}
