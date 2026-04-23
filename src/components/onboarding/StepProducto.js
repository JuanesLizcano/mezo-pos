import { useState } from 'react';
import { X } from 'lucide-react';

// Paso 4: primer producto del menú
export default function StepProducto({ data, updateData, next, prev }) {
  const [ingredienteInput, setIngredienteInput] = useState('');

  function agregarIngrediente(texto) {
    const val = texto.trim();
    if (!val) return;
    const actuales = data.productoIngredientes ?? [];
    if (!actuales.includes(val)) {
      updateData({ productoIngredientes: [...actuales, val] });
    }
    setIngredienteInput('');
  }

  function quitarIngrediente(ing) {
    updateData({ productoIngredientes: (data.productoIngredientes ?? []).filter(i => i !== ing) });
  }

  function handleIngredienteKey(e) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      agregarIngrediente(ingredienteInput);
    } else if (e.key === 'Backspace' && !ingredienteInput && (data.productoIngredientes ?? []).length) {
      updateData({ productoIngredientes: (data.productoIngredientes ?? []).slice(0, -1) });
    }
  }

  // Formatear precio mientras se escribe
  const precioDisplay = data.productoPrecio
    ? new Intl.NumberFormat('es-CO').format(parseInt(data.productoPrecio, 10) || 0)
    : '';

  function handlePrecioChange(e) {
    const soloDigitos = e.target.value.replace(/\D/g, '');
    updateData({ productoPrecio: soloDigitos });
  }

  return (
    <div>
      <p className="text-xs text-mezo-stone uppercase tracking-widest mb-1 font-body">Paso 4 de 5</p>
      <h2 className="text-xl font-semibold text-mezo-cream mb-1 font-body">Tu primer producto</h2>
      <p className="text-sm text-mezo-stone mb-5 font-body">
        Puedes agregar más desde el módulo Productos.{' '}
        <button type="button" onClick={next}
          className="text-mezo-gold hover:text-mezo-gold-soft font-medium transition">
          Saltar por ahora →
        </button>
      </p>

      <form onSubmit={(e) => { e.preventDefault(); next(); }} className="space-y-4">
        <Campo label="Nombre del producto" placeholder="Ej: Café americano" required
          value={data.productoNombre ?? ''} onChange={v => updateData({ productoNombre: v })} />

        {/* Precio con formato COP */}
        <div>
          <label className="block text-xs font-medium text-mezo-cream-dim uppercase tracking-widest mb-2 font-body">
            Precio (COP)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-mezo-stone font-mono text-sm">$</span>
            <input type="text" inputMode="numeric" placeholder="0" required
              value={precioDisplay} onChange={handlePrecioChange}
              className="w-full pl-7 pr-4 py-2.5 bg-mezo-ink-muted border border-mezo-ink-line text-mezo-cream font-mono placeholder-mezo-stone rounded-mezo-md text-sm focus:outline-none focus:ring-2 focus:ring-mezo-gold focus:border-transparent transition"
            />
          </div>
        </div>

        <Campo label="Descripción (opcional)" placeholder="Ej: Espresso doble con agua caliente"
          value={data.productoDescripcion ?? ''} onChange={v => updateData({ productoDescripcion: v })} />

        {/* Ingredientes */}
        <div>
          <label className="block text-xs font-medium text-mezo-cream-dim uppercase tracking-widest mb-2 font-body">
            Ingredientes <span className="normal-case text-mezo-stone">(opcional)</span>
          </label>
          <div className="w-full min-h-[42px] px-3 py-2 bg-mezo-ink-muted border border-mezo-ink-line rounded-mezo-md flex flex-wrap gap-1.5 items-center focus-within:ring-2 focus-within:ring-mezo-gold">
            {(data.productoIngredientes ?? []).map(ing => (
              <span key={ing}
                className="flex items-center gap-1 text-xs bg-mezo-ink-raised border border-mezo-ink-line text-mezo-cream-dim rounded px-2 py-0.5 font-body">
                {ing}
                <button type="button" onClick={() => quitarIngrediente(ing)}
                  className="text-mezo-stone hover:text-mezo-rojo transition ml-0.5">
                  <X size={10} />
                </button>
              </span>
            ))}
            <input
              type="text" placeholder={(data.productoIngredientes ?? []).length ? '' : 'Ej: leche, azúcar… Enter para agregar'}
              value={ingredienteInput}
              onChange={e => setIngredienteInput(e.target.value)}
              onKeyDown={handleIngredienteKey}
              onBlur={() => agregarIngrediente(ingredienteInput)}
              className="flex-1 min-w-24 bg-transparent text-mezo-cream text-xs placeholder-mezo-stone outline-none font-body"
            />
          </div>
          <p className="text-mezo-stone font-body text-xs mt-1">Enter o coma para agregar, Backspace para borrar.</p>
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

function Campo({ label, placeholder, value, onChange, required }) {
  return (
    <div>
      <label className="block text-xs font-medium text-mezo-cream-dim uppercase tracking-widest mb-2 font-body">
        {label}
      </label>
      <input type="text" placeholder={placeholder} value={value}
        onChange={e => onChange(e.target.value)} required={required}
        className="w-full px-4 py-2.5 bg-mezo-ink-muted border border-mezo-ink-line text-mezo-cream placeholder-mezo-stone rounded-mezo-md text-sm focus:outline-none focus:ring-2 focus:ring-mezo-gold focus:border-transparent transition font-body"
      />
    </div>
  );
}
