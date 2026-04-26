import { useState } from 'react';
import { Scissors, Users, ArrowRightLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { updateMesa } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { useTimer } from '../../hooks/useTimer';
import { formatCOP } from '../../utils/formatters';
import ModalDivisionCuenta from './ModalDivisionCuenta';
import ModalCambiarMesa from './ModalCambiarMesa';

const ESTADOS = {
  libre:     { label: 'Libre',     color: '#3DAA68', bg: 'rgba(61,170,104,0.12)',  border: 'rgba(61,170,104,0.3)'  },
  ocupada:   { label: 'Ocupada',   color: '#C8903F', bg: 'rgba(200,144,63,0.12)',  border: 'rgba(200,144,63,0.3)'  },
  pagando:   { label: 'Pagando',   color: '#D9A437', bg: 'rgba(217,164,55,0.12)',  border: 'rgba(217,164,55,0.3)'  },
  reservada: { label: 'Reservada', color: '#6B6055', bg: 'rgba(107,96,85,0.15)',   border: 'rgba(107,96,85,0.4)'   },
};

export default function TarjetaMesa({ mesa, todasMesas, onEliminar }) {
  const { bumpVersion }       = useAuth();
  const navigate              = useNavigate();
  const estado                = mesa.estado ?? 'libre';
  const config                = ESTADOS[estado] ?? ESTADOS.libre;
  const { formatted }         = useTimer(estado !== 'libre' ? mesa.ocupadaEn : null);
  const [mostrarDivision, setMostrarDivision] = useState(false);
  const [mostrarCambio, setMostrarCambio]     = useState(false);
  const [modalOcupar, setModalOcupar]         = useState(false);
  const [numPersonas, setNumPersonas]         = useState(2);

  async function ocupar() {
    await updateMesa(mesa.id, { estado: 'ocupada', ocupadaEn: new Date().toISOString(), total: 0, personas: numPersonas });
    setModalOcupar(false);
    bumpVersion();
  }

  async function marcarPagando() {
    await updateMesa(mesa.id, { estado: 'pagando' });
    bumpVersion();
  }

  async function liberar() {
    await updateMesa(mesa.id, { estado: 'libre', ocupadaEn: null, total: null, lineas: null });
    bumpVersion();
  }

  async function reservar() {
    await updateMesa(mesa.id, { estado: 'reservada', ocupadaEn: new Date().toISOString(), total: null });
    bumpVersion();
  }

  const estaOcupada = estado === 'ocupada' || estado === 'pagando';
  const lineas      = mesa.lineas ?? [];

  // Resumen de los primeros 3 productos para mostrar en la card
  const resumenLineas = lineas.slice(0, 3).map(l => `${l.nombre} ×${l.cantidad}`).join(', ');
  const masProductos  = lineas.length > 3 ? ` +${lineas.length - 3} más` : '';

  return (
    <>
      <div className="bg-mezo-ink-raised rounded-mezo-xl flex flex-col overflow-hidden transition"
        style={{ border: `1px solid ${config.border}` }}>

        {/* Header */}
        <div className="flex items-start justify-between px-4 pt-4 pb-2">
          <div>
            <p className="text-mezo-stone uppercase tracking-widest font-body" style={{ fontSize: 10 }}>Mesa</p>
            <p className="text-mezo-cream font-display font-medium leading-none" style={{ fontSize: 32 }}>
              {mesa.numero}
            </p>
            {mesa.nombre && mesa.nombre !== `Mesa ${mesa.numero}` && (
              <p className="text-mezo-stone font-body mt-0.5" style={{ fontSize: 11 }}>{mesa.nombre}</p>
            )}
          </div>
          <span className="text-xs font-semibold font-body px-2.5 py-1 rounded-full"
            style={{ background: config.bg, color: config.color, border: `1px solid ${config.border}` }}>
            {config.label}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 px-4 pb-2 flex flex-col justify-end gap-1">
          {estaOcupada && mesa.personas && (
            <div className="flex items-center justify-between">
              <span className="text-mezo-stone font-body flex items-center gap-1" style={{ fontSize: 12 }}>
                <Users size={11} /> Personas
              </span>
              <span className="font-mono text-mezo-cream-dim font-medium" style={{ fontSize: 13 }}>
                {mesa.personas}
              </span>
            </div>
          )}
          {estaOcupada && mesa.ocupadaEn && (
            <div className="flex items-center justify-between">
              <span className="text-mezo-stone font-body" style={{ fontSize: 12 }}>Tiempo</span>
              <span className="font-mono text-mezo-cream-dim font-medium" style={{ fontSize: 13 }}>{formatted}</span>
            </div>
          )}
          {estaOcupada && mesa.total != null && (
            <div className="flex items-center justify-between">
              <span className="text-mezo-stone font-body" style={{ fontSize: 12 }}>Total</span>
              <span className="font-mono font-bold" style={{ fontSize: 14, color: config.color }}>
                {formatCOP(mesa.total)}
              </span>
            </div>
          )}
          {estado === 'reservada' && <p className="text-mezo-stone font-body" style={{ fontSize: 12 }}>Reservada</p>}
          {estado === 'libre'     && <p className="text-mezo-stone font-body" style={{ fontSize: 12 }}>Disponible</p>}
        </div>

        {/* Resumen de productos */}
        {estaOcupada && lineas.length > 0 && (
          <div className="px-4 pb-2">
            <p className="text-mezo-stone font-body truncate" style={{ fontSize: 11 }}>
              {resumenLineas}{masProductos}
            </p>
          </div>
        )}

        {/* Acciones */}
        <div className="border-t px-3 py-2.5 flex flex-col gap-1.5" style={{ borderColor: config.border }}>
          {estado === 'libre' && (
            <div className="flex gap-1.5">
              <ActionBtn onClick={() => setModalOcupar(true)} color={ESTADOS.ocupada.color}   label="Ocupar"   flex />
              <ActionBtn onClick={reservar}                   color={ESTADOS.reservada.color} label="Reservar" flex />
              {onEliminar && (
                <ActionBtn onClick={() => onEliminar(mesa.id)} color="#C8573F" label="×" />
              )}
            </div>
          )}

          {estado === 'ocupada' && (
            <>
              {/* Botón principal cobrar */}
              <button
                onClick={() => navigate(`/pos?mesaId=${mesa.id}&mode=cobrar`)}
                className="w-full py-2 rounded-mezo-md text-sm font-semibold font-body transition flex items-center justify-center gap-1"
                style={{ background: 'rgba(200,144,63,0.18)', color: '#C8903F', border: '1px solid rgba(200,144,63,0.55)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(200,144,63,0.3)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(200,144,63,0.18)'; }}>
                Cobrar →
              </button>
              {/* Acciones secundarias */}
              <div className="flex gap-1.5">
                {todasMesas && (
                  <ActionBtn onClick={() => setMostrarCambio(true)} color="#9B8EA8"
                    label={<span className="flex items-center gap-1 justify-center"><ArrowRightLeft size={10} />Cambiar</span>} flex />
                )}
                {mesa.total > 0 && (
                  <ActionBtn onClick={() => setMostrarDivision(true)} color="#6B9ED4"
                    label={<span className="flex items-center gap-1 justify-center"><Scissors size={10} />Dividir</span>} flex />
                )}
                <ActionBtn onClick={marcarPagando} color={ESTADOS.pagando.color} label="Pagando" flex />
                <ActionBtn onClick={liberar}       color="#C8573F"               label="Liberar"  flex />
              </div>
            </>
          )}

          {estado === 'pagando' && (
            <>
              <button
                onClick={() => navigate(`/pos?mesaId=${mesa.id}&mode=cobrar`)}
                className="w-full py-2 rounded-mezo-md text-sm font-semibold font-body transition flex items-center justify-center gap-1"
                style={{ background: 'rgba(200,144,63,0.18)', color: '#C8903F', border: '1px solid rgba(200,144,63,0.55)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(200,144,63,0.3)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(200,144,63,0.18)'; }}>
                Cobrar →
              </button>
              <div className="flex gap-1.5">
                {mesa.total > 0 && (
                  <ActionBtn onClick={() => setMostrarDivision(true)} color="#6B9ED4"
                    label={<span className="flex items-center gap-1 justify-center"><Scissors size={10} />Dividir</span>} flex />
                )}
                <ActionBtn onClick={liberar} color={ESTADOS.libre.color} label="Liberar mesa" flex />
              </div>
            </>
          )}

          {estado === 'reservada' && (
            <div className="flex gap-1.5">
              <ActionBtn onClick={ocupar}  color={ESTADOS.ocupada.color} label="Sentar"   flex />
              <ActionBtn onClick={liberar} color="#C8573F"               label="Cancelar" flex />
            </div>
          )}
        </div>
      </div>

      {mostrarDivision && (
        <ModalDivisionCuenta mesa={mesa} onCerrar={() => setMostrarDivision(false)} />
      )}

      {/* Modal de personas */}
      {modalOcupar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(8,7,6,0.85)' }}>
          <div className="bg-mezo-ink-raised border border-mezo-ink-line rounded-mezo-xl p-6 w-full max-w-xs shadow-mezo-lg">
            <p className="text-mezo-stone text-xs uppercase tracking-widest font-body mb-1">Mesa {mesa.numero}</p>
            <h3 className="text-mezo-cream font-body font-semibold text-lg mb-4">¿Cuántas personas?</h3>
            <div className="flex items-center justify-center gap-4 mb-5">
              <button onClick={() => setNumPersonas(n => Math.max(1, n - 1))}
                className="w-10 h-10 rounded-mezo-md border border-mezo-ink-line text-mezo-cream-dim hover:bg-mezo-ink-line text-xl font-bold transition flex items-center justify-center">
                −
              </button>
              <span className="text-3xl font-bold text-mezo-cream font-mono w-10 text-center">{numPersonas}</span>
              <button onClick={() => setNumPersonas(n => Math.min(20, n + 1))}
                className="w-10 h-10 rounded-mezo-md border border-mezo-ink-line text-mezo-cream-dim hover:bg-mezo-ink-line text-xl font-bold transition flex items-center justify-center">
                +
              </button>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setModalOcupar(false)}
                className="flex-1 border border-mezo-ink-line text-mezo-cream-dim font-semibold py-2.5 rounded-mezo-md text-sm font-body hover:bg-mezo-ink-muted transition">
                Cancelar
              </button>
              <button onClick={ocupar}
                className="flex-[2] bg-mezo-gold hover:bg-mezo-gold-deep text-mezo-ink font-semibold py-2.5 rounded-mezo-md text-sm font-body transition">
                Ocupar mesa
              </button>
            </div>
          </div>
        </div>
      )}

      {mostrarCambio && todasMesas && (
        <ModalCambiarMesa mesaOrigen={mesa} todasMesas={todasMesas} onCerrar={() => setMostrarCambio(false)} />
      )}
    </>
  );
}

function ActionBtn({ onClick, color, label, flex }) {
  return (
    <button onClick={onClick}
      className={`${flex ? 'flex-1' : ''} py-1.5 rounded-mezo-sm text-xs font-semibold font-body transition`}
      style={{ background: `${color}18`, color, border: `1px solid ${color}40` }}
      onMouseEnter={e => { e.currentTarget.style.background = `${color}30`; }}
      onMouseLeave={e => { e.currentTarget.style.background = `${color}18`; }}>
      {label}
    </button>
  );
}
