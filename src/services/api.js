import { signOut } from 'firebase/auth';
import { auth } from '@/config/firebase';

export const API_URL = import.meta.env.VITE_API_URL;
export const UPLOAD_URL = import.meta.env.VITE_UPLOAD_URL;

export class ApiError extends Error {
  constructor(message, status, errorCode) {
    super(message);
    this.status = status;
    this.code = errorCode;
  }
}

export async function apiFetch(endpoint, options = {}) {
  const headers = { ...options.headers };

  if (auth.currentUser) {
    const token = await auth.currentUser.getIdToken();
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const body = await response.json().catch(() => null);

  if (response.status === 401 && auth.currentUser) {
    // O AuthContext percebe o signOut e as rotas protegidas mandam para o login
    await signOut(auth);
    throw new ApiError('Sessão expirada. Faça login novamente.', 401, 'UNAUTHORIZED');
  }

  if (!response.ok) {
    throw new ApiError(
      body?.message || `Erro ${response.status}: ${response.statusText}`,
      response.status,
      body?.errorCode,
    );
  }

  return body;
}

// A API responde no formato { success, data }
export const unwrapData = (response) => response?.data ?? response;

// Fotos salvas na API vêm como caminho relativo (/uploads/...)
export function resolveUploadUrl(path) {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return `${UPLOAD_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}
