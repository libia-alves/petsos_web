import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { auth } from '@/config/firebase';
import { API_URL } from './api';

/**
 * Verifica se username está disponível
 * @param {string} username - Username para verificar
 * @returns {Promise<boolean>} True se disponível
 */
export async function checkUsername(username) {
  const response = await fetch(`${API_URL}/auth/check-username/${encodeURIComponent(username)}`);
  const data = await response.json();
  return data.data.available;
}

export async function resolveUsername(username) {
  const response = await fetch(`${API_URL}/auth/resolve-username/${encodeURIComponent(username)}`);
  const data = await response.json();
  return data?.data?.email;
}

/**
 * Faz login com email ou username e senha
 * @param {string} identifier - Email ou username
 * @param {string} password - Senha do usuário
 */
export async function login(identifier, password) {
  let email = identifier;

  if (!identifier.includes('@')) {
    const resolved = await resolveUsername(identifier);
    if (!resolved) {
      const error = new Error('Usuário não encontrado');
      error.code = 'auth/user-not-found';
      throw error;
    }
    email = resolved;
  }

  return signInWithEmailAndPassword(auth, email, password);
}

/**
 * Registra novo usuário no Firebase e completa o perfil no backend
 */
export async function register(email, password, name, username) {
  const available = await checkUsername(username);
  if (!available) {
    const error = new Error('Este username já está em uso');
    error.code = 'USERNAME_ALREADY_EXISTS';
    throw error;
  }

  const userCredential = await createUserWithEmailAndPassword(auth, email, password);

  try {
    await updateProfile(userCredential.user, { displayName: name });

    const idToken = await userCredential.user.getIdToken();

    const response = await fetch(`${API_URL}/auth/complete-profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ name, username }),
    });

    const data = await response.json();

    if (!response.ok) {
      const error = new Error(data.message || 'Erro ao completar perfil');
      error.code = data.errorCode;
      throw error;
    }

    await sendEmailVerification(userCredential.user);

    return userCredential;
  } catch (error) {
    await userCredential.user.delete();
    throw error;
  }
}

export function logout() {
  return signOut(auth);
}

/** Envia o email de redefinição de senha do Firebase */
export function resetPassword(email) {
  return sendPasswordResetEmail(auth, email);
}

export function resendVerificationEmail() {
  return sendEmailVerification(auth.currentUser);
}

/**
 * Recarrega o usuário e força um token novo: a API lê o email_verified
 * de dentro do token, então sem o refresh ela continuaria bloqueando.
 */
export async function reloadCurrentUser() {
  if (!auth.currentUser) return null;
  await auth.currentUser.reload();
  await auth.currentUser.getIdToken(true);
  return auth.currentUser;
}
