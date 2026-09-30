import { useEffect, useState } from 'react';
import { MAP_MAX_VIEWPORT_DELTA } from '@/constants/map.constants';
import { useDebouncedValue } from './useDebouncedValue';
import { getComplaintsInBounds } from '@/services/complaints.service';
import { hasValidLocation } from '@/utils/complaint.utils';

/**
 * Busca as denúncias da área visível do mapa sempre que ela muda
 * @param {{ north: number, south: number, east: number, west: number } | null} bounds
 */
export function useMapComplaints(bounds) {
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  // Evita mostrar "nenhuma denúncia" antes da primeira busca terminar
  const [hasLoaded, setHasLoaded] = useState(false);
  const debouncedBounds = useDebouncedValue(bounds, 350);

  const isTooZoomedOut = Boolean(
    debouncedBounds &&
      (debouncedBounds.north - debouncedBounds.south > MAP_MAX_VIEWPORT_DELTA ||
        debouncedBounds.east - debouncedBounds.west > MAP_MAX_VIEWPORT_DELTA),
  );

  useEffect(() => {
    if (!debouncedBounds || isTooZoomedOut) return;

    const controller = new AbortController();
    setIsLoading(true);
    setError('');

    getComplaintsInBounds(debouncedBounds, controller.signal)
      .then((items) => {
        setComplaints(items.filter(hasValidLocation));
        setHasLoaded(true);
      })
      .catch((fetchError) => {
        if (fetchError.name === 'AbortError') return;
        setError('Não foi possível carregar as denúncias. Verifique se a API está no ar.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [debouncedBounds, isTooZoomedOut]);

  return { complaints, isLoading, hasLoaded, error, isTooZoomedOut };
}
