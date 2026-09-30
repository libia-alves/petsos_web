import { resolveUploadUrl } from '@/services/api';
import { getTimestamp } from './date.utils';

const normalizeText = (value) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

export const hasValidLocation = (complaint) =>
  Number.isFinite(Number(complaint?.location?.latitude)) &&
  Number.isFinite(Number(complaint?.location?.longitude));

export const getCoverPhoto = (complaint) =>
  resolveUploadUrl(complaint?.thumbnailPhotos?.[0] ?? complaint?.photos?.[0]);

/**
 * Filtros feitos no navegador: a API não recebe filtro de tipo/status
 * @param {object[]} complaints
 * @param {{ type?: string|null, status?: string|null, text?: string }} filters
 */
export function filterComplaints(complaints, { type, status, text } = {}) {
  const query = normalizeText(text?.trim());

  return complaints.filter((complaint) => {
    if (type && complaint.type !== type) return false;
    if (status && complaint.status !== status) return false;
    if (query) {
      const haystack = normalizeText(`${complaint.title} ${complaint.description ?? ''}`);
      if (!haystack.includes(query)) return false;
    }
    return true;
  });
}

export const sortByNewest = (complaints) =>
  [...complaints].sort((a, b) => (getTimestamp(b.createdAt) || 0) - (getTimestamp(a.createdAt) || 0));
