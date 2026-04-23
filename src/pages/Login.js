import { useState, useEffect, useRef } from 'react';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db } from '../services/firebase';
import MezoWordmark from '../components/brand/MezoWordmark';

const SLOGANS = [
  'Vende más. Piensa menos.',
  'Todo el negocio, una pantalla.',
  'Menos caos. Más caja.',
  'El pulso de tu negocio.',
  'Todo en orden, todo en caja.',
  'Tu negocio, bajo control.',
];

function useSloganRotator(interval = 3000) {
  const [index, setIndex]     = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % SLOGANS.length);
        setVisible(true);
      }, 400);
    }, interval);

    return () => clearInterval(timer);
  }, [interval]);

  return { slogan: SLOGANS[index], visible };
}

const ERRORES = {
  'auth/invalid-credential':   'Correo o contraseña incorrectos.',
  'auth/user-not-found':       'No existe una cuenta con ese correo.',
  'auth/wrong-password':       'Contraseña incorrecta.',
  'auth/too-many-requests':    'Demasiados intentos. Espera un momento.',
};

const MAX_INTENTOS     = 5;
const BLOQUEO_MS       = 5 * 60 * 1000; // 5 minutos

export default function Login() {
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [error, setError]           = useState('');
  const [loading, setLoading]       = useState(false);
  const [resetMsg, setResetMsg]     = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  // Rate limiting
  const [intentosFallidos, setIntentosFallidos] = useState(0);
  const [bloqueadoHasta, setBloqueadoHasta]     = useState(null);
  const [segundosRestantes, setSegundosRestantes] = useState(0);
  const intervaloRef = useRef(null);

  const navigate                    = useNavigate();
  const { slogan, visible }         = useSloganRotator(3000);

  const estaBloqueado = bloqueadoHasta && Date.now() < bloqueadoHasta;

  // Countdown visual del bloqueo
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

  async function handleReset() {
    if (!email) { setResetMsg('Ingresa tu correo primero.'); return; }
    setResetLoading(true);
    setResetMsg('');
    try {
      await sendPasswordResetEmail(auth, email);
      setResetMsg('Correo enviado. Revisa tu bandeja.');
    } catch {
      setResetMsg('No se pudo enviar. Verifica el correo.');
    } finally {
      setResetLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (estaBloqueado) return;
    setError('');
    setLoading(true);

    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      setIntentosFallidos(0);
      setBloqueadoHasta(null);

      // Guardar log de acceso en Firestore
      try {
        await addDoc(collection(db, 'negocios', cred.user.uid, 'accesos'), {
          uid:       cred.user.uid,
          email:     cred.user.email,
          timestamp: serverTimestamp(),
          userAgent: navigator.userAgent,
        });
      } catch {
        // El log de acceso no es crítico, no bloquear el login si falla
      }

      navigate('/dashboard');
    } catch (err) {
      const nuevosIntentos = intentosFallidos + 1;
      setIntentosFallidos(nuevosIntentos);

      if (nuevosIntentos >= MAX_INTENTOS) {
        setBloqueadoHasta(Date.now() + BLOQUEO_MS);
        setError(`Demasiados intentos fallidos. Espera 5 minutos.`);
      } else {
        setError(
          ERRORES[err.code] ||
          `Ocurrió un error. Intento ${nuevosIntentos} de ${MAX_INTENTOS}.`
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-mezo-ink flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <MezoWordmark height={120} color="#C8903F" />
          <p
            style={{
              fontFamily: '"DM Sans", system-ui, sans-serif',
              fontStyle: 'italic',
              fontSize: 15,
              color: '#7A6A58',
              marginTop: 10,
              height: 22,
              opacity: visible ? 1 : 0,
              transition: 'opacity 0.1s ease',
            }}
          >
            {slogan}
          </p>
        </div>

        <div className="bg-mezo-ink-raised border border-mezo-ink-line rounded-mezo-xl p-8 shadow-mezo-lg">
          <h2 className="text-mezo-cream font-body font-semibold text-lg mb-6">
            Iniciar sesión
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Campo
              label="Correo electrónico"
              type="email"
              placeholder="hola@minegocio.com"
              value={email}
              onChange={setEmail}
              required
              disabled={estaBloqueado}
            />
            <Campo
              label="Contraseña"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={setPassword}
              required
              disabled={estaBloqueado}
            />

            {/* Indicador de intentos */}
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

            {/* Bloqueo activo */}
            {estaBloqueado && (
              <div className="bg-mezo-rojo/10 border border-mezo-rojo/30 rounded-mezo-md px-4 py-3 text-center">
                <p className="text-mezo-rojo text-sm font-semibold font-body">
                  🔒 Formulario bloqueado
                </p>
                <p className="text-mezo-stone text-xs font-body mt-1">
                  Disponible en{' '}
                  <span className="font-mono font-bold text-mezo-cream">
                    {Math.floor(segundosRestantes / 60)}:{String(segundosRestantes % 60).padStart(2, '0')}
                  </span>
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || estaBloqueado}
              className="w-full bg-mezo-gold hover:bg-mezo-gold-deep disabled:opacity-50 text-mezo-ink font-semibold py-3 rounded-mezo-md text-sm transition mt-2 font-body"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={handleReset}
                disabled={resetLoading || estaBloqueado}
                className="text-xs text-mezo-gold hover:text-mezo-gold-soft transition disabled:opacity-50 font-body"
              >
                {resetLoading ? 'Enviando...' : '¿Olvidaste tu contraseña?'}
              </button>
              {resetMsg && (
                <p className="text-xs text-mezo-stone mt-1.5 font-body">{resetMsg}</p>
              )}
            </div>
          </form>
        </div>

        <p className="text-center text-sm text-mezo-stone mt-6 font-body">
          ¿No tienes cuenta?{' '}
          <Link to="/registro" className="text-mezo-gold hover:text-mezo-gold-soft transition font-medium">
            Regístrate gratis
          </Link>
        </p>
      </div>
    </div>
  );
}

function Campo({ label, type, placeholder, value, onChange, required, disabled }) {
  return (
    <div>
      <label className="block text-xs font-medium text-mezo-cream-dim uppercase tracking-widest mb-2 font-body">
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        disabled={disabled}
        className="w-full px-4 py-2.5 bg-mezo-ink-muted border border-mezo-ink-line text-mezo-cream placeholder-mezo-stone rounded-mezo-md text-sm focus:outline-none focus:ring-2 focus:ring-mezo-gold focus:border-transparent transition font-body disabled:opacity-50"
      />
    </div>
  );
}
