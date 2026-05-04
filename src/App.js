import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { EmployeeProvider } from './context/EmployeeContext';
import { MensajesProvider } from './context/MensajesContext';
import { DiaProvider } from './context/DiaContext';
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
import Arqueo from './pages/Arqueo';
import PantallaCocina from './pages/PantallaCocina';
import Mensajes from './pages/Mensajes';
import Terminos from './pages/Terminos';
import Privacidad from './pages/Privacidad';
import SobreMezo from './pages/SobreMezo';
import CentroAyuda from './pages/CentroAyuda';
import EstadoSistema from './pages/EstadoSistema';
import Equipo from './pages/Equipo';
import TrabajaConNosotros from './pages/TrabajaConNosotros';
import Blog from './pages/Blog';
import NotFound from './pages/NotFound';
import WhatsAppButton from './components/WhatsAppButton';

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
        <ThemeProvider>
        <DiaProvider>
        <MensajesProvider>
        <EmployeeProvider>
          <Routes>
            {/* Pública */}
            <Route path="/"          element={<RootRedirect />} />
            <Route path="/login"     element={<Login />} />
            <Route path="/register"  element={<Register />} />
            {/* Registro legacy compatible */}
            <Route path="/registro"  element={<Onboarding />} />
            <Route path="/onboarding" element={<Onboarding />} />
            {/* Páginas legales */}
            <Route path="/terminos"   element={<Terminos />} />
            <Route path="/privacidad" element={<Privacidad />} />
            <Route path="/sobre"      element={<SobreMezo />} />
            <Route path="/ayuda"      element={<CentroAyuda />} />
            <Route path="/estado"     element={<EstadoSistema />} />
            <Route path="/equipo"               element={<Equipo />} />
            <Route path="/trabaja-con-nosotros" element={<TrabajaConNosotros />} />
            <Route path="/blog"                 element={<Blog />} />

            {/* Protegidas */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/productos" element={<ProtectedRoute><Productos /></ProtectedRoute>} />
            <Route path="/pos"       element={<ProtectedRoute><POS /></ProtectedRoute>} />
            <Route path="/mesas"     element={<ProtectedRoute><Mesas /></ProtectedRoute>} />
            <Route path="/reportes"  element={<ProtectedRoute><Reportes /></ProtectedRoute>} />
            <Route path="/empleados"      element={<ProtectedRoute><Empleados /></ProtectedRoute>} />
            <Route path="/configuracion"  element={<ProtectedRoute><Configuracion /></ProtectedRoute>} />
            <Route path="/arqueo"         element={<ProtectedRoute><Arqueo /></ProtectedRoute>} />
            <Route path="/cocina"         element={<ProtectedRoute><PantallaCocina /></ProtectedRoute>} />
            <Route path="/mensajes"       element={<ProtectedRoute><Mensajes /></ProtectedRoute>} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>

          <WhatsAppButton />
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
        </MensajesProvider>
        </DiaProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
