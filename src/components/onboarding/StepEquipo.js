import { useState } from 'react';
import { X } from 'lucide-react';

const ROLES = [
  { value: 'cajero',  label: 'Cajero'  },
  { value: 'mesero',  label: 'Mesero'  },
  { value: 'cocina',  label: 'Cocina'  },
  { value: 'admin',   label: 'Admin'   },
];

function FilaEmpleado({ emp, idx, onChange, onQuitar }) {
  return (
    <div className="flex gap-2 items-center">
      <input
        type="text" placeholder="Nombre"
        value={emp.nombre}
        onChange={e => onChange(idx, 'nombre', e.target.value)}
        className="flex-1 px-3 py-2 bg-mezo-ink-muted border border-mezo-ink-line text-mezo-cream placeholder-mezo-stone rounded-mezo-md text-sm focus:outline-none focus:ring-1 focus:ring-mezo-gold/50 font-body"
      />
      <select
        value={emp.rol}
        onChange={e => onChange(idx, 'rol', e.target.value)}
        className="px-2 py-2 bg-mezo-ink-muted border border-mezo-ink-line text-mezo-cream rounded-mezo-md text-sm font-body focus:outline-none focus:ring-1 focus:ring-mezo-gold/50"
      >
        {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
      </select>
      {idx > 0 && (
        <button type="button" onClick={() => onQuitar(idx)}
          className="text-mezo-stone hover:text-mezo-rojo transition p-1">
          <X size={14} />
        </button>
      )}
    </div>
  );
}

// Paso 6 — equipo (solo por ahora o añadir 1-3 empleados)
export default function StepEquipo({ updateData, next, prev }) {
  const [modo, setModo]           = useState(null);
  const [empleados, setEmpleados] = useState([{ nombre: '', rol: 'cajero' }]);

  function cambiarEmpleado(idx, campo, val) {
    setEmpleados(prev => prev.map((e, i) => i === idx ? { ...e, [campo]: val } : e));
  }

  function quitarEmpleado(idx) {
    setEmpleados(prev => prev.filter((_, i) => i !== idx));
  }

  function handleContinuar() {
    updateData({ empleados: modo === 'equipo' ? empleados.filter(e => e.nombre.trim()) : [] });
    next();
  }

  return (
    <div>
      <h2
        className="text-mezo-cream font-display font-medium mb-1 leading-snug"
        style={{ fontSize: 22, fontVariationSettings: '"SOFT" 30, "opsz" 36' }}
      >
        ¿Trabajas solo o con equipo?
      </h2>
      <p className="text-sm text-mezo-stone mb-6 font-body">
        Si tienes empleados, podemos crear sus accesos ahora.
      </p>

      <div className="grid grid-cols-2 gap-3 mb-5">
        {[
          { id: 'solo',   icon: '👤', label: 'Solo por ahora' },
          { id: 'equipo', icon: '👥', label: 'Añadir equipo'  },
        ].map(op => (
          <button
            key={op.id} type="button"
            onClick={() => setModo(op.id)}
            className={`flex flex-col items-center gap-2 py-6 px-3 rounded-mezo-xl border text-center transition font-body
              ${modo === op.id
                ? 'border-mezo-gold bg-mezo-gold/10 text-mezo-gold'
                : 'border-mezo-ink-line text-mezo-stone hover:border-mezo-gold/40 hover:text-mezo-cream'}`}
          >
            <span style={{ fontSize: 32 }}>{op.icon}</span>
            <span className="text-sm font-semibold leading-tight">{op.label}</span>
          </button>
        ))}
      </div>

      {modo === 'equipo' && (
        <div className="space-y-2 mb-4">
          {empleados.map((emp, idx) => (
            <FilaEmpleado key={idx} emp={emp} idx={idx} onChange={cambiarEmpleado} onQuitar={quitarEmpleado} />
          ))}
          {empleados.length < 3 && (
            <button type="button"
              onClick={() => setEmpleados(p => [...p, { nombre: '', rol: 'cajero' }])}
              className="text-mezo-gold hover:text-mezo-gold-soft text-sm font-body transition mt-1">
              + Añadir otro
            </button>
          )}
        </div>
      )}

      {modo !== null && (
        <p className="text-mezo-stone font-body text-xs mb-4">
          Tranquilo, puedes añadir más personas después desde la sección Equipo.
        </p>
      )}

      <div className="flex gap-3 mt-4">
        <button type="button" onClick={prev}
          className="flex-1 border border-mezo-ink-line text-mezo-cream-dim font-semibold py-2.5 rounded-mezo-md text-sm hover:bg-mezo-ink-muted transition font-body">
          ← Atrás
        </button>
        <button type="button" onClick={handleContinuar} disabled={modo === null}
          className="flex-[2] bg-mezo-gold hover:bg-mezo-gold-deep disabled:opacity-40 text-mezo-ink font-semibold py-2.5 rounded-mezo-md text-sm transition font-body">
          Continuar →
        </button>
      </div>
    </div>
  );
}
