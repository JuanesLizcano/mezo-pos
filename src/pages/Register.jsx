import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { register as apiRegister, verifyOtp, resendOtp } from '../services';
import { useAuth } from '../context/AuthContext';
import MezoWordmark from '../components/brand/MezoWordmark';
import AuroraGlow from '../components/effects/AuroraGlow';
import toast from 'react-hot-toast';

const OTP_DURACION_SEG   = 5 * 60;
const REENVIO_ESPERA_SEG = 60;
const easeMezo           = [0.22, 1, 0.36, 1];

const GRID_BG = {
  backgroundImage: `repeating-linear-gradient(
    90deg,
    rgba(200,144,63,0.03) 0px,
    rgba(200,144,63,0.03) 1px,
    transparent 1px,
    transparent 80px
  )`,
};

// ─── Spinner ──────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <svg className="animate-spin inline-block mr-2" width={14} height={14} viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeOpacity="0.3" strokeWidth="2" />
      <path d="M7 1.5A5.5 5.5 0 0112.5 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// ─── Input con validación animada ─────────────────────────────────────────────
function Campo({ label, type, placeholder, value, onChange, required, error: fieldError }) {
  const [focused, setFocused] = useState(false);
  const isInvalid = !!fieldError;

  const borderColor = isInvalid ? '#C8573F' : focused ? '#C8903F' : 'rgba(244,236,216,0.10)';
  const ringColor   = isInvalid ? 'rgba(200,87,63,0.15)' : focused ? 'rgba(200,144,63,0.15)' : 'none';

  return (
    <div>
      <label className="block text-xs font-medium text-mezo-cream-dim uppercase tracking-widest mb-2 font-body">
        {label}
      </label>
      <motion.div
        animate={isInvalid ? { x: [-4, 4, -2, 2, 0] } : { x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          required={required}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full px-4 py-2.5 bg-mezo-ink-muted text-mezo-cream placeholder-mezo-stone rounded-mezo-md text-sm focus:outline-none font-body transition-all duration-200"
          style={{
            border: `1px solid ${borderColor}`,
            boxShadow: focused || isInvalid ? `0 0 0 3px ${ringColor}` : 'none',
          }}
        />
      </motion.div>
      <AnimatePresence>
        {fieldError && (
          <motion.p
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: easeMezo }}
            className="text-xs font-body mt-1.5"
            style={{ color: '#C8573F' }}
          >
            {fieldError}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Paso 1: datos de la cuenta ──────────────────────────────────────────────
function StepCuenta({ onSuccess }) {
  const [email,   setEmail]   = useState('');
  const [pass,    setPass]    = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const newErrors = {};
    if (pass.length < 6)      newErrors.pass    = 'Mínimo 6 caracteres.';
    if (pass !== confirm)     newErrors.confirm = 'Las contraseñas no coinciden.';
    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }
    setErrors({});
    setLoading(true);
    try {
      await apiRegister(email, pass);
      toast.success('Código enviado a ' + email);
      onSuccess(email);
    } catch (err) {
      setErrors({ general: err.message || 'Error al crear la cuenta.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h2 className="text-mezo-cream font-body font-semibold text-lg mb-1">Crear cuenta</h2>
        <p className="text-mezo-stone text-sm font-body">30 días gratis · Cancela cuando quieras</p>
      </div>

      <Campo label="Correo electrónico" type="email" placeholder="hola@minegocio.com"
        value={email} onChange={setEmail} required error={errors.email} />
      <Campo label="Contraseña" type="password" placeholder="Mínimo 6 caracteres"
        value={pass} onChange={setPass} required error={errors.pass} />
      <Campo label="Confirmar contraseña" type="password" placeholder="Repite tu contraseña"
        value={confirm} onChange={setConfirm} required error={errors.confirm} />

      {errors.general && (
        <motion.p
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: easeMezo }}
          className="text-mezo-rojo text-sm bg-mezo-rojo/10 border border-mezo-rojo/30 rounded-mezo-md px-4 py-2 font-body"
        >
          {errors.general}
        </motion.p>
      )}

      <BotonSubmit loading={loading}>
        {loading ? <><Spinner />Creando cuenta…</> : 'Crear cuenta →'}
      </BotonSubmit>
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

  useEffect(() => {
    if (segundos <= 0) return;
    const t = setInterval(() => setSegundos(s => s - 1), 1000);
    return () => clearInterval(t);
  }, [segundos]);

  useEffect(() => {
    if (reenvioSeg <= 0) return;
    const t = setInterval(() => setReenvioSeg(s => s - 1), 1000);
    return () => clearInterval(t);
  }, [reenvioSeg]);

  const fmtTiempo = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const handleChange = useCallback((idx, val) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    setCodigo(prev => { const next = [...prev]; next[idx] = digit; return next; });
    if (digit && idx < 5) inputsRef.current[idx + 1]?.focus();
  }, []);

  const handlePaste = useCallback(e => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const arr = pasted.split('').concat(Array(6).fill('')).slice(0, 6);
    setCodigo(arr);
    inputsRef.current[Math.min(pasted.length, 5)]?.focus();
  }, []);

  const handleKeyDown = useCallback((idx, e) => {
    if (e.key === 'Backspace' && !codigo[idx] && idx > 0) inputsRef.current[idx - 1]?.focus();
  }, [codigo]);

  async function handleVerificar(e) {
    e.preventDefault();
    const codeStr = codigo.join('');
    if (codeStr.length < 6) { setError('Ingresa los 6 dígitos.'); return; }
    setError('');
    setLoading(true);
    try {
      const authData = await verifyOtp(email, codeStr);
      onVerified(authData);
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
            type="text" inputMode="numeric" maxLength={1} value={d}
            onChange={e => handleChange(i, e.target.value)}
            onKeyDown={e => handleKeyDown(i, e)}
            className="w-11 h-14 text-center text-2xl font-mono font-bold text-mezo-cream bg-mezo-ink-muted rounded-mezo-lg focus:outline-none transition-all duration-200"
            style={{
              border: `1px solid ${d ? '#C8903F' : 'rgba(244,236,216,0.10)'}`,
              boxShadow: d ? '0 0 0 3px rgba(200,144,63,0.12)' : 'none',
              letterSpacing: 0,
            }}
          />
        ))}
      </div>

      {segundos > 0 ? (
        <p className="text-center text-mezo-stone text-sm font-body">
          Expira en{' '}
          <span className="font-mono font-semibold text-mezo-cream">{fmtTiempo(segundos)}</span>
        </p>
      ) : (
        <p className="text-center text-sm font-body" style={{ color: '#C8573F' }}>El código expiró.</p>
      )}

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: easeMezo }}
            className="text-mezo-rojo text-sm bg-mezo-rojo/10 border border-mezo-rojo/30 rounded-mezo-md px-4 py-2 font-body text-center"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      <BotonSubmit loading={loading} disabled={codigo.join('').length < 6}>
        {loading ? <><Spinner />Verificando…</> : 'Verificar código'}
      </BotonSubmit>

      <button type="button" onClick={handleReenviar} disabled={reenvioSeg > 0}
        className="w-full text-sm text-mezo-gold hover:text-mezo-gold-soft disabled:text-mezo-stone transition font-body text-center">
        {reenvioSeg > 0 ? `Reenviar código en ${fmtTiempo(reenvioSeg)}` : 'Reenviar código'}
      </button>

      {process.env.REACT_APP_USE_MOCK === 'true' && process.env.NODE_ENV !== 'production' && (
        <p className="text-center text-xs text-mezo-stone/50 font-body">Demo: código 123456</p>
      )}
    </form>
  );
}

// ─── Stepper animado ──────────────────────────────────────────────────────────
function Stepper({ step }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {[1, 2].map(n => {
        const active    = step === n;
        const completed = step > n;
        return (
          <div key={n} className="flex items-center gap-2 flex-1">
            {/* Círculo */}
            <motion.div
              animate={{
                background:  completed || active ? '#C8903F' : '#2A2520',
                boxShadow:   active ? '0 0 0 4px rgba(200,144,63,0.15)' : '0 0 0 0px rgba(200,144,63,0)',
              }}
              transition={{ duration: 0.4, ease: easeMezo }}
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-body flex-shrink-0"
              style={{ color: completed || active ? '#080706' : '#7A6A58' }}
            >
              {completed ? (
                <motion.svg
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.3, ease: easeMezo }}
                  width={10} height={10} viewBox="0 0 10 10" fill="none"
                >
                  <path d="M1.5 5l2.5 2.5 4.5-5" stroke="#080706" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </motion.svg>
              ) : n}
            </motion.div>

            {/* Label */}
            <span
              className="text-xs font-body transition-colors duration-300"
              style={{ color: active || completed ? '#E4B878' : '#7A6A58' }}
            >
              {n === 1 ? 'Cuenta' : 'Verificación'}
            </span>

            {/* Línea de progreso */}
            {n < 2 && (
              <div className="flex-1 h-px relative overflow-hidden" style={{ background: '#2A2520' }}>
                <motion.div
                  className="absolute inset-y-0 left-0"
                  animate={{ width: step > n ? '100%' : '0%' }}
                  transition={{ duration: 0.6, ease: easeMezo }}
                  style={{ background: '#C8903F' }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Botón submit ─────────────────────────────────────────────────────────────
function BotonSubmit({ loading, disabled, children }) {
  return (
    <motion.button
      type="submit"
      disabled={loading || disabled}
      whileHover={!disabled && !loading ? { y: -1, boxShadow: '0 6px 20px rgba(200,144,63,0.28)' } : {}}
      whileTap={!disabled && !loading   ? { scale: 0.98 } : {}}
      transition={{ duration: 0.18, ease: easeMezo }}
      className="w-full bg-mezo-gold disabled:opacity-50 text-mezo-ink font-semibold py-3 rounded-mezo-md text-sm font-body"
      style={{ transition: 'background 0.2s ease' }}
      onMouseEnter={e => { if (!disabled && !loading) e.currentTarget.style.background = '#E4B878'; }}
      onMouseLeave={e => { e.currentTarget.style.background = '#C8903F'; }}
    >
      {children}
    </motion.button>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function Register() {
  const { setSession, user, loading } = useAuth();
  const navigate       = useNavigate();
  const [step, setStep]   = useState(1);
  const [email, setEmail] = useState('');
  const prefersReduced    = useReducedMotion();

  useEffect(() => {
    if (!loading && user) navigate('/onboarding', { replace: true });
  }, [loading, user, navigate]);

  async function handleOtpVerified(authData) {
    await setSession(authData);
    navigate('/onboarding', { replace: true });
  }

  const dur = prefersReduced ? 0 : 0.6;

  return (
    <div
      className="relative min-h-screen bg-mezo-ink flex items-center justify-center px-4 overflow-hidden"
      style={GRID_BG}
    >
      <AuroraGlow variant="top"    intensity={0.14} />
      <AuroraGlow variant="bottom" intensity={0.07} />

      <div className="relative z-10 w-full max-w-md">

        {/* Logo */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: dur, ease: easeMezo }}
        >
          <MezoWordmark height={100} color="#C8903F" />
        </motion.div>

        {/* Stepper */}
        <motion.div
          initial={{ opacity: 0, y: prefersReduced ? 0 : 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: dur, ease: easeMezo, delay: 0.15 }}
        >
          <Stepper step={step} />
        </motion.div>

        {/* Card con transición entre pasos */}
        <motion.div
          className="bg-mezo-ink-raised border border-mezo-ink-line rounded-mezo-xl p-8 shadow-mezo-lg relative overflow-hidden"
          initial={{ opacity: 0, y: prefersReduced ? 0 : 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: dur, ease: easeMezo, delay: 0.3 }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: prefersReduced ? 0 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: prefersReduced ? 0 : -20 }}
              transition={{ duration: 0.35, ease: easeMezo }}
            >
              {step === 1 ? (
                <StepCuenta onSuccess={e => { setEmail(e); setStep(2); }} />
              ) : (
                <StepOtp email={email} onVerified={handleOtpVerified} />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Detalle decorativo */}
          <svg
            aria-hidden="true"
            width={72} height={72} viewBox="0 0 72 72" fill="none"
            className="absolute bottom-5 right-5 pointer-events-none"
            style={{ opacity: 0.13 }}
          >
            <path d="M8 64 Q36 36 64 8"   stroke="#C8903F" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M20 64 Q48 36 64 20"  stroke="#C8903F" strokeWidth="0.8" strokeLinecap="round" />
            <path d="M36 64 Q56 44 64 36"  stroke="#C8903F" strokeWidth="0.5" strokeLinecap="round" />
          </svg>
        </motion.div>

        {/* Link login */}
        <motion.p
          className="text-center text-sm text-mezo-stone mt-6 font-body"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: dur, ease: easeMezo, delay: 0.5 }}
        >
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-mezo-gold hover:text-mezo-gold-soft transition font-medium">
            Inicia sesión
          </Link>
        </motion.p>
      </div>
    </div>
  );
}
