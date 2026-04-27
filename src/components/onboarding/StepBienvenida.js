import MezoWordmark from '../brand/MezoWordmark';

// Paso 0 — pantalla de bienvenida antes de iniciar la configuración
export default function StepBienvenida({ next }) {
  return (
    <div className="text-center">
      <div className="mb-6">
        <MezoWordmark height={52} color="#C8903F" />
      </div>

      <h1
        className="text-mezo-cream font-display font-medium mb-3 leading-snug"
        style={{ fontSize: 26, fontVariationSettings: '"SOFT" 50, "opsz" 72' }}
      >
        Bienvenido a mezo 👋
      </h1>
      <p className="text-mezo-stone font-body text-base leading-relaxed mb-8">
        Listo parce, vamos a montar tu negocio.<br />
        Esto no tarda más de 3 minutos.
      </p>

      <div className="text-left bg-mezo-ink-muted rounded-mezo-lg border border-mezo-ink-line px-5 py-4 space-y-3 mb-8">
        {[
          'Tu negocio y sus datos',
          'Tu primer producto en el menú',
          'Tus mesas y tu equipo',
        ].map(item => (
          <div key={item} className="flex items-center gap-3">
            <span
              className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
              style={{ background: 'rgba(61,170,104,0.18)', color: '#3DAA68' }}
            >
              ✓
            </span>
            <span className="text-mezo-cream font-body text-sm">{item}</span>
          </div>
        ))}
      </div>

      <button
        onClick={next}
        className="w-full bg-mezo-gold hover:bg-mezo-gold-deep text-mezo-ink font-semibold py-3.5 rounded-mezo-md text-base transition font-body"
      >
        ¡Arrancamos! →
      </button>
    </div>
  );
}
