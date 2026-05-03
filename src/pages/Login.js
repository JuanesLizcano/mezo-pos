import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import MezoWordmark from '../components/brand/MezoWordmark';
import AuroraGlow from '../components/effects/AuroraGlow';

const SLOGANS = [
  'Todo el negocio, una pantalla.',
  'Menos caos. Más caja.',
  'En pesos colombianos, sin letra chica.',
  'Vende más. Piensa menos.',
  'La caja que no te da sustos.',
  'Abre, cobra, cierra. Sin estrés.',
];

const easeMezo = [0.22, 1, 0.36, 1];

function useSloganRotator(interval = 3000) {
  const [index,   setIndex]   = useState(0);
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

// Grid de líneas verticales sutiles como textura de fondo
const GRID_BG = {
  backgroundImage: `repeating-linear-gradient(
    90deg,
    rgba(200,144,63,0.03) 0px,
    rgba(200,144,63,0.03) 1px,
    transparent 1px,
    transparent 80px
  )`,
};

// Spinner inline para el estado loading del botón
function Spinner() {
  return (
    <svg
      className="animate-spin inline-block mr-2"
      width={14} height={14} viewBox="0 0 14 14" fill="none"
    >
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeOpacity="0.3" strokeWidth="2" />
      <path d="M7 1.5A5.5 5.5 0 0112.5 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function Login() {
  const { login, user, negocio, loading } = useAuth();
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [error,     setError]     = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [intentosFallidos,   setIntentosFallidos]   = useState(0);
  const [bloqueadoHasta,     setBloqueadoHasta]     = useState(null);
  const [segundosRestantes,  setSegundosRestantes]  = useState(0);
  const intervaloRef = useRef(null);

  const navigate           = useNavigate();
  const { slogan, visible } = useSloganRotator(3000);
  const estaBloqueado      = bloqueadoHasta && Date.now() < bloqueadoHasta;
  const prefersReduced     = useReducedMotion();

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
        setError('Demasiados intentos. Espera 5 minutos antes de volver a intentar.');
      } else {
        const raw     = err.message || '';
        const mensaje = raw === 'network_error'
          ? 'Sin conexión. Revisa el internet y vuelve a intentar.'
          : raw || `Correo o contraseña incorrectos — intento ${nuevos} de ${MAX_INTENTOS}.`;
        setError(mensaje);
      }
    } finally {
      setSubmitting(false);
    }
  }

  // Variantes de animación — se simplifica si prefers-reduced-motion
  const dur = prefersReduced ? 0 : 0.6;
  const mkVariant = (y = 0, delay = 0) => ({
    initial:  { opacity: 0, y: prefersReduced ? 0 : y },
    animate:  { opacity: 1, y: 0, transition: { duration: dur, ease: easeMezo, delay } },
  });

  return (
    <div
      className="relative min-h-screen bg-mezo-ink flex items-center justify-center px-4 overflow-hidden"
      style={GRID_BG}
    >
      {/* Resplandores de identidad */}
      <AuroraGlow variant="top"    intensity={0.14} />
      <AuroraGlow variant="bottom" intensity={0.07} />

      <div className="relative z-10 w-full max-w-md">

        {/* Logo */}
        <motion.div
          className="text-center mb-10"
          {...mkVariant(0, 0)}
        >
          <MezoWordmark height={120} color="#C8903F" />
          <p style={{
            fontFamily: '"DM Sans", system-ui, sans-serif',
            fontStyle: 'italic', fontSize: 15, color: '#7A6A58',
            marginTop: 10, height: 22,
            opacity: visible ? 1 : 0, transition: 'opacity 0.3s ease',
          }}>
            {slogan}
          </p>
        </motion.div>

        {/* Card */}
        <motion.div
          className="bg-mezo-ink-raised border border-mezo-ink-line rounded-mezo-xl p-8 shadow-mezo-lg relative"
          {...mkVariant(24, 0.3)}
        >
          <h2 className="text-mezo-cream font-body font-semibold text-lg mb-6">
            Iniciar sesión
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Campo
              label="Correo electrónico" type="email"
              placeholder="hola@minegocio.com"
              value={email} onChange={setEmail}
              disabled={estaBloqueado}
            />
            <Campo
              label="Contraseña" type="password"
              placeholder="••••••••"
              value={password} onChange={setPassword}
              disabled={estaBloqueado}
            />

            {intentosFallidos > 0 && intentosFallidos < MAX_INTENTOS && (
              <p className="text-mezo-stone text-xs font-body">
                Intento {intentosFallidos} de {MAX_INTENTOS}. Tras {MAX_INTENTOS} se bloqueará 5 minutos.
              </p>
            )}

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: easeMezo }}
                className="text-mezo-rojo text-sm bg-mezo-rojo/10 border border-mezo-rojo/30 rounded-mezo-md px-4 py-2 font-body"
              >
                {error}
              </motion.p>
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

            <BotonSubmit submitting={submitting} disabled={estaBloqueado}>
              {submitting ? <><Spinner />Entrando…</> : 'Entrar'}
            </BotonSubmit>
          </form>

          {/* Detalle decorativo — líneas curvas en esquina inferior derecha */}
          <svg
            aria-hidden="true"
            width={72} height={72}
            viewBox="0 0 72 72"
            fill="none"
            className="absolute bottom-5 right-5 pointer-events-none"
            style={{ opacity: 0.13 }}
          >
            <path d="M8 64 Q36 36 64 8"  stroke="#C8903F" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M20 64 Q48 36 64 20" stroke="#C8903F" strokeWidth="0.8" strokeLinecap="round" />
            <path d="M36 64 Q56 44 64 36" stroke="#C8903F" strokeWidth="0.5" strokeLinecap="round" />
          </svg>
        </motion.div>

        {/* Link registro */}
        <motion.p
          className="text-center text-sm text-mezo-stone mt-6 font-body"
          {...mkVariant(0, 0.5)}
        >
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="text-mezo-gold hover:text-mezo-gold-soft transition font-medium">
            Regístrate gratis
          </Link>
        </motion.p>

        {process.env.REACT_APP_USE_MOCK === 'true' && (
          <p className="text-center text-xs mt-4 font-body" style={{ color: '#4A3F35' }}>
            Modo demo — usa cualquier email válido y contraseña de 6+ caracteres
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Botón submit con hover/active ───────────────────────────────────────────

function BotonSubmit({ submitting, disabled, children }) {
  return (
    <motion.button
      type="submit"
      disabled={submitting || disabled}
      whileHover={!disabled && !submitting ? { y: -1, boxShadow: '0 6px 20px rgba(200,144,63,0.28)' } : {}}
      whileTap={!disabled && !submitting  ? { scale: 0.98 } : {}}
      transition={{ duration: 0.18, ease: easeMezo }}
      className="w-full bg-mezo-gold disabled:opacity-50 text-mezo-ink font-semibold py-3 rounded-mezo-md text-sm mt-2 font-body"
      style={{ transition: 'background 0.2s ease' }}
      onMouseEnter={e => { if (!disabled && !submitting) e.currentTarget.style.background = '#E4B878'; }}
      onMouseLeave={e => { e.currentTarget.style.background = '#C8903F'; }}
    >
      {children}
    </motion.button>
  );
}

// ─── Input premium ────────────────────────────────────────────────────────────

function Campo({ label, type, placeholder, value, onChange, disabled }) {
  const [focused, setFocused] = useState(false);

  return (
    <div>
      <label className="block text-xs font-medium text-mezo-cream-dim uppercase tracking-widest mb-2 font-body">
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full px-4 py-2.5 bg-mezo-ink-muted text-mezo-cream placeholder-mezo-stone rounded-mezo-md text-sm focus:outline-none font-body disabled:opacity-50 transition-all duration-200"
        style={{
          border: `1px solid ${focused ? '#C8903F' : 'rgba(244,236,216,0.10)'}`,
          boxShadow: focused ? '0 0 0 3px rgba(200,144,63,0.15)' : 'none',
        }}
      />
    </div>
  );
}
