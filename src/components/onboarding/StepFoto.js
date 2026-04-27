import { useRef } from 'react';
import { Upload } from 'lucide-react';

const EMOJIS_COMIDA = [
  '☕','🥐','🍕','🍔','🌮','🍜','🍣','🥗','🍰','🧋',
  '🧇','🥩','🍗','🌯','🥪','🍱','🧆','🥘','🍳','🍦',
];

// Paso 5 — foto del producto: subir, emoji o IA (próximamente)
export default function StepFoto({ data, updateData, next, prev }) {
  const fileInputRef = useRef(null);
  const modo   = data.productoModo   ?? 'emoji';
  const emoji  = data.productoEmoji  ?? '🍽️';
  const preview = data.productoPreview ?? null;

  function handleArchivoChange(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    updateData({ productoModo: 'foto', productoPreview: URL.createObjectURL(f) });
  }

  function seleccionarEmoji(e) {
    updateData({ productoEmoji: e, productoModo: 'emoji' });
  }

  return (
    <div>
      <h2 className="text-mezo-cream font-display font-medium mb-1 leading-snug"
        style={{ fontSize: 22, fontVariationSettings: '"SOFT" 30, "opsz" 36' }}>
        {data.productoNombre
          ? `Ponle cara a tu ${data.productoNombre}`
          : 'Foto del producto'}
      </h2>
      <p className="text-sm text-mezo-stone mb-5 font-body">
        Los clientes comen primero con los ojos.
      </p>

      {/* Tres opciones en cards */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        <OpcionCard
          emoji="📸" label="Subir mi foto"
          activa={modo === 'foto'}
          onClick={() => fileInputRef.current?.click()}
        />
        <OpcionCard
          emoji="🎨" label="Elegir emoji"
          activa={modo === 'emoji'}
          onClick={() => updateData({ productoModo: 'emoji' })}
        />
        <OpcionCard
          emoji="✨" label="Crear con IA"
          activa={false} disabled
          badge="Próximamente"
          onClick={() => {}}
        />
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
        onChange={handleArchivoChange} />

      {/* Panel de foto subida */}
      {modo === 'foto' && (
        <div className="mb-4">
          {preview ? (
            <div className="relative rounded-mezo-lg overflow-hidden h-40 bg-mezo-ink-muted mb-2">
              <img src={preview} alt="preview" className="w-full h-full object-cover" />
              <button type="button"
                onClick={() => updateData({ productoModo: 'emoji', productoPreview: null })}
                className="absolute top-2 right-2 bg-mezo-ink/80 text-mezo-cream text-xs px-2 py-1 rounded-mezo-sm font-body">
                Cambiar
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => fileInputRef.current?.click()}
              className="w-full h-36 border-2 border-dashed border-mezo-ink-line rounded-mezo-lg flex flex-col items-center justify-center gap-2 text-mezo-stone hover:border-mezo-gold/40 hover:text-mezo-cream transition">
              <Upload size={22} />
              <span className="text-sm font-body">Toca para subir foto</span>
            </button>
          )}
        </div>
      )}

      {/* Panel de emojis */}
      {modo === 'emoji' && (
        <div className="grid grid-cols-5 gap-2 mb-4">
          {EMOJIS_COMIDA.map(e => (
            <button key={e} type="button" onClick={() => seleccionarEmoji(e)}
              className={`h-11 rounded-mezo-md text-2xl transition border
                ${emoji === e
                  ? 'bg-mezo-gold/15 border-mezo-gold scale-110'
                  : 'border-mezo-ink-line hover:border-mezo-gold/40 bg-mezo-ink-muted'}`}>
              {e}
            </button>
          ))}
        </div>
      )}

      <p className="text-mezo-stone font-body text-xs text-center mb-5">
        También puedes saltarte esto y añadirla después
      </p>

      <div className="flex gap-3">
        <button type="button" onClick={prev}
          className="flex-1 border border-mezo-ink-line text-mezo-cream-dim font-semibold py-2.5 rounded-mezo-md text-sm hover:bg-mezo-ink-muted transition font-body">
          ← Atrás
        </button>
        <button type="button" onClick={next}
          className="flex-[2] bg-mezo-gold hover:bg-mezo-gold-deep text-mezo-ink font-semibold py-2.5 rounded-mezo-md text-sm transition font-body">
          Continuar →
        </button>
      </div>
    </div>
  );
}

function OpcionCard({ emoji, label, activa, onClick, disabled, badge }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled}
      className={`relative flex flex-col items-center gap-2 py-4 px-2 rounded-mezo-xl border text-center transition font-body
        ${activa
          ? 'border-mezo-gold bg-mezo-gold/10 text-mezo-gold'
          : disabled
            ? 'border-mezo-ink-line text-mezo-stone/50 cursor-not-allowed'
            : 'border-mezo-ink-line text-mezo-stone hover:border-mezo-gold/40 hover:text-mezo-cream'}`}
    >
      {badge && (
        <span className="absolute top-1 right-1 text-[8px] font-body font-semibold px-1 py-0.5 rounded"
          style={{ background: 'rgba(200,144,63,0.15)', color: '#C8903F', border: '1px solid rgba(200,144,63,0.3)' }}>
          {badge}
        </span>
      )}
      <span style={{ fontSize: 26 }}>{emoji}</span>
      <span className="text-xs font-medium leading-tight">{label}</span>
    </button>
  );
}
