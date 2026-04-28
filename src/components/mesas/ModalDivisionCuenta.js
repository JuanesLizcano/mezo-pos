import { useState } from 'react';
import { X, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { pdf } from '@react-pdf/renderer';
import { formatCOP } from '../../utils/formatters';
import { createOrden, deliverOrden, createVenta, updateMesa } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { useEmployee } from '../../context/EmployeeContext';
import TicketPDF from '../pos/Ticket';

const PASOS = ['Personas', 'Productos', 'Cobro'];

const METODOS = [
  { id: 'efectivo',      label: 'Efectivo',  emoji: '💵', backendValue: 'CASH'      },
  { id: 'datafono',      label: 'Datáfono',  emoji: '💳', backendValue: 'CARD'      },
  { id: 'nequi',         label: 'Nequi',     emoji: '📱', backendValue: 'NEQUI'     },
  { id: 'daviplata',     label: 'Daviplata', emoji: '🔵', backendValue: 'DAVIPLATA' },
  { id: 'transferencia', label: 'Transfer.', emoji: '🏦', backendValue: 'TRANSFER'  },
];

function initPersonas(n) {
  return Array.from({ length: n }, (_, i) => ({ id: i + 1, nombre: `Persona ${i + 1}` }));
}

export default function ModalDivisionCuenta({ mesa, onCerrar }) {
  const { bumpVersion, negocio }    = useAuth();
  const { empleadoActivo, turnoId } = useEmployee();

  const totalMesa = mesa.total ?? 0;
  const lineas    = mesa.lineas ?? [];

  // ── Pasos y asignaciones ────────────────────────────────────────────────────
  const [paso, setPaso]               = useState(1);
  const [numPersonas, setNumPersonas] = useState(2);
  const [personas, setPersonas]       = useState(() => initPersonas(2));
  const [asignaciones, setAsignaciones] = useState(
    () => lineas.reduce((acc, _, i) => ({ ...acc, [i]: [] }), {})
  );

  // ── Estado de cobros inline ─────────────────────────────────────────────────
  const [pagados, setPagados]                   = useState({});
  const [personaCobrandoId, setPersonaCobrandoId] = useState(null);
  const [metodoCobro, setMetodoCobro]           = useState('efectivo');
  const [recibidoRaw, setRecibidoRaw]           = useState('');
  const [loadingCobro, setLoadingCobro]         = useState(false);
  const [todasPagadas, setTodasPagadas]         = useState(false);

  // Pantalla intermedia tras cobrar cada persona
  // null | { personaId, nombre, total, metodo, recibido, cambio, nuevosPagados, todasYa }
  const [pendientePostCobro, setPendientePostCobro] = useState(null);

  // Resumen para la pantalla final — capturado antes de que bumpVersion limpie la mesa
  const [resumenFinal, setResumenFinal] = useState(null);

  // ── Helpers paso 1 y 2 ─────────────────────────────────────────────────────
  function cambiarNumPersonas(n) {
    setNumPersonas(n);
    setPersonas(initPersonas(n));
    setAsignaciones(lineas.reduce((acc, _, i) => ({ ...acc, [i]: [] }), {}));
  }

  function editarNombre(id, nombre) {
    setPersonas(prev => prev.map(p => p.id === id ? { ...p, nombre } : p));
  }

  function toggleAsignacion(lineaIdx, personaId) {
    setAsignaciones(prev => {
      const actual = prev[lineaIdx] || [];
      return {
        ...prev,
        [lineaIdx]: actual.includes(personaId)
          ? actual.filter(id => id !== personaId)
          : [...actual, personaId],
      };
    });
  }

  // ── Cálculos ────────────────────────────────────────────────────────────────
  function calcularMontoPersona(personaId) {
    return lineas.reduce((sum, linea, i) => {
      const asig = asignaciones[i] || [];
      if (!asig.includes(personaId)) return sum;
      const subtotal = linea.subtotal ?? linea.precio * linea.cantidad;
      return sum + Math.round(subtotal / asig.length);
    }, 0);
  }

  function calcularLineasParaCobro(personaId) {
    return lineas
      .map((linea, i) => ({ linea, i }))
      .filter(({ i }) => (asignaciones[i] || []).includes(personaId))
      .map(({ linea, i }) => {
        const numAsig = (asignaciones[i] || []).length;
        const sub     = Math.round((linea.subtotal ?? linea.precio * linea.cantidad) / numAsig);
        return {
          productId: `${linea.productoId || linea.productId || `item${i}`}_p${personaId}`,
          name:      numAsig > 1 ? `${linea.nombre} (÷${numAsig})` : linea.nombre,
          unitPrice: sub,
          quantity:  1,
          subtotal:  sub,
        };
      });
  }

  const totalAsignado   = lineas.reduce((sum, linea, i) => {
    if ((asignaciones[i] || []).length === 0) return sum;
    return sum + (linea.subtotal ?? linea.precio * linea.cantidad);
  }, 0);
  const sinAsignar      = totalMesa - totalAsignado;
  const sinAsignarCount = Object.values(asignaciones).filter(a => a.length === 0).length;

  const personasConItems = personas.filter(p => calcularLineasParaCobro(p.id).length > 0);

  const personaCobrando = personas.find(p => p.id === personaCobrandoId);
  const montoCobrando   = personaCobrando ? calcularMontoPersona(personaCobrando.id) : 0;
  const recibidoNum     = parseInt(recibidoRaw, 10) || 0;
  const recibidoDisplay = recibidoRaw ? new Intl.NumberFormat('es-CO').format(recibidoNum) : '';
  const cambio          = metodoCobro === 'efectivo' ? recibidoNum - montoCobrando : 0;
  const puedeCobrar     = Boolean(personaCobrandoId) &&
                          (metodoCobro !== 'efectivo' || recibidoNum >= montoCobrando);

  // ── Cobro de una persona — registra en API y muestra pantalla intermedia ────
  async function handleCobrarPersona() {
    if (!puedeCobrar || loadingCobro) return;
    setLoadingCobro(true);
    try {
      const items     = calcularLineasParaCobro(personaCobrandoId);
      const subtotal  = items.reduce((s, l) => s + l.subtotal, 0);
      const backendMethod = METODOS.find(m => m.id === metodoCobro)?.backendValue ?? 'CASH';

      const orden = await createOrden({
        items,
        tableId:      mesa.id,
        employeeName: empleadoActivo?.nombre ?? null,
        shiftId:      turnoId ?? null,
      });
      await deliverOrden(orden.id);
      await createVenta({
        orderId:       orden.id,
        paymentMethod: backendMethod,
        subtotal,
        tip:           null,
        total:         subtotal,
        amountPaid:    metodoCobro === 'efectivo' ? recibidoNum : null,
        change:        metodoCobro === 'efectivo' ? cambio : null,
      });

      const nuevosPagados = {
        ...pagados,
        [personaCobrandoId]: {
          metodo:   metodoCobro,
          items,
          total:    subtotal,
          recibido: metodoCobro === 'efectivo' ? recibidoNum : null,
          cambio:   metodoCobro === 'efectivo' ? cambio      : null,
        },
      };
      setPagados(nuevosPagados);

      const todasYa = personasConItems.every(p => nuevosPagados[p.id]);

      // Mostrar pantalla intermedia en vez de avanzar automáticamente
      setPendientePostCobro({
        personaId:     personaCobrandoId,
        nombre:        personaCobrando?.nombre ?? `Persona ${personaCobrandoId}`,
        total:         subtotal,
        metodo:        metodoCobro,
        recibido:      metodoCobro === 'efectivo' ? recibidoNum : null,
        cambio:        metodoCobro === 'efectivo' ? cambio      : null,
        nuevosPagados,
        todasYa,
      });
      setPersonaCobrandoId(null);
      setMetodoCobro('efectivo');
      setRecibidoRaw('');
    } catch {
      toast.error('Error al procesar el cobro. Intenta de nuevo.');
    } finally {
      setLoadingCobro(false);
    }
  }

  // ── Avanzar desde pantalla intermedia ──────────────────────────────────────
  async function handleContinuarTrasPersona() {
    if (!pendientePostCobro) return;
    const { nuevosPagados, todasYa } = pendientePostCobro;
    setPendientePostCobro(null);

    if (todasYa) {
      // Calcular total real antes de limpiar la mesa (bumpVersion puede vaciar lineas)
      const totalReal = Object.values(nuevosPagados).reduce((s, p) => s + p.total, 0);
      const personasResumen = personasConItems.map(p => ({
        nombre: p.nombre,
        ...nuevosPagados[p.id],
      }));
      setResumenFinal({ total: totalReal, personas: personasResumen });

      try {
        await updateMesa(mesa.id, { estado: 'libre', ocupadaEn: null, total: null, lineas: null });
      } catch { /* mesa ya pudo haber sido liberada */ }
      bumpVersion();
      setTodasPagadas(true);
    } else {
      const siguiente = personasConItems.find(p => !nuevosPagados[p.id]);
      setPersonaCobrandoId(siguiente?.id ?? null);
    }
  }

  // ── Ticket individual por persona ──────────────────────────────────────────
  async function handleImprimirPersona(personaId) {
    const cobro   = pagados[personaId];
    const persona = personas.find(p => p.id === personaId);
    if (!cobro) return;
    try {
      const orden = {
        id:         `div-${mesa.id}-p${personaId}`,
        lineas:     cobro.items,
        subtotal:   cobro.total,
        propina:    null,
        total:      cobro.total,
        metodo:     cobro.metodo,
        recibido:   cobro.recibido,
        cambio:     cobro.cambio,
        cajero:     null,
        fecha:      new Date(),
        numFactura: null,
        cliente:    null,
      };
      const blob = await pdf(
        <TicketPDF
          orden={orden}
          negocio={negocio}
          tituloOrden={`Mesa ${mesa.numero} — Cuenta de ${persona?.nombre ?? 'Persona'}`}
        />
      ).toBlob();
      window.open(URL.createObjectURL(blob), '_blank');
    } catch {
      toast.error('Error al generar el ticket PDF.');
    }
  }

  // ── Resumen completo con todas las personas ────────────────────────────────
  async function handleImprimirResumen() {
    if (!resumenFinal) return;
    try {
      // Agrupar ítems de todas las personas etiquetando a quién corresponde
      const lineasResumen = resumenFinal.personas.flatMap(p =>
        (p.items ?? []).map(item => ({
          ...item,
          name: `${p.nombre}: ${item.name}`,
        }))
      );
      const orden = {
        id:         `resumen-${mesa.id}`,
        lineas:     lineasResumen,
        subtotal:   resumenFinal.total,
        propina:    null,
        total:      resumenFinal.total,
        metodo:     'varios',
        recibido:   null,
        cambio:     null,
        cajero:     null,
        fecha:      new Date(),
        numFactura: null,
        cliente:    null,
      };
      const blob = await pdf(
        <TicketPDF
          orden={orden}
          negocio={negocio}
          tituloOrden={`Resumen Mesa ${mesa.numero} — División`}
        />
      ).toBlob();
      window.open(URL.createObjectURL(blob), '_blank');
    } catch {
      toast.error('Error al generar el resumen.');
    }
  }

  // Compartir ticket por WhatsApp
  function handleWhatsAppPersona(personaId) {
    const cobro   = pagados[personaId];
    const persona = personas.find(p => p.id === personaId);
    if (!cobro) return;
    const { items, total, metodo } = cobro;
    const fechaStr    = new Date().toLocaleString('es-CO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    const itemsTxt    = items.map(l => `▫ ${l.quantity}× ${l.name}   ${formatCOP(l.subtotal)}`).join('\n');
    const metodoLabel = METODOS.find(m => m.id === metodo)?.label ?? metodo;
    const texto = [
      `*🧾 Ticket — ${negocio?.name ?? 'mezo'}*`,
      `Mesa ${mesa.numero} — Cuenta de ${persona?.nombre ?? 'Persona'}`,
      fechaStr, '',
      itemsTxt, '',
      `*Total: ${formatCOP(total)}*`, '',
      `Pago: ${metodoLabel} ✅`,
      '¡Gracias por tu visita! 🙏',
    ].filter(Boolean).join('\n');
    window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank');
  }

  // ── Pantalla intermedia — persona recién cobrada ────────────────────────────
  if (pendientePostCobro) {
    const { personaId, nombre, total, cambio: cambioPost, recibido: recibidoPost, todasYa } = pendientePostCobro;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
        style={{ background: 'rgba(8,7,6,0.88)' }}>
        <div className="bg-mezo-ink-raised border border-mezo-ink-line rounded-mezo-xl w-full max-w-sm p-8 text-center shadow-mezo-lg">
          <div style={{ fontSize: 52 }}>✅</div>
          <p className="text-mezo-cream font-body font-semibold text-xl mt-4">{nombre} cobrado/a</p>
          <p className="font-mono font-bold text-mezo-gold text-2xl mt-1">{formatCOP(total)}</p>

          {/* Cambio si pagó en efectivo */}
          {recibidoPost > 0 && cambioPost > 0 && (
            <p className="text-mezo-verde font-body text-sm mt-1">
              Cambio: {formatCOP(cambioPost)}
            </p>
          )}

          {todasYa && (
            <p className="text-mezo-stone font-body text-xs mt-2">
              Última persona — la mesa quedará liberada
            </p>
          )}

          {/* Acciones de impresión */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => handleImprimirPersona(personaId)}
              className="flex-1 py-2.5 rounded-mezo-md text-sm font-body font-semibold border transition"
              style={{ background: 'rgba(200,144,63,0.1)', borderColor: 'rgba(200,144,63,0.4)', color: '#C8903F' }}>
              🖨️ Imprimir ticket
            </button>
            <button
              onClick={() => handleWhatsAppPersona(personaId)}
              className="flex-1 py-2.5 rounded-mezo-md text-sm font-body font-semibold border transition"
              style={{ background: 'rgba(61,170,104,0.08)', borderColor: 'rgba(61,170,104,0.3)', color: '#3DAA68' }}>
              📱 WhatsApp
            </button>
          </div>

          {/* Continuar — avanza a la siguiente persona o a la pantalla final */}
          <button
            onClick={handleContinuarTrasPersona}
            className="mt-3 w-full py-3 rounded-mezo-md text-sm font-body font-semibold border transition"
            style={{ borderColor: '#2A2520', color: '#F4ECD8' }}>
            Continuar →
          </button>
        </div>
      </div>
    );
  }

  // ── Pantalla final — todas pagadas ──────────────────────────────────────────
  if (todasPagadas) {
    const totalMostrar  = resumenFinal?.total ?? 0;
    const numPersonasCobradas = resumenFinal?.personas?.length ?? 0;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
        style={{ background: 'rgba(8,7,6,0.88)' }}>
        <div className="bg-mezo-ink-raised border border-mezo-ink-line rounded-mezo-xl w-full max-w-sm p-8 text-center shadow-mezo-lg">
          <div style={{ fontSize: 56 }}>✅</div>
          <p className="text-mezo-cream font-display text-2xl font-medium mt-4 leading-tight">
            ¡Todas pagadas!
          </p>
          <p className="font-mono font-bold text-mezo-gold text-2xl mt-1">{formatCOP(totalMostrar)}</p>
          <p className="text-mezo-verde font-body text-sm mt-1">Mesa {mesa.numero} liberada ✓</p>
          <p className="text-mezo-stone font-body text-xs mt-0.5">
            {numPersonasCobradas} persona{numPersonasCobradas !== 1 ? 's' : ''} cobrada{numPersonasCobradas !== 1 ? 's' : ''}
          </p>

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleImprimirResumen}
              className="flex-1 py-2.5 rounded-mezo-md text-sm font-body font-semibold border transition"
              style={{ background: 'rgba(200,144,63,0.1)', borderColor: 'rgba(200,144,63,0.4)', color: '#C8903F' }}>
              🖨️ Imprimir resumen completo
            </button>
          </div>

          <button onClick={onCerrar}
            className="mt-3 w-full bg-mezo-gold hover:bg-mezo-gold-deep text-mezo-ink font-semibold py-3 rounded-mezo-md text-sm font-body transition">
            Volver a Mesas
          </button>
        </div>
      </div>
    );
  }

  const anchoPaso3 = paso === 3 && personaCobrandoId;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(8,7,6,0.88)' }}>
      <div className={`bg-mezo-ink-raised border border-mezo-ink-line rounded-mezo-xl w-full shadow-mezo-lg max-h-[92vh] flex flex-col transition-all duration-200 ${anchoPaso3 ? 'max-w-3xl' : 'max-w-lg'}`}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-mezo-ink-line flex-shrink-0">
          <div>
            <p className="text-mezo-stone font-body text-xs uppercase tracking-widest">
              Mesa {mesa.numero} · {formatCOP(totalMesa)}
            </p>
            <h3 className="text-mezo-cream font-body font-semibold text-lg mt-0.5">Dividir cuenta</h3>
          </div>
          <button onClick={onCerrar} className="text-mezo-stone hover:text-mezo-cream transition">
            <X size={18} />
          </button>
        </div>

        {/* Indicador de pasos */}
        <div className="flex items-center px-6 py-3 border-b border-mezo-ink-line flex-shrink-0">
          {PASOS.map((p, i) => {
            const num      = i + 1;
            const activo   = num === paso;
            const completado = num < paso;
            return (
              <div key={p} className="flex items-center">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center font-body text-xs font-bold transition"
                    style={{
                      background: activo ? '#C8903F' : completado ? '#3DAA68' : 'rgba(42,37,32,0.8)',
                      color:      activo || completado ? '#080706' : '#6B6055',
                    }}>
                    {completado ? '✓' : num}
                  </div>
                  <span className={`font-body text-xs font-medium ${activo ? 'text-mezo-gold' : 'text-mezo-stone'}`}>
                    {p}
                  </span>
                </div>
                {i < PASOS.length - 1 && (
                  <div className="w-8 h-px mx-3" style={{ background: '#2A2520' }} />
                )}
              </div>
            );
          })}
        </div>

        {/* Pasos 1 y 2 */}
        {paso !== 3 && (
          <div className="flex-1 overflow-y-auto px-6 py-4">

            {/* PASO 1: Personas */}
            {paso === 1 && (
              <div className="space-y-5">
                <div>
                  <p className="text-mezo-stone font-body text-xs uppercase tracking-widest mb-3">
                    ¿Entre cuántas personas?
                  </p>
                  <div className="flex gap-2">
                    {[2, 3, 4, 5, 6, 7, 8].map(n => (
                      <button key={n} onClick={() => cambiarNumPersonas(n)}
                        className={`flex-1 py-2.5 rounded-mezo-md text-sm font-body font-semibold transition
                          ${numPersonas === n
                            ? 'bg-mezo-gold text-mezo-ink'
                            : 'border border-mezo-ink-line text-mezo-stone hover:text-mezo-cream hover:border-mezo-gold/40'}`}>
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-mezo-stone font-body text-xs uppercase tracking-widest mb-3">
                    Nombres (opcional)
                  </p>
                  <div className="space-y-2">
                    {personas.map(p => (
                      <div key={p.id} className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-full flex items-center justify-center font-body text-xs font-bold flex-shrink-0"
                          style={{ background: 'rgba(200,144,63,0.15)', color: '#C8903F', border: '1px solid rgba(200,144,63,0.3)' }}>
                          {p.id}
                        </span>
                        <input
                          type="text" value={p.nombre} onChange={e => editarNombre(p.id, e.target.value)}
                          placeholder={`Persona ${p.id}`}
                          className="flex-1 px-3 py-2 bg-mezo-ink-muted border border-mezo-ink-line text-mezo-cream font-body text-sm rounded-mezo-md focus:outline-none focus:ring-2 focus:ring-mezo-gold/40 transition placeholder-mezo-stone/60"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* PASO 2: Asignar productos */}
            {paso === 2 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-mezo-stone font-body text-xs uppercase tracking-widest">
                    Asignar a cada persona
                  </p>
                  {sinAsignarCount > 0 && (
                    <span className="text-mezo-gold font-body text-xs">{sinAsignarCount} sin asignar</span>
                  )}
                </div>

                <div className="rounded-mezo-lg overflow-hidden border border-mezo-ink-line">
                  {lineas.length === 0 ? (
                    <div className="px-4 py-8 text-center text-mezo-stone font-body text-sm">
                      Esta mesa no tiene productos registrados
                    </div>
                  ) : lineas.map((linea, i) => {
                    const asig     = asignaciones[i] || [];
                    const subtotal = linea.subtotal ?? linea.precio * linea.cantidad;
                    return (
                      <div key={i} className="px-4 py-3 border-b border-mezo-ink-line last:border-0">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-mezo-cream font-body text-sm font-medium">
                            {linea.cantidad > 1 ? `${linea.cantidad}× ` : ''}{linea.nombre}
                          </span>
                          <span className="text-mezo-stone font-mono text-xs ml-3">
                            {formatCOP(subtotal)}
                          </span>
                        </div>
                        <div className="flex gap-1.5 flex-wrap">
                          {personas.map(p => (
                            <button key={p.id} onClick={() => toggleAsignacion(i, p.id)}
                              className={`px-2.5 py-1 rounded-mezo-sm text-xs font-body font-medium transition
                                ${asig.includes(p.id)
                                  ? 'bg-mezo-gold text-mezo-ink'
                                  : 'border border-mezo-ink-line text-mezo-stone hover:border-mezo-gold/40 hover:text-mezo-cream'}`}>
                              {p.nombre.split(' ')[0]}
                            </button>
                          ))}
                          {asig.length > 0 && (
                            <button onClick={() => setAsignaciones(prev => ({ ...prev, [i]: [] }))}
                              className="text-mezo-stone hover:text-mezo-rojo text-xs px-1.5 py-1 font-body transition">
                              ✕
                            </button>
                          )}
                        </div>
                        {asig.length > 1 && (
                          <p className="text-mezo-stone font-body mt-1.5" style={{ fontSize: 10 }}>
                            Dividido entre {asig.length}: {formatCOP(Math.round(subtotal / asig.length))} c/u
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>

                {sinAsignar > 0 && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-mezo-md border"
                    style={{ background: 'rgba(200,144,63,0.08)', borderColor: 'rgba(200,144,63,0.3)' }}>
                    <span className="text-mezo-gold font-body text-xs">
                      ⚠️ Faltan {formatCOP(sinAsignar)} por asignar
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* PASO 3: Cobro inline con dos columnas en desktop */}
        {paso === 3 && (
          <div className="flex flex-1 overflow-hidden">

            {/* Columna izquierda — lista de personas */}
            <div className={`flex flex-col overflow-y-auto px-5 py-4
              ${personaCobrandoId
                ? 'hidden md:flex md:w-64 md:flex-shrink-0 md:border-r md:border-mezo-ink-line'
                : 'flex-1'}`}>

              <p className="text-mezo-stone font-body text-xs uppercase tracking-widest mb-3">
                Cobrar por persona
              </p>

              <div className="space-y-2 flex-1">
                {personas.map(p => {
                  const monto      = calcularMontoPersona(p.id);
                  const tieneItems = calcularLineasParaCobro(p.id).length > 0;
                  const pagado     = pagados[p.id];
                  const activo     = personaCobrandoId === p.id;
                  return (
                    <div key={p.id}
                      className="rounded-mezo-lg border overflow-hidden"
                      style={{
                        borderColor: pagado ? '#3DAA68' : activo ? '#C8903F' : '#2A2520',
                        background:  pagado ? 'rgba(61,170,104,0.05)' : activo ? 'rgba(200,144,63,0.07)' : 'rgba(255,255,255,0.02)',
                      }}>
                      <div className="px-3 py-2.5">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full flex items-center justify-center font-body text-xs font-bold flex-shrink-0"
                              style={{
                                background: pagado ? 'rgba(61,170,104,0.2)' : 'rgba(200,144,63,0.15)',
                                color:      pagado ? '#3DAA68' : '#C8903F',
                                border:     `1px solid ${pagado ? 'rgba(61,170,104,0.4)' : 'rgba(200,144,63,0.3)'}`,
                              }}>
                              {pagado ? '✓' : p.id}
                            </span>
                            <span className="text-mezo-cream font-body text-sm font-medium truncate">{p.nombre}</span>
                          </div>
                          <span className="font-mono font-bold text-sm flex-shrink-0 ml-2"
                            style={{ color: pagado ? '#3DAA68' : '#F4ECD8' }}>
                            {formatCOP(monto)}
                          </span>
                        </div>

                        {pagado && (
                          <>
                            <p className="text-mezo-verde font-body text-xs">Pagado ✓</p>
                            <div className="flex gap-1.5 mt-1.5">
                              <button
                                onClick={() => handleImprimirPersona(p.id)}
                                className="flex-1 py-1 rounded-mezo-sm text-xs font-body font-medium transition border"
                                style={{ background: 'rgba(200,144,63,0.08)', borderColor: 'rgba(200,144,63,0.3)', color: '#C8903F' }}>
                                🖨️ Ticket
                              </button>
                              <button
                                onClick={() => handleWhatsAppPersona(p.id)}
                                className="flex-1 py-1 rounded-mezo-sm text-xs font-body font-medium transition border"
                                style={{ background: 'rgba(61,170,104,0.08)', borderColor: 'rgba(61,170,104,0.3)', color: '#3DAA68' }}>
                                📱 WhatsApp
                              </button>
                            </div>
                          </>
                        )}
                        {!pagado && !tieneItems && (
                          <p className="text-mezo-stone font-body text-xs">Sin productos asignados</p>
                        )}
                        {!pagado && tieneItems && (
                          <button
                            onClick={() => { setPersonaCobrandoId(p.id); setMetodoCobro('efectivo'); setRecibidoRaw(''); }}
                            className="w-full py-1.5 rounded-mezo-sm text-xs font-body font-semibold transition mt-1"
                            style={activo
                              ? { background: 'rgba(200,144,63,0.2)', color: '#C8903F', border: '1px solid rgba(200,144,63,0.5)' }
                              : { background: 'rgba(200,144,63,0.1)', color: '#C8903F', border: '1px solid rgba(200,144,63,0.3)' }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(200,144,63,0.25)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = activo ? 'rgba(200,144,63,0.2)' : 'rgba(200,144,63,0.1)'; }}>
                            {activo ? '← Cobrando ahora' : 'Cobrar →'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Resumen total */}
              <div className="mt-4 rounded-mezo-md px-3 py-2.5 border border-mezo-ink-line space-y-1 flex-shrink-0">
                <div className="flex justify-between text-xs font-body">
                  <span className="text-mezo-stone">Total asignado</span>
                  <span className="font-mono text-mezo-cream">{formatCOP(totalAsignado)}</span>
                </div>
                {sinAsignar > 0 && (
                  <div className="flex justify-between text-xs font-body">
                    <span className="text-mezo-gold">Sin asignar</span>
                    <span className="font-mono text-mezo-gold">{formatCOP(sinAsignar)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Columna derecha — panel de cobro */}
            {personaCobrandoId && personaCobrando && (
              <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col">

                <button onClick={() => setPersonaCobrandoId(null)}
                  className="flex items-center gap-1.5 text-mezo-stone hover:text-mezo-cream text-xs font-body mb-4 md:hidden transition">
                  <ChevronLeft size={14} /> Volver a división
                </button>

                <p className="text-mezo-stone font-body text-xs uppercase tracking-widest mb-1">Cobrar a</p>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-mezo-cream font-body font-semibold text-lg">{personaCobrando.nombre}</p>
                  <p className="font-mono font-bold text-2xl" style={{ color: '#C8903F' }}>{formatCOP(montoCobrando)}</p>
                </div>

                {/* Ítems de la persona */}
                <div className="bg-mezo-ink-muted rounded-mezo-md px-3 py-2.5 mb-4 space-y-1">
                  {calcularLineasParaCobro(personaCobrandoId).map((l, j) => (
                    <p key={j} className="text-mezo-stone font-body" style={{ fontSize: 11 }}>
                      · {l.name}: {formatCOP(l.subtotal)}
                    </p>
                  ))}
                </div>

                {/* Método de pago */}
                <p className="text-mezo-stone font-body text-xs uppercase tracking-widest mb-2">Método de pago</p>
                <div className="grid grid-cols-5 gap-1.5 mb-4">
                  {METODOS.map(m => (
                    <button key={m.id}
                      onClick={() => { setMetodoCobro(m.id); setRecibidoRaw(''); }}
                      className={`flex flex-col items-center gap-0.5 py-2 rounded-mezo-md border text-xs font-body transition
                        ${metodoCobro === m.id
                          ? 'bg-mezo-gold/15 border-mezo-gold text-mezo-gold'
                          : 'border-mezo-ink-line text-mezo-stone hover:border-mezo-gold/40 hover:text-mezo-cream'}`}>
                      <span style={{ fontSize: 16 }}>{m.emoji}</span>
                      <span style={{ fontSize: 9 }}>{m.label}</span>
                    </button>
                  ))}
                </div>

                {/* Recibido en efectivo */}
                {metodoCobro === 'efectivo' && (
                  <div className="space-y-2 mb-4">
                    <div>
                      <label className="block text-xs font-body text-mezo-stone mb-1 uppercase tracking-widest">
                        Recibido
                      </label>
                      <input type="text" inputMode="numeric" placeholder="0"
                        value={recibidoDisplay}
                        onChange={e => setRecibidoRaw(e.target.value.replace(/\D/g, ''))}
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

                <button onClick={handleCobrarPersona}
                  disabled={!puedeCobrar || loadingCobro}
                  className="mt-auto w-full py-3 rounded-mezo-md text-sm font-body font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: '#C8903F', color: '#080706' }}
                  onMouseEnter={e => { if (!loadingCobro) e.currentTarget.style.background = '#B8802F'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#C8903F'; }}>
                  {loadingCobro ? 'Procesando...' : `Cobrar ${formatCOP(montoCobrando)} →`}
                </button>
              </div>
            )}

            {!personaCobrandoId && (
              <div className="hidden md:flex flex-1 items-center justify-center">
                <p className="text-mezo-stone font-body text-sm">← Selecciona una persona para cobrar</p>
              </div>
            )}
          </div>
        )}

        {/* Footer — navegación entre pasos */}
        {(paso < 3 || (paso === 3 && !personaCobrandoId)) && (
          <div className="flex-shrink-0 px-6 pb-5 pt-3 border-t border-mezo-ink-line flex gap-3">
            {paso > 1 ? (
              <button onClick={() => setPaso(p => p - 1)}
                className="flex items-center gap-1.5 px-4 py-2.5 border border-mezo-ink-line text-mezo-cream-dim font-semibold rounded-mezo-md text-sm hover:bg-mezo-ink-muted transition font-body">
                <ChevronLeft size={15} /> Atrás
              </button>
            ) : (
              <button onClick={onCerrar}
                className="px-4 py-2.5 border border-mezo-ink-line text-mezo-cream-dim font-semibold rounded-mezo-md text-sm hover:bg-mezo-ink-muted transition font-body">
                Cancelar
              </button>
            )}

            {paso < 3 ? (
              <button onClick={() => setPaso(p => p + 1)}
                className="flex-1 flex items-center justify-center gap-1.5 bg-mezo-gold hover:bg-mezo-gold-deep text-mezo-ink font-semibold py-2.5 rounded-mezo-md text-sm transition font-body">
                {paso === 1 ? 'Asignar productos' : 'Ver resumen'} →
              </button>
            ) : (
              <button onClick={onCerrar}
                className="flex-1 border border-mezo-ink-line text-mezo-cream-dim font-semibold py-2.5 rounded-mezo-md text-sm hover:bg-mezo-ink-muted transition font-body">
                Cerrar
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
