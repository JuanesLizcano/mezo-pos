import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { Link } from 'react-router-dom';
import { auth } from '../../services/firebase';

const ERRORES = {
  'auth/email-already-in-use': 'Ese correo ya tiene cuenta. ¿Quieres iniciar sesión?',
  'auth/weak-password':        'La contraseña debe tener al menos 6 caracteres.',
  'auth/invalid-email':        'El correo no es válido.',
};

export default function Step1Cuenta({ data, updateData, next }) {
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (data.password !== data.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, data.email, data.password);
      next();
    } catch (err) {
      setError(ERRORES[err.code] || 'Error al crear la cuenta.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <p className="text-xs text-mezo-stone uppercase tracking-widest mb-1 font-body">Paso 1</p>
      <h2 className="text-xl font-semibold text-mezo-cream mb-1 font-body">Crea tu cuenta</h2>
      <p className="text-sm text-mezo-stone mb-6 font-body">Un correo para acceder a mezo desde cualquier caja.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Campo label="Correo electrónico" type="email" placeholder="hola@minegocio.com"
          value={data.email} onChange={(v) => updateData({ email: v })} required />
        <Campo label="Contraseña" type="password" placeholder="Mínimo 6 caracteres"
          value={data.password} onChange={(v) => updateData({ password: v })} required />
        <Campo label="Confirmar contraseña" type="password" placeholder="Repite la contraseña"
          value={data.confirmPassword} onChange={(v) => updateData({ confirmPassword: v })} required />

        {error && <ErrorMsg>{error}</ErrorMsg>}

        <button type="submit" disabled={loading}
          className="w-full bg-mezo-gold hover:bg-mezo-gold-deep disabled:opacity-50 text-mezo-ink font-semibold py-3 rounded-mezo-md text-sm transition shadow-mezo-gold mt-2 font-body">
          {loading ? 'Creando cuenta...' : 'Continuar →'}
        </button>
      </form>

      <p className="text-center text-sm text-mezo-stone mt-5 font-body">
        ¿Ya tienes cuenta?{' '}
        <Link to="/login" className="text-mezo-gold hover:text-mezo-gold-soft transition font-medium">
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}

function Campo({ label, type, placeholder, value, onChange, required }) {
  return (
    <div>
      <label className="block text-xs font-medium text-mezo-cream-dim uppercase tracking-widest mb-2 font-body">
        {label}
      </label>
      <input
        type={type} placeholder={placeholder} value={value}
        onChange={(e) => onChange(e.target.value)} required={required}
        className="w-full px-4 py-2.5 bg-mezo-ink-muted border border-mezo-ink-line text-mezo-cream placeholder-mezo-stone rounded-mezo-md text-sm focus:outline-none focus:ring-2 focus:ring-mezo-gold focus:border-transparent transition font-body"
      />
    </div>
  );
}

function ErrorMsg({ children }) {
  return (
    <p className="text-mezo-rojo text-sm bg-mezo-rojo/10 border border-mezo-rojo/30 rounded-mezo-md px-4 py-2 font-body">
      {children}
    </p>
  );
}
