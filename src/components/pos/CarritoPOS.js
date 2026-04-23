import { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { Trash2, Plus, Minus, ShoppingCart, Printer, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { pdf } from '@react-pdf/renderer';
import { db } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';
import { useEmployee } from '../../context/EmployeeContext';
import { formatCOP } from '../../utils/formatters';
import TicketPDF from './Ticket';

const METODOS = [
  { id: 'efectivo',      label: 'Efectivo',   emoji: '💵' },
  { id: 'datafono',      label: 'Datáfono',   emoji: '💳' },
  { id: 'nequi',         label: 'Nequi',      emoji: '📱' },
  { id: 'daviplata',     label: 'Daviplata',  emoji: '🔵' },
  { id: 'transferencia', label: 'Transfer.',  emoji: '🏦' },
];

const PROPINAS = [5, 10, 15];

export default function CarritoPOS({ lineas, total, count, onAgregar, onQuitar, onEliminar, onVaciar }) {
  const { user, negocio }           = useAuth();
  const { empleadoActivo }          = useEmployee();
  const [metodo, setMetodo]         = useState('efectivo');
  const [recibidoRaw, setRecibidoRaw] = useState('');
  const [loading, setLoading]       = useState(false);
  const [ordenConfirmada, setOrdenConfirmada] = useState(null);

  // Propina
  const [propinaPct, setPropinaPct] = useState(null); // null | 5 | 10 | 15

  const propinaMonto   = propinaPct ? Math.round(total * propinaPct / 100) : 0;
  const totalConPropina = total + propinaMonto;

  const recibidoNum     = parseInt(recibidoRaw, 10) || 0;
  const recibidoDisplay = recibidoRaw ? new Intl.NumberFormat('es-CO').format(recibidoNum) : '';
  const cambio          = metodo === 'efectivo' ? recibidoNum - totalConPropina : 0;
  const puedeCobrar     = lineas.length > 0 && (metodo !== 'efectivo' || recibidoNum >= totalConPropina);

  function handleRecibidoChange(e) {
    const soloDigitos = e.target.value.replace(/\D/g, '');
    setRecibidoRaw(soloDigitos);
  }

  function togglePropina(pct) {
    setPropinaPct(prev => prev === pct ? null : pct);
  }

  async function handleCobrar() {
    if (!puedeCobrar) return;
    setLoading(true);
    try {
      const lineasParaGuardar = lineas.map(({ producto, cantidad }) => ({
        productoId: producto.id,
        nombre:     producto.nombre,
        precio:     producto.precio,
        cantidad,
        subtotal:   producto.precio * cantidad,
      }));

      const ref = await addDoc(collection(db, 'negocios', user.uid, 'ordenes'), {
        lineas:        lineasParaGuardar,
        subtotal:      total,
        propina:       propinaPct ? { porcentaje: propinaPct, monto: propinaMonto } : null,
        total:         totalConPropina,
        metodoPago:    metodo,
        recibido:      metodo === 'efectivo' ? recibidoNum : null,
        cambio:        metodo === 'efectivo' ? cambio : null,
        empleadoUid:   user.uid,
        empleadoEmail: user.email,
        empleadoNombre: empleadoActivo?.nombre ?? null,
        creadoEn:      serverTimestamp(),
        estado:        'pagada',
      });

      toast.success('Orden guardada ✓');

      setOrdenConfirmada({
        id:       ref.id,
        lineas:   lineasParaGuardar,
        subtotal: total,
        propina:  propinaPct ? { porcentaje: propinaPct, monto: propinaMonto } : null,
        total:    totalConPropina,
        metodo,
        recibido: metodo === 'efectivo' ? recibidoNum : null,
        cambio:   metodo === 'efectivo' ? cambio : null,
        cajero:   empleadoActivo?.nombre ?? user.email,
        fecha:    new Date(),
      });
    } catch (err) {
      toast.error('Error al guardar la orden. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  async function handleImprimir() {
    if (!ordenConfirmada) return;
    try {
      const blob = await pdf(
        <TicketPDF orden={ordenConfirmada} negocio={negocio} />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch {
      toast.error('Error al generar el ticket PDF.');
    }
  }

  function handleWhatsApp() {
    if (!ordenConfirmada) return;
    const { lineas: ls, subtotal, propina, total: t, metodo: met, fecha } = ordenConfirmada;
    const fechaStr = fecha.toLocaleString('es-CO', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

    const items = ls.map(l => `▫ ${l.cantidad}× ${l.nombre}   ${formatCOP(l.subtotal)}`).join('\n');
    const propinaTxt = propina?.monto > 0 ? `\nPropina (${propina.porcentaje}%): ${formatCOP(propina.monto)}` : '';
    const metodoLabel = METODOS.find(m => m.id === met)?.label ?? met;

    const texto = [
      `*🧾 Ticket — ${negocio?.nombre ?? 'mezo'}*`,
      `Orden #${ordenConfirmada.id.slice(-6).toUpperCase()} | ${fechaStr}`,
      '',
      items,
      '',
      `Subtotal: ${formatCOP(subtotal)}`,
      propinaTxt,
      `*Total: ${formatCOP(t)}*`,
      '',
      `Pago: ${metodoLabel} ✅`,
      '¡Gracias por tu visita! 🙏',
    ].filter(Boolean).join('\n');

    window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank');
  }

  function handleNuevaOrden() {
    onVaciar();
    setRecibidoRaw('');
    setMetodo('efectivo');
    setPropinaPct(null);
    setOrdenConfirmada(null);
  }

  // Pantalla de confirmación
  if (ordenConfirmada) {
    const { metodo: met, cambio: c, total: t, subtotal, propina } = ordenConfirmada;
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 px-5">
        <span style={{ fontSize: 56 }}>✅</span>
        <p className="text-mezo-cream font-display text-2xl font-medium">¡Cobrado!</p>

        {/* Resumen */}
        <div className="w-full bg-mezo-ink-muted rounded-mezo-lg px-4 py-3 space-y-1.5 text-sm font-body">
          {propina?.monto > 0 && (
            <div className="flex justify-between">
              <span className="text-mezo-stone">Subtotal</span>
              <span className="text-mezo-cream-dim font-mono">{formatCOP(subtotal)}</span>
            </div>
          )}
          {propina?.monto > 0 && (
            <div className="flex justify-between">
              <span className="text-mezo-stone">Propina {propina.porcentaje}%</span>
              <span className="text-mezo-cream-dim font-mono">{formatCOP(propina.monto)}</span>
            </div>
          )}
          <div className="flex justify-between font-semibold">
            <span className="text-mezo-stone">Total</span>
            <span className="text-mezo-gold font-mono font-bold">{formatCOP(t)}</span>
          </div>
          {met === 'efectivo' && c > 0 && (
            <div className="flex justify-between pt-1 border-t border-mezo-ink-line">
              <span className="text-mezo-stone">Cambio</span>
              <span className="text-mezo-verde font-mono font-bold">{formatCOP(c)}</span>
            </div>
          )}
        </div>

        {/* Botones ticket */}
        <div className="flex gap-3 w-full">
          <button onClick={handleImprimir}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-mezo-ink-line text-mezo-cream-dim hover:text-mezo-cream hover:border-mezo-gold/40 rounded-mezo-md text-sm font-body font-medium transition">
            <Printer size={14} /> Imprimir PDF
          </button>
          <button onClick={handleWhatsApp}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-mezo-verde/40 text-mezo-verde hover:bg-mezo-verde/10 rounded-mezo-md text-sm font-body font-medium transition">
            <MessageCircle size={14} /> WhatsApp
          </button>
        </div>

        <button onClick={handleNuevaOrden}
          className="w-full bg-mezo-gold hover:bg-mezo-gold-deep text-mezo-ink font-semibold py-2.5 rounded-mezo-md text-sm font-body transition">
          Nueva orden
        </button>
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

        {/* Propina */}
        {lineas.length > 0 && (
          <div>
            <p className="text-mezo-stone font-body text-xs uppercase tracking-widest mb-2">
              Propina <span className="normal-case text-mezo-stone/60">(opcional)</span>
            </p>
            <div className="flex gap-1.5">
              {PROPINAS.map(pct => (
                <button key={pct}
                  onClick={() => togglePropina(pct)}
                  className={`flex-1 py-1.5 rounded-mezo-md text-xs font-body font-semibold border transition
                    ${propinaPct === pct
                      ? 'bg-mezo-gold/15 border-mezo-gold text-mezo-gold'
                      : 'border-mezo-ink-line text-mezo-stone hover:border-mezo-gold/40 hover:text-mezo-cream'}`}>
                  {pct}%
                </button>
              ))}
              {propinaPct && (
                <button onClick={() => setPropinaPct(null)}
                  className="px-2 text-mezo-stone hover:text-mezo-rojo border border-mezo-ink-line rounded-mezo-md text-xs transition">
                  ✕
                </button>
              )}
            </div>
            {propinaPct && (
              <p className="text-mezo-stone font-body text-xs mt-1.5">
                Propina: <span className="text-mezo-gold font-mono font-medium">{formatCOP(propinaMonto)}</span>
              </p>
            )}
          </div>
        )}

        {/* Total */}
        <div className="space-y-1">
          {propinaPct && (
            <div className="flex items-center justify-between text-xs font-body text-mezo-stone">
              <span>Subtotal</span>
              <span className="font-mono">{formatCOP(total)}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-mezo-stone font-body text-sm">Total</span>
            <span className="text-mezo-cream font-mono font-bold text-xl">{formatCOP(totalConPropina)}</span>
          </div>
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
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={recibidoDisplay}
                onChange={handleRecibidoChange}
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
          {loading ? 'Guardando...' : `Cobrar ${lineas.length > 0 ? formatCOP(totalConPropina) : ''}`}
        </button>
      </div>
    </div>
  );
}
