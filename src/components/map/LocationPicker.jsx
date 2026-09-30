import { useMemo, useState } from 'react';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';
import { DEFAULT_CENTER, DEFAULT_ZOOM, FOCUS_ZOOM, TILE_ATTRIBUTION, TILE_URL } from '@/constants/map.constants';
import { useAddress } from '@/hooks/useAddress';
import { useGeolocation } from '@/hooks/useGeolocation';
import AddressSearch from './AddressSearch';
import MapFocus from './MapFocus';
import { pickerIcon } from './markerIcons';

function ClickToPick({ onPick }) {
  useMapEvents({
    click: (event) => onPick({ latitude: event.latlng.lat, longitude: event.latlng.lng }),
  });
  return null;
}

/**
 * Escolha do local da denúncia: clique no mapa, busca por endereço ou GPS
 * @param {{ value: { latitude: number, longitude: number } | null, onChange: Function }} props
 */
export default function LocationPicker({ value, onChange }) {
  const [focus, setFocus] = useState(null);
  const { locate, isLocating, error: geoError } = useGeolocation();
  const { address, loadingAddress } = useAddress(value);

  const markerHandlers = useMemo(
    () => ({
      dragend: (event) => {
        const { lat, lng } = event.target.getLatLng();
        onChange({ latitude: lat, longitude: lng });
      },
    }),
    [onChange],
  );

  const pickAndFocus = (location) => {
    onChange(location);
    setFocus({ ...location, zoom: FOCUS_ZOOM });
  };

  const handleUseMyLocation = async () => {
    try {
      pickAndFocus(await locate());
    } catch {
      // mensagem já exibida via geoError
    }
  };

  return (
    <div className="location-picker">
      <div className="location-picker-toolbar">
        <AddressSearch
          onSelect={({ latitude, longitude }) => pickAndFocus({ latitude, longitude })}
        />
        <button
          type="button"
          className="btn btn-ghost"
          onClick={handleUseMyLocation}
          disabled={isLocating}
        >
          {isLocating ? 'Localizando...' : '📍 Usar minha localização'}
        </button>
      </div>

      {geoError && <div className="alert-error">{geoError}</div>}

      <div className="location-picker-map">
        <MapContainer center={DEFAULT_CENTER} zoom={DEFAULT_ZOOM} scrollWheelZoom>
          <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
          <ClickToPick onPick={onChange} />
          <MapFocus focus={focus} />
          {value && (
            <Marker
              position={[value.latitude, value.longitude]}
              icon={pickerIcon}
              draggable
              eventHandlers={markerHandlers}
            />
          )}
        </MapContainer>
      </div>

      <p className="location-picker-address">
        {!value && 'Clique no mapa, busque um endereço ou use sua localização.'}
        {value && loadingAddress && 'Buscando endereço...'}
        {value && !loadingAddress && (
          <>
            <strong>Local selecionado:</strong> {address}
            <small> (arraste o marcador para ajustar)</small>
          </>
        )}
      </p>
    </div>
  );
}
