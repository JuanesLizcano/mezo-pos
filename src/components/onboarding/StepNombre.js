import MezoWordmark from '../brand/MezoWordmark';

// Paso 1: nombre del negocio con preview animado del logo
export default function StepNombre({ data, updateData, next }) {
  return (
    <div>
      <p className="text-xs text-mezo-stone uppercase tracking-widest mb-1 font-body">Paso 1 de 5</p>
      <h2 className="text-xl font-semibold text-mezo-cream mb-1 font-body">¿Cómo se llama tu negocio?</h2>
      <p className="text-sm text-mezo-stone mb-6 font-body">Este nombre aparecerá en tus tickets y reportes.</p>

      <form onSubmit={(e) => { e.preventDefault(); next(); }} className="space-y-5">
        <div>
          <input
            type="text"
            placeholder="Ej: Café El Origen"
            required
            maxLength={60}
            autoFocus
            value={data.nombre}
            onChange={(e) => updateData({ nombre: e.target.value })}
            className="w-full px-4 py-3 bg-mezo-ink-muted border border-mezo-ink-line text-mezo-cream placeholder-mezo-stone rounded-mezo-md text-lg focus:outline-none focus:ring-2 focus:ring-mezo-gold focus:border-transparent transition font-body"
          />
        </div>

        {/* Preview dinámico */}
        {data.nombre && (
          <div className="bg-mezo-ink-muted rounded-mezo-lg border border-mezo-ink-line p-5 flex items-center gap-4">
            <MezoWordmark height={32} color="#C8903F" />
            <div className="w-px h-8 bg-mezo-ink-line" />
            <p className="text-mezo-cream font-display font-medium text-lg leading-none"
              style={{ fontVariationSettings: '"SOFT" 50, "opsz" 36' }}>
              {data.nombre}
            </p>
          </div>
        )}

        <button type="submit" disabled={!data.nombre.trim()}
          className="w-full bg-mezo-gold hover:bg-mezo-gold-deep disabled:opacity-40 text-mezo-ink font-semibold py-3 rounded-mezo-md text-sm transition font-body">
          Continuar →
        </button>
      </form>
    </div>
  );
}
