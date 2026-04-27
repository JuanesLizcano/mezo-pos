import { useMemo } from 'react';
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { useProductos } from '../../hooks/useProductos';
import { formatCOP } from '../../utils/formatters';

// Verde ≥ 65% · Ámbar 45–64% · Rojo < 45%
function colorMargen(pct) {
  if (pct >= 65) return '#3DAA68';
  if (pct >= 45) return '#D9A437';
  return '#C8573F';
}

function labelMargen(pct) {
  if (pct >= 65) return 'Excelente';
  if (pct >= 45) return 'Aceptable';
  return 'Revisar precio';
}

export default function FoodCost() {
  const { productos, loading } = useProductos();

  // Solo productos con costo configurado
  const conCosto = useMemo(
    () => productos
      .filter(p => p.costo > 0 && p.precio > 0)
      .map(p => ({
        ...p,
        margenCOP: p.precio - p.costo,
        margenPct: Math.round(((p.precio - p.costo) / p.precio) * 100),
      }))
      .sort((a, b) => b.margenPct - a.margenPct),
    [productos]
  );

  const masRentable  = conCosto[0]                     ?? null;
  const menosRentable = conCosto[conCosto.length - 1]  ?? null;

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-7 h-7 border-4 border-mezo-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (conCosto.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
        <AlertCircle size={40} className="text-mezo-stone opacity-50" />
        <p className="text-mezo-cream font-body font-semibold">Sin datos de food cost</p>
        <p className="text-mezo-stone font-body text-sm max-w-sm">
          Ve a <strong className="text-mezo-cream">Productos → Editar</strong> y agrega el costo
          de producción a cada ítem para ver tus márgenes reales aquí.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Cards más / menos rentable */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <CardDestacada
          titulo="Producto más rentable"
          icono={<TrendingUp size={18} className="text-mezo-verde" />}
          producto={masRentable}
        />
        <CardDestacada
          titulo="Producto menos rentable"
          icono={<TrendingDown size={18} className="text-mezo-rojo" />}
          producto={menosRentable}
        />
      </div>

      {/* Tabla de productos */}
      <div className="bg-mezo-ink-raised border border-mezo-ink-line rounded-mezo-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-mezo-ink-line">
          <p className="text-mezo-stone uppercase tracking-widest font-body" style={{ fontSize: 10 }}>
            Análisis
          </p>
          <p className="text-mezo-cream font-body font-semibold text-sm mt-0.5">
            Rentabilidad por producto — {conCosto.length} con costo configurado
          </p>
        </div>

        {/* Cabecera */}
        <div className="grid font-body text-mezo-stone uppercase tracking-widest px-5 py-2.5 border-b border-mezo-ink-line"
          style={{ fontSize: 10, gridTemplateColumns: '1fr 100px 100px 110px 110px' }}>
          <span>Producto</span>
          <span className="text-right">Precio venta</span>
          <span className="text-right">Costo</span>
          <span className="text-right">Margen COP</span>
          <span className="text-center">Margen %</span>
        </div>

        {/* Filas */}
        {conCosto.map(p => {
          const color = colorMargen(p.margenPct);
          return (
            <div key={p.id}
              className="grid items-center px-5 py-3 border-b border-mezo-ink-line last:border-0 hover:bg-mezo-ink-muted/40 transition"
              style={{ gridTemplateColumns: '1fr 100px 100px 110px 110px' }}>

              <div className="flex items-center gap-2 min-w-0">
                {p.emoji && <span style={{ fontSize: 16 }}>{p.emoji}</span>}
                <span className="text-mezo-cream font-body text-sm truncate">{p.nombre}</span>
              </div>

              <span className="text-right font-mono text-mezo-cream-dim text-sm">
                {formatCOP(p.precio)}
              </span>
              <span className="text-right font-mono text-mezo-stone text-sm">
                {formatCOP(p.costo)}
              </span>
              <span className="text-right font-mono font-semibold text-sm" style={{ color }}>
                {formatCOP(p.margenCOP)}
              </span>

              <div className="flex justify-center">
                <span className="text-xs font-body font-semibold px-2.5 py-1 rounded-full"
                  style={{ background: `${color}18`, color, border: `1px solid ${color}40` }}>
                  {p.margenPct}% · {labelMargen(p.margenPct)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Leyenda */}
      <div className="flex flex-wrap gap-4 text-xs font-body text-mezo-stone">
        <Leyenda color="#3DAA68" label="≥ 65% — Excelente" />
        <Leyenda color="#D9A437" label="45–64% — Aceptable" />
        <Leyenda color="#C8573F" label="< 45% — Revisar precio o costo" />
      </div>

    </div>
  );
}

function CardDestacada({ titulo, icono, producto }) {
  if (!producto) return null;
  const color = colorMargen(producto.margenPct);
  return (
    <div className="bg-mezo-ink-raised border border-mezo-ink-line rounded-mezo-xl p-5">
      <div className="flex items-center gap-2 mb-3">
        {icono}
        <p className="text-mezo-stone uppercase tracking-widest font-body" style={{ fontSize: 10 }}>
          {titulo}
        </p>
      </div>
      <div className="flex items-center gap-3 mb-3">
        {producto.emoji && <span style={{ fontSize: 28 }}>{producto.emoji}</span>}
        <p className="text-mezo-cream font-body font-semibold text-base leading-tight">
          {producto.nombre}
        </p>
      </div>
      <div className="grid grid-cols-3 gap-3 text-center">
        <MetricaCard label="Precio venta" valor={formatCOP(producto.precio)} />
        <MetricaCard label="Costo" valor={formatCOP(producto.costo)} />
        <MetricaCard
          label="Margen"
          valor={`${producto.margenPct}%`}
          color={color}
          sub={formatCOP(producto.margenCOP) + ' por venta'}
        />
      </div>
    </div>
  );
}

function MetricaCard({ label, valor, color, sub }) {
  return (
    <div className="bg-mezo-ink-muted rounded-mezo-md px-2 py-2.5 text-center">
      <p className="text-mezo-stone font-body" style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {label}
      </p>
      <p className="font-mono font-bold text-sm mt-0.5 leading-tight" style={{ color: color ?? '#F4ECD8' }}>
        {valor}
      </p>
      {sub && <p className="text-mezo-stone font-body mt-0.5" style={{ fontSize: 9 }}>{sub}</p>}
    </div>
  );
}

function Leyenda({ color, label }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
      {label}
    </div>
  );
}
