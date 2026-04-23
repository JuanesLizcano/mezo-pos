import { ChefHat, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { updateOrden } from '../services';
import { useAuth } from '../context/AuthContext';
import { useOrdenes } from '../hooks/useOrdenes';

const ESTADOS_COCINA = {
  pendiente:   { label: 'Pendiente',   color: '#D9A437', bg: 'rgba(217,164,55,0.12)'  },
  preparando:  { label: 'Preparando',  color: '#C8903F', bg: 'rgba(200,144,63,0.12)'  },
  listo:       { label: 'Listo',       color: '#3DAA68', bg: 'rgba(61,170,104,0.12)'  },
};

export default function PantallaCocina() {
  const { bumpVersion } = useAuth();
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const { ordenes, loading } = useOrdenes(hoy);

  const comandas = ordenes.filter(o => o.estadoCocina !== 'listo');

  async function cambiarEstado(ordenId, nuevoEstado) {
    await updateOrden(ordenId, { estadoCocina: nuevoEstado });
    bumpVersion();
  }

  return (
    <div className="h-screen bg-mezo-ink flex flex-col overflow-hidden">
      <header className="bg-mezo-ink border-b border-mezo-ink-line px-8 flex items-center justify-between"
        style={{ height: 64 }}>
        <div className="flex items-center gap-4">
          <Link to="/dashboard"
            className="flex items-center gap-1.5 text-mezo-stone hover:text-mezo-cream transition text-sm font-body">
            <ArrowLeft size={15} />
            <span className="hidden sm:block">Dashboard</span>
          </Link>
          <div className="w-px h-5 bg-mezo-ink-line" />
          <ChefHat size={20} className="text-mezo-gold" />
          <span className="text-mezo-cream font-display font-medium text-lg"
            style={{ fontVariationSettings: '"SOFT" 50, "opsz" 36' }}>
            Cocina — {new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <span className="text-mezo-stone font-body text-sm">
          {comandas.length} {comandas.length === 1 ? 'comanda' : 'comandas'} activas
        </span>
      </header>

      <main className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-7 h-7 border-4 border-mezo-gold border-t-transparent rounded-full animate-spin" />
          </div>
        ) : comandas.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
            <span style={{ fontSize: 56 }}>👨‍🍳</span>
            <p className="text-mezo-cream font-display text-2xl font-medium">Todo al día</p>
            <p className="text-mezo-stone font-body text-sm">Esperando nuevas órdenes…</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {comandas.map(orden => (
              <Comanda key={orden.id} orden={orden} onCambiarEstado={cambiarEstado} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function Comanda({ orden, onCambiarEstado }) {
  const estado = orden.estadoCocina ?? 'pendiente';
  const conf   = ESTADOS_COCINA[estado] ?? ESTADOS_COCINA.pendiente;
  const hora   = orden.creadoEn
    ? new Date(orden.creadoEn).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
    : '—';

  return (
    <div className="bg-mezo-ink-raised rounded-mezo-xl overflow-hidden"
      style={{ border: `1px solid ${conf.color}40` }}>
      <div className="flex items-center justify-between px-4 py-3"
        style={{ background: conf.bg }}>
        <span className="font-mono font-bold text-sm" style={{ color: conf.color }}>
          {hora}
        </span>
        <span className="text-xs font-semibold font-body px-2.5 py-1 rounded-full"
          style={{ color: conf.color, border: `1px solid ${conf.color}60`, background: `${conf.color}20` }}>
          {conf.label}
        </span>
      </div>

      <div className="px-4 py-3 space-y-1.5">
        {(orden.lineas ?? []).map((linea, i) => (
          <div key={i} className="flex items-center justify-between">
            <span className="text-mezo-cream font-body text-sm">{linea.nombre}</span>
            <span className="text-mezo-gold font-mono font-bold text-sm">×{linea.cantidad}</span>
          </div>
        ))}
        {orden.empleadoNombreTomo && (
          <p className="text-mezo-stone font-body text-xs mt-2 pt-2 border-t border-mezo-ink-line">
            Tomó: {orden.empleadoNombreTomo}
          </p>
        )}
      </div>

      <div className="px-3 pb-3 flex gap-2">
        {estado === 'pendiente' && (
          <button onClick={() => onCambiarEstado(orden.id, 'preparando')}
            className="flex-1 py-2 rounded-mezo-md text-xs font-semibold font-body transition"
            style={{ background: 'rgba(200,144,63,0.15)', color: '#C8903F', border: '1px solid rgba(200,144,63,0.4)' }}>
            👨‍🍳 Preparando
          </button>
        )}
        {(estado === 'pendiente' || estado === 'preparando') && (
          <button onClick={() => onCambiarEstado(orden.id, 'listo')}
            className="flex-1 py-2 rounded-mezo-md text-xs font-semibold font-body transition"
            style={{ background: 'rgba(61,170,104,0.15)', color: '#3DAA68', border: '1px solid rgba(61,170,104,0.4)' }}>
            ✓ Listo
          </button>
        )}
      </div>
    </div>
  );
}
