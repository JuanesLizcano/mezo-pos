import { useState } from 'react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatCOP } from '../../utils/formatters';

const PASOS = ['Personas', 'Productos', 'Cobro'];

function initPersonas(n) {
  return Array.from({ length: n }, (_, i) => ({ id: i + 1, nombre: `Persona ${i + 1}` }));
}

export default function ModalDivisionCuenta({ mesa, onCerrar }) {
  const navigate  = useNavigate();
  const totalMesa = mesa.total ?? 0;
  const lineas    = mesa.lineas ?? [];

  const [paso, setPaso]           = useState(1);
  const [numPersonas, setNumPersonas] = useState(2);
  const [personas, setPersonas]   = useState(() => initPersonas(2));
  const [asignaciones, setAsignaciones] = useState(
    () => lineas.reduce((acc, _, i) => ({ ...acc, [i]: [] }), {})
  );

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
        const subtotalPersona = Math.round(
          (linea.subtotal ?? linea.precio * linea.cantidad) / numAsig
        );
        return {
          productId: `${linea.productoId || linea.productId || `item${i}`}_p${personaId}`,
          nombre:    numAsig > 1 ? `${linea.nombre} (÷${numAsig})` : linea.nombre,
          precio:    subtotalPersona,
          cantidad:  1,
        };
      });
  }

  const totalAsignado = lineas.reduce((sum, linea, i) => {
    if ((asignaciones[i] || []).length === 0) return sum;
    return sum + (linea.subtotal ?? linea.precio * linea.cantidad);
  }, 0);
  const sinAsignar      = totalMesa - totalAsignado;
  const sinAsignarCount = Object.values(asignaciones).filter(a => a.length === 0).length;

  function cobrarPersona(persona) {
    const lineasCobro = calcularLineasParaCobro(persona.id);
    if (!lineasCobro.length) return;
    onCerrar();
    navigate(`/pos?mesaId=${mesa.id}`, {
      state: { lineasDivision: lineasCobro, personaNombre: persona.nombre },
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(8,7,6,0.88)' }}>
      <div className="bg-mezo-ink-raised border border-mezo-ink-line rounded-mezo-xl w-full max-w-lg shadow-mezo-lg max-h-[92vh] flex flex-col">

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
            const num       = i + 1;
            const activo    = num === paso;
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

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto px-6 py-4">

          {/* ── PASO 1: Personas ── */}
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
                        type="text"
                        value={p.nombre}
                        onChange={e => editarNombre(p.id, e.target.value)}
                        placeholder={`Persona ${p.id}`}
                        className="flex-1 px-3 py-2 bg-mezo-ink-muted border border-mezo-ink-line text-mezo-cream font-body text-sm rounded-mezo-md focus:outline-none focus:ring-2 focus:ring-mezo-gold/40 transition placeholder-mezo-stone/60"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── PASO 2: Asignar productos ── */}
          {paso === 2 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-mezo-stone font-body text-xs uppercase tracking-widest">
                  Asignar a cada persona
                </p>
                {sinAsignarCount > 0 && (
                  <span className="text-mezo-gold font-body text-xs">
                    {sinAsignarCount} sin asignar
                  </span>
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
                          <button key={p.id}
                            onClick={() => toggleAsignacion(i, p.id)}
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

          {/* ── PASO 3: Cobro por persona ── */}
          {paso === 3 && (
            <div className="space-y-3">
              <p className="text-mezo-stone font-body text-xs uppercase tracking-widest">Cobrar por persona</p>

              {personas.map(p => {
                const monto      = calcularMontoPersona(p.id);
                const lineasP    = calcularLineasParaCobro(p.id);
                const tieneItems = lineasP.length > 0;
                return (
                  <div key={p.id} className="bg-mezo-ink-muted rounded-mezo-lg border border-mezo-ink-line overflow-hidden">
                    <div className="px-4 py-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full flex items-center justify-center font-body text-xs font-bold"
                            style={{ background: 'rgba(200,144,63,0.15)', color: '#C8903F', border: '1px solid rgba(200,144,63,0.3)' }}>
                            {p.id}
                          </span>
                          <span className="text-mezo-cream font-body font-semibold text-sm">{p.nombre}</span>
                        </div>
                        <span className="text-mezo-cream font-mono font-bold text-lg">{formatCOP(monto)}</span>
                      </div>

                      {tieneItems ? (
                        <div className="mb-3 space-y-0.5">
                          {lineasP.map((l, j) => (
                            <p key={j} className="text-mezo-stone font-body" style={{ fontSize: 11 }}>
                              · {l.nombre}: {formatCOP(l.precio)}
                            </p>
                          ))}
                        </div>
                      ) : (
                        <p className="text-mezo-stone font-body text-xs mb-3">Sin productos asignados</p>
                      )}

                      <button
                        onClick={() => cobrarPersona(p)}
                        disabled={!tieneItems}
                        className="w-full py-2 rounded-mezo-md text-sm font-body font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed"
                        style={tieneItems
                          ? { background: 'rgba(200,144,63,0.18)', color: '#C8903F', border: '1px solid rgba(200,144,63,0.5)' }
                          : { background: 'rgba(42,37,32,0.5)', color: '#6B6055', border: '1px solid #2A2520' }}
                        onMouseEnter={e => { if (tieneItems) e.currentTarget.style.background = 'rgba(200,144,63,0.3)'; }}
                        onMouseLeave={e => { if (tieneItems) e.currentTarget.style.background = 'rgba(200,144,63,0.18)'; }}>
                        {tieneItems
                          ? `Cobrar a ${p.nombre.split(' ')[0]} · ${formatCOP(monto)}`
                          : 'Sin productos'}
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Resumen total */}
              <div className="bg-mezo-ink-muted/50 rounded-mezo-lg px-4 py-3 border border-mezo-ink-line space-y-1.5">
                <div className="flex justify-between text-sm font-body">
                  <span className="text-mezo-stone">Total asignado</span>
                  <span className="text-mezo-cream font-mono font-bold">{formatCOP(totalAsignado)}</span>
                </div>
                {sinAsignar > 0 && (
                  <div className="flex justify-between text-sm font-body">
                    <span className="text-mezo-gold">Sin asignar</span>
                    <span className="text-mezo-gold font-mono font-bold">{formatCOP(sinAsignar)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-body border-t border-mezo-ink-line pt-1.5">
                  <span className="text-mezo-stone">Total mesa</span>
                  <span className="text-mezo-gold font-mono font-bold">{formatCOP(totalMesa)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer — navegación entre pasos */}
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
              {paso === 1 ? 'Asignar productos' : 'Ver resumen'}
              <ChevronRight size={15} />
            </button>
          ) : (
            <button onClick={onCerrar}
              className="flex-1 border border-mezo-ink-line text-mezo-cream-dim font-semibold py-2.5 rounded-mezo-md text-sm hover:bg-mezo-ink-muted transition font-body">
              Cerrar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
