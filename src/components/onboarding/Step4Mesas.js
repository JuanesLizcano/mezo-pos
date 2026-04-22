export default function Step4Mesas({ data, updateData, next, prev }) {
  return (
    <div>
      <p className="text-xs text-mezo-stone uppercase tracking-widest mb-1 font-body">Paso 4</p>
      <h2 className="text-xl font-semibold text-mezo-cream mb-1 font-body">Tus mesas</h2>
      <p className="text-sm text-mezo-stone mb-6 font-body">Puedes ajustar esto desde el panel después.</p>

      <form onSubmit={(e) => { e.preventDefault(); next(); }} className="space-y-5">
        {/* Toggle mesas */}
        <div className="flex items-center justify-between p-4 bg-mezo-ink-muted rounded-mezo-lg border border-mezo-ink-line">
          <div>
            <p className="text-sm font-medium text-mezo-cream font-body">¿Tu negocio tiene mesas?</p>
            <p className="text-xs text-mezo-stone mt-0.5 font-body">Si vendes solo en mostrador, desactívalas</p>
          </div>
          <button type="button"
            onClick={() => updateData({ tieneMesas: !data.tieneMesas })}
            className={`relative w-12 h-6 rounded-full transition-colors
              ${data.tieneMesas ? 'bg-mezo-gold' : 'bg-mezo-ink-line'}`}>
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform
              ${data.tieneMesas ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </div>

        {data.tieneMesas && (
          <div>
            <label className="block text-xs font-medium text-mezo-cream-dim uppercase tracking-widest mb-3 font-body">
              ¿Cuántas mesas tienes?
            </label>
            <div className="flex items-center gap-4">
              <button type="button"
                onClick={() => updateData({ mesas: Math.max(1, data.mesas - 1) })}
                className="w-10 h-10 rounded-mezo-md border border-mezo-ink-line text-mezo-cream-dim hover:bg-mezo-ink-muted text-lg font-bold transition flex items-center justify-center">
                −
              </button>
              <span className="text-2xl font-bold text-mezo-cream w-10 text-center font-mono">
                {data.mesas}
              </span>
              <button type="button"
                onClick={() => updateData({ mesas: Math.min(50, data.mesas + 1) })}
                className="w-10 h-10 rounded-mezo-md border border-mezo-ink-line text-mezo-cream-dim hover:bg-mezo-ink-muted text-lg font-bold transition flex items-center justify-center">
                +
              </button>
            </div>
            <p className="text-xs text-mezo-stone mt-2 font-body">
              Se crearán: Mesa 1, Mesa 2 … Mesa {data.mesas}
            </p>
          </div>
        )}

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
