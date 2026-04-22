import { useState } from 'react';
import Navbar from '../components/layout/Navbar';
import ListaProductos from '../components/productos/ListaProductos';
import ListaCategorias from '../components/productos/ListaCategorias';

const TABS = [
  { id: 'productos',  label: 'Productos' },
  { id: 'categorias', label: 'Categorías' },
];

export default function Productos() {
  const [tab, setTab] = useState('productos');

  return (
    <div className="min-h-screen bg-mezo-ink">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-6">
          <p className="text-xs text-mezo-stone uppercase tracking-widest mb-1 font-body">Administración</p>
          <h1
            className="font-display font-medium text-mezo-cream"
            style={{ fontSize: 32, letterSpacing: '-0.02em', fontVariationSettings: '"SOFT" 50, "opsz" 72' }}
          >
            Menú
          </h1>
          <p className="text-sm text-mezo-stone mt-1 font-body">
            Administra los productos y categorías de tu negocio
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-mezo-ink-raised border border-mezo-ink-line p-1 rounded-mezo-lg w-fit mb-8">
          {TABS.map(({ id, label }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`px-5 py-2 rounded-mezo-md text-sm font-semibold transition font-body
                ${tab === id
                  ? 'bg-mezo-gold text-mezo-ink shadow-mezo-sm'
                  : 'text-mezo-stone hover:text-mezo-cream-dim'}`}>
              {label}
            </button>
          ))}
        </div>

        {tab === 'productos' ? <ListaProductos /> : <ListaCategorias />}
      </main>
    </div>
  );
}
