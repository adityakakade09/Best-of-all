import { useCallback, useState } from 'react';
import { GeoPoint } from '@bestofall/shared';

interface GeoState {
  location: GeoPoint | null;
  status: 'idle' | 'locating' | 'granted' | 'denied' | 'unsupported';
  request: () => void;
}

export function useGeolocation(): GeoState {
  const [location, setLocation] = useState<GeoPoint | null>(null);
  const [status, setStatus] = useState<GeoState['status']>('idle');

  const request = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setStatus('unsupported');
      return;
    }
    setStatus('locating');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setStatus('granted');
      },
      () => setStatus('denied'),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  return { location, status, request };
}
