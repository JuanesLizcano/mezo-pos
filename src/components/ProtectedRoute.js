import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, negocio, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mezo-ink">
        <div className="w-8 h-8 border-4 border-mezo-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  // Sesión sin negocio → completar onboarding
  if (!negocio) return <Navigate to="/registro" replace />;

  return children;
}
