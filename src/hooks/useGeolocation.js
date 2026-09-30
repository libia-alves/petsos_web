import { useCallback, useState } from 'react';

const GEOLOCATION_ERRORS = {
  1: 'Permissão de localização negada. Libere nas configurações do navegador.',
  2: 'Não foi possível obter sua localização.',
  3: 'A busca pela localização demorou demais. Tente novamente.',
};

/** Localização atual do navegador, pedida só quando o usuário clica */
export function useGeolocation() {
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState('');

  const locate = useCallback(() => {
    if (!navigator.geolocation) {
      const message = 'Seu navegador não suporta localização.';
      setError(message);
      return Promise.reject(new Error(message));
    }

    setIsLocating(true);
    setError('');

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setIsLocating(false);
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (geoError) => {
          const message = GEOLOCATION_ERRORS[geoError.code] ?? GEOLOCATION_ERRORS[2];
          setIsLocating(false);
          setError(message);
          reject(new Error(message));
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 },
      );
    });
  }, []);

  return { locate, isLocating, error };
}
