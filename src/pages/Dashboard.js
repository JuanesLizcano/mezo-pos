import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';

const MODULOS = [
  { titulo: 'POS / Caja',  descripcion: 'Tomar y cobrar órdenes',  emoji: '🧾', ruta: '/pos' },
  { titulo: 'Mesas',       descripcion: 'Estado en tiempo real',    emoji: '🪑', ruta: '/mesas' },
  { titulo: 'Cocina',      descripcion: 'Pantalla de pedidos',      emoji: '👨‍🍳', ruta: '/cocina' },
  { titulo: 'Productos',   descripcion: 'Menú y precios',          emoji: '🍽️', ruta: '/productos' },
  { titulo: 'Reportes',    descripcion: 'Ventas y análisis IA',     emoji: '📊', ruta: '/reportes' },
  { titulo: 'Empleados',   descripcion: 'Roles y turnos',          emoji: '👥', ruta: '/empleados' },
];

const DISPONIBLES = ['/productos', '/pos'];

export default function Dashboard() {
  const { negocio } = useAuth();
  const navigate    = useNavigate();

  return (
    <div className="h-screen bg-mezo-ink flex flex-col overflow-hidden">
      <Navbar />

      <main className="flex-1 p-8 max-w-7xl mx-auto w-full flex flex-col overflow-hidden">
        {/* Encabezado */}
        <div className="mb-8">
          <p className="text-mezo-stone uppercase tracking-widest text-xs mb-2 font-body">
            Panel principal
          </p>
          <h1
            className="text-mezo-cream font-display font-medium leading-none"
            style={{ fontSize: 52, letterSpacing: '-0.025em', fontVariationSettings: '"SOFT" 50, "opsz" 72' }}
          >
            {negocio ? negocio.nombre : 'Bienvenido a mezo'}
          </h1>
          {negocio && (
            <div className="flex items-center gap-3 mt-3">
              <span className="text-mezo-stone text-sm font-body">Plan activo</span>
              <span
                className="capitalize font-semibold text-sm px-3 py-1 rounded-mezo-md font-body"
                style={{ background: 'rgba(200,144,63,0.15)', color: '#C8903F', border: '1px solid rgba(200,144,63,0.3)' }}
              >
                {negocio.plan}
              </span>
            </div>
          )}
        </div>

        {/* Grid de módulos — 3×2, cards de altura fija */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          style={{ gap: 16, gridTemplateRows: 'repeat(2, 120px)' }}
        >
          {MODULOS.map(({ titulo, descripcion, emoji, ruta }) => {
            const disponible = DISPONIBLES.includes(ruta);
            return (
              <button
                key={ruta}
                onClick={() => disponible && navigate(ruta)}
                disabled={!disponible}
                className={`bg-mezo-ink-raised border border-mezo-ink-line rounded-mezo-xl
                  flex flex-col items-center justify-center text-center w-full h-full transition px-6
                  ${disponible
                    ? 'hover:border-mezo-gold hover:shadow-mezo-gold cursor-pointer'
                    : 'opacity-40 cursor-not-allowed'}`}
              >
                <span style={{ fontSize: 36, lineHeight: 1 }}>{emoji}</span>
                <h3 className="font-semibold text-mezo-cream font-body mt-2" style={{ fontSize: 18 }}>
                  {titulo}
                </h3>
                <p className="text-mezo-stone mt-0.5 font-body" style={{ fontSize: 13 }}>
                  {descripcion}
                </p>
                {!disponible && (
                  <span className="text-mezo-gold-soft font-medium mt-1 inline-block font-body"
                    style={{ fontSize: 11 }}>
                    Próximamente
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
}
