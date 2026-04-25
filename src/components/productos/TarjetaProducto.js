import { Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { updateProducto, deleteProducto } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { formatCOP } from '../../utils/formatters';

// Verde ≥ 65% · Ámbar 45–64% · Rojo < 45%
function MargenBadge({ precio, costo }) {
  const margen = Math.round(((precio - costo) / precio) * 100);
  const color  = margen >= 65 ? '#3DAA68' : margen >= 45 ? '#D9A437' : '#C8573F';
  return (
    <span className="text-xs px-2 py-0.5 rounded-full font-body font-medium"
      style={{ background: `${color}18`, color, border: `1px solid ${color}40` }}>
      {margen}% margen
    </span>
  );
}

export default function TarjetaProducto({ producto, categoriaNombre, categoriaEmoji, onEditar }) {
  const { bumpVersion } = useAuth();

  async function toggleDisponible() {
    try {
      await updateProducto(producto.id, { disponible: !producto.disponible });
      bumpVersion();
    } catch {
      toast.error('Error al actualizar el producto.');
    }
  }

  async function handleEliminar() {
    if (!window.confirm(`¿Eliminar "${producto.nombre}"?`)) return;
    try {
      await deleteProducto(producto.id);
      bumpVersion();
      toast.success(`"${producto.nombre}" eliminado.`);
    } catch {
      toast.error('Error al eliminar el producto.');
    }
  }

  return (
    <div className={`bg-mezo-ink-raised border border-mezo-ink-line rounded-mezo-lg overflow-hidden transition
      ${!producto.disponible ? 'opacity-50' : 'hover:border-mezo-gold/40'}`}>
      {/* Imagen */}
      <div className="h-36 bg-mezo-ink-muted relative">
        {producto.imagen ? (
          <img src={producto.imagen} alt={producto.nombre} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl opacity-30">🍽️</div>
        )}
        <button onClick={toggleDisponible}
          className={`absolute top-2 right-2 text-xs font-semibold px-2 py-0.5 rounded-full border transition font-body
            ${producto.disponible
              ? 'bg-mezo-verde/20 text-mezo-verde border-mezo-verde/40 hover:bg-mezo-verde/30'
              : 'bg-mezo-ink-muted text-mezo-stone border-mezo-ink-line hover:bg-mezo-ink-line'}`}>
          {producto.disponible ? 'Activo' : 'Inactivo'}
        </button>
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="font-semibold text-mezo-cream text-sm truncate font-body">{producto.nombre}</p>
        {producto.descripcion && (
          <p className="text-xs text-mezo-stone mt-0.5 truncate font-body">
            {producto.descripcion.length > 50 ? producto.descripcion.slice(0, 47) + '…' : producto.descripcion}
          </p>
        )}

        {/* Ingredientes */}
        {producto.ingredientes?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {producto.ingredientes.slice(0, 4).map((ing) => (
              <span key={ing}
                className="text-xs bg-mezo-ink-muted text-mezo-stone px-1.5 py-0.5 rounded font-body">
                {ing}
              </span>
            ))}
            {producto.ingredientes.length > 4 && (
              <span className="text-xs text-mezo-stone font-body">
                +{producto.ingredientes.length - 4}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between mt-3">
          <span className="font-bold text-mezo-gold font-mono text-base">
            {formatCOP(producto.precio)}
          </span>
          {producto.costo > 0 ? (
            // Muestra margen% si el producto tiene costo configurado
            <MargenBadge precio={producto.precio} costo={producto.costo} />
          ) : (
            categoriaNombre && (
              <span className="text-xs px-2 py-0.5 rounded-full font-body"
                style={{ background: 'rgba(200,144,63,0.12)', color: '#E4B878' }}>
                {categoriaEmoji} {categoriaNombre}
              </span>
            )
          )}
        </div>

        <div className="flex gap-2 mt-3">
          <button onClick={() => onEditar(producto)}
            className="flex-1 flex items-center justify-center gap-1.5 border border-mezo-ink-line text-mezo-stone hover:text-mezo-gold hover:border-mezo-gold/40 text-xs font-medium py-1.5 rounded-mezo-sm transition font-body">
            <Pencil size={12} /> Editar
          </button>
          <button onClick={handleEliminar}
            className="flex items-center justify-center border border-mezo-ink-line text-mezo-stone hover:text-mezo-rojo hover:border-mezo-rojo/40 text-xs px-3 py-1.5 rounded-mezo-sm transition">
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}
