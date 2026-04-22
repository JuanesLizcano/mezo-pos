import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useProductos } from '../../hooks/useProductos';
import { useCategorias } from '../../hooks/useCategorias';
import TarjetaProducto from './TarjetaProducto';
import FormProducto from './FormProducto';

export default function ListaProductos() {
  const { productos, loading } = useProductos();
  const { categorias }         = useCategorias();
  const [filtroCategoria, setFiltroCategoria] = useState('todos');
  const [modal, setModal] = useState(null);

  const productosFiltrados = filtroCategoria === 'todos'
    ? productos
    : filtroCategoria === 'sin-categoria'
      ? productos.filter((p) => !p.categoriaId)
      : productos.filter((p) => p.categoriaId === filtroCategoria);

  function getCat(id) { return categorias.find((c) => c.id === id); }

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-semibold text-mezo-cream font-body">Productos</h2>
          <p className="text-xs text-mezo-stone mt-0.5 font-body">{productos.length} productos en total</p>
        </div>
        <button onClick={() => setModal('nuevo')}
          className="flex items-center gap-2 bg-mezo-gold hover:bg-mezo-gold-deep text-mezo-ink text-sm font-semibold px-4 py-2 rounded-mezo-md transition shadow-mezo-gold font-body">
          <Plus size={15} /> Nuevo producto
        </button>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-5">
        <Chip activo={filtroCategoria === 'todos'} onClick={() => setFiltroCategoria('todos')}
          label={`Todos (${productos.length})`} />
        {categorias.map((cat) => (
          <Chip key={cat.id} activo={filtroCategoria === cat.id}
            onClick={() => setFiltroCategoria(cat.id)}
            label={`${cat.emoji} ${cat.nombre} (${productos.filter((p) => p.categoriaId === cat.id).length})`} />
        ))}
        {productos.some((p) => !p.categoriaId) && (
          <Chip activo={filtroCategoria === 'sin-categoria'}
            onClick={() => setFiltroCategoria('sin-categoria')} label="Sin categoría" />
        )}
      </div>

      {productosFiltrados.length === 0 ? (
        <EstadoVacio onNuevo={() => setModal('nuevo')} hayProductos={productos.length > 0} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {productosFiltrados.map((prod) => {
            const cat = getCat(prod.categoriaId);
            return (
              <TarjetaProducto key={prod.id} producto={prod}
                categoriaNombre={cat?.nombre} categoriaEmoji={cat?.emoji}
                onEditar={(p) => setModal(p)} />
            );
          })}
        </div>
      )}

      {modal && (
        <FormProducto producto={modal === 'nuevo' ? null : modal} onClose={() => setModal(null)} />
      )}
    </div>
  );
}

function Chip({ activo, onClick, label }) {
  return (
    <button onClick={onClick}
      className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition font-body
        ${activo
          ? 'bg-mezo-gold text-mezo-ink border-mezo-gold'
          : 'bg-mezo-ink-raised text-mezo-stone border-mezo-ink-line hover:border-mezo-gold/40 hover:text-mezo-cream-dim'}`}>
      {label}
    </button>
  );
}

function EstadoVacio({ onNuevo, hayProductos }) {
  return (
    <div className="text-center py-16">
      <p className="text-4xl mb-3">📦</p>
      <p className="font-medium text-mezo-cream-dim font-body">
        {hayProductos ? 'No hay productos en esta categoría' : 'Sin productos aún'}
      </p>
      {!hayProductos && (
        <>
          <p className="text-sm mt-1 mb-4 text-mezo-stone font-body">Agrega tu primer producto al menú</p>
          <button onClick={onNuevo}
            className="text-sm text-mezo-gold hover:text-mezo-gold-soft transition font-medium font-body">
            + Crear primer producto
          </button>
        </>
      )}
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
