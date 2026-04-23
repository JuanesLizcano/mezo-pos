import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { formatCOP } from '../../utils/formatters';

// Tooltip con estilo oscuro mezo
function TooltipPersonalizado({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-mezo-ink-raised border border-mezo-ink-line rounded-mezo-md px-3 py-2 shadow-mezo-lg">
      <p className="text-mezo-stone font-body text-xs mb-1">{label}</p>
      <p className="text-mezo-gold font-mono font-bold text-sm">{formatCOP(payload[0].value)}</p>
    </div>
  );
}

export default function GraficaVentas({ datos, titulo }) {
  if (!datos?.length) {
    return (
      <div className="flex items-center justify-center h-48 text-mezo-stone font-body text-sm">
        Sin datos para mostrar
      </div>
    );
  }

  const maxValor = Math.max(...datos.map(d => d.valor));

  return (
    <div>
      {titulo && (
        <p className="text-mezo-stone uppercase tracking-widest text-xs font-body mb-4">{titulo}</p>
      )}
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={datos} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="#2A2520" strokeDasharray="0" />
          <XAxis
            dataKey="label"
            tick={{ fill: '#6B6055', fontSize: 11, fontFamily: '"DM Sans", sans-serif' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v) => v === 0 ? '0' : `$${(v / 1000).toFixed(0)}k`}
            tick={{ fill: '#6B6055', fontSize: 11, fontFamily: '"DM Sans", sans-serif' }}
            axisLine={false}
            tickLine={false}
            width={44}
            domain={[0, maxValor * 1.15]}
          />
          <Tooltip content={<TooltipPersonalizado />} cursor={{ fill: 'rgba(200,144,63,0.06)' }} />
          <Bar
            dataKey="valor"
            fill="#C8903F"
            radius={[4, 4, 0, 0]}
            maxBarSize={48}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
