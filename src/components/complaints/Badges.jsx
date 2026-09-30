import { getStatusConfig, getTypeConfig } from '@/constants/complaints.constants';

export function StatusBadge({ status }) {
  const { label, color } = getStatusConfig(status);
  return (
    <span className="badge" style={{ '--badge-color': color }}>
      <span className="badge-dot" />
      {label}
    </span>
  );
}

export function TypeBadge({ type }) {
  const { label, color } = getTypeConfig(type);
  return (
    <span className="badge badge-soft" style={{ '--badge-color': color }}>
      {label}
    </span>
  );
}
