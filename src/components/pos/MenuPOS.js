import { useState } from 'react';
import { formatCOP } from '../../utils/formatters';

export default function MenuPOS({ categorias, productos, onAgregar }) {
  const [catActiva, setCatActiva] = useState('todas');

  const filtrados = catActiva === 'todas'
    ? productos.filter(p => p.disponible)
    : productos.filter(p => p.disponible && p.categoriaId === catActiva);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Tabs de categorías */}
      <div className="flex gap-2 px-5 pt-4 pb-3 overflow-x-auto flex-shrink-0 scrollbar-hide">
        <TabCategoria
          activa={catActiva === 'todas'}
          onClick={() => setCatActiva('todas')}
          label="Todos"
          emoji="🍽️"
        />
        {categorias.map(cat => (
          <TabCategoria
            key={cat.id}
            activa={catActiva === cat.id}
            onClick={() => setCatActiva(cat.id)}
            label={cat.nombre}
            emoji={cat.emoji}
          />
        ))}
      </div>

      {/* Grid de productos */}
      <div className="flex-1 overflow-y-auto px-5 pb-5">
        {filtrados.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-mezo-stone font-body text-sm">
            No hay productos disponibles en esta categoría.
          </div>
        ) : (
          <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
            {filtrados.map(producto => (
              <TarjetaMenuPOS
                key={producto.id}
                producto={producto}
                categoria={categorias.find(c => c.id === producto.categoriaId)}
                onAgregar={onAgregar}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TabCategoria({ activa, onClick, label, emoji }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-4 py-2 rounded-mezo-md text-sm font-medium font-body whitespace-nowrap transition flex-shrink-0
        ${activa
          ? 'bg-mezo-gold text-mezo-ink'
          : 'bg-mezo-ink-raised border border-mezo-ink-line text-mezo-stone hover:text-mezo-cream hover:border-mezo-gold/40'}`}
    >
      <span>{emoji}</span>
      {label}
    </button>
  );
}

function TarjetaMenuPOS({ producto, categoria, onAgregar }) {
  return (
    <button
      onClick={() => onAgregar(producto)}
      className="bg-mezo-ink-raised border border-mezo-ink-line rounded-mezo-lg text-left transition hover:border-mezo-gold/60 hover:shadow-mezo-gold active:scale-[0.98] overflow-hidden"
    >
      {/* Imagen o placeholder */}
      <div className="h-24 bg-mezo-ink-muted relative">
        {producto.imagen ? (
          <img src={producto.imagen} alt={producto.nombre} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl opacity-30">
            {categoria?.emoji ?? '🍽️'}
          </div>
        )}
      </div>

      <div className="p-3">
        <p className="text-mezo-cream font-semibold font-body text-sm leading-tight truncate">
          {producto.nombre}
        </p>
        <p className="text-mezo-gold font-mono font-bold text-sm mt-1">
          {formatCOP(producto.precio)}
        </p>
      </div>
    </button>
  );
}
