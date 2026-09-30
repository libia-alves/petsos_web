import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import logo from '@/assets/images/icon-light.webp';

export default function AppLayout() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <Link to="/" className="app-logo">
          <img src={logo} alt="" />
          <strong>
            Pet<span>SOS</span>
          </strong>
        </Link>

        <nav className="app-nav">
          <NavLink to="/" end>
            Mapa
          </NavLink>
          <NavLink to="/denuncias" end>
            Denúncias
          </NavLink>
        </nav>

        <div className="app-header-actions">
          <Link to="/denuncias/nova" className="btn btn-sm" aria-label="Nova denúncia">
            +<span className="hide-mobile"> Denunciar</span>
          </Link>
          {isAuthenticated ? (
            <>
              <span className="app-user" title={user.email}>
                {user.displayName || user.email}
              </span>
              <button type="button" className="btn btn-ghost btn-sm" onClick={handleLogout}>
                Sair
              </button>
            </>
          ) : (
            <Link to="/login" className="btn btn-ghost btn-sm">
              Entrar
            </Link>
          )}
        </div>
      </header>

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
