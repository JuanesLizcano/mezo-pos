import { useState } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { cambiarMesa } from '../../services';
import { useAuth } from '../../context/AuthContext';

// Modal para mover todos los productos de una mesa a otra libre
export default function ModalCambiarMesa({ mesaOrigen, todasMesas, onCerrar }) {
  const { bumpVersion } = useAuth();
  const [guardando, setGuardando] = useState(false);

  const mesasLibres = todasMesas.filter(
    m => m.id !== mesaOrigen.id && (m.estado ?? 'libre') === 'libre'
  );

  async function handleCambiar(mesaDestino) {
    setGuardando(true);
    try {
      await cambiarMesa(mesaOrigen.id, mesaDestino.id);
      bumpVersion();
      toast.success(`Mesa ${mesaOrigen.numero} → Mesa ${mesaDestino.numero}`);
      onCerrar();
    } catch {
      toast.error('Error al cambiar de mesa. Intenta de nuevo.');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(8,7,6,0.85)' }}>
      <div className="bg-mezo-ink-raised border border-mezo-ink-line rounded-mezo-xl p-6 w-full max-w-sm shadow-mezo-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-mezo-stone text-xs uppercase tracking-widest font-body">Cambiar de mesa</p>
            <h3 className="text-mezo-cream font-body font-semibold text-lg">Mesa {mesaOrigen.numero}</h3>
          </div>
          <button onClick={onCerrar} className="text-mezo-stone hover:text-mezo-cream transition">
            <X size={18} />
          </button>
        </div>

        {mesasLibres.length === 0 ? (
          <p className="text-mezo-stone font-body text-sm text-center py-6">
            No hay mesas libres disponibles.
          </p>
        ) : (
          <>
            <p className="text-mezo-stone font-body text-xs uppercase tracking-widest mb-3">
              Selecciona la mesa destino
            </p>
            <div className="grid grid-cols-4 gap-2">
              {mesasLibres.map(m => (
                <button key={m.id} onClick={() => handleCambiar(m)} disabled={guardando}
                  className="flex flex-col items-center justify-center py-3 rounded-mezo-lg border border-mezo-ink-line hover:border-mezo-gold/60 hover:bg-mezo-gold/10 transition disabled:opacity-50">
                  <span className="text-mezo-cream font-display font-medium text-xl leading-none">{m.numero}</span>
                  <span className="text-mezo-stone font-body mt-0.5" style={{ fontSize: 10 }}>Libre</span>
                </button>
              ))}
            </div>
          </>
        )}

        <button onClick={onCerrar}
          className="w-full mt-4 border border-mezo-ink-line text-mezo-cream-dim font-semibold py-2.5 rounded-mezo-md text-sm font-body hover:bg-mezo-ink-muted transition">
          Cancelar
        </button>
      </div>
    </div>
  );
}
