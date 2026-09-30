import { apiFetch, unwrapData } from './api';
import { MAP_QUERY_LIMIT } from '@/constants/map.constants';

/**
 * Lista paginada (mais recentes primeiro)
 * @returns {Promise<{ items: object[], pageInfo: { hasMore: boolean, nextCursor: string|null } }>}
 */
export async function getComplaints({ cursor, limit = 20, signal } = {}) {
  const params = new URLSearchParams({ limit: String(limit) });
  if (cursor) params.set('cursor', cursor);

  const response = await apiFetch(`/complaints?${params}`, { signal });
  return unwrapData(response);
}

/**
 * Denúncias dentro da área visível do mapa
 * @param {{ north: number, south: number, east: number, west: number }} bounds
 */
export async function getComplaintsInBounds(bounds, signal) {
  const params = new URLSearchParams({
    north: bounds.north.toFixed(6),
    south: bounds.south.toFixed(6),
    east: bounds.east.toFixed(6),
    west: bounds.west.toFixed(6),
    limit: String(MAP_QUERY_LIMIT),
  });

  const response = await apiFetch(`/complaints/map?${params}`, { signal });
  return unwrapData(response) ?? [];
}

/** Denúncias num raio (máx. 50 km) de um ponto */
export async function getNearbyComplaints({ lat, lng, radiusKm }, signal) {
  const params = new URLSearchParams({
    lat: String(lat),
    lng: String(lng),
    radiusKm: String(radiusKm),
  });

  const response = await apiFetch(`/complaints/nearest?${params}`, { signal });
  return unwrapData(response) ?? [];
}

export async function getComplaintById(id, signal) {
  const response = await apiFetch(`/complaints/${encodeURIComponent(id)}`, { signal });
  return unwrapData(response);
}

/**
 * Envio do formulário de criação de denúncia (multipart, como no app)
 * @param {{ title: string, description: string, type: string, animal: string,
 *   location: { latitude: number, longitude: number }, isAnonymous: boolean, photos: File[] }} data
 */
export async function createComplaint(data) {
  const formData = new FormData();

  formData.append('title', data.title);
  formData.append('description', data.description);
  formData.append('type', data.type);
  formData.append('animal', data.animal);
  formData.append('isAnonymous', String(Boolean(data.isAnonymous)));
  formData.append('location', JSON.stringify(data.location));

  data.photos.forEach((photo) => {
    formData.append('photos', photo, photo.name);
  });

  const response = await apiFetch('/complaints', {
    method: 'POST',
    body: formData,
  });

  return unwrapData(response);
}
