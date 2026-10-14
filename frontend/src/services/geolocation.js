// LifeLink AI - Real Device Geolocation Service

export async function getCurrentLocation() {
  if (!navigator.geolocation) {
    return {
      status: 'unavailable',
      error: 'Geolocation is not supported by your browser or operating system hardware.',
      confidence: 'unavailable'
    };
  }

  return new Promise((resolve) => {
    const options = {
      enableHighAccuracy: true,
      timeout: 12000,
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        let confidence = 'approximate';
        if (accuracy <= 25) {
          confidence = 'precise';
        } else if (accuracy > 250) {
          confidence = 'stale';
        }

        resolve({
          status: 'success',
          latitude: Number(latitude.toFixed(6)),
          longitude: Number(longitude.toFixed(6)),
          accuracy_meters: Math.round(accuracy),
          confidence,
          source: 'browser_high_accuracy_gps',
          timestamp: new Date(position.timestamp).toISOString(),
          google_maps_url: `https://www.google.com/maps?q=${latitude.toFixed(6)},${longitude.toFixed(6)}`
        });
      },
      (error) => {
        let msg = 'Failed to acquire location.';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            msg = 'Location permission was denied. Please allow location access in your browser settings to transmit emergency coordinates.';
            break;
          case error.POSITION_UNAVAILABLE:
            msg = 'GPS satellite / network location signal unavailable on this device.';
            break;
          case error.TIMEOUT:
            msg = 'Location acquisition timed out. Please check device GPS or network signal.';
            break;
        }
        resolve({
          status: 'error',
          error: msg,
          code: error.code,
          confidence: 'unavailable'
        });
      },
      options
    );
  });
}

export function watchLiveLocation(onUpdate, onError) {
  if (!navigator.geolocation) return null;

  return navigator.geolocation.watchPosition(
    (pos) => {
      onUpdate({
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
