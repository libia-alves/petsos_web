import { useCallback, useEffect, useMemo, useState } from 'react';
import ComplaintCard from '@/components/complaints/ComplaintCard';
import ComplaintFilters from '@/components/complaints/ComplaintFilters';
import AddressSearch from '@/components/map/AddressSearch';
import { EMPTY_FILTERS } from '@/constants/complaints.constants';
import { useGeolocation } from '@/hooks/useGeolocation';
import { getComplaints, getNearbyComplaints } from '@/services/complaints.service';
import { filterComplaints, sortByNewest } from '@/utils/complaint.utils';

const PAGE_SIZE = 20;
// A rota /complaints/nearest aceita no máximo 50 km
const RADIUS_OPTIONS = [1, 5, 10, 25, 50];

export default function ComplaintsPage() {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [mode, setMode] = useState('recent');
  const [place, setPlace] = useState(null);
  const [radiusKm, setRadiusKm] = useState(5);

  const [items, setItems] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { locate, isLocating, error: geoError } = useGeolocation();

  const loadRecent = useCallback(async (cursor, signal) => {
    const { items: page, pageInfo } = await getComplaints({ cursor, limit: PAGE_SIZE, signal });
    setItems((prev) => (cursor ? [...prev, ...page] : page));
    setNextCursor(pageInfo?.hasMore ? pageInfo.nextCursor : null);
  }, []);

  useEffect(() => {
    if (mode === 'nearby' && !place) {
      setItems([]);
      return;
    }

    const controller = new AbortController();
    setIsLoading(true);
    setError('');
    setNextCursor(null);

    const request =
      mode === 'recent'
        ? loadRecent(null, controller.signal)
        : getNearbyComplaints(
            { lat: place.latitude, lng: place.longitude, radiusKm },
            controller.signal,
          ).then(setItems);

    request
      .catch((fetchError) => {
        if (fetchError.name !== 'AbortError') setError('Não foi possível carregar as denúncias.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [mode, place, radiusKm, loadRecent]);

  const handleLoadMore = async () => {
    setIsLoading(true);
    try {
      await loadRecent(nextCursor);
    } catch {
      setError('Não foi possível carregar mais denúncias.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMyLocation = async () => {
    try {
      const location = await locate();
      setPlace({ ...location, label: 'Minha localização' });
    } catch {
      // mensagem exibida via geoError
    }
  };

  const filtered = useMemo(() => {
    const result = filterComplaints(items, filters);
    return mode === 'nearby' ? sortByNewest(result) : result;
  }, [items, filters, mode]);

  return (
    <div className="page">
      <header className="page-header">
        <h1>Denúncias</h1>
        <p>Veja as denúncias registradas e filtre por tipo, status ou localização.</p>
      </header>

      <div className="complaints-layout">
        <aside className="card complaints-filters">
          <div className="segmented" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'recent'}
              className={mode === 'recent' ? 'is-active' : ''}
              onClick={() => setMode('recent')}
            >
              Mais recentes
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'nearby'}
              className={mode === 'nearby' ? 'is-active' : ''}
              onClick={() => setMode('nearby')}
            >
              Por localização
            </button>
          </div>

          {mode === 'nearby' && (
            <div className="filters">
              <AddressSearch
                placeholder="Endereço, bairro ou cidade"
                onSelect={({ latitude, longitude, shortLabel }) =>
                  setPlace({ latitude, longitude, label: shortLabel })
                }
              />
              <button
                type="button"
                className="btn btn-ghost btn-block"
                onClick={handleMyLocation}
                disabled={isLocating}
              >
                {isLocating ? 'Localizando...' : '📍 Perto de mim'}
              </button>
              {geoError && <div className="alert-error">{geoError}</div>}

              <label className="field">
                <span>Raio de busca</span>
                <select
                  className="input"
                  value={radiusKm}
                  onChange={(event) => setRadiusKm(Number(event.target.value))}
                >
                  {RADIUS_OPTIONS.map((km) => (
                    <option key={km} value={km}>
                      Até {km} km
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}

          <ComplaintFilters filters={filters} onChange={setFilters} />
        </aside>

        <section className="complaints-results">
          {mode === 'nearby' && place && (
            <p className="results-summary">
              Até {radiusKm} km de <strong>{place.label}</strong>
            </p>
          )}

          {error && <div className="alert-error">{error}</div>}

          {mode === 'nearby' && !place && (
            <div className="empty-state">
              <span aria-hidden="true">📍</span>
              <p>Busque um endereço ou use sua localização para ver as denúncias próximas.</p>
            </div>
          )}

          {!isLoading && !error && filtered.length === 0 && (mode === 'recent' || place) && (
            <div className="empty-state">
              <span aria-hidden="true">🐾</span>
              <p>Nenhuma denúncia encontrada com esses filtros.</p>
            </div>
          )}

          <div className="complaints-grid">
            {filtered.map((complaint) => (
              <ComplaintCard key={complaint.id} complaint={complaint} />
            ))}
          </div>

          {isLoading && <p className="page-loading">Carregando...</p>}

          {mode === 'recent' && nextCursor && !isLoading && (
            <button type="button" className="btn btn-ghost btn-block" onClick={handleLoadMore}>
              Carregar mais
            </button>
          )}
        </section>
      </div>
    </div>
  );
}
