import { useState } from 'react';
import { X, ShoppingCart, ArrowRightLeft, Scissors, Users, Clock, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { updateMesa } from '../../services';
import { useTimer } from '../../hooks/useTimer';
import { formatCOP } from '../../utils/formatters';
import ModalDivisionCuenta from './ModalDivisionCuenta';
import ModalCambiarMesa from './ModalCambiarMesa';

const ESTADOS = {
  libre:     { label: 'Libre',     color: '#3DAA68' },
  ocupada:   { label: 'Ocupada',   color: '#C8903F' },
  pagando:   { label: 'Pagando',   color: '#D9A437' },
  reservada: { label: 'Reservada', color: '#6B6055' },
};

export default function PanelMesa({ mesa, todasMesas, zonas, onCerrar, onEliminar, bumpVersion }) {
  const navigate = useNavigate();
  const estado   = mesa.estado ?? 'libre';
  const config   = ESTADOS[estado] ?? ESTADOS.libre;
  const { formatted: tiempoMesa } = useTimer(estado !== 'libre' ? mesa.ocupadaEn : null);

  const [mostrarDivision, setMostrarDivision] = useState(false);
  const [mostrarCambio, setMostrarCambio]     = useState(false);
  const [numPersonas, setNumPersonas]         = useState(mesa.personas ?? 2);
  const [confirmDelete, setConfirmDelete]     = useState(false);
  const [loadingAccion, setLoadingAccion]     = useState(false);

  const lineas     = mesa.lineas ?? [];
  const estaOcupada = estado === 'ocupada' || estado === 'pagando';
  const zona       = zonas?.find(z => z.id === mesa.zonaId);

  async function ocupar() {
    setLoadingAccion(true);
    try {
      await updateMesa(mesa.id, { estado: 'ocupada', ocupadaEn: new Date().toISOString(), total: 0, personas: numPersonas });
      bumpVersion();
    } finally { setLoadingAccion(false); }
  }
  async function marcarPagando() {
    setLoadingAccion(true);
    try {
      await updateMesa(mesa.id, { estado: 'pagando' });
      bumpVersion();
    } finally { setLoadingAccion(false); }
  }
  async function liberar() {
    setLoadingAccion(true);
    try {
      await updateMesa(mesa.id, { estado: 'libre', ocupadaEn: null, total: null, lineas: null });
      bumpVersion();
    } finally { setLoadingAccion(false); }
  }
  async function reservar() {
    setLoadingAccion(true);
    try {
      await updateMesa(mesa.id, { estado: 'reservada', ocupadaEn: new Date().toISOString(), total: null });
      bumpVersion();
    } finally { setLoadingAccion(false); }
  }

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-30" onClick={onCerrar} style={{ background: 'rgba(8,7,6,0.4)' }} />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full z-40 flex flex-col overflow-hidden shadow-2xl"
        style={{ width: 400, background: '#100E0B', borderLeft: '1px solid #2A2520' }}>

        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-mezo-ink-line flex-shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="text-mezo-stone uppercase tracking-widest font-body" style={{ fontSize: 10 }}>Mesa</p>
              {zona && (
                <span className="text-xs font-body px-2 py-0.5 rounded-full"
                  style={{ background: `${zona.color}18`, color: zona.color, border: `1px solid ${zona.color}30` }}>
                  {zona.nombre}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <p className="font-display font-medium leading-none" style={{ fontSize: 44, color: config.color }}>
                {mesa.numero}
              </p>
              <span className="text-xs font-semibold font-body px-2.5 py-1 rounded-full"
                style={{ background: `${config.color}18`, color: config.color, border: `1px solid ${config.color}40` }}>
                {config.label}
              </span>
            </div>
            {mesa.nombre && mesa.nombre !== `Mesa ${mesa.numero}` && (
              <p className="text-mezo-stone font-body text-sm mt-0.5">{mesa.nombre}</p>
            )}
          </div>
          <button onClick={onCerrar}
            className="text-mezo-stone hover:text-mezo-cream transition mt-1">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Info row */}
          {estaOcupada && (
            <div className="grid grid-cols-2 gap-3">
              {mesa.personas && (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-mezo-lg"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #2A2520' }}>
                  <Users size={14} className="text-mezo-stone flex-shrink-0" />
                  <div>
                    <p className="text-mezo-stone font-body" style={{ fontSize: 10 }}>Personas</p>
                    <p className="text-mezo-cream font-mono font-bold text-sm">{mesa.personas}</p>
                  </div>
                </div>
              )}
              {mesa.ocupadaEn && (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-mezo-lg"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #2A2520' }}>
                  <Clock size={14} className="text-mezo-stone flex-shrink-0" />
                  <div>
                    <p className="text-mezo-stone font-body" style={{ fontSize: 10 }}>Tiempo</p>
                    <p className="text-mezo-cream font-mono font-bold text-sm">{tiempoMesa}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Persons selector for libre state */}
          {estado === 'libre' && (
            <div>
              <p className="text-mezo-stone font-body uppercase tracking-widest mb-2" style={{ fontSize: 10 }}>Personas</p>
              <div className="flex items-center gap-4">
                <button onClick={() => setNumPersonas(n => Math.max(1, n - 1))}
                  className="w-9 h-9 rounded-mezo-md border border-mezo-ink-line text-mezo-cream-dim hover:bg-mezo-ink-line text-lg font-bold transition flex items-center justify-center">
                  −
                </button>
                <span className="text-2xl font-bold text-mezo-cream font-mono w-8 text-center">{numPersonas}</span>
                <button onClick={() => setNumPersonas(n => Math.min(20, n + 1))}
                  className="w-9 h-9 rounded-mezo-md border border-mezo-ink-line text-mezo-cream-dim hover:bg-mezo-ink-line text-lg font-bold transition flex items-center justify-center">
                  +
                </button>
              </div>
            </div>
          )}

          {/* Order lines */}
          {lineas.length > 0 && (
            <div>
              <p className="text-mezo-stone font-body uppercase tracking-widest mb-3" style={{ fontSize: 10 }}>
                Orden · {lineas.length} ítems
              </p>
              <div className="space-y-2">
                {lineas.map((l, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-mezo-ink-line last:border-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-mezo-stone font-mono text-sm flex-shrink-0">{l.cantidad}×</span>
                      <span className="text-mezo-cream font-body text-sm truncate">{l.nombre}</span>
                    </div>
                    <span className="font-mono text-mezo-cream-dim text-sm flex-shrink-0 ml-2">
                      {formatCOP(l.subtotal ?? l.precio * l.cantidad)}
                    </span>
                  </div>
                ))}
              </div>

              {mesa.total != null && (
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-mezo-ink-line">
                  <span className="text-mezo-stone font-body text-sm font-semibold uppercase tracking-wide" style={{ fontSize: 11 }}>
                    Total
                  </span>
                  <span className="font-mono font-bold text-lg" style={{ color: config.color }}>
                    {formatCOP(mesa.total)}
                  </span>
                </div>
              )}
            </div>
          )}

          {estado === 'libre' && (
            <p className="text-mezo-stone font-body text-sm text-center py-4">Mesa disponible</p>
          )}
          {estado === 'reservada' && (
            <p className="text-mezo-stone font-body text-sm text-center py-4">Mesa reservada</p>
          )}
        </div>

        {/* Action buttons */}
        <div className="px-6 py-5 border-t border-mezo-ink-line flex-shrink-0 space-y-3">

          {(estado === 'ocupada' || estado === 'pagando') && (
            <>
              <button
                onClick={() => navigate(`/pos?mesaId=${mesa.id}&mode=cobrar`)}
                className="w-full py-3 rounded-mezo-lg text-sm font-semibold font-body transition flex items-center justify-center gap-2"
                style={{ background: 'rgba(200,144,63,0.18)', color: '#C8903F', border: '1px solid rgba(200,144,63,0.55)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(200,144,63,0.3)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(200,144,63,0.18)'; }}>
                <ShoppingCart size={15} /> Ir al POS / Cobrar
              </button>

              <div className="grid grid-cols-2 gap-2">
                {todasMesas && (
                  <PanelBtn onClick={() => setMostrarCambio(true)} color="#9B8EA8"
                    icon={<ArrowRightLeft size={13} />} label="Cambiar mesa" />
                )}
                {mesa.total > 0 && (
                  <PanelBtn onClick={() => setMostrarDivision(true)} color="#6B9ED4"
                    icon={<Scissors size={13} />} label="Dividir" />
                )}
                {estado === 'ocupada' && (
                  <PanelBtn onClick={marcarPagando} color="#D9A437" label="Marcar pagando" />
                )}
                <PanelBtn onClick={liberar} color="#C8573F" label="Liberar mesa" />
              </div>
            </>
          )}

          {estado === 'libre' && (
            <div className="space-y-2">
              <button onClick={ocupar} disabled={loadingAccion}
                className="w-full py-3 rounded-mezo-lg text-sm font-semibold font-body transition disabled:opacity-50"
                style={{ background: 'rgba(61,170,104,0.15)', color: '#3DAA68', border: '1px solid rgba(61,170,104,0.4)' }}
                onMouseEnter={e => { if (!loadingAccion) e.currentTarget.style.background = 'rgba(61,170,104,0.25)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(61,170,104,0.15)'; }}>
                {loadingAccion ? 'Guardando...' : 'Ocupar mesa'}
              </button>
              <div className="grid grid-cols-2 gap-2">
                <PanelBtn onClick={reservar} color="#6B6055" label="Reservar" />
                {onEliminar && !confirmDelete && (
                  <PanelBtn onClick={() => setConfirmDelete(true)} color="#C8573F"
                    icon={<Trash2 size={13} />} label="Eliminar" />
                )}
                {onEliminar && confirmDelete && (
                  <button onClick={() => { onEliminar(mesa.id); onCerrar(); }}
                    className="flex-1 py-2 rounded-mezo-sm text-xs font-semibold font-body transition"
                    style={{ background: '#C8573F22', color: '#C8573F', border: '1px solid #C8573F60' }}>
                    ¿Confirmar?
                  </button>
                )}
              </div>
            </div>
          )}

          {estado === 'reservada' && (
            <div className="grid grid-cols-2 gap-2">
              <PanelBtn onClick={ocupar}  color="#C8903F" label="Sentar" />
              <PanelBtn onClick={liberar} color="#C8573F" label="Cancelar reserva" />
            </div>
          )}
        </div>
      </div>

      {mostrarDivision && (
        <ModalDivisionCuenta mesa={mesa} onCerrar={() => setMostrarDivision(false)} />
      )}
      {mostrarCambio && todasMesas && (
        <ModalCambiarMesa mesaOrigen={mesa} todasMesas={todasMesas} onCerrar={() => setMostrarCambio(false)} />
      )}
    </>
  );
}

function PanelBtn({ onClick, color, icon, label }) {
  return (
    <button onClick={onClick}
      className="flex items-center justify-center gap-1.5 py-2.5 rounded-mezo-md text-xs font-semibold font-body transition"
      style={{ background: `${color}18`, color, border: `1px solid ${color}40` }}
      onMouseEnter={e => { e.currentTarget.style.background = `${color}30`; }}
      onMouseLeave={e => { e.currentTarget.style.background = `${color}18`; }}>
      {icon}
      {label}
    </button>
  );
}
