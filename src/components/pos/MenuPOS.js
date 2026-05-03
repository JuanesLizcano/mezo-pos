import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { formatCOP, normalizeText } from '../../utils/formatters';

export default function MenuPOS({ categorias, productos, onAgregar }) {
  const [catActiva, setCatActiva] = useState('todas');
  const [busqueda, setBusqueda]   = useState('');
  const [highlighted, setHighlighted] = useState(0);
  const inputRef = useRef(null);

  // Auto-focus on mount
  useEffect(() => { inputRef.current?.focus(); }, []);

  const query = normalizeText(busqueda.trim());

  // Cuando hay búsqueda: filtra por nombre sin distinción de tildes ni mayúsculas
  const buscados = query
    ? productos.filter(p => p.disponible && normalizeText(p.nombre).includes(query))
    : null;

  const filtrados = buscados ?? (
    catActiva === 'todas'
      ? productos.filter(p => p.disponible)
      : productos.filter(p => p.disponible && p.categoriaId === catActiva)
  );

  // Reset highlight when results change
  useEffect(() => { setHighlighted(0); }, [query]);

  const agregarYLimpiar = useCallback((producto) => {
    onAgregar(producto);
    setBusqueda('');
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [onAgregar]);

  function handleKeyDown(e) {
    if (!buscados) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlighted(h => Math.min(h + 1, buscados.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted(h => Math.max(h - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (buscados.length === 0) return;
      agregarYLimpiar(buscados[highlighted] ?? buscados[0]);
    } else if (e.key === 'Escape') {
      setBusqueda('');
    }
  }

  // Group search results by category for display
  const grouped = buscados
    ? categorias.reduce((acc, cat) => {
        const items = buscados.filter(p => p.categoriaId === cat.id);
        if (items.length) acc.push({ cat, items });
        return acc;
      }, [])
    : null;

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* Search bar */}
      <div className="px-5 pt-4 pb-2 flex-shrink-0">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-mezo-stone pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={busqueda}
            onChange={e => { setBusqueda(e.target.value); setCatActiva('todas'); }}
            onKeyDown={handleKeyDown}
            placeholder="Buscar producto… (Enter para agregar)"
            className="w-full pl-9 pr-9 py-2 bg-mezo-ink-raised border border-mezo-ink-line text-mezo-cream placeholder-mezo-stone rounded-mezo-md text-sm focus:outline-none focus:ring-2 focus:ring-mezo-gold/50 focus:border-transparent transition font-body"
          />
          {busqueda && (
            <button onClick={() => { setBusqueda(''); inputRef.current?.focus(); }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-mezo-stone hover:text-mezo-cream transition">
              <X size={14} />
            </button>
          )}
        </div>
        {buscados && (
          <p className="text-mezo-stone font-body mt-1.5" style={{ fontSize: 11 }}>
            {buscados.length === 0
              ? 'Sin resultados'
              : `${buscados.length} resultado${buscados.length !== 1 ? 's' : ''} · ↑↓ navegar · Enter agregar`}
          </p>
        )}
      </div>

      {/* Category tabs — hidden while searching */}
      {!buscados && (
        <div className="flex gap-2 px-5 pb-3 overflow-x-auto flex-shrink-0 scrollbar-hide">
          <TabCategoria activa={catActiva === 'todas'} onClick={() => setCatActiva('todas')} label="Todos" emoji="🍽️" />
          {categorias.map(cat => (
            <TabCategoria key={cat.id} activa={catActiva === cat.id}
              onClick={() => setCatActiva(cat.id)} label={cat.nombre} emoji={cat.emoji} />
          ))}
        </div>
      )}

      {/* Grid / search results */}
      <div className="flex-1 overflow-y-auto px-5 pb-5">
        {grouped ? (
          // Search results grouped by category
          grouped.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-mezo-stone font-body text-sm">
              Nada con "{busqueda}" — prueba con otro nombre o categoría.
            </div>
          ) : (
            <div className="space-y-4">
              {grouped.map(({ cat, items }) => (
                <div key={cat.id}>
                  <p className="text-mezo-stone font-body uppercase tracking-widest mb-2 flex items-center gap-1.5"
                    style={{ fontSize: 10 }}>
                    <span>{cat.emoji}</span> {cat.nombre}
                  </p>
                  <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
                    {items.map((producto, i) => {
                      const globalIdx = buscados.indexOf(producto);
                      return (
                        <TarjetaMenuPOS
                          key={producto.id}
                          producto={producto}
                          categoria={cat}
                          onAgregar={agregarYLimpiar}
                          highlighted={globalIdx === highlighted}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          filtrados.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-mezo-stone font-body text-sm">
              Esta categoría está vacía. Agrega productos desde el módulo Productos.
            </div>
          ) : (
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
              {filtrados.map(producto => (
                <TarjetaMenuPOS
                  key={producto.id}
                  producto={producto}
                  categoria={categorias.find(c => c.id === producto.categoriaId)}
                  onAgregar={agregarYLimpiar}
                  highlighted={false}
                />
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}

function TabCategoria({ activa, onClick, label, emoji }) {
  return (
    <button onClick={onClick}
      className={`flex items-center gap-1.5 px-4 py-2 rounded-mezo-md text-sm font-medium font-body whitespace-nowrap transition flex-shrink-0
        ${activa
          ? 'bg-mezo-gold text-mezo-ink'
          : 'bg-mezo-ink-raised border border-mezo-ink-line text-mezo-stone hover:text-mezo-cream hover:border-mezo-gold/40'}`}>
      <span>{emoji}</span>
      {label}
    </button>
  );
}

function TarjetaMenuPOS({ producto, categoria, onAgregar, highlighted }) {
  return (
    <button
      onClick={() => onAgregar(producto)}
      className="bg-mezo-ink-raised border rounded-mezo-lg text-left transition hover:border-mezo-gold/60 hover:shadow-mezo-gold active:scale-[0.98] overflow-hidden"
      style={{ borderColor: highlighted ? '#C8903F' : undefined, boxShadow: highlighted ? '0 0 0 2px rgba(200,144,63,0.3)' : undefined }}>
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
        <p className="text-mezo-cream font-semibold font-body text-sm leading-tight truncate">{producto.nombre}</p>
        <p className="text-mezo-gold font-mono font-bold text-sm mt-1">{formatCOP(producto.precio)}</p>
      </div>
    </button>
  );
}
