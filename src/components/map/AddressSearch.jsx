import { useEffect, useState } from 'react';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { searchAddress } from '@/services/geocoding.service';

const MIN_QUERY_LENGTH = 3;

/**
 * Campo de busca de endereço/cidade com sugestões (Nominatim)
 * @param {{ onSelect: (place: { label: string, latitude: number, longitude: number }) => void }} props
 */
export default function AddressSearch({ onSelect, placeholder = 'Buscar endereço, bairro ou cidade' }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState('idle');
  const debouncedQuery = useDebouncedValue(query.trim(), 600);

  useEffect(() => {
    if (debouncedQuery.length < MIN_QUERY_LENGTH) return;

    const controller = new AbortController();
    setStatus('loading');

    searchAddress(debouncedQuery, controller.signal)
      .then((places) => {
        setResults(places);
        setStatus(places.length ? 'idle' : 'empty');
      })
      .catch((error) => {
        if (error.name !== 'AbortError') setStatus('error');
      });

    return () => controller.abort();
  }, [debouncedQuery]);

  const handleSelect = (place) => {
    setQuery(place.shortLabel);
    setIsOpen(false);
    onSelect(place);
  };

  const showDropdown = isOpen && query.trim().length >= MIN_QUERY_LENGTH;

  return (
    <div className="address-search">
      <input
        type="search"
        className="input"
        placeholder={placeholder}
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 150)}
        onKeyDown={(event) => {
          // Enter dentro do formulário de denúncia não deve enviar o formulário
          if (event.key === 'Enter') {
            event.preventDefault();
            if (results[0]) handleSelect(results[0]);
          }
        }}
      />

      {showDropdown && (
        <ul className="address-search-results">
          {status === 'loading' && <li className="address-search-hint">Buscando...</li>}
          {status === 'empty' && <li className="address-search-hint">Nenhum endereço encontrado</li>}
          {status === 'error' && <li className="address-search-hint">Erro ao buscar endereço</li>}
          {status === 'idle' &&
            results.map((place) => (
              <li key={`${place.latitude},${place.longitude}`}>
                <button type="button" onMouseDown={() => handleSelect(place)}>
                  <strong>{place.shortLabel}</strong>
                  <small>{place.label}</small>
                </button>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}
