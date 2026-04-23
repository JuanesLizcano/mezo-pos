import { formatCOP } from '../../utils/formatters';

// Calcula KPIs desde el array de órdenes del período
export function calcularKPIs(ordenes) {
  if (!ordenes.length) {
    return { total: 0, numOrdenes: 0, ticketPromedio: 0, mejorHora: null, productoTop: null, metodoPagoTop: null };
  }

  const total     = ordenes.reduce((s, o) => s + (o.total ?? 0), 0);
  const numOrdenes = ordenes.length;
  const ticketPromedio = Math.round(total / numOrdenes);

  // Mejor hora del día
  const porHora = {};
  ordenes.forEach(o => {
    if (!o.creadoEn) return;
    const h = new Date(o.creadoEn).getHours();
    porHora[h] = (porHora[h] ?? 0) + 1;
  });
  const mejorHoraNum = Object.keys(porHora).sort((a, b) => porHora[b] - porHora[a])[0];
  const mejorHora = mejorHoraNum != null
    ? `${String(mejorHoraNum).padStart(2, '0')}:00 – ${String((+mejorHoraNum + 1) % 24).padStart(2, '0')}:00`
    : null;

  // Producto #1 por cantidad vendida
  const porProducto = {};
  ordenes.forEach(o => {
    (o.lineas ?? []).forEach(l => {
      const key = l.nombre;
      porProducto[key] = (porProducto[key] ?? 0) + (l.cantidad ?? 1);
    });
  });
  const productoTop = Object.keys(porProducto).sort((a, b) => porProducto[b] - porProducto[a])[0] ?? null;
  const productoTopCantidad = productoTop ? porProducto[productoTop] : 0;

  // Método de pago más usado
  const porMetodo = {};
  ordenes.forEach(o => {
    if (!o.metodoPago) return;
    porMetodo[o.metodoPago] = (porMetodo[o.metodoPago] ?? 0) + 1;
  });
  const metodoPagoTop = Object.keys(porMetodo).sort((a, b) => porMetodo[b] - porMetodo[a])[0] ?? null;

  return { total, numOrdenes, ticketPromedio, mejorHora, productoTop, productoTopCantidad, metodoPagoTop };
}

const METODO_LABELS = {
  efectivo: 'Efectivo', datafono: 'Datáfono', nequi: 'Nequi',
  daviplata: 'Daviplata', transferencia: 'Transferencia',
};

export default function KPIs({ kpis }) {
  const { total, numOrdenes, ticketPromedio, mejorHora, productoTop, productoTopCantidad, metodoPagoTop } = kpis;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      <Tarjeta label="Total vendido" valor={formatCOP(total)} grande />
      <Tarjeta label="Órdenes" valor={numOrdenes} />
      <Tarjeta label="Ticket promedio" valor={formatCOP(ticketPromedio)} />
      <Tarjeta label="Mejor hora" valor={mejorHora ?? '—'} />
      <Tarjeta
        label="Producto #1"
        valor={productoTop ?? '—'}
        sub={productoTop ? `${productoTopCantidad} vendidos` : null}
      />
      <Tarjeta
        label="Pago más usado"
        valor={METODO_LABELS[metodoPagoTop] ?? metodoPagoTop ?? '—'}
      />
    </div>
  );
}

function Tarjeta({ label, valor, sub, grande }) {
  return (
    <div className="bg-mezo-ink-raised border border-mezo-ink-line rounded-mezo-lg px-4 py-4">
      <p className="text-mezo-stone uppercase tracking-widest font-body" style={{ fontSize: 10 }}>{label}</p>
      <p className={`font-mono font-bold text-mezo-cream mt-1 leading-tight ${grande ? 'text-xl' : 'text-base'}`}>
        {valor}
      </p>
      {sub && <p className="text-mezo-stone font-body mt-0.5" style={{ fontSize: 11 }}>{sub}</p>}
    </div>
  );
}
