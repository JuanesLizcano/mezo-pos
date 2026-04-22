const TIPOS = [
  { value: 'cafetería',   label: '☕ Cafetería' },
  { value: 'restaurante', label: '🍽️ Restaurante' },
  { value: 'bar',         label: '🍺 Bar / Cantina' },
  { value: 'panadería',   label: '🥐 Panadería' },
  { value: 'foodtruck',   label: '🚚 Food Truck' },
  { value: 'otro',        label: '🏪 Otro' },
];

export default function Step2Negocio({ data, updateData, next, prev }) {
  return (
    <div>
      <p className="text-xs text-mezo-stone uppercase tracking-widest mb-1 font-body">Paso 2</p>
      <h2 className="text-xl font-semibold text-mezo-cream mb-1 font-body">Tu negocio</h2>
      <p className="text-sm text-mezo-stone mb-6 font-body">Esta info aparece en tus reportes y tickets.</p>

      <form onSubmit={(e) => { e.preventDefault(); next(); }} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-mezo-cream-dim uppercase tracking-widest mb-2 font-body">
            Nombre del negocio
          </label>
          <input
            type="text" placeholder="Ej: Café El Origen" required maxLength={60}
            value={data.nombre} onChange={(e) => updateData({ nombre: e.target.value })}
            className="w-full px-4 py-2.5 bg-mezo-ink-muted border border-mezo-ink-line text-mezo-cream placeholder-mezo-stone rounded-mezo-md text-sm focus:outline-none focus:ring-2 focus:ring-mezo-gold focus:border-transparent transition font-body"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-mezo-cream-dim uppercase tracking-widest mb-2 font-body">
            Tipo de negocio
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {TIPOS.map((t) => (
              <button key={t.value} type="button"
                onClick={() => updateData({ tipo: t.value })}
                className={`px-3 py-2 rounded-mezo-sm text-sm border text-left transition font-body
                  ${data.tipo === t.value
                    ? 'border-mezo-gold bg-mezo-gold/10 text-mezo-gold font-medium'
                    : 'border-mezo-ink-line text-mezo-cream-dim hover:border-mezo-ink-muted'}`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-mezo-cream-dim uppercase tracking-widest mb-2 font-body">
            Ciudad
          </label>
          <input
            type="text" placeholder="Ej: Medellín" required
            value={data.ciudad} onChange={(e) => updateData({ ciudad: e.target.value })}
            className="w-full px-4 py-2.5 bg-mezo-ink-muted border border-mezo-ink-line text-mezo-cream placeholder-mezo-stone rounded-mezo-md text-sm focus:outline-none focus:ring-2 focus:ring-mezo-gold focus:border-transparent transition font-body"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-mezo-cream-dim uppercase tracking-widest mb-2 font-body">
            Teléfono <span className="normal-case text-mezo-stone">(opcional)</span>
          </label>
          <input
            type="tel" placeholder="+57 300 123 4567"
            value={data.telefono} onChange={(e) => updateData({ telefono: e.target.value })}
            className="w-full px-4 py-2.5 bg-mezo-ink-muted border border-mezo-ink-line text-mezo-cream placeholder-mezo-stone rounded-mezo-md text-sm focus:outline-none focus:ring-2 focus:ring-mezo-gold focus:border-transparent transition font-body"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={prev}
            className="flex-1 border border-mezo-ink-line text-mezo-cream-dim font-semibold py-2.5 rounded-mezo-md text-sm hover:bg-mezo-ink-muted transition font-body">
            ← Atrás
          </button>
          <button type="submit"
            className="flex-[2] bg-mezo-gold hover:bg-mezo-gold-deep text-mezo-ink font-semibold py-2.5 rounded-mezo-md text-sm transition shadow-mezo-gold font-body">
            Continuar →
          </button>
        </div>
      </form>
    </div>
  );
}
