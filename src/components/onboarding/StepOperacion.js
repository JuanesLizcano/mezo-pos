// Paso 3: información operativa — ciudad, mesas, horario, WhatsApp
export default function StepOperacion({ data, updateData, next, prev }) {
  return (
    <div>
      <p className="text-xs text-mezo-stone uppercase tracking-widest mb-1 font-body">Paso 3 de 5</p>
      <h2 className="text-xl font-semibold text-mezo-cream mb-1 font-body">Información del negocio</h2>
      <p className="text-sm text-mezo-stone mb-5 font-body">Puedes cambiar esto luego desde configuración.</p>

      <form onSubmit={(e) => { e.preventDefault(); next(); }} className="space-y-4">
        <Campo label="Ciudad" placeholder="Ej: Medellín" required
          value={data.ciudad} onChange={v => updateData({ ciudad: v })} />

        <Campo label="Dirección del negocio" placeholder="Ej: Calle 50 #10-30, El Poblado" required
          value={data.direccion} onChange={v => updateData({ direccion: v })} />

        <Campo label="WhatsApp del negocio" type="tel" placeholder="+57 300 123 4567"
          value={data.whatsapp} onChange={v => updateData({ whatsapp: v })} />

        <Campo label="Horario de atención" placeholder="Ej: Lunes a Sábado 7am – 9pm"
          value={data.horario} onChange={v => updateData({ horario: v })} />

        {/* Mesas */}
        <div className="bg-mezo-ink-muted rounded-mezo-lg border border-mezo-ink-line p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-medium text-mezo-cream font-body">¿Tu negocio tiene mesas?</p>
              <p className="text-xs text-mezo-stone mt-0.5 font-body">Desactiva si solo vendes en mostrador</p>
            </div>
            <button type="button" onClick={() => updateData({ tieneMesas: !data.tieneMesas })}
              className={`relative w-12 h-6 rounded-full transition-colors ${data.tieneMesas ? 'bg-mezo-gold' : 'bg-mezo-ink-line'}`}>
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${data.tieneMesas ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>

          {data.tieneMesas && (
            <div className="flex items-center gap-4">
              <button type="button"
                onClick={() => updateData({ mesas: Math.max(1, data.mesas - 1) })}
                className="w-10 h-10 rounded-mezo-md border border-mezo-ink-line text-mezo-cream-dim hover:bg-mezo-ink-line text-xl font-bold transition flex items-center justify-center">
                −
              </button>
              <span className="text-2xl font-bold text-mezo-cream w-10 text-center font-mono">{data.mesas}</span>
              <button type="button"
                onClick={() => updateData({ mesas: Math.min(50, data.mesas + 1) })}
                className="w-10 h-10 rounded-mezo-md border border-mezo-ink-line text-mezo-cream-dim hover:bg-mezo-ink-line text-xl font-bold transition flex items-center justify-center">
                +
              </button>
              <p className="text-xs text-mezo-stone font-body">Mesa 1 … Mesa {data.mesas}</p>
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={prev}
            className="flex-1 border border-mezo-ink-line text-mezo-cream-dim font-semibold py-2.5 rounded-mezo-md text-sm hover:bg-mezo-ink-muted transition font-body">
            ← Atrás
          </button>
          <button type="submit"
            className="flex-[2] bg-mezo-gold hover:bg-mezo-gold-deep text-mezo-ink font-semibold py-2.5 rounded-mezo-md text-sm transition font-body">
            Continuar →
          </button>
        </div>
      </form>
    </div>
  );
}

function Campo({ label, type = 'text', placeholder, value, onChange, required }) {
  return (
    <div>
      <label className="block text-xs font-medium text-mezo-cream-dim uppercase tracking-widest mb-2 font-body">
        {label}
      </label>
      <input type={type} placeholder={placeholder} value={value}
        onChange={e => onChange(e.target.value)} required={required}
        className="w-full px-4 py-2.5 bg-mezo-ink-muted border border-mezo-ink-line text-mezo-cream placeholder-mezo-stone rounded-mezo-md text-sm focus:outline-none focus:ring-2 focus:ring-mezo-gold focus:border-transparent transition font-body"
      />
    </div>
  );
}
