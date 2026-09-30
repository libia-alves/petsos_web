// Centro inicial do mapa: Cuiabá - MT
export const DEFAULT_CENTER = [-15.601, -56.0974];
export const DEFAULT_ZOOM = 13;
export const FOCUS_ZOOM = 16;

// A rota /complaints/map recusa áreas maiores que 0.35 grau (complaint.schema.js)
export const MAP_MAX_VIEWPORT_DELTA = 0.35;
export const MAP_QUERY_LIMIT = 150;

export const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
export const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';
