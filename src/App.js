import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { EmployeeProvider } from './context/EmployeeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Productos from './pages/Productos';
import POS from './pages/POS';
import Mesas from './pages/Mesas';
import Reportes from './pages/Reportes';
import Empleados from './pages/Empleados';
import Configuracion from './pages/Configuracion';
import PantallaCocina from './pages/PantallaCocina';

// Redirige / al dashboard si está logueado, o a la Landing si no
function RootRedirect() {
  const { user, negocio, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mezo-ink">
        <div className="w-8 h-8 border-4 border-mezo-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (user) return <Navigate to={negocio ? '/dashboard' : '/onboarding'} replace />;
  return <Landing />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <EmployeeProvider>
          <Routes>
            {/* Pública */}
            <Route path="/"          element={<RootRedirect />} />
            <Route path="/login"     element={<Login />} />
            <Route path="/register"  element={<Register />} />
            {/* Registro legacy compatible */}
            <Route path="/registro"  element={<Onboarding />} />
            <Route path="/onboarding" element={<Onboarding />} />

            {/* Protegidas */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/productos" element={<ProtectedRoute><Productos /></ProtectedRoute>} />
            <Route path="/pos"       element={<ProtectedRoute><POS /></ProtectedRoute>} />
            <Route path="/mesas"     element={<ProtectedRoute><Mesas /></ProtectedRoute>} />
            <Route path="/reportes"  element={<ProtectedRoute><Reportes /></ProtectedRoute>} />
            <Route path="/empleados"      element={<ProtectedRoute><Empleados /></ProtectedRoute>} />
            <Route path="/configuracion"  element={<ProtectedRoute><Configuracion /></ProtectedRoute>} />
            <Route path="/cocina"         element={<ProtectedRoute><PantallaCocina /></ProtectedRoute>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                background:   '#1A1713',
                color:        '#D9CEB5',
                border:       '1px solid #2A2520',
                borderRadius: 10,
                fontSize:     14,
                fontFamily:   '"DM Sans", system-ui, sans-serif',
                boxShadow:    '0 4px 20px rgba(0,0,0,0.5)',
              },
              success: { iconTheme: { primary: '#3DAA68', secondary: '#0D0B09' } },
              error:   { iconTheme: { primary: '#C8573F', secondary: '#0D0B09' } },
              loading: { iconTheme: { primary: '#C8903F', secondary: '#0D0B09' } },
            }}
          />
        </EmployeeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
