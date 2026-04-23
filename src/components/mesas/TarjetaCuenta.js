import { useState } from 'react';
import { User } from 'lucide-react';
import toast from 'react-hot-toast';
import { updateCuenta, createOrden } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { useEmployee } from '../../context/EmployeeContext';
import { useTimer } from '../../hooks/useTimer';
import { formatCOP } from '../../utils/formatters';

const ESTADOS = {
  abierta:    { label: 'Abierta',    color: '#6B6055', bg: 'rgba(107,96,85,0.15)',  border: 'rgba(107,96,85,0.4)'  },
  por_cobrar: { label: 'Por cobrar', color: '#D9A437', bg: 'rgba(217,164,55,0.12)', border: 'rgba(217,164,55,0.3)' },
  pagada:     { label: 'Pagada',     color: '#3DAA68', bg: 'rgba(61,170,104,0.12)', border: 'rgba(61,170,104,0.3)' },
};

export default function TarjetaCuenta({ cuenta }) {
  const { bumpVersion }             = useAuth();
  const { empleadoActivo, turnoId } = useEmployee();
  const estado                      = cuenta.estado ?? 'abierta';
  const config                      = ESTADOS[estado] ?? ESTADOS.abierta;
  const { formatted }               = useTimer(cuenta.creadoEn);
  const [guardando, setGuardando]   = useState(false);

  async function marcarPorCobrar() {
    try {
      await updateCuenta(cuenta.id, { estado: 'por_cobrar' });
      bumpVersion();
    } catch {
      toast.error('Error al actualizar la cuenta.');
    }
  }

  async function cobrar() {
    setGuardando(true);
    try {
      await createOrden({
        lineas:         cuenta.lineas ?? [],
        subtotal:       cuenta.total ?? 0,
        propina:        null,
        total:          cuenta.total ?? 0,
        metodoPago:     'efectivo',
        empleadoNombre: empleadoActivo?.nombre ?? null,
        turnoId:        turnoId ?? null,
        estado:         'pagada',
        cuentaNombre:   cuenta.nombre,
      });
      await updateCuenta(cuenta.id, { estado: 'pagada', cerradaEn: new Date().toISOString() });
      bumpVersion();
      toast.success(`Cuenta "${cuenta.nombre}" cobrada ✓`);
    } catch {
      toast.error('Error al cobrar la cuenta.');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="bg-mezo-ink-raised rounded-mezo-xl flex flex-col overflow-hidden transition"
      style={{ border: `1px solid ${config.border}` }}>

      {/* Header */}
      <div className="flex items-start justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-2 min-w-0">
          <User size={16} className="text-mezo-stone flex-shrink-0" />
          <p className="text-mezo-cream font-body font-semibold text-base truncate">{cuenta.nombre}</p>
        </div>
        <span className="text-xs font-semibold font-body px-2.5 py-1 rounded-full flex-shrink-0"
          style={{ background: config.bg, color: config.color, border: `1px solid ${config.border}` }}>
          {config.label}
        </span>
      </div>

      {/* Info */}
      <div className="flex-1 px-4 pb-3 space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-mezo-stone font-body" style={{ fontSize: 12 }}>Tiempo</span>
          <span className="font-mono text-mezo-cream-dim font-medium" style={{ fontSize: 12 }}>{formatted}</span>
        </div>
        {cuenta.total > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-mezo-stone font-body" style={{ fontSize: 12 }}>Total</span>
            <span className="font-mono font-bold" style={{ fontSize: 14, color: config.color }}>
              {formatCOP(cuenta.total)}
            </span>
          </div>
        )}
        {(cuenta.lineas ?? []).slice(0, 2).map((l, i) => (
          <p key={i} className="text-mezo-stone font-body truncate" style={{ fontSize: 11 }}>
            {l.cantidad}× {l.nombre}
          </p>
        ))}
        {(cuenta.lineas ?? []).length > 2 && (
          <p className="text-mezo-stone font-body" style={{ fontSize: 11 }}>
            +{cuenta.lineas.length - 2} más…
          </p>
        )}
      </div>

      {/* Acciones */}
      <div className="border-t px-3 py-2.5 flex gap-1.5" style={{ borderColor: config.border }}>
        {estado === 'abierta' && (
          <ActionBtn onClick={marcarPorCobrar} color="#D9A437" label="Por cobrar" flex />
        )}
        {(estado === 'abierta' || estado === 'por_cobrar') && (
          <ActionBtn onClick={cobrar} color="#3DAA68" label={guardando ? '…' : 'Cobrar'} flex />
        )}
      </div>
    </div>
  );
}

function ActionBtn({ onClick, color, label, flex }) {
  return (
    <button onClick={onClick}
      className={`${flex ? 'flex-1' : ''} py-1.5 rounded-mezo-sm text-xs font-semibold font-body transition`}
      style={{ background: `${color}18`, color, border: `1px solid ${color}40` }}
      onMouseEnter={e => { e.currentTarget.style.background = `${color}30`; }}
      onMouseLeave={e => { e.currentTarget.style.background = `${color}18`; }}
    >
      {label}
    </button>
  );
}
