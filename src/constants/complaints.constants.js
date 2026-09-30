// Valores aceitos pela API (mesmos do app mobile)
export const COMPLAINT_TYPES = [
  { label: 'Abandono', value: 'abandono' },
  { label: 'Maus-tratos', value: 'maus-tratos fisicos' },
  { label: 'Negligência', value: 'negligencia' },
  { label: 'Animal perdido', value: 'perdido' },
  { label: 'Outro', value: 'outro' },
];

export const TYPE_CONFIG = {
  abandono: { label: 'Abandono', emoji: '🐕', color: '#0EA5A4' },
  negligencia: { label: 'Negligência', emoji: '🐈', color: '#8B5CF6' },
  'maus-tratos fisicos': { label: 'Maus-tratos', emoji: '🐕', color: '#E24B4A' },
  perdido: { label: 'Animal perdido', emoji: '🐾', color: '#3B82F6' },
  outro: { label: 'Outro', emoji: '🐾', color: '#6B7280' },
};

export const ANIMAL_TYPES = [
  { label: 'Cachorro', value: 'cachorro' },
  { label: 'Gato', value: 'gato' },
  { label: 'Pássaro', value: 'passaro' },
  { label: 'Outro', value: 'outro' },
];

export const ANIMAL_EMOJI = {
  cachorro: '🐕',
  gato: '🐈',
  passaro: '🐦',
  outro: '🐾',
};

export const STATUS_CONFIG = {
  aberto: { label: 'Aberto', color: '#E24B4A' },
  em_andamento: { label: 'Em andamento', color: '#3B82F6' },
  aguardando_validacao: { label: 'Aguardando validação', color: '#F59E0B' },
  resolvido: { label: 'Resolvido', color: '#10B981' },
  fechado: { label: 'Fechado', color: '#6B7280' },
};

export const STATUS_OPTIONS = Object.entries(STATUS_CONFIG).map(([value, { label }]) => ({
  value,
  label,
}));

// Limites do upload na API (upload.middleware.js): 5 fotos, 8 MB cada, JPG ou PNG
export const MAX_PHOTOS = 5;
export const MAX_PHOTO_BYTES = 8 * 1024 * 1024;

export const getTypeConfig = (type) => TYPE_CONFIG[type] ?? TYPE_CONFIG.outro;
export const getStatusConfig = (status) =>
  STATUS_CONFIG[status] ?? { label: status || 'Desconhecido', color: '#6B7280' };

export const EMPTY_FILTERS = { type: null, status: null, text: '' };
