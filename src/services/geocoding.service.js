// Busca de endereços pelo Nominatim (OpenStreetMap), gratuito e sem chave.
// Política de uso: no máximo 1 requisição por segundo, por isso as buscas
// são disparadas com debounce e o resultado fica em cache.
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org';

const reverseCache = new Map();

function formatAddress(address, fallback) {
  if (!address) return fallback;

  const street = [address.road, address.house_number].filter(Boolean).join(', ');
  const district = address.suburb || address.neighbourhood || address.quarter;
  const city = address.city || address.town || address.village || address.municipality;

  const parts = [street, district, city].filter(Boolean);
  return parts.length > 0 ? parts.join(' - ') : fallback;
}

/**
 * Busca endereços pelo texto digitado
 * @returns {Promise<Array<{ label: string, latitude: number, longitude: number }>>}
 */
export async function searchAddress(query, signal) {
  const params = new URLSearchParams({
    q: query,
    format: 'jsonv2',
    addressdetails: '1',
    countrycodes: 'br',
    limit: '5',
    'accept-language': 'pt-BR',
  });

  const response = await fetch(`${NOMINATIM_URL}/search?${params}`, { signal });
  if (!response.ok) throw new Error('Não foi possível buscar o endereço');

  const results = await response.json();

  return results.map((result) => ({
    label: result.display_name,
    shortLabel: formatAddress(result.address, result.display_name),
    latitude: Number(result.lat),
    longitude: Number(result.lon),
  }));
}

/** Converte coordenadas em um endereço legível */
export async function getAddressFromCoords(latitude, longitude) {
  const key = `${latitude.toFixed(4)},${longitude.toFixed(4)}`;
  if (reverseCache.has(key)) return reverseCache.get(key);

  const promise = (async () => {
    const params = new URLSearchParams({
      lat: String(latitude),
      lon: String(longitude),
      format: 'jsonv2',
      addressdetails: '1',
      zoom: '18',
      'accept-language': 'pt-BR',
    });

    try {
      const response = await fetch(`${NOMINATIM_URL}/reverse?${params}`);
      if (!response.ok) throw new Error();
      const result = await response.json();
      return formatAddress(result.address, 'Localização aproximada');
    } catch {
      reverseCache.delete(key);
      return 'Localização aproximada';
    }
  })();

  reverseCache.set(key, promise);
  return promise;
}
