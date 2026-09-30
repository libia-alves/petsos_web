import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

// A API só aceita denúncias de quem confirmou o email (requireVerifiedEmail)
export default function EmailVerificationNotice() {
  const { user, refreshUser, resendVerificationEmail } = useAuth();
  const [message, setMessage] = useState('');
  const [isBusy, setIsBusy] = useState(false);

  const handleResend = async () => {
    setIsBusy(true);
    try {
      await resendVerificationEmail();
      setMessage(`Enviamos um novo link para ${user.email}.`);
    } catch {
      setMessage('Aguarde alguns minutos antes de pedir outro email.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleCheck = async () => {
    setIsBusy(true);
    try {
      const refreshed = await refreshUser();
      if (!refreshed?.emailVerified) {
        setMessage('Seu email ainda não foi confirmado. Verifique a caixa de entrada e o spam.');
      }
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="notice">
      <strong>Confirme seu email para registrar denúncias</strong>
      <p>
        Enviamos um link de confirmação para <b>{user.email}</b>. Depois de clicar no link, volte
        aqui e clique em &quot;Já confirmei&quot;.
      </p>
      <div className="notice-actions">
        <button type="button" className="btn" onClick={handleCheck} disabled={isBusy}>
          Já confirmei
        </button>
        <button type="button" className="btn btn-ghost" onClick={handleResend} disabled={isBusy}>
          Reenviar email
        </button>
      </div>
      {message && <small>{message}</small>}
    </div>
  );
}
