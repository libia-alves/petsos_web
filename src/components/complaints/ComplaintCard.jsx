import { Link } from 'react-router-dom';
import { formatRelativeDate } from '@/utils/date.utils';
import { getCoverPhoto } from '@/utils/complaint.utils';
import { StatusBadge, TypeBadge } from './Badges';
import ComplaintPhoto from './ComplaintPhoto';

export default function ComplaintCard({ complaint, compact = false, selected = false, onSelect }) {
  const cover = getCoverPhoto(complaint);

  const content = (
    <>
      <div className="complaint-card-photo">
        <ComplaintPhoto src={cover} animal={complaint.animal} />
      </div>

      <div className="complaint-card-body">
        <div className="complaint-card-badges">
          <StatusBadge status={complaint.status} />
          {!compact && <TypeBadge type={complaint.type} />}
        </div>
        <h3>{complaint.title}</h3>
        {!compact && complaint.description && <p>{complaint.description}</p>}
        <small>{formatRelativeDate(complaint.createdAt)}</small>
      </div>
    </>
  );

  const className = `complaint-card${compact ? ' complaint-card--compact' : ''}${selected ? ' is-selected' : ''}`;

  // No mapa o clique seleciona o marcador; na lista vai direto para o detalhe
  if (onSelect) {
    return (
      <button type="button" className={className} onClick={() => onSelect(complaint)}>
        {content}
      </button>
    );
  }

  return (
    <Link to={`/denuncias/${complaint.id}`} className={className}>
      {content}
    </Link>
  );
}
