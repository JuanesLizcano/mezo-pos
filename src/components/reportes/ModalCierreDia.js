import { useState } from 'react';
import { doc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { db } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';
import { formatCOP } from '../../utils/formatters';
import { useMesas } from '../../hooks/useMesas';

function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function ModalCierreDia({ kpis, onCerrar, onCancelar }) {
  const { user }       = useAuth();
  const { mesas }      = useMesas();
  const [loading, setLoading] = useState(false);
  const [listo, setListo]     = useState(false);

  async function handleCerrar() {
    setLoading(true);
    try {
      const batch = writeBatch(db);

      // Guardar resumen del día
      const diaRef = doc(db, 'negocios', user.uid, 'dias', hoyISO());
      batch.set(diaRef, {
        fecha:           hoyISO(),
        estado:          'cerrado',
        total:           kpis.total,
        numOrdenes:      kpis.numOrdenes,
        ticketPromedio:  kpis.ticketPromedio,
        productoTop:     kpis.productoTop,
        metodoPagoTop:   kpis.metodoPagoTop,
        cerradoEn:       serverTimestamp(),
      });

      // Liberar todas las mesas al cerrar el día
      mesas.forEach(mesa => {
        const mesaRef = doc(db, 'negocios', user.uid, 'mesas', mesa.id);
        batch.update(mesaRef, { estado: 'libre', ocupadaEn: null, total: null });
      });

      await batch.commit();
      toast.success('Día cerrado. Resumen guardado ✓');
      setListo(true);
      setTimeout(() => {
        setListo(false);
        onCerrar();
      }, 1800);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(8,7,6,0.85)' }}>
      <div className="bg-mezo-ink-raised border border-mezo-ink-line rounded-mezo-xl p-7 w-full max-w-md shadow-mezo-lg">
        {listo ? (
          <div className="text-center py-4">
            <span style={{ fontSize: 48 }}>🌙</span>
            <p className="text-mezo-cream font-display text-2xl font-medium mt-3">Día cerrado</p>
            <p className="text-mezo-stone font-body text-sm mt-1">Resumen guardado en Firestore.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-mezo-cream font-body text-lg">Cerrar el día</h3>
              <button onClick={onCancelar}
                className="text-mezo-stone hover:text-mezo-cream transition">
                <X size={18} />
              </button>
            </div>

            <p className="text-mezo-stone font-body text-sm mb-5">
              Resumen de hoy — {new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>

            <div className="space-y-3 mb-6">
              <FilaResumen label="Total vendido"   valor={formatCOP(kpis.total)} destacado />
              <FilaResumen label="Órdenes"          valor={kpis.numOrdenes} />
              <FilaResumen label="Ticket promedio"  valor={formatCOP(kpis.ticketPromedio)} />
              {kpis.productoTop  && <FilaResumen label="Producto #1"    valor={kpis.productoTop} />}
              {kpis.metodoPagoTop && <FilaResumen label="Pago más usado" valor={kpis.metodoPagoTop} />}
              <FilaResumen label="Mesas liberadas"  valor={`${mesas.length} mesas`} />
            </div>

            <div className="flex gap-3">
              <button onClick={onCancelar}
                className="flex-1 border border-mezo-ink-line text-mezo-cream-dim font-semibold py-2.5 rounded-mezo-md text-sm hover:bg-mezo-ink-muted transition font-body">
                Cancelar
              </button>
              <button onClick={handleCerrar} disabled={loading}
                className="flex-[2] bg-mezo-rojo hover:bg-red-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-mezo-md text-sm transition font-body">
                {loading ? 'Cerrando...' : '🌙 Confirmar cierre'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function FilaResumen({ label, valor, destacado }) {
  return (
    <div className="flex justify-between items-center text-sm font-body">
      <span className="text-mezo-stone">{label}</span>
      <span className={`font-medium ${destacado ? 'text-mezo-gold font-mono font-bold text-base' : 'text-mezo-cream'}`}>
        {valor}
      </span>
    </div>
  );
}
