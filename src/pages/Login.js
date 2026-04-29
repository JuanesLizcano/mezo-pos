import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MezoWordmark from '../components/brand/MezoWordmark';
import BanderaColombiana from '../components/brand/BanderaColombiana';

const SLOGANS = [
  'Todo el negocio, una pantalla.',
  'Menos caos. Más caja.',
  'El pulso de tu negocio.',
  'Vende más. Piensa menos.',
  'Tu negocio, bajo control.',
  'Abre, cobra, cierra.',
];

function useSloganRotator(interval = 3000) {
  const [index, setIndex]     = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex(i => (i + 1) % SLOGANS.length);
        setVisible(true);
      }, 400);
    }, interval);
    return () => clearInterval(timer);
  }, [interval]);

  return { slogan: SLOGANS[index], visible };
}

const MAX_INTENTOS = 5;
const BLOQUEO_MS   = 5 * 60 * 1000;

export default function Login() {
  const { login, user, negocio, loading } = useAuth();
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [error, setError]         = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [intentosFallidos, setIntentosFallidos] = useState(0);
  const [bloqueadoHasta, setBloqueadoHasta]     = useState(null);
  const [segundosRestantes, setSegundosRestantes] = useState(0);
  const intervaloRef = useRef(null);

  const navigate            = useNavigate();
  const { slogan, visible } = useSloganRotator(3000);
  const estaBloqueado       = bloqueadoHasta && Date.now() < bloqueadoHasta;

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (!loading && user) {
      navigate(negocio ? '/dashboard' : '/onboarding', { replace: true });
    }
  }, [loading, user, negocio, navigate]);

  useEffect(() => {
    if (estaBloqueado) {
      intervaloRef.current = setInterval(() => {
        const restante = Math.ceil((bloqueadoHasta - Date.now()) / 1000);
        if (restante <= 0) {
          setSegundosRestantes(0);
          setBloqueadoHasta(null);
          setIntentosFallidos(0);
          clearInterval(intervaloRef.current);
        } else {
          setSegundosRestantes(restante);
        }
      }, 1000);
    }
    return () => clearInterval(intervaloRef.current);
  }, [estaBloqueado, bloqueadoHasta]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (estaBloqueado) return;
    setError('');
    setSubmitting(true);

    try {
      const { negocio: neg } = await login(email, password);
      navigate(neg ? '/dashboard' : '/onboarding', { replace: true });
    } catch (err) {
      const nuevos = intentosFallidos + 1;
      setIntentosFallidos(nuevos);
      if (nuevos >= MAX_INTENTOS) {
        setBloqueadoHasta(Date.now() + BLOQUEO_MS);
        setError('Demasiados intentos fallidos. Espera 5 minutos.');
      } else {
        const raw = err.message || '';
        const mensaje = raw === 'network_error'
          ? 'Error de conexión. Intenta de nuevo.'
          : raw || `Credenciales incorrectas. Intento ${nuevos} de ${MAX_INTENTOS}.`;
        setError(mensaje);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative min-h-screen bg-mezo-ink flex items-center justify-center px-4 overflow-hidden">
      <BanderaColombiana />
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <MezoWordmark height={120} color="#C8903F" />
          <p style={{
            fontFamily: '"DM Sans", system-ui, sans-serif',
            fontStyle: 'italic', fontSize: 15, color: '#7A6A58',
            marginTop: 10, height: 22,
            opacity: visible ? 1 : 0, transition: 'opacity 0.1s ease',
          }}>
            {slogan}
          </p>
        </div>

        <div className="bg-mezo-ink-raised border border-mezo-ink-line rounded-mezo-xl p-8 shadow-mezo-lg">
          <h2 className="text-mezo-cream font-body font-semibold text-lg mb-6">Iniciar sesión</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Campo label="Correo electrónico" type="email" placeholder="hola@minegocio.com"
              value={email} onChange={setEmail} disabled={estaBloqueado} />
            <Campo label="Contraseña" type="password" placeholder="••••••••"
              value={password} onChange={setPassword} disabled={estaBloqueado} />

            {intentosFallidos > 0 && intentosFallidos < MAX_INTENTOS && (
              <p className="text-mezo-stone text-xs font-body">
                Intento {intentosFallidos} de {MAX_INTENTOS}. Tras {MAX_INTENTOS} se bloqueará 5 minutos.
              </p>
            )}

            {error && (
              <p className="text-mezo-rojo text-sm bg-mezo-rojo/10 border border-mezo-rojo/30 rounded-mezo-md px-4 py-2 font-body">
                {error}
              </p>
            )}

            {estaBloqueado && (
              <div className="bg-mezo-rojo/10 border border-mezo-rojo/30 rounded-mezo-md px-4 py-3 text-center">
                <p className="text-mezo-rojo text-sm font-semibold font-body">🔒 Formulario bloqueado</p>
                <p className="text-mezo-stone text-xs font-body mt-1">
                  Disponible en{' '}
                  <span className="font-mono font-bold text-mezo-cream">
                    {Math.floor(segundosRestantes / 60)}:{String(segundosRestantes % 60).padStart(2, '0')}
                  </span>
                </p>
              </div>
            )}

            <button type="submit" disabled={submitting || estaBloqueado}
              className="w-full bg-mezo-gold hover:bg-mezo-gold-deep disabled:opacity-50 text-mezo-ink font-semibold py-3 rounded-mezo-md text-sm transition mt-2 font-body">
              {submitting ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-mezo-stone mt-6 font-body">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="text-mezo-gold hover:text-mezo-gold-soft transition font-medium">
            Regístrate gratis
          </Link>
        </p>

        {/* Hint modo demo */}
        {process.env.REACT_APP_USE_MOCK === 'true' && (
          <p className="text-center text-xs mt-4 font-body" style={{ color: '#4A3F35' }}>
            Modo demo — usa cualquier email válido y contraseña de 6+ caracteres
          </p>
        )}
      </div>
    </div>
  );
}

function Campo({ label, type, placeholder, value, onChange, disabled }) {
  return (
    <div>
      <label className="block text-xs font-medium text-mezo-cream-dim uppercase tracking-widest mb-2 font-body">
        {label}
      </label>
      <input type={type} placeholder={placeholder} value={value}
        onChange={e => onChange(e.target.value)} disabled={disabled}
        className="w-full px-4 py-2.5 bg-mezo-ink-muted border border-mezo-ink-line text-mezo-cream placeholder-mezo-stone rounded-mezo-md text-sm focus:outline-none focus:ring-2 focus:ring-mezo-gold focus:border-transparent transition font-body disabled:opacity-50"
      />
    </div>
  );
}
