import { COMPLAINT_TYPES, STATUS_OPTIONS } from '@/constants/complaints.constants';

/**
 * Filtros por tipo (chips), status (select) e texto
 * @param {{ filters: { type: string|null, status: string|null, text: string }, onChange: Function }} props
 */
export default function ComplaintFilters({ filters, onChange, showText = true }) {
  const update = (field, value) => onChange({ ...filters, [field]: value });

  return (
    <div className="filters">
      {showText && (
        <input
          type="search"
          className="input"
          placeholder="Buscar por título ou descrição"
          value={filters.text}
          onChange={(event) => update('text', event.target.value)}
        />
      )}

      <div className="chips" role="group" aria-label="Filtrar por tipo">
        <button
          type="button"
          className={`chip${!filters.type ? ' is-active' : ''}`}
          onClick={() => update('type', null)}
        >
          Todas
        </button>
        {COMPLAINT_TYPES.map(({ label, value }) => (
          <button
            key={value}
            type="button"
            className={`chip${filters.type === value ? ' is-active' : ''}`}
            onClick={() => update('type', filters.type === value ? null : value)}
          >
            {label}
          </button>
        ))}
      </div>

      <select
        className="input"
        aria-label="Filtrar por status"
        value={filters.status ?? ''}
        onChange={(event) => update('status', event.target.value || null)}
      >
        <option value="">Todos os status</option>
        {STATUS_OPTIONS.map(({ label, value }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}
