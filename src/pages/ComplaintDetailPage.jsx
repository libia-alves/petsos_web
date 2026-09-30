import { useEffect, useState } from 'react';
import { MapContainer, Marker, TileLayer } from 'react-leaflet';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { StatusBadge, TypeBadge } from '@/components/complaints/Badges';
import { getComplaintIcon } from '@/components/map/markerIcons';
import { ANIMAL_EMOJI, ANIMAL_TYPES } from '@/constants/complaints.constants';
import { FOCUS_ZOOM, TILE_ATTRIBUTION, TILE_URL } from '@/constants/map.constants';
import { useAddress } from '@/hooks/useAddress';
import { resolveUploadUrl } from '@/services/api';
import { getComplaintById } from '@/services/complaints.service';
import { hasValidLocation } from '@/utils/complaint.utils';
import { formatFullDate, formatRelativeDate } from '@/utils/date.utils';

const getAnimalLabel = (value) => ANIMAL_TYPES.find((animal) => animal.value === value)?.label ?? 'Outro';

function PhotoGallery({ photos }) {
  const [activeIndex, setActiveIndex] = useState(null);
  const [failedUrls, setFailedUrls] = useState([]);
  const urls = photos
    .map(resolveUploadUrl)
    .filter((url) => url && !failedUrls.includes(url));

  useEffect(() => {
    if (activeIndex === null) return;
    const handleKey = (event) => {
      if (event.key === 'Escape') setActiveIndex(null);
      if (event.key === 'ArrowRight') setActiveIndex((index) => (index + 1) % urls.length);
      if (event.key === 'ArrowLeft') setActiveIndex((index) => (index - 1 + urls.length) % urls.length);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [activeIndex, urls.length]);

  if (urls.length === 0) return null;

  return (
    <>
      <div className={`gallery gallery--${Math.min(urls.length, 3)}`}>
        {urls.map((url, index) => (
          <button key={url} type="button" onClick={() => setActiveIndex(index)}>
            <img
              src={url}
              alt={`Evidência ${index + 1}`}
              onError={() => setFailedUrls((prev) => [...prev, url])}
            />
          </button>
        ))}
      </div>

      {activeIndex !== null && (
        <div className="lightbox" role="dialog" aria-modal="true" onClick={() => setActiveIndex(null)}>
          <img src={urls[activeIndex]} alt={`Evidência ${activeIndex + 1}`} />
          <span className="lightbox-counter">
            {activeIndex + 1} / {urls.length}
          </span>
        </div>
      )}
    </>
  );
}

export default function ComplaintDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const routeLocation = useLocation();
  const [complaint, setComplaint] = useState(null);
  const [status, setStatus] = useState('loading');
  const [copied, setCopied] = useState(false);

  const location = hasValidLocation(complaint)
    ? { latitude: Number(complaint.location.latitude), longitude: Number(complaint.location.longitude) }
    : null;
  const { address, loadingAddress } = useAddress(location);

  useEffect(() => {
    const controller = new AbortController();
    setStatus('loading');

    getComplaintById(id, controller.signal)
      .then((data) => {
        setComplaint(data);
        setStatus('ready');
      })
      .catch((error) => {
        if (error.name === 'AbortError') return;
        setStatus(error.status === 404 ? 'not-found' : 'error');
      });

    return () => controller.abort();
  }, [id]);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // navegador sem permissão de clipboard
    }
  };

  if (status === 'loading') return <p className="page-loading">Carregando denúncia...</p>;

  if (status !== 'ready') {
    return (
      <div className="page">
        <div className="empty-state card">
          <span aria-hidden="true">🐾</span>
          <p>
            {status === 'not-found'
              ? 'Denúncia não encontrada. Ela pode ter sido removida ou estar em moderação.'
              : 'Não foi possível carregar a denúncia.'}
          </p>
          <Link to="/denuncias" className="btn">
            Ver outras denúncias
          </Link>
        </div>
      </div>
    );
  }

  const photos = complaint.photos ?? [];

  return (
    <div className="page page--narrow">
      <button type="button" className="back-link" onClick={() => navigate(-1)}>
        ← Voltar
      </button>

      {routeLocation.state?.justCreated && (
        <div className="notice notice--success">
          <strong>Denúncia registrada com sucesso!</strong>
          <p>Ela já aparece no mapa. Compartilhe o link para que mais pessoas possam acompanhar.</p>
        </div>
      )}

      <article className="card detail">
        <PhotoGallery photos={photos} />

        <div className="detail-header">
          <div className="complaint-card-badges">
            <StatusBadge status={complaint.status} />
            <TypeBadge type={complaint.type} />
          </div>
          <h1>{complaint.title}</h1>
          <p className="detail-meta">
            Registrada {formatRelativeDate(complaint.createdAt)} por{' '}
            {complaint.isAnonymous || !complaint.createdByUsername ? (
              <strong>Anônimo</strong>
            ) : (
              <strong>@{complaint.createdByUsername}</strong>
            )}
          </p>
        </div>

        {complaint.description && (
          <section className="detail-section">
            <h2>Descrição</h2>
            <p className="detail-description">{complaint.description}</p>
          </section>
        )}

        <section className="detail-section">
          <h2>Informações</h2>
          <dl className="detail-info">
            <div>
              <dt>Animal</dt>
              <dd>
                {ANIMAL_EMOJI[complaint.animal] ?? '🐾'} {getAnimalLabel(complaint.animal)}
              </dd>
            </div>
            <div>
              <dt>Registrada em</dt>
              <dd>{formatFullDate(complaint.createdAt)}</dd>
            </div>
            {complaint.statusUpdatedAt && (
              <div>
                <dt>Status atualizado</dt>
                <dd>{formatFullDate(complaint.statusUpdatedAt)}</dd>
              </div>
            )}
            <div>
              <dt>Acompanhando</dt>
              <dd>{complaint.followersCount ?? 0} pessoa(s)</dd>
            </div>
            <div>
              <dt>Voluntários</dt>
              <dd>{complaint.volunteersCount ?? 0}</dd>
            </div>
            <div>
              <dt>Evidências</dt>
              <dd>{photos.length} foto(s)</dd>
            </div>
          </dl>
        </section>

        {location && (
          <section className="detail-section">
            <h2>Localização</h2>
            <p>{loadingAddress ? 'Buscando endereço...' : address}</p>
            <div className="detail-map">
              <MapContainer
                center={[location.latitude, location.longitude]}
                zoom={FOCUS_ZOOM}
                scrollWheelZoom={false}
              >
                <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
                <Marker position={[location.latitude, location.longitude]} icon={getComplaintIcon(complaint)} />
              </MapContainer>
            </div>
            <a
              className="btn btn-ghost"
              href={`https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`}
              target="_blank"
              rel="noreferrer"
            >
              Abrir no Google Maps
            </a>
          </section>
        )}

        <div className="detail-actions">
          <button type="button" className="btn btn-ghost" onClick={handleShare}>
            {copied ? 'Link copiado!' : '🔗 Copiar link'}
          </button>
        </div>
      </article>
    </div>
  );
}
