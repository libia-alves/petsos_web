import { AUTH_ERRORS } from '@/constants/error.messages.constants';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Mesmas regras do registerSchema do app mobile
export function validateRegisterForm({ name, email, username, password, confirmPassword }) {
  const errors = {};

  if (!name.trim()) errors.name = AUTH_ERRORS.NAME_REQUIRED;
  else if (name.trim().length < 2) errors.name = AUTH_ERRORS.NAME_MIN_LENGTH;

  if (!email.trim()) errors.email = AUTH_ERRORS.EMAIL_REQUIRED;
  else if (!EMAIL_REGEX.test(email.trim())) errors.email = AUTH_ERRORS.EMAIL_INVALID;

  if (!username.trim()) errors.username = AUTH_ERRORS.USERNAME_REQUIRED;
  else if (username.trim().length < 4) errors.username = AUTH_ERRORS.USERNAME_MIN_LENGTH;
  else if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) errors.username = AUTH_ERRORS.USERNAME_INVALID;

  if (!password) errors.password = AUTH_ERRORS.PASSWORD_REQUIRED;
  else if (password.length < 8) errors.password = AUTH_ERRORS.PASSWORD_MIN_LENGTH;
  else if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
    errors.password = AUTH_ERRORS.PASSWORD_WEAK;
  }

  if (!confirmPassword) errors.confirmPassword = AUTH_ERRORS.CONFIRM_PASSWORD_REQUIRED;
  else if (password !== confirmPassword) errors.confirmPassword = AUTH_ERRORS.PASSWORDS_DONT_MATCH;

  return errors;
}

export const isValidEmail = (email) => EMAIL_REGEX.test(email.trim());
