import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import AppLayout from '@/layouts/AppLayout';
import CreateComplaintPage from '@/pages/CreateComplaintPage';
import LoginPage from '@/pages/LoginPage';
import MapPage from '@/pages/MapPage';
import NotFoundPage from '@/pages/NotFoundPage';
import RegisterPage from '@/pages/RegisterPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/cadastro" element={<RegisterPage />} />

          <Route element={<AppLayout />}>
            {/* Visitantes podem ver o mapa, como no app */}
            <Route path="/" element={<MapPage />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/denuncias/nova" element={<CreateComplaintPage />} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
