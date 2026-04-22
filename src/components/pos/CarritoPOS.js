import { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { Trash2, Plus, Minus, ShoppingCart } from 'lucide-react';
import { db } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';
import { formatCOP } from '../../utils/formatters';

const METODOS = [
  { id: 'efectivo',      label: 'Efectivo',      emoji: '💵' },
  { id: 'bold',          label: 'Bold',           emoji: '💳' },
  { id: 'nequi',         label: 'Nequi',          emoji: '📱' },
  { id: 'daviplata',     label: 'Daviplata',      emoji: '🔵' },
  { id: 'transferencia', label: 'Transferencia',  emoji: '🏦' },
];

export default function CarritoPOS({ lineas, total, count, onAgregar, onQuitar, onEliminar, onVaciar }) {
  const { user }                    = useAuth();
  const [metodo, setMetodo]         = useState('efectivo');
  const [recibido, setRecibido]     = useState('');
  const [loading, setLoading]       = useState(false);
  const [confirmado, setConfirmado] = useState(false);

  const recibidoNum = parseFloat(recibido.replace(/\./g, '').replace(',', '.')) || 0;
  const cambio      = metodo === 'efectivo' ? recibidoNum - total : 0;
  const puedeCobrar = lineas.length > 0 && (metodo !== 'efectivo' || recibidoNum >= total);

  async function handleCobrar() {
    if (!puedeCobrar) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'negocios', user.uid, 'ordenes'), {
        lineas: lineas.map(({ producto, cantidad }) => ({
          productoId: producto.id,
          nombre:     producto.nombre,
          precio:     producto.precio,
          cantidad,
          subtotal:   producto.precio * cantidad,
        })),
        total,
        metodoPago:    metodo,
        recibido:      metodo === 'efectivo' ? recibidoNum : null,
        cambio:        metodo === 'efectivo' ? cambio : null,
        empleadoUid:   user.uid,
        empleadoEmail: user.email,
        creadoEn:      serverTimestamp(),
        estado:        'pagada',
      });
      setConfirmado(true);
      setTimeout(() => {
        onVaciar();
        setRecibido('');
        setMetodo('efectivo');
        setConfirmado(false);
      }, 2000);
    } finally {
      setLoading(false);
    }
  }

  if (confirmado) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <span style={{ fontSize: 56 }}>✅</span>
        <p className="text-mezo-cream font-display text-2xl font-medium">¡Cobrado!</p>
        {metodo === 'efectivo' && cambio > 0 && (
          <p className="text-mezo-stone font-body text-sm">
            Cambio: <span className="text-mezo-gold font-bold">{formatCOP(cambio)}</span>
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header carrito */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-mezo-ink-line flex-shrink-0">
        <div className="flex items-center gap-2">
          <ShoppingCart size={16} className="text-mezo-gold" />
          <span className="text-mezo-cream font-semibold font-body text-sm">
            Orden {count > 0 && <span className="text-mezo-stone">({count})</span>}
          </span>
        </div>
        {lineas.length > 0 && (
          <button onClick={onVaciar} className="text-mezo-stone hover:text-mezo-rojo text-xs font-body transition">
            Vaciar
          </button>
        )}
      </div>

      {/* Lista de ítems */}
      <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2">
        {lineas.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-mezo-stone font-body text-sm gap-2">
            <ShoppingCart size={28} className="opacity-30" />
            <span>Agrega productos al carrito</span>
          </div>
        ) : (
          lineas.map(({ producto, cantidad }) => (
            <div key={producto.id}
              className="flex items-center gap-3 bg-mezo-ink-muted rounded-mezo-md px-3 py-2">
              <div className="flex-1 min-w-0">
                <p className="text-mezo-cream text-sm font-body font-medium truncate">{producto.nombre}</p>
                <p className="text-mezo-stone text-xs font-mono">{formatCOP(producto.precio)}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <button onClick={() => onQuitar(producto.id)}
                  className="w-6 h-6 flex items-center justify-center rounded-full border border-mezo-ink-line text-mezo-stone hover:text-mezo-cream hover:border-mezo-gold/40 transition">
                  <Minus size={10} />
                </button>
                <span className="text-mezo-cream font-body text-sm w-5 text-center">{cantidad}</span>
                <button onClick={() => onAgregar(producto)}
                  className="w-6 h-6 flex items-center justify-center rounded-full border border-mezo-ink-line text-mezo-stone hover:text-mezo-cream hover:border-mezo-gold/40 transition">
                  <Plus size={10} />
                </button>
                <button onClick={() => onEliminar(producto.id)}
                  className="w-6 h-6 flex items-center justify-center text-mezo-stone hover:text-mezo-rojo transition ml-1">
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Panel de pago */}
      <div className="flex-shrink-0 border-t border-mezo-ink-line px-5 pt-4 pb-5 space-y-4">
        {/* Total */}
        <div className="flex items-center justify-between">
          <span className="text-mezo-stone font-body text-sm">Total</span>
          <span className="text-mezo-cream font-mono font-bold text-xl">{formatCOP(total)}</span>
        </div>

        {/* Métodos de pago */}
        <div className="grid grid-cols-5 gap-1.5">
          {METODOS.map(m => (
            <button
              key={m.id}
              onClick={() => setMetodo(m.id)}
              className={`flex flex-col items-center gap-0.5 py-2 rounded-mezo-md border text-xs font-body transition
                ${metodo === m.id
                  ? 'bg-mezo-gold/15 border-mezo-gold text-mezo-gold'
                  : 'border-mezo-ink-line text-mezo-stone hover:border-mezo-gold/40 hover:text-mezo-cream'}`}
            >
              <span style={{ fontSize: 16 }}>{m.emoji}</span>
              <span style={{ fontSize: 10 }}>{m.label}</span>
            </button>
          ))}
        </div>

        {/* Campo efectivo */}
        {metodo === 'efectivo' && (
          <div className="space-y-2">
            <div>
              <label className="block text-xs font-body text-mezo-stone mb-1 uppercase tracking-widest">
                Recibido
              </label>
              <input
                type="number"
                placeholder="0"
                value={recibido}
                onChange={e => setRecibido(e.target.value)}
                className="w-full px-3 py-2 bg-mezo-ink-muted border border-mezo-ink-line text-mezo-cream font-mono text-sm rounded-mezo-md focus:outline-none focus:ring-2 focus:ring-mezo-gold focus:border-transparent"
              />
            </div>
            {recibidoNum > 0 && (
              <div className={`flex justify-between text-sm font-body px-1 ${cambio < 0 ? 'text-mezo-rojo' : 'text-mezo-verde'}`}>
                <span>{cambio < 0 ? 'Falta' : 'Cambio'}</span>
                <span className="font-mono font-bold">{formatCOP(Math.abs(cambio))}</span>
              </div>
            )}
          </div>
        )}

        {/* Botón cobrar */}
        <button
          onClick={handleCobrar}
          disabled={!puedeCobrar || loading}
          className="w-full py-3 rounded-mezo-md font-semibold font-body text-sm transition
            bg-mezo-gold hover:bg-mezo-gold-deep text-mezo-ink
            disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? 'Guardando...' : `Cobrar ${lineas.length > 0 ? formatCOP(total) : ''}`}
        </button>
      </div>
    </div>
  );
}
