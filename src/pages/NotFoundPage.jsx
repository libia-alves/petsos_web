import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="page">
      <div className="empty-state card">
        <span aria-hidden="true">🐾</span>
        <p>Página não encontrada.</p>
        <Link to="/" className="btn">
          Voltar ao mapa
        </Link>
      </div>
    </div>
  );
}
