import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '@/components/auth/AuthLayout';
import { AUTH_ERRORS } from '@/constants/error.messages.constants';
import { useAuth } from '@/context/AuthContext';
import { isValidEmail } from '@/validators/auth.validators';

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    if (!email.trim()) return setError(AUTH_ERRORS.EMAIL_REQUIRED);
    if (!isValidEmail(email)) return setError(AUTH_ERRORS.EMAIL_INVALID);

    setIsSubmitting(true);
    try {
      await resetPassword(email.trim());
      setSent(true);
    } catch (resetError) {
      if (resetError.code === 'auth/too-many-requests') {
        setError('Muitas tentativas. Aguarde alguns minutos.');
      } else if (resetError.code === 'auth/invalid-email') {
        setError(AUTH_ERRORS.EMAIL_INVALID);
      } else {
        // Por segurança, não revelamos se o email existe ou não
        setSent(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Recuperar senha"
      subtitle="Enviaremos um link para você criar uma nova senha"
      footer={<Link to="/login">Voltar para o login</Link>}
    >
      {sent ? (
        <div className="notice notice--success">
          <strong>Verifique seu email</strong>
          <p>
            Se existir uma conta com <b>{email.trim()}</b>, você receberá um link para redefinir a
            senha. Confira também a caixa de spam.
          </p>
        </div>
      ) : (
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="email">Email da conta</label>
            <input
              id="email"
              className="input"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setError('');
              }}
            />
            {error && <span className="field-error">{error}</span>}
          </div>

          <button type="submit" className="btn" disabled={isSubmitting}>
            {isSubmitting ? 'Enviando...' : 'Enviar link'}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}
