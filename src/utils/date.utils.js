// A API serializa datas do Firestore como string ISO
export function getTimestamp(value) {
  if (!value) return Number.NaN;
  if (value instanceof Date) return value.getTime();
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return Date.parse(value);
  return Number.NaN;
}

export function formatRelativeDate(value) {
  const timestamp = getTimestamp(value);
  if (!Number.isFinite(timestamp)) return '—';

  const diffMin = Math.floor((Date.now() - timestamp) / 60000);
  const diffH = Math.floor(diffMin / 60);
  const diffD = Math.floor(diffH / 24);

  if (diffMin < 1) return 'agora mesmo';
  if (diffMin < 60) return `há ${diffMin} min`;
  if (diffH < 24) return `há ${diffH}h`;
  if (diffD === 1) return 'ontem';
  if (diffD < 30) return `há ${diffD} dias`;
  return formatFullDate(value);
}

export function formatFullDate(value) {
  const timestamp = getTimestamp(value);
  if (!Number.isFinite(timestamp)) return '—';

  return new Date(timestamp).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
