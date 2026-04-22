const PLANES = [
  {
    id: 'semilla', nombre: 'Semilla', precio: '$39.900', cajas: '1 caja',
    features: ['POS completo', 'Mesas básicas', 'Reportes diarios', 'Ticket imprimible'],
    recomendado: false,
    activeBorder: 'border-mezo-verde', activeRing: 'ring-mezo-verde/20',
    badge: 'bg-mezo-verde/15 text-mezo-verde',
  },
  {
    id: 'pro', nombre: 'Pro', precio: '$99.900', cajas: 'Hasta 3 cajas',
    features: ['Todo lo de Semilla', 'Análisis IA con Claude', 'Pantalla de cocina', 'División de cuenta', 'Reportes avanzados'],
    recomendado: true,
    activeBorder: 'border-mezo-gold', activeRing: 'ring-mezo-gold/20',
    badge: 'bg-mezo-gold/15 text-mezo-gold',
  },
  {
    id: 'elite', nombre: 'Élite', precio: '$199.900', cajas: 'Cajas ilimitadas',
    features: ['Todo lo de Pro', 'Múltiples sedes', 'Reportes por sede', 'Soporte prioritario', 'Factura DIAN (pronto)'],
    recomendado: false,
    activeBorder: 'border-mezo-cream-dim', activeRing: 'ring-mezo-cream/10',
    badge: 'bg-mezo-cream/10 text-mezo-cream-dim',
  },
];

export default function Step3Plan({ data, updateData, next, prev }) {
  return (
    <div>
      <p className="text-xs text-mezo-stone uppercase tracking-widest mb-1 font-body">Paso 3</p>
      <h2 className="text-xl font-semibold text-mezo-cream mb-1 font-body">Elige tu plan</h2>
      <p className="text-sm text-mezo-stone mb-6 font-body">Sin permanencia. Cambia cuando quieras.</p>

      <div className="space-y-3 mb-6">
        {PLANES.map((plan) => {
          const sel = data.plan === plan.id;
          return (
            <button key={plan.id} type="button"
              onClick={() => updateData({ plan: plan.id })}
              className={`w-full text-left border-2 rounded-mezo-lg p-4 transition font-body bg-mezo-ink-raised
                ${sel ? `${plan.activeBorder} ring-4 ${plan.activeRing}` : 'border-mezo-ink-line hover:border-mezo-ink-muted'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-bold text-mezo-cream text-sm">{plan.nombre}</span>
                    {plan.recomendado && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${plan.badge}`}>
                        Recomendado
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-mezo-stone">{plan.cajas}</p>
                  <ul className="mt-2 space-y-0.5">
                    {plan.features.map((f) => (
                      <li key={f} className="text-xs text-mezo-cream-dim flex items-center gap-1.5">
                        <span className="text-mezo-verde font-bold">✓</span> {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-mezo-cream font-mono">{plan.precio}</p>
                  <p className="text-xs text-mezo-stone">COP/mes</p>
                  <div className={`mt-2 w-5 h-5 rounded-full border-2 flex items-center justify-center ml-auto transition
                    ${sel ? `${plan.activeBorder} bg-transparent` : 'border-mezo-ink-line'}`}>
                    {sel && <div className="w-2.5 h-2.5 rounded-full bg-mezo-gold" />}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <p className="text-xs text-mezo-stone text-center mb-4 font-body">
        💳 El cobro se activa cuando configures tu suscripción. Hoy es gratis.
      </p>

      <div className="flex gap-3">
        <button type="button" onClick={prev}
          className="flex-1 border border-mezo-ink-line text-mezo-cream-dim font-semibold py-2.5 rounded-mezo-md text-sm hover:bg-mezo-ink-muted transition font-body">
          ← Atrás
        </button>
        <button type="button" onClick={next}
          className="flex-[2] bg-mezo-gold hover:bg-mezo-gold-deep text-mezo-ink font-semibold py-2.5 rounded-mezo-md text-sm transition shadow-mezo-gold font-body">
          Continuar →
        </button>
      </div>
    </div>
  );
}
