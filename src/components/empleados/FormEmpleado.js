import { useState } from 'react';

const ROLES_DISPONIBLES = [
  { id: 'admin',   label: 'Admin',   desc: 'Acceso total',                color: '#C8903F' },
  { id: 'cajero',  label: 'Cajero',  desc: 'POS + Mesas',                 color: '#3DAA68' },
  { id: 'mesero',  label: 'Mesero',  desc: 'Tomar órdenes',               color: '#6B9ED4' },
  { id: 'cocina',  label: 'Cocina',  desc: 'Ver comandas, sin precios',   color: '#D9A437' },
];

export default function FormEmpleado({ inicial, onGuardar, onCancelar, loading }) {
  const [nombre, setNombre]   = useState(inicial?.nombre ?? '');
  const [correo, setCorreo]   = useState(inicial?.correo ?? '');
  const [pin, setPin]         = useState(inicial?.pin ?? '');
  const [roles, setRoles]     = useState(inicial?.roles ?? []);

  function toggleRol(rolId) {
    setRoles(prev =>
      prev.includes(rolId) ? prev.filter(r => r !== rolId) : [...prev, rolId]
    );
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!nombre.trim()) return;
    if (!roles.length) return;
    if (pin.length !== 4) return;
    onGuardar({ nombre: nombre.trim(), correo: correo.trim(), pin, roles });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Campo label="Nombre completo" type="text" placeholder="Ej: María Gómez"
        value={nombre} onChange={setNombre} required />
      <Campo label="Correo" type="email" placeholder="empleado@email.com"
        value={correo} onChange={setCorreo} required />

      {/* PIN de 4 dígitos */}
      <div>
        <label className="block text-xs font-medium text-mezo-cream-dim uppercase tracking-widest mb-2 font-body">
          PIN (4 dígitos)
        </label>
        <input
          type="text" inputMode="numeric" maxLength={4} placeholder="••••"
          value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
          required
          className="w-32 px-4 py-2.5 bg-mezo-ink-muted border border-mezo-ink-line text-mezo-cream placeholder-mezo-stone rounded-mezo-md text-sm text-center tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-mezo-gold font-mono"
        />
        <p className="text-mezo-stone font-body text-xs mt-1">Para seleccionar empleado en el POS.</p>
      </div>

      {/* Roles (checkboxes múltiples) */}
      <div>
        <label className="block text-xs font-medium text-mezo-cream-dim uppercase tracking-widest mb-3 font-body">
          Roles <span className="normal-case text-mezo-stone">(puede tener varios)</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {ROLES_DISPONIBLES.map(r => {
            const sel = roles.includes(r.id);
            return (
              <button key={r.id} type="button" onClick={() => toggleRol(r.id)}
                className={`flex items-start gap-3 p-3 rounded-mezo-lg border text-left transition
                  ${sel
                    ? 'border-opacity-60 bg-opacity-10'
                    : 'border-mezo-ink-line hover:border-mezo-ink-muted'}`}
                style={sel ? { borderColor: r.color, background: `${r.color}15` } : {}}
              >
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition`}
                  style={sel ? { borderColor: r.color, background: r.color } : { borderColor: '#3A332C' }}>
                  {sel && <span className="text-mezo-ink text-xs font-bold">✓</span>}
                </div>
                <div>
                  <p className="font-semibold font-body text-sm" style={{ color: sel ? r.color : '#D9CEB5' }}>
                    {r.label}
                  </p>
                  <p className="text-mezo-stone font-body" style={{ fontSize: 11 }}>{r.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
        {!roles.length && (
          <p className="text-mezo-rojo font-body text-xs mt-2">Selecciona al menos un rol.</p>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancelar}
          className="flex-1 border border-mezo-ink-line text-mezo-cream-dim font-semibold py-2.5 rounded-mezo-md text-sm hover:bg-mezo-ink-muted transition font-body">
          Cancelar
        </button>
        <button type="submit" disabled={loading || !roles.length}
          className="flex-[2] bg-mezo-gold hover:bg-mezo-gold-deep disabled:opacity-50 text-mezo-ink font-semibold py-2.5 rounded-mezo-md text-sm transition font-body">
          {loading ? 'Guardando...' : (inicial ? 'Guardar cambios' : 'Crear empleado')}
        </button>
      </div>
    </form>
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
