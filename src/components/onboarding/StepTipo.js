// Paso 2: tipo de tienda — 12 categorías colombianas
const TIPOS = [
  { value: 'cafetería',        label: 'Cafetería',          emoji: '☕' },
  { value: 'restaurante',      label: 'Restaurante',        emoji: '🍽️' },
  { value: 'panadería',        label: 'Panadería',          emoji: '🥐' },
  { value: 'tienda',           label: 'Tienda / Minimercado', emoji: '🛒' },
  { value: 'heladería',        label: 'Heladería',          emoji: '🍦' },
  { value: 'bar',              label: 'Bar',                emoji: '🍺' },
  { value: 'comida rápida',    label: 'Comida rápida',      emoji: '🍔' },
  { value: 'juguería',         label: 'Juguería',           emoji: '🧃' },
  { value: 'pizzería',         label: 'Pizzería',           emoji: '🍕' },
  { value: 'sushi',            label: 'Sushi / Japonés',    emoji: '🍱' },
  { value: 'asadero',          label: 'Asadero / Pollo',    emoji: '🍗' },
  { value: 'otro',             label: 'Otro',               emoji: '🏪' },
];

export default function StepTipo({ data, updateData, next, prev }) {
  return (
    <div>
      <p className="text-xs text-mezo-stone uppercase tracking-widest mb-1 font-body">Paso 2 de 5</p>
      <h2 className="text-xl font-semibold text-mezo-cream mb-1 font-body">¿Qué tipo de negocio es?</h2>
      <p className="text-sm text-mezo-stone mb-5 font-body">Esto personaliza el menú y los reportes.</p>

      <div className="grid grid-cols-3 gap-2 mb-6">
        {TIPOS.map((t) => {
          const sel = data.tipo === t.value;
          return (
            <button key={t.value} type="button" onClick={() => updateData({ tipo: t.value })}
              className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-mezo-lg border text-center transition font-body
                ${sel
                  ? 'border-mezo-gold bg-mezo-gold/10 text-mezo-gold'
                  : 'border-mezo-ink-line text-mezo-cream-dim hover:border-mezo-ink-muted hover:text-mezo-cream'}`}>
              <span style={{ fontSize: 22 }}>{t.emoji}</span>
              <span className="text-xs font-medium leading-tight">{t.label}</span>
            </button>
          );
        })}
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={prev}
          className="flex-1 border border-mezo-ink-line text-mezo-cream-dim font-semibold py-2.5 rounded-mezo-md text-sm hover:bg-mezo-ink-muted transition font-body">
          ← Atrás
        </button>
        <button type="button" onClick={next} disabled={!data.tipo}
          className="flex-[2] bg-mezo-gold hover:bg-mezo-gold-deep disabled:opacity-40 text-mezo-ink font-semibold py-2.5 rounded-mezo-md text-sm transition font-body">
          Continuar →
        </button>
      </div>
    </div>
  );
}
