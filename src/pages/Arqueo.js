import { useState, useMemo, useEffect } from 'react';
import { Calculator, Plus, TrendingUp, TrendingDown, AlertTriangle, ChevronDown, ChevronRight, History, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/layout/Navbar';
import { useOrdenes } from '../hooks/useOrdenes';
import { useMovimientos } from '../hooks/useMovimientos';
import { useEmployee } from '../context/EmployeeContext';
import { useDia } from '../context/DiaContext';
import { createMovimiento, getTurnoActivo } from '../services';
import { useAuth } from '../context/AuthContext';
import { formatCOP } from '../utils/formatters';

const METODOS = [
  { id: 'CASH',      label: 'Efectivo',      emoji: '💵' },
  { id: 'CARD',      label: 'Datáfono',      emoji: '💳' },
  { id: 'NEQUI',     label: 'Nequi',         emoji: '📱' },
  { id: 'DAVIPLATA', label: 'Daviplata',      emoji: '🔵' },
  { id: 'TRANSFER',  label: 'Transferencia', emoji: '🏦' },
];

const MOTIVOS = {
  ingreso: [
    'Cambio de billete',
    'Anticipo de cliente',
    'Reposición de base',
    'Cobro externo',
    'Otro ingreso',
  ],
  egreso: [
    'Pago a proveedor',
    'Compra de insumos',
    'Gastos de operación',
    'Vuelto de caja',
    'Retiro del dueño',
    'Otro gasto',
  ],
};

function calcularSistema(ordenes) {
  const sistema = {};
  METODOS.forEach(m => { sistema[m.id] = 0; });
  ordenes.forEach(o => {
    if (o.paymentMethod && sistema[o.paymentMethod] !== undefined) {
      sistema[o.paymentMethod] += o.total ?? 0;
    }
  });
  return sistema;
}

function ModalMovimiento({ onGuardar, onCerrar }) {
  const [tipo,    setTipo]    = useState('ingreso');
  const [desc,    setDesc]    = useState('');
  const [monto,   setMonto]   = useState('');
  const [loading, setLoading] = useState(false);

  function seleccionarMotivo(motivo) {
    setDesc(motivo);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!desc.trim() || !monto) return;
    setLoading(true);
    await onGuardar({ tipo, descripcion: desc.trim(), monto: Number(monto) });
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(8,7,6,0.85)' }}>
      <div className="bg-mezo-ink-raised border border-mezo-ink-line rounded-mezo-xl p-6 w-full max-w-sm shadow-mezo-lg">
        <h3 className="font-semibold text-mezo-cream font-body text-lg mb-5">Agregar movimiento</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tipo */}
          <div className="flex gap-2">
            {[
              { id: 'ingreso', label: 'Ingreso', color: '#3DAA68' },
              { id: 'egreso',  label: 'Egreso',  color: '#C8573F' },
            ].map(t => (
              <button key={t.id} type="button" onClick={() => { setTipo(t.id); setDesc(''); }}
                className="flex-1 py-2.5 rounded-mezo-md text-sm font-body font-semibold border transition"
                style={tipo === t.id
                  ? { background: `${t.color}18`, borderColor: t.color, color: t.color }
                  : { borderColor: '#2A2520', color: '#6B6055' }}>
                {t.id === 'ingreso' ? '↑' : '↓'} {t.label}
              </button>
            ))}
          </div>

          {/* Motivos rápidos */}
          <div>
            <p className="text-xs font-medium text-mezo-cream-dim uppercase tracking-widest mb-2 font-body">
              Motivo frecuente
            </p>
            <div className="flex flex-wrap gap-1.5">
              {MOTIVOS[tipo].map(m => (
                <button key={m} type="button"
                  onClick={() => seleccionarMotivo(m)}
                  className="px-2.5 py-1 rounded-mezo-sm text-xs font-body transition"
                  style={desc === m
                    ? { background: 'rgba(200,144,63,0.2)', color: '#C8903F', border: '1px solid rgba(200,144,63,0.5)' }
                    : { background: 'rgba(255,255,255,0.04)', color: '#6B6055', border: '1px solid #2A2520' }}>
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-xs font-medium text-mezo-cream-dim uppercase tracking-widest mb-2 font-body">
              Descripción
            </label>
            <input type="text" value={desc} onChange={e => setDesc(e.target.value)}
              placeholder="Ej: Cambio de billete, pago proveedor…"
              required
              className="w-full px-4 py-2.5 bg-mezo-ink-muted border border-mezo-ink-line text-mezo-cream placeholder-mezo-stone rounded-mezo-md text-sm focus:outline-none focus:ring-2 focus:ring-mezo-gold focus:border-transparent transition font-body"
            />
          </div>

          {/* Monto */}
          <div>
            <label className="block text-xs font-medium text-mezo-cream-dim uppercase tracking-widest mb-2 font-body">
              Monto (COP)
            </label>
            <input type="number" value={monto} onChange={e => setMonto(e.target.value)}
              placeholder="0" required min={1}
              className="w-full px-4 py-2.5 bg-mezo-ink-muted border border-mezo-ink-line text-mezo-cream placeholder-mezo-stone rounded-mezo-md text-sm focus:outline-none focus:ring-2 focus:ring-mezo-gold focus:border-transparent transition font-mono"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onCerrar}
              className="flex-1 border border-mezo-ink-line text-mezo-cream-dim font-semibold py-2.5 rounded-mezo-md text-sm hover:bg-mezo-ink-muted transition font-body">
              Cancelar
            </button>
            <button type="submit" disabled={loading}
              className="flex-[2] bg-mezo-gold hover:bg-mezo-gold-deep disabled:opacity-50 text-mezo-ink font-semibold py-2.5 rounded-mezo-md text-sm transition font-body">
              {loading ? 'Guardando…' : 'Agregar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function HistoricoArqueos() {
  const [abierto, setAbierto] = useState(false);
  const [expandido, setExpandido] = useState(null);

  const registros = (() => {
    try { return JSON.parse(localStorage.getItem('mezo_arqueo_historico') ?? '[]'); }
    catch { return []; }
  })();

  if (registros.length === 0) return null;

  return (
    <div className="bg-mezo-ink-raised border border-mezo-ink-line rounded-mezo-xl overflow-hidden">
      <button onClick={() => setAbierto(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-mezo-ink-muted/40 transition">
        <div className="flex items-center gap-2">
          <History size={16} className="text-mezo-stone" />
          <p className="text-mezo-cream font-body font-semibold text-base">Histórico de cierres</p>
          <span className="text-mezo-stone font-body text-xs px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(255,255,255,0.06)' }}>
            {registros.length}
          </span>
        </div>
        {abierto ? <ChevronDown size={16} className="text-mezo-stone" /> : <ChevronRight size={16} className="text-mezo-stone" />}
      </button>

      {abierto && (
        <div className="border-t border-mezo-ink-line divide-y divide-mezo-ink-line">
          {registros.slice().reverse().map((r, i) => (
            <div key={i}>
              <button onClick={() => setExpandido(expandido === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-3 hover:bg-mezo-ink-muted/30 transition text-left">
                <div>
                  <p className="text-mezo-cream font-body text-sm font-medium">
                    {new Date(r.fecha).toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'long' })}
                  </p>
                  <p className="text-mezo-stone font-body" style={{ fontSize: 11 }}>
                    Cerrado a las {new Date(r.fecha).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                    {r.cajero && ` · ${r.cajero}`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold text-mezo-gold text-sm">{formatCOP(r.totalSistema)}</p>
                  <p className="text-mezo-stone font-body" style={{ fontSize: 11 }}>
                    {r.diferencia === 0 ? '✓ Cuadrado' : r.diferencia > 0 ? `+${formatCOP(r.diferencia)}` : formatCOP(r.diferencia)}
                  </p>
                </div>
              </button>

              {expandido === i && (
                <div className="px-5 pb-4 space-y-1">
                  {METODOS.map(m => {
                    const sis  = r.sistema?.[m.id] ?? 0;
                    const real = r.real?.[m.id] ?? 0;
                    if (sis === 0 && real === 0) return null;
                    return (
                      <div key={m.id} className="flex items-center justify-between text-sm">
                        <span className="text-mezo-stone font-body">{m.emoji} {m.label}</span>
                        <div className="flex gap-4">
                          <span className="font-mono text-mezo-cream-dim">{formatCOP(sis)}</span>
                          {real > 0 && <span className="font-mono text-mezo-cream">{formatCOP(real)}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Arqueo() {
  const { bumpVersion }            = useAuth();
  const { empleadoActivo }         = useEmployee();
  const { cerrarDia }              = useDia();

  const hoy = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }, []);
  const { ordenes, loading: loadingOrdenes } = useOrdenes(hoy);
  const { movimientos, loading: loadingMov } = useMovimientos();

  const [conteoReal, setConteoReal] = useState(
    Object.fromEntries(METODOS.map(m => [m.id, '']))
  );
  const [modalMovimiento, setModalMovimiento] = useState(false);
  const [turnoActivo, setTurnoActivo]         = useState(null);
  const [confirmCierre, setConfirmCierre]     = useState(false);

  useEffect(() => {
    getTurnoActivo().then(setTurnoActivo).catch(() => {});
  }, []);

  function handleConteoChange(id, rawValue) {
    const soloDigitos = rawValue.replace(/\D/g, '');
    setConteoReal(prev => ({ ...prev, [id]: soloDigitos }));
  }

  function displayConteo(raw) {
    if (!raw) return '';
    return new Intl.NumberFormat('es-CO').format(Number(raw));
  }

  const sistema = useMemo(() => calcularSistema(ordenes), [ordenes]);
  const totalIngresos  = movimientos.filter(m => m.tipo === 'ingreso').reduce((s, m) => s + m.monto, 0);
  const totalEgresos   = movimientos.filter(m => m.tipo === 'egreso' ).reduce((s, m) => s + m.monto, 0);
  const netMovimientos = totalIngresos - totalEgresos;
  const totalSistema   = Object.values(sistema).reduce((s, v) => s + v, 0);
  const totalReal      = METODOS.reduce((s, m) => s + (parseFloat(conteoReal[m.id]) || 0), 0);
  const diferenciaTotalCOP = totalReal - totalSistema;

  async function handleAgregarMovimiento(datos) {
    try {
      await createMovimiento(datos);
      bumpVersion();
      toast.success(`Movimiento "${datos.descripcion}" registrado ✓`);
      setModalMovimiento(false);
    } catch {
      toast.error('Error al registrar el movimiento.');
    }
  }

  function handleCerrarDia() {
    const registro = {
      fecha:        new Date().toISOString(),
      cajero:       empleadoActivo?.nombre ?? null,
      totalSistema,
      totalReal,
      diferencia:   diferenciaTotalCOP,
      sistema:      { ...sistema },
      real:         Object.fromEntries(
        METODOS.map(m => [m.id, parseFloat(conteoReal[m.id]) || 0])
      ),
    };
    // DiaContext guarda en histórico y marca el día como cerrado
    cerrarDia(registro);
    setConteoReal(Object.fromEntries(METODOS.map(m => [m.id, ''])));
    setConfirmCierre(false);
    toast.success('Día cerrado y arqueo guardado en histórico ✓');
  }

  const loading = loadingOrdenes || loadingMov;

  return (
    <div className="min-h-screen bg-mezo-ink flex flex-col">
      <Navbar />

      <main className="flex-1 px-8 py-6 max-w-4xl mx-auto w-full">
        {/* Encabezado */}
        <div className="flex items-end justify-between mb-8">
          <div className="flex items-end gap-3">
            <Calculator size={32} className="text-mezo-gold mb-1" />
            <div>
              <p className="text-mezo-stone uppercase tracking-widest text-xs font-body">Turno</p>
              <h1 className="text-mezo-cream font-display font-medium leading-none"
                style={{ fontSize: 40, letterSpacing: '-0.02em', fontVariationSettings: '"SOFT" 50, "opsz" 72' }}>
                Arqueo de caja
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {empleadoActivo && (
              <p className="text-mezo-stone font-body text-sm">
                Cajero: <span className="text-mezo-cream font-medium">{empleadoActivo.nombre}</span>
              </p>
            )}
            <button onClick={() => setConfirmCierre(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-mezo-md text-sm font-body font-semibold border transition"
              style={{ background: 'rgba(200,144,63,0.1)', borderColor: 'rgba(200,144,63,0.4)', color: '#C8903F' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(200,144,63,0.2)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(200,144,63,0.1)'; }}>
              Cerrar día →
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-7 h-7 border-4 border-mezo-gold border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">

            {/* Resumen del día */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <ResumenCard label="Total sistema"  valor={formatCOP(totalSistema)}         sub={`${ordenes.length} órdenes`} color="#C8903F" />
              <ResumenCard label="Total contado"  valor={formatCOP(totalReal)}             sub="Según cajero"               color="#D9CEB5" />
              <ResumenCard label="Diferencia"     valor={formatCOP(Math.abs(diferenciaTotalCOP))}
                sub={diferenciaTotalCOP === 0 ? 'Cuadrado ✓' : diferenciaTotalCOP > 0 ? 'Sobrante' : 'Faltante'}
                color={diferenciaTotalCOP === 0 ? '#3DAA68' : '#C8573F'} />
              <ResumenCard label="Movimientos"
                valor={formatCOP(Math.abs(netMovimientos))}
                sub={netMovimientos >= 0 ? `+${movimientos.filter(m => m.tipo === 'ingreso').length} ingresos` : `${movimientos.filter(m => m.tipo === 'egreso').length} egresos`}
                color="#D9A437" />
            </div>

            {/* Tabla cuadre */}
            <div className="bg-mezo-ink-raised border border-mezo-ink-line rounded-mezo-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-mezo-ink-line">
                <p className="text-mezo-cream font-body font-semibold text-base">Cuadre por método de pago</p>
                <p className="text-mezo-stone font-body text-xs mt-0.5">Escribe cuánto contaste físicamente para ver la diferencia</p>
              </div>
              <div className="grid px-5 py-2.5 border-b border-mezo-ink-line font-body uppercase tracking-widest text-mezo-stone"
                style={{ fontSize: 10, gridTemplateColumns: '1fr 120px 140px 120px' }}>
                <span>Método</span>
                <span className="text-right">Sistema</span>
                <span className="text-center">Real (ingresa)</span>
                <span className="text-right">Diferencia</span>
              </div>

              {METODOS.map(m => {
                const sis  = sistema[m.id] ?? 0;
                const real = parseFloat(conteoReal[m.id]) || 0;
                const diff = real - sis;
                const tieneDatos = sis > 0 || conteoReal[m.id] !== '';
                return (
                  <div key={m.id}
                    className="grid items-center px-5 py-3 border-b border-mezo-ink-line last:border-0"
                    style={{ gridTemplateColumns: '1fr 120px 140px 120px', opacity: !tieneDatos ? 0.45 : 1 }}>
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: 16 }}>{m.emoji}</span>
                      <span className="text-mezo-cream font-body text-sm font-medium">{m.label}</span>
                    </div>
                    <span className="text-right font-mono text-mezo-cream-dim text-sm">{formatCOP(sis)}</span>
                    <div className="flex justify-center">
                      <input type="text" inputMode="numeric" placeholder="0"
                        value={displayConteo(conteoReal[m.id])}
                        onChange={e => handleConteoChange(m.id, e.target.value)}
                        className="w-28 px-3 py-1.5 bg-mezo-ink-muted border border-mezo-ink-line text-mezo-cream text-center font-mono text-sm rounded-mezo-md focus:outline-none focus:ring-2 focus:ring-mezo-gold focus:border-transparent transition"
                      />
                    </div>
                    <div className="text-right">
                      {conteoReal[m.id] !== '' ? (
                        <span className="font-mono font-semibold text-sm"
                          style={{ color: diff === 0 ? '#3DAA68' : diff > 0 ? '#D9A437' : '#C8573F' }}>
                          {diff > 0 ? '+' : ''}{formatCOP(diff)}
                        </span>
                      ) : (
                        <span className="text-mezo-stone font-body text-xs">—</span>
                      )}
                    </div>
                  </div>
                );
              })}

              <div className="grid items-center px-5 py-3.5 bg-mezo-ink-muted/50"
                style={{ gridTemplateColumns: '1fr 120px 140px 120px' }}>
                <span className="text-mezo-cream font-body font-semibold text-sm uppercase tracking-wide" style={{ fontSize: 11 }}>Total</span>
                <span className="text-right font-mono font-bold text-mezo-gold text-base">{formatCOP(totalSistema)}</span>
                <span className="text-center font-mono font-bold text-mezo-cream text-base">{totalReal > 0 ? formatCOP(totalReal) : '—'}</span>
                <div className="text-right">
                  {totalReal > 0 && (
                    <span className="font-mono font-bold text-base"
                      style={{ color: diferenciaTotalCOP === 0 ? '#3DAA68' : '#C8573F' }}>
                      {diferenciaTotalCOP > 0 ? '+' : ''}{formatCOP(diferenciaTotalCOP)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Aviso diferencia */}
            {totalReal > 0 && diferenciaTotalCOP !== 0 && (
              <div className="flex items-start gap-3 px-4 py-3 rounded-mezo-lg border"
                style={{
                  background: `${diferenciaTotalCOP > 0 ? '#D9A437' : '#C8573F'}12`,
                  borderColor: `${diferenciaTotalCOP > 0 ? '#D9A437' : '#C8573F'}40`,
                }}>
                <AlertTriangle size={16} style={{ color: diferenciaTotalCOP > 0 ? '#D9A437' : '#C8573F', marginTop: 1, flexShrink: 0 }} />
                <p className="text-mezo-stone font-body text-sm">
                  {diferenciaTotalCOP > 0
                    ? `Hay ${formatCOP(diferenciaTotalCOP)} de sobrante en caja. Verifica los pagos recibidos.`
                    : `Hay ${formatCOP(Math.abs(diferenciaTotalCOP))} de faltante en caja. Revisa si falta registrar algún pago.`}
                </p>
              </div>
            )}

            {/* Movimientos */}
            <div className="bg-mezo-ink-raised border border-mezo-ink-line rounded-mezo-xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-mezo-ink-line">
                <div>
                  <p className="text-mezo-cream font-body font-semibold text-base">Movimientos de caja</p>
                  <p className="text-mezo-stone font-body text-xs mt-0.5">Ingresos y egresos manuales del día</p>
                </div>
                <button onClick={() => setModalMovimiento(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-mezo-gold/15 border border-mezo-gold/40 text-mezo-gold hover:bg-mezo-gold/25 rounded-mezo-md text-sm font-body font-medium transition">
                  <Plus size={14} /> Agregar
                </button>
              </div>
              {movimientos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2 text-mezo-stone font-body text-sm">
                  <span style={{ fontSize: 32, opacity: 0.3 }}>💵</span>
                  <p>Sin movimientos hoy</p>
                </div>
              ) : (
                <div className="divide-y divide-mezo-ink-line">
                  {movimientos.map(mov => (
                    <div key={mov.id} className="flex items-center justify-between px-5 py-3">
                      <div className="flex items-center gap-3">
                        {mov.tipo === 'ingreso'
                          ? <TrendingUp size={15} className="text-mezo-verde flex-shrink-0" />
                          : <TrendingDown size={15} className="text-mezo-rojo flex-shrink-0" />}
                        <div>
                          <p className="text-mezo-cream font-body text-sm">{mov.descripcion}</p>
                          {mov.creadoEn && (
                            <p className="text-mezo-stone font-body" style={{ fontSize: 11 }}>
                              {new Date(mov.creadoEn).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="font-mono font-semibold text-sm"
                        style={{ color: mov.tipo === 'ingreso' ? '#3DAA68' : '#C8573F' }}>
                        {mov.tipo === 'ingreso' ? '+' : '-'}{formatCOP(mov.monto)}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center px-5 py-3 bg-mezo-ink-muted/40">
                    <span className="text-mezo-stone font-body text-xs uppercase tracking-widest">Neto movimientos</span>
                    <span className="font-mono font-bold text-sm"
                      style={{ color: netMovimientos >= 0 ? '#3DAA68' : '#C8573F' }}>
                      {netMovimientos >= 0 ? '+' : ''}{formatCOP(netMovimientos)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Turno activo */}
            {turnoActivo && (
              <div className="bg-mezo-ink-raised border border-mezo-ink-line rounded-mezo-xl p-5">
                <p className="text-mezo-stone uppercase tracking-widest font-body mb-3" style={{ fontSize: 10 }}>Turno activo</p>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-mezo-stone font-body" style={{ fontSize: 11 }}>Cajero</p>
                    <p className="text-mezo-cream font-body font-medium text-sm mt-0.5">{turnoActivo.empleadoNombre ?? '—'}</p>
                  </div>
                  <div>
                    <p className="text-mezo-stone font-body" style={{ fontSize: 11 }}>Inicio</p>
                    <p className="text-mezo-cream font-body font-medium text-sm mt-0.5">
                      {turnoActivo.inicio
                        ? new Date(turnoActivo.inicio).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
                        : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-mezo-stone font-body" style={{ fontSize: 11 }}>Base de turno</p>
                    <p className="font-mono font-bold text-mezo-gold text-base mt-0.5">{formatCOP(turnoActivo.baseTurno ?? 0)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Histórico de cierres */}
            <HistoricoArqueos />

          </div>
        )}
      </main>

      {modalMovimiento && (
        <ModalMovimiento onGuardar={handleAgregarMovimiento} onCerrar={() => setModalMovimiento(false)} />
      )}

      {/* Confirmar cierre del día */}
      {confirmCierre && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(8,7,6,0.85)' }}>
          <div className="bg-mezo-ink-raised border border-mezo-ink-line rounded-mezo-xl p-6 w-full max-w-sm shadow-mezo-lg">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-mezo-cream font-body font-semibold text-lg">¿Cerrar el día?</h3>
              <button onClick={() => setConfirmCierre(false)} className="text-mezo-stone hover:text-mezo-cream transition">
                <X size={18} />
              </button>
            </div>
            <p className="text-mezo-stone font-body text-sm mb-2">
              Se guardará el arqueo actual en el histórico y se reiniciarán los conteos reales.
            </p>
            <div className="flex items-center justify-between py-3 border-y border-mezo-ink-line my-4">
              <span className="text-mezo-stone font-body text-sm">Total sistema</span>
              <span className="font-mono font-bold text-mezo-gold">{formatCOP(totalSistema)}</span>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setConfirmCierre(false)}
                className="flex-1 border border-mezo-ink-line text-mezo-cream-dim font-semibold py-2.5 rounded-mezo-md text-sm font-body hover:bg-mezo-ink-muted transition">
                Cancelar
              </button>
              <button onClick={handleCerrarDia}
                className="flex-[2] bg-mezo-gold hover:bg-mezo-gold-deep text-mezo-ink font-semibold py-2.5 rounded-mezo-md text-sm font-body transition">
                Cerrar y guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ResumenCard({ label, valor, sub, color }) {
  return (
    <div className="bg-mezo-ink-raised border border-mezo-ink-line rounded-mezo-xl p-4">
      <p className="text-mezo-stone uppercase tracking-widest font-body" style={{ fontSize: 10 }}>{label}</p>
      <p className="font-mono font-bold text-xl mt-1 leading-tight" style={{ color }}>{valor}</p>
      {sub && <p className="text-mezo-stone font-body mt-1" style={{ fontSize: 11 }}>{sub}</p>}
    </div>
  );
}
