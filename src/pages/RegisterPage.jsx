import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '@/components/auth/AuthLayout';
import { AUTH_ERRORS } from '@/constants/error.messages.constants';
import { useAuth } from '@/context/AuthContext';
import { validateRegisterForm } from '@/validators/auth.validators';

const INITIAL_FORM = { name: '', email: '', username: '', password: '', confirmPassword: '' };

const FIELDS = [
  { name: 'name', label: 'Nome', autoComplete: 'name' },
  { name: 'email', label: 'Email', type: 'email', autoComplete: 'email' },
  { name: 'username', label: 'Username', autoComplete: 'username' },
  { name: 'password', label: 'Senha', type: 'password', autoComplete: 'new-password' },
  { name: 'confirmPassword', label: 'Confirmar senha', type: 'password', autoComplete: 'new-password' },
];

function getRegisterErrorMessage(error) {
  switch (error.code) {
    case 'auth/email-already-in-use':
      return { field: 'email', message: AUTH_ERRORS.EMAIL_ALREADY_IN_USE };
    case 'USERNAME_ALREADY_EXISTS':
      return { field: 'username', message: AUTH_ERRORS.USERNAME_ALREADY_EXISTS };
    case 'auth/weak-password':
      return { field: 'password', message: AUTH_ERRORS.WEAK_PASSWORD };
    case 'auth/invalid-email':
      return { field: 'email', message: AUTH_ERRORS.EMAIL_INVALID };
    default:
      // Erros da API (ex.: email temporário bloqueado) já vêm com mensagem em português
      return { field: null, message: error.message || AUTH_ERRORS.GENERIC_ERROR };
  }
}

export default function RegisterPage() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || '/';

  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated && !isSubmitting) {
    return <Navigate to={redirectTo} replace />;
  }

  const updateField = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setSubmitError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    const validationErrors = validateRegisterForm(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      await register(form.email.trim(), form.password, form.name.trim(), form.username.trim());
      navigate(redirectTo, { replace: true });
    } catch (error) {
      const { field, message } = getRegisterErrorMessage(error);
      if (field) setErrors((prev) => ({ ...prev, [field]: message }));
      else setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Criar conta"
      subtitle="Junte-se à rede de proteção animal"
      footer={
        <>
          Já tem conta? <Link to="/login" state={location.state}>Entrar</Link>
        </>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {FIELDS.map(({ name, label, type = 'text', autoComplete }) => (
          <div className="field" key={name}>
            <label htmlFor={name}>{label}</label>
            <input
              id={name}
              className="input"
              type={type}
              autoComplete={autoComplete}
              value={form[name]}
              onChange={updateField(name)}
            />
            {errors[name] && <span className="field-error">{errors[name]}</span>}
          </div>
        ))}

        <p className="form-hint">
          A senha precisa de 8 caracteres ou mais, com letras maiúsculas, minúsculas e números.
          Depois do cadastro enviaremos um link para confirmar seu email.
        </p>

        {submitError && <div className="alert-error">{submitError}</div>}

        <button type="submit" className="btn" disabled={isSubmitting}>
          {isSubmitting ? 'Criando conta...' : 'Criar conta'}
        </button>
      </form>
    </AuthLayout>
  );
}
