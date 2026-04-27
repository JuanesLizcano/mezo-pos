import MezoWordmark from '../brand/MezoWordmark';

// Paso 1 — nombre del negocio con preview animado en Fraunces
export default function StepNombre({ data, updateData, next }) {
  return (
    <div>
      <h2 className="text-mezo-cream font-display font-medium mb-1 leading-snug"
        style={{ fontSize: 22, fontVariationSettings: '"SOFT" 30, "opsz" 36' }}>
        ¿Cómo se llama tu negocio?
      </h2>
      <p className="text-sm text-mezo-stone mb-6 font-body">
        El nombre con el que tus clientes te conocen.
      </p>

      <form onSubmit={e => { e.preventDefault(); next(); }} className="space-y-5">
        <input
          type="text" autoFocus required maxLength={60}
          placeholder="Ej: Café El Parche, Restaurante La Abuela, Fritanga Don Carlos…"
          value={data.nombre}
          onChange={e => updateData({ nombre: e.target.value })}
          className="w-full px-4 py-3 bg-mezo-ink-muted border border-mezo-ink-line text-mezo-cream placeholder-mezo-stone rounded-mezo-md text-base focus:outline-none focus:ring-2 focus:ring-mezo-gold focus:border-transparent transition font-body"
        />

        {/* Preview dinámico con transición suave */}
        <div
          className="bg-mezo-ink-muted rounded-mezo-lg border border-mezo-ink-line p-5 flex items-center gap-4 transition-all duration-300"
          style={{
            opacity:   data.nombre.trim() ? 1 : 0.35,
            transform: data.nombre.trim() ? 'translateY(0)' : 'translateY(4px)',
          }}
        >
          <MezoWordmark height={28} color="#C8903F" />
          <div className="w-px h-7 bg-mezo-ink-line flex-shrink-0" />
          <p className="text-mezo-cream font-display font-medium text-xl leading-none truncate"
            style={{ fontVariationSettings: '"SOFT" 50, "opsz" 36' }}>
            {data.nombre.trim() || 'Tu negocio'}
          </p>
        </div>

        <button type="submit" disabled={!data.nombre.trim()}
          className="w-full bg-mezo-gold hover:bg-mezo-gold-deep disabled:opacity-40 text-mezo-ink font-semibold py-3 rounded-mezo-md text-sm transition font-body">
          Continuar →
        </button>
      </form>
    </div>
  );
}
