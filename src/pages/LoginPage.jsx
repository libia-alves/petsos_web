import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '@/components/auth/AuthLayout';
import { useAuth } from '@/context/AuthContext';

const INVALID_CREDENTIAL_CODES = [
  'auth/user-not-found',
  'auth/wrong-password',
  'auth/invalid-credential',
  'auth/invalid-email',
];

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || '/';

  const [form, setForm] = useState({ identifier: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (isAuthenticated && !isSubmitting) {
    return <Navigate to={redirectTo} replace />;
  }

  const updateField = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setLoginError('');
  };

  const validateForm = () => {
    const validationErrors = {};
    if (!form.identifier.trim()) validationErrors.identifier = 'Email ou username é obrigatório';
    if (!form.password) validationErrors.password = 'Senha é obrigatória';
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting || !validateForm()) return;

    try {
      setIsSubmitting(true);
      await login(form.identifier.trim(), form.password);
      navigate(redirectTo, { replace: true });
    } catch (error) {
      if (INVALID_CREDENTIAL_CODES.includes(error.code)) {
        setLoginError('Verifique a sua senha e nome de usuário/email e tente novamente.');
      } else if (error.code === 'auth/too-many-requests') {
        setLoginError('Muitas tentativas. Aguarde alguns minutos e tente novamente.');
      } else {
        setLoginError('Não foi possível entrar. Tente novamente.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Bem-vindo de Volta"
      subtitle="Entre para continuar sua missão"
      footer={
        <>
          Ainda não tem conta? <Link to="/cadastro" state={location.state}>Cadastre-se</Link>
          <br />
          <Link to="/">Continuar sem entrar</Link>
        </>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="identifier">Email ou username</label>
          <input
            id="identifier"
            className="input"
            autoComplete="username"
            value={form.identifier}
            onChange={updateField('identifier')}
          />
          {errors.identifier && <span className="field-error">{errors.identifier}</span>}
        </div>

        <div className="field">
          <label htmlFor="password">Senha</label>
          <input
            id="password"
            className="input"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            value={form.password}
            onChange={updateField('password')}
          />
          <div className="field-row">
            <button
              type="button"
              className="link-button"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            </button>
          </div>
          {errors.password && <span className="field-error">{errors.password}</span>}
        </div>

        {loginError && <div className="alert-error">{loginError}</div>}

        <button type="submit" className="btn" disabled={isSubmitting}>
          {isSubmitting ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </AuthLayout>
  );
}
