// Paso 3 — info del negocio en dos columnas con tips contextuales
export default function StepOperacion({ data, updateData, next, prev }) {
  return (
    <div>
      <h2 className="text-mezo-cream font-display font-medium mb-1 leading-snug"
        style={{ fontSize: 22, fontVariationSettings: '"SOFT" 30, "opsz" 36' }}>
        Cuéntanos más de {data.nombre || 'tu negocio'}
      </h2>
      <p className="text-sm text-mezo-stone mb-5 font-body">
        Esta información aparecerá en tus facturas y reportes.
      </p>

      <form onSubmit={e => { e.preventDefault(); next(); }} className="space-y-4">

        {/* Fila 1: Ciudad · WhatsApp */}
        <div className="grid grid-cols-2 gap-3">
          <Campo label="Ciudad *" placeholder="Ej: Medellín"
            value={data.city} onChange={v => updateData({ city: v })} required />
          <div>
            <Campo label="WhatsApp del negocio" type="tel" placeholder="+57 300 123 4567"
              value={data.phone} onChange={v => updateData({ phone: v })} />
            <p className="text-mezo-stone font-body mt-1" style={{ fontSize: 10 }}>
              💡 Lo usamos para el reporte al cerrar el día
            </p>
          </div>
        </div>

        {/* Fila 2: Dirección · Horario */}
        <div className="grid grid-cols-2 gap-3">
          <Campo label="Dirección *" placeholder="Calle 50 #10-30"
            value={data.address} onChange={v => updateData({ address: v })} required />
          <div>
            <label className="block text-xs font-medium text-mezo-cream-dim uppercase tracking-widest mb-2 font-body">
              Horario
            </label>
            <div className="flex items-center gap-2">
              <input type="time" value={data.openingTime}
                onChange={e => updateData({ openingTime: e.target.value })}
                className="flex-1 px-2 py-2 bg-mezo-ink-muted border border-mezo-ink-line text-mezo-cream rounded-mezo-md text-xs focus:outline-none focus:ring-1 focus:ring-mezo-gold/50 font-body"
              />
              <span className="text-mezo-stone text-xs font-body">–</span>
              <input type="time" value={data.closingTime}
                onChange={e => updateData({ closingTime: e.target.value })}
                className="flex-1 px-2 py-2 bg-mezo-ink-muted border border-mezo-ink-line text-mezo-cream rounded-mezo-md text-xs focus:outline-none focus:ring-1 focus:ring-mezo-gold/50 font-body"
              />
            </div>
          </div>
        </div>

        {/* Fila 3: NIT · Correo */}
        <div className="grid grid-cols-2 gap-3">
          <Campo label="NIT (opcional)" placeholder="900.123.456-7"
            value={data.nit ?? ''} onChange={v => updateData({ nit: v })} />
          <Campo label="Correo del negocio" type="email" placeholder="hola@minegocio.com"
            value={data.email ?? ''} onChange={v => updateData({ email: v })} />
        </div>

        {/* Fila 4: Mesas — full width */}
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

        <div className="flex gap-3 pt-1">
          <button type="button" onClick={prev}
            className="flex-1 border border-mezo-ink-line text-mezo-cream-dim font-semibold py-2.5 rounded-mezo-md text-sm hover:bg-mezo-ink-muted transition font-body">
            ← Atrás
          </button>
          <button type="submit" disabled={!data.city || !data.address}
            className="flex-[2] bg-mezo-gold hover:bg-mezo-gold-deep disabled:opacity-40 text-mezo-ink font-semibold py-2.5 rounded-mezo-md text-sm transition font-body">
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
        className="w-full px-3 py-2.5 bg-mezo-ink-muted border border-mezo-ink-line text-mezo-cream placeholder-mezo-stone rounded-mezo-md text-sm focus:outline-none focus:ring-2 focus:ring-mezo-gold focus:border-transparent transition font-body"
      />
    </div>
  );
}
