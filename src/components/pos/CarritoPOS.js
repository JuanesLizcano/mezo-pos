import { useState, useRef } from 'react';
import { Trash2, Plus, Minus, ShoppingCart, Printer, MessageCircle, User, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { pdf } from '@react-pdf/renderer';
import { createOrden, deliverOrden, createVenta, createCuenta, getCliente, registrarVisita } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { useEmployee } from '../../context/EmployeeContext';
import { formatCOP } from '../../utils/formatters';
import TicketPDF from './Ticket';

const METODOS = [
  { id: 'efectivo',      label: 'Efectivo',   emoji: '💵', backendValue: 'CASH'      },
  { id: 'datafono',      label: 'Datáfono',   emoji: '💳', backendValue: 'CARD'      },
  { id: 'nequi',         label: 'Nequi',      emoji: '📱', backendValue: 'NEQUI'     },
  { id: 'daviplata',     label: 'Daviplata',  emoji: '🔵', backendValue: 'DAVIPLATA' },
  { id: 'transferencia', label: 'Transfer.',  emoji: '🏦', backendValue: 'TRANSFER'  },
];

const PROPINAS = [5, 10, 15];

export default function CarritoPOS({ lineas, total, count, onAgregar, onQuitar, onEliminar, onVaciar }) {
  const { user, negocio, bumpVersion }   = useAuth();
  const { empleadoActivo, turnoId }       = useEmployee();
  const [metodo, setMetodo]               = useState('efectivo');
  const [recibidoRaw, setRecibidoRaw]     = useState('');
  const [loading, setLoading]             = useState(false);
  const [ordenConfirmada, setOrdenConfirmada] = useState(null);
  const [tipoCuenta, setTipoCuenta]       = useState('mostrador');
  const [cuentaNombre, setCuentaNombre]   = useState('');
  const [propinaPct, setPropinaPct]       = useState(null);
  const [celularLealtad, setCelularLealtad] = useState('');
  const [clienteInfo, setClienteInfo]     = useState(null); // { visitas, frecuente }
  const lealtadTimerRef = useRef(null);

  const propinaMonto    = propinaPct ? Math.round(total * propinaPct / 100) : 0;
  const totalConPropina = total + propinaMonto;
  const recibidoNum     = parseInt(recibidoRaw, 10) || 0;
  const recibidoDisplay = recibidoRaw ? new Intl.NumberFormat('es-CO').format(recibidoNum) : '';
  const cambio          = metodo === 'efectivo' ? recibidoNum - totalConPropina : 0;
  const puedeCobrar     = lineas.length > 0 && (metodo !== 'efectivo' || recibidoNum >= totalConPropina);

  function handleRecibidoChange(e) {
    setRecibidoRaw(e.target.value.replace(/\D/g, ''));
  }

  // Consulta el cliente al escribir 10 dígitos (con debounce 600ms)
  function handleCelularChange(e) {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
    setCelularLealtad(val);
    setClienteInfo(null);
    if (lealtadTimerRef.current) clearTimeout(lealtadTimerRef.current);
    if (val.length === 10) {
      lealtadTimerRef.current = setTimeout(async () => {
        try {
          const cli = await getCliente(val);
          setClienteInfo(cli ? { visitas: cli.visitas, frecuente: cli.visitas >= 9 } : { visitas: 0, frecuente: false });
        } catch { /* silencioso */ }
      }, 600);
    }
  }

  function togglePropina(pct) {
    setPropinaPct(prev => prev === pct ? null : pct);
  }

  async function handleGuardarCuenta() {
    if (!lineas.length || !cuentaNombre.trim()) return;
    setLoading(true);
    try {
      const lineasGuardar = lineas.map(({ producto, cantidad }) => ({
        productoId: producto.id,
        nombre:     producto.nombre,
        precio:     producto.precio,
        cantidad,
        subtotal:   producto.precio * cantidad,
      }));
      await createCuenta({
        nombre:         cuentaNombre.trim(),
        lineas:         lineasGuardar,
        total:          totalConPropina,
        estado:         'abierta',
        empleadoNombre: empleadoActivo?.nombre ?? null,
      });
      bumpVersion();
      toast.success(`Cuenta "${cuentaNombre.trim()}" abierta ✓`);
      onVaciar();
      setCuentaNombre('');
      setTipoCuenta('mostrador');
    } catch {
      toast.error('Error al abrir la cuenta.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCobrar() {
    if (!puedeCobrar) return;
    setLoading(true);
    try {
      // Items con los nombres de campo del backend
      const items = lineas.map(({ producto, cantidad }) => ({
        productId: producto.id,
        name:      producto.nombre,
        unitPrice: producto.precio,
        quantity:  cantidad,
        subtotal:  producto.precio * cantidad,
      }));

      // Paso 1 — POST /orders → estado OPEN
      const orden = await createOrden({
        items,
        tableId:      null,
        employeeName: empleadoActivo?.nombre ?? null,
        shiftId:      turnoId ?? null,
      });

      // Paso 2 — POST /orders/{id}/deliver → estado DELIVERED
      await deliverOrden(orden.id);

      // Paso 3 — POST /sales → cierra la venta con método de pago
      const paymentMethod = METODOS.find(m => m.id === metodo)?.backendValue ?? 'CASH';
      const venta = await createVenta({
        orderId:       orden.id,
        paymentMethod,
        subtotal:      total,
        tip:           propinaPct ? { percentage: propinaPct, amount: propinaMonto } : null,
        total:         totalConPropina,
        amountPaid:    metodo === 'efectivo' ? recibidoNum : null,
        change:        metodo === 'efectivo' ? cambio : null,
      });

      bumpVersion();
      toast.success('Orden guardada ✓');

      // Registrar visita de lealtad si hay celular
      let clienteFinal = null;
      if (celularLealtad.length === 10) {
        try {
          clienteFinal = await registrarVisita(celularLealtad);
        } catch { /* silencioso */ }
      }

      setOrdenConfirmada({
        id:         orden.id,
        lineas:     items,
        subtotal:   total,
        propina:    propinaPct ? { porcentaje: propinaPct, monto: propinaMonto } : null,
        total:      totalConPropina,
        metodo,
        recibido:   metodo === 'efectivo' ? recibidoNum : null,
        cambio:     metodo === 'efectivo' ? cambio : null,
        cajero:     empleadoActivo?.nombre ?? user?.email,
        fecha:      new Date(),
        numFactura: venta.saleNumber,
        // Lealtad: visitas actualizadas tras esta compra
        clienteVisitas: clienteFinal?.visitas ?? null,
        clienteFrecuente: clienteFinal ? clienteFinal.visitas >= 10 : false,
      });
    } catch {
      toast.error('Error al guardar la orden. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  async function handleImprimir() {
    if (!ordenConfirmada) return;
    try {
      const blob = await pdf(<TicketPDF orden={ordenConfirmada} negocio={negocio} />).toBlob();
      const url  = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch {
      toast.error('Error al generar el ticket PDF.');
    }
  }

  function handleWhatsApp() {
    if (!ordenConfirmada) return;
    const { lineas: ls, subtotal, propina, total: t, metodo: met, fecha } = ordenConfirmada;
    const fechaStr  = fecha.toLocaleString('es-CO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    const items     = ls.map(l => `▫ ${l.quantity}× ${l.name}   ${formatCOP(l.subtotal)}`).join('\n');
    const propinaTxt = propina?.monto > 0 ? `\nPropina (${propina.porcentaje}%): ${formatCOP(propina.monto)}` : '';
    const metodoLabel = METODOS.find(m => m.id === met)?.label ?? met;
    const texto = [
      `*🧾 Ticket — ${negocio?.name ?? 'mezo'}*`,
      `Orden #${ordenConfirmada.id.slice(-6).toUpperCase()} | ${fechaStr}`,
      '', items, '',
      `Subtotal: ${formatCOP(subtotal)}`,
      propinaTxt,
      `*Total: ${formatCOP(t)}*`,
      '', `Pago: ${metodoLabel} ✅`,
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
    setCelularLealtad('');
    setClienteInfo(null);
  }

  // ── Pantalla de confirmación ────────────────────────────────────────────────
  if (ordenConfirmada) {
    const { metodo: met, cambio: c, total: t, subtotal, propina,
            clienteVisitas, clienteFrecuente } = ordenConfirmada;
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 px-5">
        <span style={{ fontSize: 56 }}>{clienteFrecuente ? '🎉' : '✅'}</span>
        <p className="text-mezo-cream font-display text-2xl font-medium">¡Cobrado!</p>

        {/* Badge cliente frecuente */}
        {clienteFrecuente && (
          <div className="w-full flex items-center gap-2 px-4 py-3 rounded-mezo-lg"
            style={{ background: 'rgba(200,144,63,0.12)', border: '1px solid rgba(200,144,63,0.4)' }}>
            <Star size={16} className="text-mezo-gold flex-shrink-0" />
            <div>
              <p className="text-mezo-gold font-body font-semibold text-sm">¡Cliente frecuente!</p>
              <p className="text-mezo-stone font-body text-xs">{clienteVisitas} compras · Ofrécele un beneficio especial 🙌</p>
            </div>
          </div>
        )}
        {clienteVisitas !== null && !clienteFrecuente && clienteVisitas > 0 && (
          <p className="text-mezo-stone font-body text-xs text-center">
            Visita #{clienteVisitas} registrada · Le faltan {10 - clienteVisitas} para ser cliente frecuente
          </p>
        )}

        <div className="w-full bg-mezo-ink-muted rounded-mezo-lg px-4 py-3 space-y-1.5 text-sm font-body">
          {propina?.monto > 0 && (
            <>
              <div className="flex justify-between">
                <span className="text-mezo-stone">Subtotal</span>
                <span className="text-mezo-cream-dim font-mono">{formatCOP(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-mezo-stone">Propina {propina.porcentaje}%</span>
                <span className="text-mezo-cream-dim font-mono">{formatCOP(propina.monto)}</span>
              </div>
            </>
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

  // ── Vista principal del carrito ─────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full overflow-hidden">
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

      <div className="flex-shrink-0 border-t border-mezo-ink-line px-5 pt-4 pb-5 space-y-4">
        {lineas.length > 0 && (
          <div>
            <p className="text-mezo-stone font-body text-xs uppercase tracking-widest mb-2">
              Propina <span className="normal-case text-mezo-stone/60">(opcional)</span>
            </p>
            <div className="flex gap-1.5">
              {PROPINAS.map(pct => (
                <button key={pct} onClick={() => togglePropina(pct)}
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

        <div className="grid grid-cols-5 gap-1.5">
          {METODOS.map(m => (
            <button key={m.id} onClick={() => setMetodo(m.id)}
              className={`flex flex-col items-center gap-0.5 py-2 rounded-mezo-md border text-xs font-body transition
                ${metodo === m.id
                  ? 'bg-mezo-gold/15 border-mezo-gold text-mezo-gold'
                  : 'border-mezo-ink-line text-mezo-stone hover:border-mezo-gold/40 hover:text-mezo-cream'}`}>
              <span style={{ fontSize: 16 }}>{m.emoji}</span>
              <span style={{ fontSize: 10 }}>{m.label}</span>
            </button>
          ))}
        </div>

        {metodo === 'efectivo' && (
          <div className="space-y-2">
            <div>
              <label className="block text-xs font-body text-mezo-stone mb-1 uppercase tracking-widest">
                Recibido
              </label>
              <input type="text" inputMode="numeric" placeholder="0"
                value={recibidoDisplay} onChange={handleRecibidoChange}
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

        {lineas.length > 0 && (
          <div className="flex gap-1.5">
            <button onClick={() => setTipoCuenta('mostrador')}
              className={`flex-1 py-2 rounded-mezo-md text-xs font-body font-semibold border transition
                ${tipoCuenta === 'mostrador'
                  ? 'bg-mezo-gold/15 border-mezo-gold text-mezo-gold'
                  : 'border-mezo-ink-line text-mezo-stone hover:border-mezo-gold/40'}`}>
              🧾 Mostrador
            </button>
            <button onClick={() => setTipoCuenta('nombre')}
              className={`flex-1 py-2 rounded-mezo-md text-xs font-body font-semibold border transition
                ${tipoCuenta === 'nombre'
                  ? 'bg-mezo-gold/15 border-mezo-gold text-mezo-gold'
                  : 'border-mezo-ink-line text-mezo-stone hover:border-mezo-gold/40'}`}>
              <span className="flex items-center justify-center gap-1"><User size={11} />A nombre de</span>
            </button>
          </div>
        )}

        {tipoCuenta === 'nombre' && lineas.length > 0 && (
          <input type="text" placeholder="Nombre del cliente o mesa…"
            value={cuentaNombre} onChange={e => setCuentaNombre(e.target.value)}
            className="w-full px-3 py-2 bg-mezo-ink-muted border border-mezo-ink-line text-mezo-cream font-body text-sm rounded-mezo-md focus:outline-none focus:ring-2 focus:ring-mezo-gold focus:border-transparent"
          />
        )}

        {/* Campo celular para programa de lealtad */}
        {tipoCuenta === 'mostrador' && lineas.length > 0 && (
          <div>
            <label className="block text-xs font-body text-mezo-stone mb-1 uppercase tracking-widest">
              Celular cliente <span className="normal-case text-mezo-stone/50">(lealtad, opcional)</span>
            </label>
            <div className="relative">
              <input
                type="tel"
                inputMode="numeric"
                placeholder="300 123 4567"
                value={celularLealtad}
                onChange={handleCelularChange}
                maxLength={10}
                className="w-full px-3 py-2 bg-mezo-ink-muted border border-mezo-ink-line text-mezo-cream font-body text-sm rounded-mezo-md focus:outline-none focus:ring-2 focus:ring-mezo-gold focus:border-transparent transition"
              />
              {celularLealtad.length === 10 && clienteInfo !== null && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {clienteInfo.frecuente
                    ? <Star size={13} className="text-mezo-gold" />
                    : <span className="text-mezo-stone font-body" style={{ fontSize: 10 }}>
                        V.{clienteInfo.visitas + 1}
                      </span>}
                </div>
              )}
            </div>
            {celularLealtad.length === 10 && clienteInfo?.frecuente && (
              <p className="text-mezo-gold font-body text-xs mt-1">⭐ Cliente frecuente ({clienteInfo.visitas} visitas)</p>
            )}
          </div>
        )}

        {tipoCuenta === 'nombre' ? (
          <button onClick={handleGuardarCuenta}
            disabled={!lineas.length || !cuentaNombre.trim() || loading}
            className="w-full py-3 rounded-mezo-md font-semibold font-body text-sm transition bg-mezo-gold hover:bg-mezo-gold-deep text-mezo-ink disabled:opacity-40 disabled:cursor-not-allowed">
            {loading ? 'Guardando...' : `Abrir cuenta ${cuentaNombre.trim() ? `"${cuentaNombre.trim()}"` : ''}`}
          </button>
        ) : (
          <button onClick={handleCobrar}
            disabled={!puedeCobrar || loading}
            className="w-full py-3 rounded-mezo-md font-semibold font-body text-sm transition bg-mezo-gold hover:bg-mezo-gold-deep text-mezo-ink disabled:opacity-40 disabled:cursor-not-allowed">
            {loading ? 'Guardando...' : `Cobrar ${lineas.length > 0 ? formatCOP(totalConPropina) : ''}`}
          </button>
        )}
      </div>
    </div>
  );
}
