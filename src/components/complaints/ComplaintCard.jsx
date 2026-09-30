import { formatRelativeDate } from '@/utils/date.utils';
import { getCoverPhoto } from '@/utils/complaint.utils';
import { StatusBadge, TypeBadge } from './Badges';
import ComplaintPhoto from './ComplaintPhoto';

// Card da lista lateral do mapa: o clique centraliza o mapa na denúncia
export default function ComplaintCard({ complaint, selected = false, onSelect }) {
  const cover = getCoverPhoto(complaint);

  return (
    <button
      type="button"
      className={`complaint-card complaint-card--compact${selected ? ' is-selected' : ''}`}
      onClick={() => onSelect(complaint)}
    >
      <div className="complaint-card-photo">
        <ComplaintPhoto src={cover} animal={complaint.animal} />
      </div>

      <div className="complaint-card-body">
        <div className="complaint-card-badges">
          <StatusBadge status={complaint.status} />
          <TypeBadge type={complaint.type} />
        </div>
        <h3>{complaint.title}</h3>
        <small>{formatRelativeDate(complaint.createdAt)}</small>
      </div>
    </button>
  );
}
