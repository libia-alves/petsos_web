import { Link } from 'react-router-dom';
import logo from '@/assets/images/icon-light.webp';
import catPeeking from '@/assets/images/cat-peeking.webp';

// Moldura comum das telas de login, cadastro e recuperação de senha
export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="auth-page">
      <div className="auth-card card">
        <img src={catPeeking} alt="" className="auth-peeking" />

        <div className="auth-hero">
          <Link to="/">
            <img src={logo} alt="PetSOS - voltar ao início" />
          </Link>
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>

        {children}

        {footer && <p className="auth-footer">{footer}</p>}
      </div>
    </div>
  );
}
