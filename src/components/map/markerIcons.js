import L from 'leaflet';
import { ANIMAL_EMOJI, getStatusConfig } from '@/constants/complaints.constants';

// Ícones em HTML (divIcon) para não depender das imagens padrão do Leaflet,
// que quebram com o Vite. A cor da borda é o status da denúncia.
const iconCache = new Map();

export function getComplaintIcon(complaint, selected = false) {
  const key = `${complaint.status}|${complaint.animal}|${selected}`;
  if (iconCache.has(key)) return iconCache.get(key);

  const { color } = getStatusConfig(complaint.status);
  const emoji = ANIMAL_EMOJI[complaint.animal] ?? '🐾';

  const icon = L.divIcon({
    className: '',
    html: `<div class="map-pin${selected ? ' is-selected' : ''}" style="--pin-color:${color}"><span>${emoji}</span></div>`,
    iconSize: [40, 48],
    iconAnchor: [20, 46],
    popupAnchor: [0, -42],
  });

  iconCache.set(key, icon);
  return icon;
}

export const pickerIcon = L.divIcon({
  className: '',
  html: '<div class="map-pin map-pin--picker" style="--pin-color:#FF6B35"><span>📍</span></div>',
  iconSize: [40, 48],
  iconAnchor: [20, 46],
});

export const userLocationIcon = L.divIcon({
  className: '',
  html: '<div class="map-user-dot"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});
