import { useEffect, useState } from 'react';
import { getAddressFromCoords } from '@/services/geocoding.service';

/** Endereço legível de uma localização { latitude, longitude } */
export function useAddress(location) {
  const latitude = Number(location?.latitude);
  const longitude = Number(location?.longitude);
  const hasLocation = Number.isFinite(latitude) && Number.isFinite(longitude);

  const [result, setResult] = useState({ key: null, address: null });
  const key = hasLocation ? `${latitude},${longitude}` : null;

  useEffect(() => {
    if (!key) return;

    let cancelled = false;
    getAddressFromCoords(latitude, longitude).then((address) => {
      if (!cancelled) setResult({ key, address });
    });

    return () => {
      cancelled = true;
    };
  }, [key, latitude, longitude]);

  const isCurrent = result.key === key;

  return {
    address: isCurrent ? result.address : null,
    loadingAddress: Boolean(key) && !isCurrent,
  };
}
