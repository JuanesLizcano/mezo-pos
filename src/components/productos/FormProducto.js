import { useState, useRef } from 'react';
import { ImagePlus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { createProducto, updateProducto } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { useCategorias } from '../../hooks/useCategorias';
import Modal from '../ui/Modal';

const INPUT_CLS = 'w-full px-4 py-2.5 bg-mezo-ink-muted border border-mezo-ink-line text-mezo-cream placeholder-mezo-stone rounded-mezo-md text-sm focus:outline-none focus:ring-2 focus:ring-mezo-gold focus:border-transparent transition font-body';
const LABEL_CLS = 'block text-xs font-medium text-mezo-cream-dim uppercase tracking-widest mb-2 font-body';

export default function FormProducto({ producto = null, onClose }) {
  const { bumpVersion }  = useAuth();
  const { categorias }   = useCategorias();
  const fileRef          = useRef(null);
  const esEdicion        = !!producto;

  const [nombre,        setNombre]        = useState(producto?.nombre ?? '');
  const [descripcion,   setDescripcion]   = useState(producto?.descripcion ?? '');
  const [precio,        setPrecio]        = useState(producto?.precio ?? '');
  const [costo,         setCosto]         = useState(producto?.costo ?? '');
  const [categoriaId,   setCategoriaId]   = useState(producto?.categoriaId ?? '');
  const [disponible,    setDisponible]    = useState(producto?.disponible ?? true);
  const [ingredientes,  setIngredientes]  = useState(producto?.ingredientes ?? []);
  const [ingredInput,   setIngredInput]   = useState('');
  const [imagenPreview, setImagenPreview] = useState(producto?.imagen ?? null);
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState('');

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) { setError('La imagen no puede superar 3MB.'); return; }
    setImagenPreview(URL.createObjectURL(file));
    setError('');
  }

  function quitarImagen() {
    setImagenPreview(null);
    if (fileRef.current) fileRef.current.value = '';
  }

  function agregarIngrediente() {
    const val = ingredInput.trim().replace(/,+$/, '');
    if (val && !ingredientes.includes(val)) setIngredientes(prev => [...prev, val]);
    setIngredInput('');
  }

  function handleIngredKey(e) {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); agregarIngrediente(); }
    if (e.key === 'Backspace' && ingredInput === '' && ingredientes.length > 0) {
      setIngredientes(prev => prev.slice(0, -1));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!nombre.trim() || !precio) return;
    if (ingredInput.trim()) agregarIngrediente();
    setLoading(true); setError('');
    try {
      const base = {
        nombre:       nombre.trim(),
        descripcion:  descripcion.trim(),
        precio:       Number(precio),
        costo:        Number(costo) || 0,
        categoriaId:  categoriaId || null,
        disponible,
        ingredientes,
        imagen:       null,
      };
      if (esEdicion) {
        await updateProducto(producto.id, base);
      } else {
        await createProducto(base);
      }
      bumpVersion();
      toast.success(esEdicion ? 'Producto actualizado ✓' : 'Producto creado ✓');
      onClose();
    } catch {
      toast.error('Error al guardar el producto. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal titulo={esEdicion ? 'Editar producto' : 'Nuevo producto'} onClose={onClose} ancho="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Imagen */}
        <div>
          <label className={LABEL_CLS}>Imagen</label>
          {imagenPreview ? (
            <div className="relative w-full h-40 rounded-mezo-lg overflow-hidden border border-mezo-ink-line">
              <img src={imagenPreview} alt="preview" className="w-full h-full object-cover" />
              <button type="button" onClick={quitarImagen}
                className="absolute top-2 right-2 bg-mezo-ink/70 text-mezo-cream rounded-full p-1 hover:bg-mezo-ink transition">
                <X size={14} />
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => fileRef.current?.click()}
              className="w-full h-32 border-2 border-dashed border-mezo-ink-line rounded-mezo-lg flex flex-col items-center justify-center gap-2 text-mezo-stone hover:border-mezo-gold hover:text-mezo-gold transition">
              <ImagePlus size={22} />
              <span className="text-sm font-body">Subir imagen (máx. 3MB)</span>
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        </div>

        {/* Nombre */}
        <div>
          <label className={LABEL_CLS}>Nombre *</label>
          <input type="text" value={nombre} onChange={e => setNombre(e.target.value)}
            placeholder="Ej: Cappuccino 8oz" required maxLength={80} className={INPUT_CLS} />
        </div>

        {/* Descripción */}
        <div>
          <label className={LABEL_CLS}>Descripción <span className="normal-case text-mezo-stone">(opcional)</span></label>
          <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)}
            placeholder="Breve descripción del plato o bebida..." rows={2} maxLength={200}
            className={`${INPUT_CLS} resize-none`} />
        </div>

        {/* Ingredientes chips */}
        <div>
          <label className={LABEL_CLS}>Ingredientes <span className="normal-case text-mezo-stone">(opcional)</span></label>
          <div className="min-h-[44px] px-3 py-2 bg-mezo-ink-muted border border-mezo-ink-line rounded-mezo-md flex flex-wrap gap-1.5 items-center cursor-text focus-within:ring-2 focus-within:ring-mezo-gold focus-within:border-transparent transition"
            onClick={() => document.getElementById('ingred-input')?.focus()}>
            {ingredientes.map(item => (
              <span key={item} className="inline-flex items-center gap-1 bg-mezo-ink-line text-mezo-cream-dim text-xs px-2 py-1 rounded-mezo-sm font-body">
                {item}
                <button type="button" onClick={() => setIngredientes(prev => prev.filter(i => i !== item))}
                  className="text-mezo-stone hover:text-mezo-cream transition ml-0.5"><X size={10} /></button>
              </span>
            ))}
            <input id="ingred-input" type="text" value={ingredInput}
              onChange={e => setIngredInput(e.target.value)}
              onKeyDown={handleIngredKey} onBlur={agregarIngrediente}
              placeholder={ingredientes.length === 0 ? 'Escribe y presiona Enter o coma...' : ''}
              className="flex-1 min-w-[140px] bg-transparent border-none outline-none text-mezo-cream placeholder-mezo-stone text-sm font-body" />
          </div>
          <p className="text-xs text-mezo-stone mt-1.5 font-body">Enter o coma para agregar · Backspace para borrar el último</p>
        </div>

        {/* Precio de venta + Costo de producción */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={LABEL_CLS}>Precio de venta (COP) *</label>
            <input type="number" value={precio} onChange={e => setPrecio(e.target.value)}
              placeholder="0" required min={0}
              className="w-full px-4 py-2.5 bg-mezo-ink-muted border border-mezo-ink-line text-mezo-cream placeholder-mezo-stone rounded-mezo-md text-sm focus:outline-none focus:ring-2 focus:ring-mezo-gold focus:border-transparent transition font-mono" />
          </div>
          <div>
            <label className={LABEL_CLS}>
              Costo de producción
              <span className="ml-1 text-mezo-stone normal-case">(opcional)</span>
            </label>
            <input type="number" value={costo} onChange={e => setCosto(e.target.value)}
              placeholder="0" min={0}
              className="w-full px-4 py-2.5 bg-mezo-ink-muted border border-mezo-ink-line text-mezo-cream placeholder-mezo-stone rounded-mezo-md text-sm focus:outline-none focus:ring-2 focus:ring-mezo-gold focus:border-transparent transition font-mono" />
            {costo > 0 && precio > 0 && (
              <p className="text-xs mt-1 font-body"
                style={{ color: ((precio - costo) / precio) >= 0.55 ? '#3DAA68' : '#D9A437' }}>
                Margen {Math.round(((precio - costo) / precio) * 100)}%
              </p>
            )}
          </div>
        </div>

        {/* Categoría */}
        <div>
          <label className={LABEL_CLS}>Categoría</label>
          <select value={categoriaId} onChange={e => setCategoriaId(e.target.value)}
            className="w-full px-4 py-2.5 bg-mezo-ink-muted border border-mezo-ink-line text-mezo-cream rounded-mezo-md text-sm focus:outline-none focus:ring-2 focus:ring-mezo-gold focus:border-transparent transition font-body">
            <option value="">Sin categoría</option>
            {categorias.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.nombre}</option>)}
          </select>
        </div>

        {/* Disponible */}
        <div className="flex items-center justify-between p-4 bg-mezo-ink-muted rounded-mezo-lg border border-mezo-ink-line">
          <div>
            <p className="text-sm font-medium text-mezo-cream font-body">Disponible para vender</p>
            <p className="text-xs text-mezo-stone mt-0.5 font-body">Aparece en el POS y en el menú</p>
          </div>
          <button type="button" onClick={() => setDisponible(v => !v)}
            className={`relative w-12 h-6 rounded-full transition-colors ${disponible ? 'bg-mezo-gold' : 'bg-mezo-ink-line'}`}>
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${disponible ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </div>

        {error && (
          <p className="text-mezo-rojo text-sm bg-mezo-rojo/10 border border-mezo-rojo/30 rounded-mezo-md px-4 py-2 font-body">
            {error}
          </p>
        )}

        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose}
            className="flex-1 border border-mezo-ink-line text-mezo-cream-dim font-semibold py-2.5 rounded-mezo-md text-sm hover:bg-mezo-ink-muted transition font-body">
            Cancelar
          </button>
          <button type="submit" disabled={loading}
            className="flex-[2] bg-mezo-gold hover:bg-mezo-gold-deep disabled:opacity-50 text-mezo-ink font-semibold py-2.5 rounded-mezo-md text-sm transition shadow-mezo-gold font-body">
            {loading ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear producto'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
