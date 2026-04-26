import { useState, useEffect } from 'react';
import { ChefHat, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { updateOrden } from '../services';
import { useAuth } from '../context/AuthContext';
import { useOrdenes } from '../hooks/useOrdenes';

export default function PantallaCocina() {
  const { bumpVersion } = useAuth();
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const { ordenes, loading } = useOrdenes(hoy);

  // Solo órdenes activas (no listas ni pagadas históricas)
  const comandas = ordenes
    .filter(o => o.estadoCocina !== 'listo' && o.status !== 'PAID')
    .sort((a, b) => {
      const ta = new Date(a.cocinaEn ?? a.createdAt).getTime();
      const tb = new Date(b.cocinaEn ?? b.createdAt).getTime();
      return ta - tb; // más antiguas primero
    });

  async function marcarListo(ordenId) {
    await updateOrden(ordenId, { estadoCocina: 'listo' });
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
              <Comanda key={orden.id} orden={orden} onListo={marcarListo} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function useElapsed(timestamp) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!timestamp) return;
    function calc() {
      const start = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return Math.floor((Date.now() - start.getTime()) / 1000);
    }
    setElapsed(calc());
    const id = setInterval(() => setElapsed(calc()), 1000);
    return () => clearInterval(id);
  }, [timestamp]);

  return elapsed;
}

function Comanda({ orden, onListo }) {
  const timestamp = orden.cocinaEn ?? orden.createdAt;
  const elapsed   = useElapsed(timestamp);

  const mins = Math.floor(elapsed / 60);
  const secs  = elapsed % 60;
  const timerStr = `${mins}:${String(secs).padStart(2, '0')}`;

  // Verde < 5 min · Ámbar 5–10 min · Rojo > 10 min
  const timerColor = elapsed < 300 ? '#3DAA68' : elapsed < 600 ? '#D9A437' : '#C8573F';
  const urgente    = elapsed >= 600;

  const borderColor = urgente ? '#C8573F40' : elapsed >= 300 ? '#D9A43740' : '#3DAA6840';

  return (
    <div className="bg-mezo-ink-raised rounded-mezo-xl overflow-hidden"
      style={{ border: `1px solid ${borderColor}` }}>

      {/* Header con timer */}
      <div className="flex items-center justify-between px-4 py-3"
        style={{ background: urgente ? 'rgba(200,87,63,0.1)' : elapsed >= 300 ? 'rgba(217,164,55,0.08)' : 'rgba(61,170,104,0.08)' }}>
        <span
          className={`font-mono font-bold text-lg${urgente ? ' animate-timer-pulse' : ''}`}
          style={{ color: timerColor }}>
          {timerStr}
        </span>
        <span className="text-xs font-semibold font-body px-2.5 py-1 rounded-full"
          style={{ color: '#C8903F', border: '1px solid rgba(200,144,63,0.4)', background: 'rgba(200,144,63,0.12)' }}>
          Preparando
        </span>
      </div>

      {/* Ítems */}
      <div className="px-4 py-3 space-y-1.5">
        {(orden.items ?? []).map((linea, i) => (
          <div key={i} className="flex items-center justify-between">
            <span className="text-mezo-cream font-body text-sm">{linea.name}</span>
            <span className="text-mezo-gold font-mono font-bold text-sm">×{linea.quantity}</span>
          </div>
        ))}
        {orden.employeeName && (
          <p className="text-mezo-stone font-body text-xs mt-2 pt-2 border-t border-mezo-ink-line">
            Tomó: {orden.employeeName}
          </p>
        )}
      </div>

      {/* Único botón */}
      <div className="px-3 pb-3">
        <button onClick={() => onListo(orden.id)}
          className="w-full py-2.5 rounded-mezo-md text-sm font-semibold font-body transition"
          style={{ background: 'rgba(61,170,104,0.15)', color: '#3DAA68', border: '1px solid rgba(61,170,104,0.4)' }}>
          ✓ Listo
        </button>
      </div>
    </div>
  );
}
