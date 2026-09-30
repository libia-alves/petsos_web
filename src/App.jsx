import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import AppLayout from '@/layouts/AppLayout';
import ComplaintDetailPage from '@/pages/ComplaintDetailPage';
import ComplaintsPage from '@/pages/ComplaintsPage';
import CreateComplaintPage from '@/pages/CreateComplaintPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
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
          <Route path="/recuperar-senha" element={<ForgotPasswordPage />} />

          <Route element={<AppLayout />}>
            {/* Visitantes podem ver o mapa e as denúncias públicas, como no app */}
            <Route path="/" element={<MapPage />} />
            <Route path="/denuncias" element={<ComplaintsPage />} />
            <Route path="/denuncias/:id" element={<ComplaintDetailPage />} />

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
