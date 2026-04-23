import { useState } from 'react';
import { X, Check } from 'lucide-react';
import { formatCOP } from '../../utils/formatters';

const METODOS = [
  { id: 'efectivo',      label: 'Efectivo',   emoji: '💵' },
  { id: 'datafono',      label: 'Datáfono',   emoji: '💳' },
  { id: 'nequi',         label: 'Nequi',      emoji: '📱' },
  { id: 'daviplata',     label: 'Daviplata',  emoji: '🔵' },
  { id: 'transferencia', label: 'Transfer.',  emoji: '🏦' },
];

function initPersonas(n, total) {
  const porPersona = Math.floor(total / n);
  const residuo    = total - porPersona * n;
  return Array.from({ length: n }, (_, i) => ({
    id:     i + 1,
    monto:  i === 0 ? porPersona + residuo : porPersona, // el primero absorbe el residuo
    metodo: 'efectivo',
    pagado: false,
  }));
}

export default function ModalDivisionCuenta({ mesa, onCerrar }) {
  const totalMesa = mesa.total ?? 0;
  const lineas    = mesa.lineas ?? [];

  const [numPersonas, setNumPersonas] = useState(2);
  const [personas, setPersonas]       = useState(() => initPersonas(2, totalMesa));
  const [productoAsignado, setProductoAsignado] = useState(
    // Si hay lineas, iniciar cada item sin asignar (null)
    lineas.reduce((acc, l, i) => ({ ...acc, [i]: null }), {})
  );
  const [modoVista, setModoVista] = useState(lineas.length > 0 ? 'productos' : 'montos');

  function cambiarNumPersonas(n) {
    setNumPersonas(n);
    setPersonas(initPersonas(n, totalMesa));
    setProductoAsignado(lineas.reduce((acc, _, i) => ({ ...acc, [i]: null }), {}));
  }

  function togglePagado(id) {
    setPersonas(prev =>
      prev.map(p => p.id === id ? { ...p, pagado: !p.pagado } : p)
    );
  }

  function cambiarMetodo(id, metodo) {
    setPersonas(prev =>
      prev.map(p => p.id === id ? { ...p, metodo } : p)
    );
  }

  function asignarProducto(lineaIdx, personaId) {
    setProductoAsignado(prev => ({ ...prev, [lineaIdx]: personaId }));
  }

  // Calcular montos por persona desde productos asignados
  function calcularMontoDesdeProductos(personaId) {
    return lineas.reduce((sum, linea, i) => {
      if (productoAsignado[i] === personaId) return sum + (linea.subtotal ?? linea.precio * linea.cantidad);
      return sum;
    }, 0);
  }

  const montoPagado    = personas.filter(p => p.pagado).reduce((s, p) => s + p.monto, 0);
  const montoRestante  = totalMesa - montoPagado;
  const todoPagado     = montoRestante <= 0;
  const lineasSinAsignar = modoVista === 'productos'
    ? Object.values(productoAsignado).filter(v => v === null).length
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(8,7,6,0.88)' }}>
      <div className="bg-mezo-ink-raised border border-mezo-ink-line rounded-mezo-xl w-full max-w-lg shadow-mezo-lg max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-mezo-ink-line flex-shrink-0">
          <div>
            <p className="text-mezo-stone font-body text-xs uppercase tracking-widest">Mesa {mesa.numero}</p>
            <h3 className="text-mezo-cream font-body font-semibold text-lg mt-0.5">Dividir cuenta</h3>
          </div>
          <button onClick={onCerrar} className="text-mezo-stone hover:text-mezo-cream transition">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">

          {/* Total mesa */}
          <div className="flex items-center justify-between bg-mezo-ink-muted rounded-mezo-lg px-4 py-3">
            <span className="text-mezo-stone font-body text-sm">Total de la mesa</span>
            <span className="text-mezo-cream font-mono font-bold text-lg">{formatCOP(totalMesa)}</span>
          </div>

          {/* Selector número de personas */}
          <div>
            <p className="text-mezo-stone font-body text-xs uppercase tracking-widest mb-3">¿Entre cuántas personas?</p>
            <div className="flex gap-2">
              {[2, 3, 4, 5, 6, 7, 8].map(n => (
                <button key={n}
                  onClick={() => cambiarNumPersonas(n)}
                  className={`flex-1 py-2.5 rounded-mezo-md text-sm font-body font-semibold transition
                    ${numPersonas === n
                      ? 'bg-mezo-gold text-mezo-ink'
                      : 'border border-mezo-ink-line text-mezo-stone hover:text-mezo-cream hover:border-mezo-gold/40'}`}>
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Toggle modo si hay productos */}
          {lineas.length > 0 && (
            <div className="flex gap-2">
              {['productos', 'montos'].map(m => (
                <button key={m}
                  onClick={() => setModoVista(m)}
                  className={`flex-1 py-2 rounded-mezo-md text-sm font-body font-medium border transition
                    ${modoVista === m
                      ? 'bg-mezo-gold/15 border-mezo-gold text-mezo-gold'
                      : 'border-mezo-ink-line text-mezo-stone hover:text-mezo-cream'}`}>
                  {m === 'productos' ? '🍽️ Por producto' : '💰 Por monto'}
                </button>
              ))}
            </div>
          )}

          {/* Vista por productos */}
          {modoVista === 'productos' && lineas.length > 0 && (
            <div className="space-y-2">
              <p className="text-mezo-stone font-body text-xs uppercase tracking-widest">
                Asignar productos a cada persona
                {lineasSinAsignar > 0 && (
                  <span className="text-mezo-gold ml-2 normal-case">({lineasSinAsignar} sin asignar)</span>
                )}
              </p>
              {lineas.map((linea, i) => (
                <div key={i} className="bg-mezo-ink-muted rounded-mezo-lg px-4 py-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-mezo-cream font-body text-sm font-medium">{linea.nombre}</span>
                    <span className="text-mezo-stone font-mono text-xs">
                      {linea.cantidad}× {formatCOP(linea.precio)}
                    </span>
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {personas.map(p => (
                      <button key={p.id}
                        onClick={() => asignarProducto(i, p.id)}
                        className={`px-2.5 py-1 rounded-mezo-sm text-xs font-body font-medium transition
                          ${productoAsignado[i] === p.id
                            ? 'bg-mezo-gold text-mezo-ink'
                            : 'border border-mezo-ink-line text-mezo-stone hover:border-mezo-gold/40'}`}>
                        Persona {p.id}
                      </button>
                    ))}
                    {productoAsignado[i] !== null && (
                      <button onClick={() => asignarProducto(i, null)}
                        className="text-mezo-stone hover:text-mezo-rojo text-xs px-2 py-1 font-body transition">
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Lista de personas con su monto y método de pago */}
          <div className="space-y-3">
            <p className="text-mezo-stone font-body text-xs uppercase tracking-widest">Cobrar por persona</p>
            {personas.map(p => {
              const montoPersona = modoVista === 'productos'
                ? calcularMontoDesdeProductos(p.id)
                : p.monto;

              return (
                <div key={p.id}
                  className={`rounded-mezo-lg border transition ${p.pagado ? 'border-mezo-verde/40 bg-mezo-verde/5' : 'border-mezo-ink-line bg-mezo-ink-muted'}`}>
                  <div className="px-4 py-3">
                    {/* Cabecera persona */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-mezo-cream font-body font-semibold text-sm">
                        Persona {p.id}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-mezo-cream font-mono font-bold text-base">
                          {formatCOP(montoPersona)}
                        </span>
                        <button
                          onClick={() => togglePagado(p.id)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center border transition
                            ${p.pagado
                              ? 'bg-mezo-verde border-mezo-verde text-white'
                              : 'border-mezo-ink-line text-mezo-stone hover:border-mezo-verde/60'}`}>
                          <Check size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Selector de método */}
                    {!p.pagado && (
                      <div className="flex gap-1.5">
                        {METODOS.map(m => (
                          <button key={m.id}
                            onClick={() => cambiarMetodo(p.id, m.id)}
                            className={`flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-mezo-sm border text-xs font-body transition
                              ${p.metodo === m.id
                                ? 'bg-mezo-gold/15 border-mezo-gold text-mezo-gold'
                                : 'border-mezo-ink-line text-mezo-stone hover:border-mezo-gold/30'}`}>
                            <span style={{ fontSize: 14 }}>{m.emoji}</span>
                            <span style={{ fontSize: 9 }}>{m.label}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {p.pagado && (
                      <p className="text-mezo-verde font-body text-xs font-medium flex items-center gap-1">
                        <Check size={11} /> Pagado con {METODOS.find(m => m.id === p.metodo)?.label}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Resumen */}
          <div className="bg-mezo-ink-muted rounded-mezo-lg px-4 py-3 space-y-2">
            <div className="flex justify-between text-sm font-body">
              <span className="text-mezo-stone">Pagado</span>
              <span className="text-mezo-verde font-mono font-bold">{formatCOP(montoPagado)}</span>
            </div>
            <div className="flex justify-between text-sm font-body">
              <span className="text-mezo-stone">Restante</span>
              <span className={`font-mono font-bold ${montoRestante > 0 ? 'text-mezo-gold' : 'text-mezo-verde'}`}>
                {formatCOP(Math.max(0, montoRestante))}
              </span>
            </div>
          </div>

          {todoPagado && (
            <div className="text-center py-3">
              <span style={{ fontSize: 36 }}>🎉</span>
              <p className="text-mezo-verde font-body font-semibold mt-1">¡Cuenta completamente pagada!</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-6 pb-5 pt-3 border-t border-mezo-ink-line">
          <button onClick={onCerrar}
            className="w-full border border-mezo-ink-line text-mezo-cream-dim font-semibold py-2.5 rounded-mezo-md text-sm hover:bg-mezo-ink-muted transition font-body">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
