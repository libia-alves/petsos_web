import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

/**
 * Move o mapa quando `focus` muda. Fica dentro do MapContainer porque
 * só lá dentro dá para acessar a instância do mapa.
 * @param {{ focus: { latitude: number, longitude: number, zoom?: number } | null }} props
 */
export default function MapFocus({ focus }) {
  const map = useMap();

  useEffect(() => {
    if (!focus) return;
    map.flyTo([focus.latitude, focus.longitude], focus.zoom ?? map.getZoom(), {
      duration: 0.8,
    });
  }, [focus, map]);

  return null;
}
