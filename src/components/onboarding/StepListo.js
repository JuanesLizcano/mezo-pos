import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createNegocio, createProducto } from '../../services';
import { emailBienvenida } from '../../services/emails';
import { useAuth } from '../../context/AuthContext';

const TIPO_BACKEND = {
  'cafetería':     'CAFE',
  'restaurante':   'RESTAURANT',
  'panadería':     'BAKERY',
  'tienda':        'OTHER',
  'heladería':     'ICE_CREAM',
  'bar':           'BAR',
  'comida rápida': 'FAST_FOOD',
  'juguería':      'JUICE_BAR',
  'pizzería':      'PIZZERIA',
  'sushi':         'SUSHI',
  'asadero':       'GRILL',
  'otro':          'OTHER',
};

// Puntos de confetti animados con CSS puro — sin librerías
function Confetti() {
  const puntos = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    color: ['#C8903F','#3DAA68','#FCD116','#CE1126','#003893'][i % 5],
    left: `${4 + (i * 5) % 92}%`,
    delay: `${(i * 0.11).toFixed(2)}s`,
    dur: `${1.3 + (i % 4) * 0.25}s`,
    size: 5 + (i % 4),
  }));
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {puntos.map(p => (
        <span key={p.id} style={{
          position: 'absolute', left: p.left, top: '-8px',
          width: p.size, height: p.size, borderRadius: '50%',
          background: p.color, opacity: 0.85,
          animation: `confetti-caer ${p.dur} ${p.delay} ease-in both`,
        }} />
      ))}
      <style>{`
        @keyframes confetti-caer {
          0%   { transform: translateY(0) rotate(0deg);   opacity: 0.85; }
          80%  { opacity: 0.6; }
          100% { transform: translateY(340px) rotate(400deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

function ResumenFila({ check, color, label }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
        style={{ background: `${color}20`, color }}>
        {check}
      </span>
      <span className="text-mezo-cream font-body text-sm">{label}</span>
    </div>
  );
}

// Paso final — resumen, guardado y pantalla de celebración
export default function StepListo({ data, prev }) {
  const { refreshNegocio, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading]   = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [error, setError]       = useState('');

  async function handleFinalizar() {
    setLoading(true);
    setError('');
    try {
      await createNegocio({
        name:        data.nombre,
        type:        TIPO_BACKEND[data.tipo] ?? 'OTHER',
        phone:       data.phone     ?? '',
        email:       data.email     ?? '',
        nit:         data.nit       ?? '',
        address:     data.address   ?? '',
        city:        data.city,
        country:     'Colombia',
        openingTime: data.openingTime ?? '07:00',
        closingTime: data.closingTime ?? '22:00',
        tableCount:  data.tieneMesas ? (data.mesas ?? 0) : 0,
      });

      if (data.productoNombre?.trim()) {
        await createProducto({
          nombre:       data.productoNombre.trim(),
          precio:       parseInt(data.productoPrecio,  10) || 0,
          costo:        parseInt(data.productoCosto,   10) || 0,
          descripcion:  data.productoDescripcion ?? '',
          ingredientes: data.productoIngredientes ?? [],
          categoriaId:  null,
          emoji:        data.productoModo !== 'foto' ? (data.productoEmoji ?? '🍽️') : null,
          disponible:   true,
        });
      }

      await refreshNegocio();
      if (user?.email) emailBienvenida({ name: data.nombre }, user.email).catch(() => {});
      setGuardado(true);
    } catch {
      setError('Parcero, algo salió mal. Intenta de nuevo 😅');
      setLoading(false);
    }
  }

  // ── Pantalla de celebración ──────────────────────────────────────────────
  if (guardado) {
    return (
      <div className="relative text-center" style={{ minHeight: 360 }}>
        <Confetti />
        <div className="relative z-10 pt-2">
          <span style={{ fontSize: 54 }} className="block mb-4">🎉</span>
          <h2 className="text-mezo-cream font-display font-medium mb-2 leading-snug"
            style={{ fontSize: 22, fontVariationSettings: '"SOFT" 50, "opsz" 72' }}>
            ¡{data.nombre} ya está en mezo!
          </h2>
          <p className="text-mezo-stone font-body text-sm mb-7">Ya puedes empezar a cobrar</p>

          <div className="bg-mezo-ink-muted rounded-mezo-lg border border-mezo-ink-line px-5 py-4 text-left space-y-3 mb-7">
            <ResumenFila check="✓" color="#3DAA68" label={`Negocio: ${data.nombre} · ${data.tipo}`} />
            {data.tieneMesas && (
              <ResumenFila check="✓" color="#3DAA68"
                label={`${data.mesas} mesa${data.mesas !== 1 ? 's' : ''} configuradas`} />
            )}
            {data.productoNombre?.trim() && (
              <ResumenFila check="✓" color="#3DAA68" label={`Primer producto: ${data.productoNombre}`} />
            )}
            <ResumenFila check="✓" color="#C8903F" label="Plan Pro activo — 30 días gratis" />
          </div>

          <button onClick={() => navigate('/dashboard')}
            className="w-full bg-mezo-gold hover:bg-mezo-gold-deep text-mezo-ink font-semibold py-3.5 rounded-mezo-md text-base transition font-body">
            Ir a mi dashboard →
          </button>
        </div>
      </div>
    );
  }

  // ── Resumen previo al guardado ───────────────────────────────────────────
  return (
    <div className="text-center">
      <span style={{ fontSize: 48 }} className="block mb-4">🚀</span>
      <h2 className="text-mezo-cream font-display font-medium mb-2"
        style={{ fontSize: 22, fontVariationSettings: '"SOFT" 50, "opsz" 72' }}>
        ¡Todo listo para lanzar!
      </h2>
      <p className="text-mezo-stone font-body text-sm mb-6">
        Revisa el resumen y dale al botón.
      </p>

      <div className="bg-mezo-ink-muted rounded-mezo-lg border border-mezo-ink-line px-5 py-4 text-left space-y-2.5 mb-6">
        <ResumenFila check="✓" color="#3DAA68" label={`Negocio: ${data.nombre || '—'}`} />
        <ResumenFila check="✓" color="#3DAA68" label={`Tipo: ${data.tipo}`} />
        {data.city && <ResumenFila check="✓" color="#3DAA68" label={`Ciudad: ${data.city}`} />}
        <ResumenFila check="✓" color="#3DAA68"
          label={data.tieneMesas ? `${data.mesas} mesa${data.mesas !== 1 ? 's' : ''}` : 'Sin mesas (mostrador)'} />
        {data.productoNombre?.trim()
          ? <ResumenFila check="✓" color="#3DAA68" label={`Producto: ${data.productoNombre}`} />
          : <ResumenFila check="·" color="#6B6055" label="Sin producto (agregar después)" />
        }
      </div>

      {error && (
        <p className="text-mezo-rojo text-sm bg-mezo-rojo/10 border border-mezo-rojo/30 rounded-mezo-md px-4 py-2 mb-4 font-body">
          {error}
        </p>
      )}

      <button type="button" onClick={handleFinalizar} disabled={loading}
        className="w-full bg-mezo-gold hover:bg-mezo-gold-deep disabled:opacity-50 text-mezo-ink font-bold py-3.5 rounded-mezo-md text-base transition font-body mb-3">
        {loading ? 'Configurando mezo…' : '🚀 Lanzar mezo'}
      </button>

      <button type="button" onClick={prev} disabled={loading}
        className="text-sm text-mezo-stone hover:text-mezo-cream-dim transition font-body">
        ← Cambiar algo
      </button>
    </div>
  );
}
