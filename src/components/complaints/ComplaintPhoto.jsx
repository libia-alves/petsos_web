import { useState } from 'react';
import { ANIMAL_EMOJI } from '@/constants/complaints.constants';

/**
 * Foto da denúncia com o emoji do animal como reserva, caso a imagem
 * não exista ou não carregue (ex.: API local sem a pasta /uploads de produção)
 */
export default function ComplaintPhoto({ src, animal, alt = '', loading = 'lazy' }) {
  const [failedSrc, setFailedSrc] = useState(null);

  if (!src || failedSrc === src) {
    return <span aria-hidden="true">{ANIMAL_EMOJI[animal] ?? '🐾'}</span>;
  }

  return <img src={src} alt={alt} loading={loading} onError={() => setFailedSrc(src)} />;
}
