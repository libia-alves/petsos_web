import { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import { Link, useLocation } from 'react-router-dom';
import AddressSearch from '@/components/map/AddressSearch';
import MapFocus from '@/components/map/MapFocus';
import { getComplaintIcon, userLocationIcon } from '@/components/map/markerIcons';
import ComplaintCard from '@/components/complaints/ComplaintCard';
import { StatusBadge, TypeBadge } from '@/components/complaints/Badges';
import { DEFAULT_CENTER, DEFAULT_ZOOM, FOCUS_ZOOM, TILE_ATTRIBUTION, TILE_URL } from '@/constants/map.constants';
import { STATUS_CONFIG } from '@/constants/complaints.constants';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useMapComplaints } from '@/hooks/useMapComplaints';
import { sortByNewest } from '@/utils/complaint.utils';
import { formatRelativeDate } from '@/utils/date.utils';

const toBounds = (leafletBounds) => ({
  north: leafletBounds.getNorth(),
  south: leafletBounds.getSouth(),
  east: leafletBounds.getEast(),
  west: leafletBounds.getWest(),
});

function BoundsWatcher({ onChange }) {
  const map = useMap();

  useEffect(() => {
    onChange(toBounds(map.getBounds()));
  }, [map, onChange]);

  useMapEvents({
    moveend: (event) => onChange(toBounds(event.target.getBounds())),
  });

  return null;
}

export default function MapPage() {
  const routeLocation = useLocation();
  // Denúncia recém-criada: o formulário volta para o mapa já focado nela
  const createdComplaint = routeLocation.state?.createdComplaint ?? null;

  const [bounds, setBounds] = useState(null);
  const [focus, setFocus] = useState(() =>
    createdComplaint?.location
      ? {
          latitude: Number(createdComplaint.location.latitude),
          longitude: Number(createdComplaint.location.longitude),
          zoom: FOCUS_ZOOM,
        }
      : null,
  );
  const [selectedId, setSelectedId] = useState(createdComplaint?.id ?? null);
  const [userLocation, setUserLocation] = useState(null);
  const markerRefs = useRef(new Map());

  const { complaints, isLoading, hasLoaded, error, isTooZoomedOut } = useMapComplaints(bounds);
  const { locate, isLocating, error: geoError } = useGeolocation();

  const visibleComplaints = useMemo(() => sortByNewest(complaints), [complaints]);

  const handleSelect = (complaint) => {
    setSelectedId(complaint.id);
    setFocus({
      latitude: Number(complaint.location.latitude),
      longitude: Number(complaint.location.longitude),
      zoom: FOCUS_ZOOM,
    });
    // Espera o flyTo terminar antes de abrir o popup
    setTimeout(() => markerRefs.current.get(complaint.id)?.openPopup(), 850);
  };

  const handleMyLocation = async () => {
    try {
      const location = await locate();
      setUserLocation(location);
      setFocus({ ...location, zoom: 15 });
    } catch {
      // mensagem exibida via geoError
    }
  };

  let mapNotice = null;
  if (isTooZoomedOut) mapNotice = 'Aproxime o mapa para ver as denúncias da região.';
  else if (error) mapNotice = error;
  else if (hasLoaded && !isLoading && complaints.length === 0) mapNotice = 'Nenhuma denúncia nesta área.';

  return (
    <div className="map-page">
      <aside className="map-sidebar">
        {createdComplaint && (
          <div className="map-sidebar-section">
            <div className="notice notice--success">
              <strong>Denúncia registrada com sucesso!</strong>
              <p>&quot;{createdComplaint.title}&quot; já aparece no mapa.</p>
            </div>
          </div>
        )}

        <div className="map-sidebar-section">
          <h1 className="map-title">Denúncias no mapa</h1>
          <AddressSearch
            onSelect={({ latitude, longitude }) => setFocus({ latitude, longitude, zoom: 15 })}
          />
          <button
            type="button"
            className="btn btn-ghost btn-block"
            onClick={handleMyLocation}
            disabled={isLocating}
          >
            {isLocating ? 'Localizando...' : '📍 Minha localização'}
          </button>
          {geoError && <div className="alert-error">{geoError}</div>}
        </div>

        <div className="map-sidebar-list">
          <p className="map-sidebar-count">
            {isLoading
              ? 'Carregando...'
              : `${visibleComplaints.length} denúncia${visibleComplaints.length === 1 ? '' : 's'} nesta área`}
          </p>
          {visibleComplaints.map((complaint) => (
            <ComplaintCard
              key={complaint.id}
              complaint={complaint}
              selected={complaint.id === selectedId}
              onSelect={handleSelect}
            />
          ))}
        </div>
      </aside>

      <div className="map-area">
        <MapContainer center={DEFAULT_CENTER} zoom={DEFAULT_ZOOM} scrollWheelZoom>
          <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
          <BoundsWatcher onChange={setBounds} />
          <MapFocus focus={focus} />

          {userLocation && (
            <Marker
              position={[userLocation.latitude, userLocation.longitude]}
              icon={userLocationIcon}
              interactive={false}
            />
          )}

          {visibleComplaints.map((complaint) => (
            <Marker
              key={complaint.id}
              position={[Number(complaint.location.latitude), Number(complaint.location.longitude)]}
              icon={getComplaintIcon(complaint, complaint.id === selectedId)}
              zIndexOffset={complaint.id === selectedId ? 1000 : 0}
              ref={(marker) => {
                if (marker) markerRefs.current.set(complaint.id, marker);
                else markerRefs.current.delete(complaint.id);
              }}
              eventHandlers={{ click: () => setSelectedId(complaint.id) }}
            >
              <Popup>
                <div className="map-popup">
                  <div className="complaint-card-badges">
                    <StatusBadge status={complaint.status} />
                    <TypeBadge type={complaint.type} />
                  </div>
                  <strong>{complaint.title}</strong>
                  {complaint.description && <p>{complaint.description}</p>}
                  <small>{formatRelativeDate(complaint.createdAt)}</small>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {mapNotice && <div className="map-notice">{mapNotice}</div>}

        <div className="map-legend" aria-label="Legenda de status">
          {Object.entries(STATUS_CONFIG).map(([value, { label, color }]) => (
            <span key={value}>
              <i style={{ background: color }} />
              {label}
            </span>
          ))}
        </div>

        <Link to="/denuncias/nova" className="btn map-fab">
          + Nova denúncia
        </Link>
      </div>
    </div>
  );
}
