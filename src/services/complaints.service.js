import { apiFetch, unwrapData } from './api';
import { MAP_QUERY_LIMIT } from '@/constants/map.constants';

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
