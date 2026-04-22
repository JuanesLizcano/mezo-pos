import { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from '../services/firebase';
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
      // Fade out
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % SLOGANS.length);
        // Fade in
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

export default function Login() {
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [error, setError]           = useState('');
  const [loading, setLoading]       = useState(false);
  const [resetMsg, setResetMsg]     = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const navigate                    = useNavigate();
  const { slogan, visible }         = useSloganRotator(3000);

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
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(ERRORES[err.code] || 'Ocurrió un error. Intenta de nuevo.');
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
              transition: 'opacity 0.4s ease',
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
            />
            <Campo
              label="Contraseña"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={setPassword}
              required
            />

            {error && (
              <p className="text-mezo-rojo text-sm bg-mezo-rojo/10 border border-mezo-rojo/30 rounded-mezo-md px-4 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-mezo-gold hover:bg-mezo-gold-deep disabled:opacity-50 text-mezo-ink font-semibold py-3 rounded-mezo-md text-sm transition mt-2"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={handleReset}
                disabled={resetLoading}
                className="text-xs text-mezo-gold hover:text-mezo-gold-soft transition disabled:opacity-50 font-body"
              >
                {resetLoading ? 'Enviando...' : '¿Olvidaste tu contraseña?'}
              </button>
              {resetMsg && (
                <p className="text-xs text-mezo-stone mt-1.5">{resetMsg}</p>
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

function Campo({ label, type, placeholder, value, onChange, required }) {
  return (
    <div>
      <label className="block text-xs font-medium text-mezo-cream-dim uppercase tracking-widest mb-2">
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full px-4 py-2.5 bg-mezo-ink-muted border border-mezo-ink-line text-mezo-cream placeholder-mezo-stone rounded-mezo-md text-sm focus:outline-none focus:ring-2 focus:ring-mezo-gold focus:border-transparent transition font-body"
      />
    </div>
  );
}
