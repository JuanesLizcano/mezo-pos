import { Users } from 'lucide-react';
import { useTimer } from '../../hooks/useTimer';
import { formatCOP } from '../../utils/formatters';

const ESTADOS = {
  libre:     { label: 'Libre',     color: '#3DAA68', bg: 'rgba(61,170,104,0.12)',  border: 'rgba(61,170,104,0.3)'  },
  ocupada:   { label: 'Ocupada',   color: '#C8903F', bg: 'rgba(200,144,63,0.12)',  border: 'rgba(200,144,63,0.3)'  },
  pagando:   { label: 'Pagando',   color: '#D9A437', bg: 'rgba(217,164,55,0.12)',  border: 'rgba(217,164,55,0.3)'  },
  reservada: { label: 'Reservada', color: '#6B6055', bg: 'rgba(107,96,85,0.15)',   border: 'rgba(107,96,85,0.4)'   },
};

export default function TarjetaMesa({ mesa, zonas, onVerPanel, activa }) {
  const estado  = mesa.estado ?? 'libre';
  const config  = ESTADOS[estado] ?? ESTADOS.libre;
  const { formatted } = useTimer(estado !== 'libre' ? mesa.ocupadaEn : null);
  const zona    = zonas?.find(z => z.id === mesa.zonaId);
  const estaOcupada = estado === 'ocupada' || estado === 'pagando';

  return (
    <button
      onClick={onVerPanel}
      className="bg-mezo-ink-raised rounded-mezo-xl flex flex-col overflow-hidden transition text-left w-full"
      style={{
        border: activa ? `1px solid ${config.color}` : `1px solid ${config.border}`,
        boxShadow: activa ? `0 0 0 2px ${config.color}30` : undefined,
      }}>

      {/* Header */}
      <div className="flex items-start justify-between px-4 pt-4 pb-2">
        <div>
          <p className="text-mezo-stone uppercase tracking-widest font-body" style={{ fontSize: 10 }}>Mesa</p>
          <p className="text-mezo-cream font-display font-medium leading-none" style={{ fontSize: 32 }}>
            {mesa.numero}
          </p>
        </div>
        <span className="text-xs font-semibold font-body px-2.5 py-1 rounded-full mt-1"
          style={{ background: config.bg, color: config.color, border: `1px solid ${config.border}` }}>
          {config.label}
        </span>
      </div>

      {/* Info */}
      <div className="flex-1 px-4 pb-2 space-y-1">
        {estaOcupada && mesa.personas && (
          <div className="flex items-center gap-1 text-mezo-stone font-body" style={{ fontSize: 12 }}>
            <Users size={10} className="flex-shrink-0" />
            <span>{mesa.personas} persona{mesa.personas !== 1 ? 's' : ''}</span>
          </div>
        )}
        {estaOcupada && mesa.ocupadaEn && (
          <p className="text-mezo-stone font-body font-mono" style={{ fontSize: 12 }}>{formatted}</p>
        )}
        {estaOcupada && mesa.total != null && (
          <p className="font-mono font-bold" style={{ fontSize: 14, color: config.color }}>
            {formatCOP(mesa.total)}
          </p>
        )}
        {estado === 'libre' && (
          <p className="text-mezo-stone font-body" style={{ fontSize: 12 }}>Disponible</p>
        )}
        {estado === 'reservada' && (
          <p className="text-mezo-stone font-body" style={{ fontSize: 12 }}>Reservada</p>
        )}
        {zona && (
          <span className="inline-block text-xs font-body px-1.5 py-0.5 rounded"
            style={{ background: `${zona.color}15`, color: zona.color, fontSize: 10 }}>
            {zona.nombre}
          </span>
        )}
      </div>

      {/* Ver → button */}
      <div className="border-t px-4 py-2.5" style={{ borderColor: config.border }}>
        <span className="text-xs font-semibold font-body" style={{ color: config.color }}>
          Ver →
        </span>
      </div>
    </button>
  );
}
