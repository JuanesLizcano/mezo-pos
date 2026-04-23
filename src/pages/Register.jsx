import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register as apiRegister, verifyOtp, resendOtp } from '../services';
import { useAuth } from '../context/AuthContext';
import MezoWordmark from '../components/brand/MezoWordmark';
import toast from 'react-hot-toast';

const OTP_DURACION_SEG  = 5 * 60; // 5 minutos
const REENVIO_ESPERA_SEG = 60;

// ─── Paso 1: datos de la cuenta ──────────────────────────────────────────────

function StepCuenta({ onSuccess }) {
  const [email,    setEmail]    = useState('');
  const [pass,     setPass]     = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (pass.length < 6) { setError('La contraseña debe tener al menos 6 caracteres.'); return; }
    if (pass !== confirm) { setError('Las contraseñas no coinciden.'); return; }
    setLoading(true);
    try {
      await apiRegister(email, pass);
      toast.success('Código enviado a ' + email);
      onSuccess(email);
    } catch (err) {
      setError(err.message || 'Error al crear la cuenta.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h2 className="text-mezo-cream font-body font-semibold text-lg mb-1">Crear cuenta</h2>
        <p className="text-mezo-stone text-sm font-body">30 días gratis · Sin tarjeta · Cancela cuando quieras</p>
      </div>

      <Campo label="Correo electrónico" type="email" placeholder="hola@minegocio.com"
        value={email} onChange={setEmail} required />
      <Campo label="Contraseña" type="password" placeholder="Mínimo 6 caracteres"
        value={pass} onChange={setPass} required />
      <Campo label="Confirmar contraseña" type="password" placeholder="Repite tu contraseña"
        value={confirm} onChange={setConfirm} required />

      {error && (
        <p className="text-mezo-rojo text-sm bg-mezo-rojo/10 border border-mezo-rojo/30 rounded-mezo-md px-4 py-2 font-body">
          {error}
        </p>
      )}

      <button type="submit" disabled={loading}
        className="w-full bg-mezo-gold hover:bg-mezo-gold-deep disabled:opacity-50 text-mezo-ink font-semibold py-3 rounded-mezo-md text-sm transition font-body">
        {loading ? 'Creando cuenta...' : 'Crear cuenta →'}
      </button>
    </form>
  );
}

// ─── Paso 2: verificación OTP ────────────────────────────────────────────────

function StepOtp({ email, onVerified }) {
  const [codigo,    setCodigo]    = useState(['', '', '', '', '', '']);
  const [error,     setError]     = useState('');
  const [loading,   setLoading]   = useState(false);
  const [segundos,  setSegundos]  = useState(OTP_DURACION_SEG);
  const [reenvioSeg, setReenvioSeg] = useState(REENVIO_ESPERA_SEG);
  const inputsRef = useRef([]);

  // Cuenta regresiva del OTP
  useEffect(() => {
    if (segundos <= 0) return;
    const t = setInterval(() => setSegundos(s => s - 1), 1000);
    return () => clearInterval(t);
  }, [segundos]);

  // Cuenta regresiva del botón "Reenviar"
  useEffect(() => {
    if (reenvioSeg <= 0) return;
    const t = setInterval(() => setReenvioSeg(s => s - 1), 1000);
    return () => clearInterval(t);
  }, [reenvioSeg]);

  const fmtTiempo = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  // Manejo de cada input individual
  const handleChange = useCallback((idx, val) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    setCodigo(prev => {
      const next = [...prev];
      next[idx] = digit;
      return next;
    });
    if (digit && idx < 5) {
      inputsRef.current[idx + 1]?.focus();
    }
  }, []);

  // Pegar código completo distribuye en los 6 inputs
  const handlePaste = useCallback((e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const arr = pasted.split('').concat(Array(6).fill('')).slice(0, 6);
    setCodigo(arr);
    inputsRef.current[Math.min(pasted.length, 5)]?.focus();
  }, []);

  const handleKeyDown = useCallback((idx, e) => {
    if (e.key === 'Backspace' && !codigo[idx] && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    }
  }, [codigo]);

  async function handleVerificar(e) {
    e.preventDefault();
    const codeStr = codigo.join('');
    if (codeStr.length < 6) { setError('Ingresa los 6 dígitos.'); return; }
    setError('');
    setLoading(true);
    try {
      const { token } = await verifyOtp(email, codeStr);
      onVerified(token);
    } catch (err) {
      setError(err.message || 'Código incorrecto.');
      setCodigo(['', '', '', '', '', '']);
      inputsRef.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  }

  async function handleReenviar() {
    if (reenvioSeg > 0) return;
    try {
      await resendOtp(email);
      setSegundos(OTP_DURACION_SEG);
      setReenvioSeg(REENVIO_ESPERA_SEG);
      toast.success('Código reenviado.');
    } catch (err) {
      toast.error(err.message || 'No se pudo reenviar el código.');
    }
  }

  return (
    <form onSubmit={handleVerificar} className="space-y-5">
      <div>
        <h2 className="text-mezo-cream font-body font-semibold text-lg mb-1">Verifica tu correo</h2>
        <p className="text-mezo-stone text-sm font-body">
          Te enviamos un código a{' '}
          <span className="text-mezo-cream font-medium">{email}</span>
        </p>
      </div>

      {/* Inputs OTP */}
      <div className="flex gap-2 justify-center" onPaste={handlePaste}>
        {codigo.map((d, i) => (
          <input
            key={i}
            ref={el => (inputsRef.current[i] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={d}
            onChange={e => handleChange(i, e.target.value)}
            onKeyDown={e => handleKeyDown(i, e)}
            className="w-11 h-14 text-center text-2xl font-mono font-bold text-mezo-cream bg-mezo-ink-muted border border-mezo-ink-line rounded-mezo-lg focus:outline-none focus:ring-2 focus:ring-mezo-gold focus:border-transparent transition"
            style={{ letterSpacing: 0 }}
          />
        ))}
      </div>

      {/* Contador */}
      {segundos > 0 ? (
        <p className="text-center text-mezo-stone text-sm font-body">
          Expira en{' '}
          <span className="font-mono font-semibold text-mezo-cream">{fmtTiempo(segundos)}</span>
        </p>
      ) : (
        <p className="text-center text-mezo-rojo text-sm font-body">El código expiró.</p>
      )}

      {error && (
        <p className="text-mezo-rojo text-sm bg-mezo-rojo/10 border border-mezo-rojo/30 rounded-mezo-md px-4 py-2 font-body text-center">
          {error}
        </p>
      )}

      <button type="submit" disabled={loading || codigo.join('').length < 6}
        className="w-full bg-mezo-gold hover:bg-mezo-gold-deep disabled:opacity-50 text-mezo-ink font-semibold py-3 rounded-mezo-md text-sm transition font-body">
        {loading ? 'Verificando...' : 'Verificar código'}
      </button>

      <button type="button" onClick={handleReenviar} disabled={reenvioSeg > 0}
        className="w-full text-sm text-mezo-gold hover:text-mezo-gold-soft disabled:text-mezo-stone transition font-body text-center">
        {reenvioSeg > 0
          ? `Reenviar código en ${fmtTiempo(reenvioSeg)}`
          : 'Reenviar código'}
      </button>

      {process.env.REACT_APP_USE_MOCK === 'true' && (
        <p className="text-center text-xs text-mezo-stone/50 font-body">Demo: código 123456</p>
      )}
    </form>
  );
}

// ─── Componente principal ────────────────────────────────────────────────────

export default function Register() {
  const { setSession, user, loading } = useAuth();
  const navigate  = useNavigate();
  const [step, setStep]   = useState(1); // 1 = crear cuenta, 2 = OTP
  const [email, setEmail] = useState('');

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (!loading && user) navigate('/onboarding', { replace: true });
  }, [loading, user, navigate]);

  async function handleOtpVerified(token) {
    await setSession(token);
    navigate('/onboarding', { replace: true });
  }

  return (
    <div className="min-h-screen bg-mezo-ink flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <MezoWordmark height={100} color="#C8903F" />
        </div>

        {/* Indicador de paso */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2].map(n => (
            <div key={n} className="flex items-center gap-2 flex-1">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-body transition"
                style={{
                  background: step >= n ? '#C8903F' : '#2A2520',
                  color:      step >= n ? '#080706' : '#7A6A58',
                }}
              >
                {n}
              </div>
              <span className="text-xs font-body" style={{ color: step >= n ? '#E4B878' : '#7A6A58' }}>
                {n === 1 ? 'Cuenta' : 'Verificación'}
              </span>
              {n < 2 && <div className="flex-1 h-px" style={{ background: step > n ? '#C8903F' : '#2A2520' }} />}
            </div>
          ))}
        </div>

        <div className="bg-mezo-ink-raised border border-mezo-ink-line rounded-mezo-xl p-8 shadow-mezo-lg">
          {step === 1 ? (
            <StepCuenta onSuccess={e => { setEmail(e); setStep(2); }} />
          ) : (
            <StepOtp email={email} onVerified={handleOtpVerified} />
          )}
        </div>

        <p className="text-center text-sm text-mezo-stone mt-6 font-body">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-mezo-gold hover:text-mezo-gold-soft transition font-medium">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}

function Campo({ label, type, placeholder, value, onChange, required }) {
  return (
    <div>
      <label className="block text-xs font-medium text-mezo-cream-dim uppercase tracking-widest mb-2 font-body">
        {label}
      </label>
      <input type={type} placeholder={placeholder} value={value}
        onChange={e => onChange(e.target.value)} required={required}
        className="w-full px-4 py-2.5 bg-mezo-ink-muted border border-mezo-ink-line text-mezo-cream placeholder-mezo-stone rounded-mezo-md text-sm focus:outline-none focus:ring-2 focus:ring-mezo-gold focus:border-transparent transition font-body"
      />
    </div>
  );
}
