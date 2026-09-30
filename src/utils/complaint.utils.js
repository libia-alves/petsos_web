import { resolveUploadUrl } from '@/services/api';
import { getTimestamp } from './date.utils';

export const hasValidLocation = (complaint) =>
  Number.isFinite(Number(complaint?.location?.latitude)) &&
  Number.isFinite(Number(complaint?.location?.longitude));

export const getCoverPhoto = (complaint) =>
  resolveUploadUrl(complaint?.thumbnailPhotos?.[0] ?? complaint?.photos?.[0]);

export const sortByNewest = (complaints) =>
  [...complaints].sort((a, b) => (getTimestamp(b.createdAt) || 0) - (getTimestamp(a.createdAt) || 0));
