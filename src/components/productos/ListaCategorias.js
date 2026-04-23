import { useState } from 'react';
import { Pencil, Trash2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { deleteCategoria } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { useCategorias } from '../../hooks/useCategorias';
import { useProductos } from '../../hooks/useProductos';
import FormCategoria from './FormCategoria';

export default function ListaCategorias() {
  const { bumpVersion }          = useAuth();
  const { categorias, loading }  = useCategorias();
  const { productos }            = useProductos();
  const [modal, setModal]        = useState(null);

  async function handleEliminar(cat) {
    const tieneProductos = productos.some((p) => p.categoriaId === cat.id);
    if (tieneProductos) {
      toast.error(`"${cat.nombre}" tiene productos. Muévelos o elimínalos primero.`);
      return;
    }
    if (!window.confirm(`¿Eliminar la categoría "${cat.nombre}"?`)) return;
    try {
      await deleteCategoria(cat.id);
      bumpVersion();
      toast.success(`Categoría "${cat.nombre}" eliminada.`);
    } catch (err) {
      toast.error(err.message || 'Error al eliminar la categoría.');
    }
  }

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-semibold text-mezo-cream font-body">Categorías</h2>
          <p className="text-xs text-mezo-stone mt-0.5 font-body">{categorias.length} categorías creadas</p>
        </div>
        <button onClick={() => setModal('nueva')}
          className="flex items-center gap-2 bg-mezo-gold hover:bg-mezo-gold-deep text-mezo-ink text-sm font-semibold px-4 py-2 rounded-mezo-md transition shadow-mezo-gold font-body">
          <Plus size={15} /> Nueva categoría
        </button>
      </div>

      {categorias.length === 0 ? (
        <EstadoVacio onNueva={() => setModal('nueva')} />
      ) : (
        <div className="space-y-2">
          {categorias.map((cat) => {
            const cantidad = productos.filter((p) => p.categoriaId === cat.id).length;
            return (
              <div key={cat.id}
                className="flex items-center justify-between bg-mezo-ink-raised border border-mezo-ink-line rounded-mezo-lg px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{cat.emoji}</span>
                  <div>
                    <p className="font-medium text-mezo-cream text-sm font-body">{cat.nombre}</p>
                    <p className="text-xs text-mezo-stone font-body">
                      {cantidad} {cantidad === 1 ? 'producto' : 'productos'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setModal(cat)}
                    className="p-2 text-mezo-stone hover:text-mezo-gold hover:bg-mezo-gold/10 rounded-mezo-sm transition">
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => handleEliminar(cat)}
                    className="p-2 text-mezo-stone hover:text-mezo-rojo hover:bg-mezo-rojo/10 rounded-mezo-sm transition">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modal && (
        <FormCategoria
          categoria={modal === 'nueva' ? null : modal}
          totalCategorias={categorias.length}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}

function EstadoVacio({ onNueva }) {
  return (
    <div className="text-center py-16 text-mezo-stone">
      <p className="text-4xl mb-3">🗂️</p>
      <p className="font-medium text-mezo-cream-dim font-body">Sin categorías aún</p>
      <p className="text-sm mt-1 mb-4 font-body">Crea categorías para organizar tu menú</p>
      <button onClick={onNueva} className="text-sm text-mezo-gold hover:text-mezo-gold-soft transition font-medium font-body">
        + Crear primera categoría
      </button>
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex justify-center py-16">
      <div className="w-7 h-7 border-4 border-mezo-gold border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
