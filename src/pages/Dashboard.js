import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDia } from '../context/DiaContext';
import { useOrdenes } from '../hooks/useOrdenes';
import { track } from '../services/analytics';
import Navbar from '../components/layout/Navbar';
import { formatCOP } from '../utils/formatters';

const MODULOS = [
  { titulo: 'POS / Caja',  descripcion: 'Tomar y cobrar órdenes',  emoji: '🧾', ruta: '/pos' },
  { titulo: 'Mesas',       descripcion: 'Estado en tiempo real',    emoji: '🪑', ruta: '/mesas' },
  { titulo: 'Cocina',      descripcion: 'Pantalla de pedidos',      emoji: '👨‍🍳', ruta: '/cocina' },
  { titulo: 'Productos',   descripcion: 'Menú y precios',          emoji: '🍽️', ruta: '/productos' },
  { titulo: 'Reportes',    descripcion: 'Ventas y análisis IA',     emoji: '📊', ruta: '/reportes' },
  { titulo: 'Empleados',   descripcion: 'Roles y turnos',          emoji: '👥', ruta: '/empleados' },
];

const DISPONIBLES = ['/productos', '/pos', '/mesas', '/cocina', '/reportes', '/empleados'];

function getSaludo() {
  const h = new Date().getHours();
  if (h >= 5  && h < 12) return { texto: 'Buenos días',   emoji: '☀️' };
  if (h >= 12 && h < 19) return { texto: 'Buenas tardes', emoji: '🌤️' };
  return                         { texto: 'Buenas noches', emoji: '🌙' };
}

function getFechaEspanol() {
  return new Date().toLocaleDateString('es-CO', {
    weekday: 'long', day: 'numeric', month: 'long',
  });
}

export default function Dashboard() {
  const { negocio, user } = useAuth();
  const { diaAbierto, abiertaAt, abrirDia, cerrarDia } = useDia();
  const navigate = useNavigate();
  const saludo   = useMemo(getSaludo, []);
  const fecha    = useMemo(getFechaEspanol, []);

  const [mostrarBienvenida, setMostrarBienvenida] = useState(
    () => !localStorage.getItem('mezo_seen_welcome')
  );

  useEffect(() => {
    if (!mostrarBienvenida) return;
    const t = setTimeout(() => {
      localStorage.setItem('mezo_seen_welcome', '1');
      setMostrarBienvenida(false);
    }, 2800);
    return () => clearTimeout(t);
  }, [mostrarBienvenida]);

  const hoy = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }, []);
  const { ordenes } = useOrdenes(hoy);

  const ventasHoy    = ordenes.filter(o => o.status === 'PAID').reduce((s, o) => s + o.total, 0);
  const ordenesHoy   = ordenes.filter(o => o.status === 'PAID').length;
  const ticketProm   = ordenesHoy ? Math.round(ventasHoy / ordenesHoy) : 0;

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ position: 'relative' }}>
      {/* Splash primer acceso */}
      {mostrarBienvenida && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(8,7,6,0.93)',
          backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'fadeOut 0.6s ease 2.2s forwards',
        }}>
          <div style={{ textAlign: 'center', userSelect: 'none' }}>
            <div style={{ fontSize: 56, marginBottom: 20 }}>👋</div>
            <h2 style={{
              fontFamily: '"Fraunces", Georgia, serif', fontStyle: 'italic',
              fontSize: 'clamp(2rem, 5vw, 3rem)', color: '#F4ECD8',
              fontWeight: 500, margin: 0, marginBottom: 10,
            }}>
              Bienvenido a mezo
            </h2>
            {negocio && (
              <p style={{ fontSize: 18, color: '#C8903F', fontFamily: '"DM Sans", sans-serif', margin: 0 }}>
                {negocio.name}
              </p>
            )}
          </div>
          <style>{`@keyframes fadeOut { to { opacity: 0; pointer-events: none; } }`}</style>
        </div>
      )}
      {/* Background image + overlay */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        backgroundImage: 'url(https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=1600&q=80)',
        backgroundSize: 'cover', backgroundPosition: 'center',
      }} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'rgba(8,7,6,0.88)' }} />

      <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Navbar />

        <main className="flex-1 p-8 max-w-7xl mx-auto w-full flex flex-col overflow-hidden">

          {/* Saludo + fecha + prompt de estado del día */}
          <div className="mb-6 flex items-start justify-between gap-6">
            <div>
              <p className="text-mezo-stone uppercase tracking-widest text-xs mb-1 font-body capitalize">{fecha}</p>
              <div className="flex items-baseline gap-3">
                <h1 className="text-mezo-cream font-display leading-none"
                  style={{ fontSize: 52, letterSpacing: '-0.025em', fontVariationSettings: '"SOFT" 50, "opsz" 72',
                           fontStyle: 'italic', fontWeight: 500 }}>
                  {saludo.texto}
                </h1>
                <span style={{ fontSize: 36 }}>{saludo.emoji}</span>
              </div>
              {negocio && (
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-mezo-stone text-sm font-body">{negocio.name}</span>
                  <span className="capitalize font-semibold text-sm px-3 py-0.5 rounded-mezo-md font-body"
                    style={{ background: 'rgba(200,144,63,0.15)', color: '#C8903F', border: '1px solid rgba(200,144,63,0.3)' }}>
                    {user?.planType ?? '—'}
                  </span>
                </div>
              )}
            </div>

            {/* Prompt contextual según el estado del día */}
            <PromptDia
              diaAbierto={diaAbierto}
              abiertaAt={abiertaAt}
              onAbrir={() => { abrirDia(); track.diaAbierto(); }}
              onCerrar={() => { cerrarDia(); track.diaCerrado({}); }}
            />
          </div>

          {/* KPI chips */}
          <div className="flex gap-3 mb-6 flex-shrink-0">
            <KpiChip label="Ventas hoy"    valor={formatCOP(ventasHoy)} color="#C8903F" />
            <KpiChip label="Órdenes hoy"   valor={String(ordenesHoy)}   color="#3DAA68" />
            <KpiChip label="Ticket promedio" valor={formatCOP(ticketProm)} color="#D9A437" />
          </div>

          {/* Module grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            style={{ gap: 16, gridTemplateRows: 'repeat(2, 120px)' }}>
            {MODULOS.map(({ titulo, descripcion, emoji, ruta }) => {
              const disponible = DISPONIBLES.includes(ruta);
              return (
                <button key={ruta}
                  onClick={() => disponible && navigate(ruta)}
                  disabled={!disponible}
                  className={`rounded-mezo-xl flex flex-col items-center justify-center text-center w-full h-full transition px-6
                    ${disponible
                      ? 'hover:border-mezo-gold hover:shadow-mezo-gold cursor-pointer'
                      : 'opacity-40 cursor-not-allowed'}`}
                  style={{
                    background: 'rgba(20,17,14,0.7)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}>
                  <span style={{ fontSize: 36, lineHeight: 1 }}>{emoji}</span>
                  <h3 className="font-semibold text-mezo-cream font-body mt-2" style={{ fontSize: 18 }}>{titulo}</h3>
                  <p className="text-mezo-stone mt-0.5 font-body" style={{ fontSize: 13 }}>{descripcion}</p>
                  {!disponible && (
                    <span className="text-mezo-gold-soft font-medium mt-1 inline-block font-body" style={{ fontSize: 11 }}>
                      Próximamente
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}

function KpiChip({ label, valor, color }) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 rounded-mezo-lg"
      style={{ background: 'rgba(20,17,14,0.7)', backdropFilter: 'blur(12px)',
               WebkitBackdropFilter: 'blur(12px)', border: `1px solid ${color}30` }}>
      <div>
        <p className="text-mezo-stone font-body uppercase tracking-widest" style={{ fontSize: 9 }}>{label}</p>
        <p className="font-mono font-bold text-base leading-tight" style={{ color, fontVariantNumeric: 'tabular-nums' }}>{valor}</p>
      </div>
    </div>
  );
}

// Prompt contextual según el estado del día
function PromptDia({ diaAbierto, abiertaAt, onAbrir, onCerrar }) {
  const ahora        = new Date();
  const horaActual   = ahora.getHours();

  if (!diaAbierto) {
    // CASO 1 — Día cerrado: invitar a empezar
    return (
      <div className="flex-shrink-0 flex flex-col items-end gap-2 px-5 py-4 rounded-mezo-xl"
        style={{ background: 'rgba(61,170,104,0.08)', border: '1px solid rgba(61,170,104,0.25)', backdropFilter: 'blur(12px)' }}>
        <p className="text-mezo-cream font-body text-sm font-medium">¿Listos para empezar? 🚀</p>
        <button onClick={onAbrir}
          className="px-4 py-1.5 rounded-mezo-md text-sm font-body font-semibold transition"
          style={{ background: '#C8903F', color: '#080706' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#B8802F'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#C8903F'; }}>
          Empezar día
        </button>
      </div>
    );
  }

  // Calcular horas transcurridas desde apertura
  const horasTranscurridas = abiertaAt
    ? Math.floor((ahora - new Date(abiertaAt)) / 3_600_000)
    : 0;

  // CASO 4 — Después de las 11pm: urgente
  if (horaActual >= 23) {
    const horaStr = ahora.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
    return (
      <div className="flex-shrink-0 flex flex-col items-end gap-2 px-5 py-4 rounded-mezo-xl"
        style={{ background: 'rgba(200,87,63,0.1)', border: '1px solid rgba(200,87,63,0.35)', backdropFilter: 'blur(12px)' }}>
        <p className="text-mezo-cream font-body text-sm font-medium">Son las {horaStr}. No olviden cerrar el día.</p>
        <button onClick={onCerrar}
          className="px-4 py-1.5 rounded-mezo-md text-sm font-body font-semibold border transition"
          style={{ borderColor: 'rgba(200,87,63,0.6)', color: '#C8573F', background: 'transparent' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(200,87,63,0.12)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
          Cerrar día
        </button>
      </div>
    );
  }

  // CASO 3 — Más de 7 horas abierto y después de las 6pm
  if (horasTranscurridas >= 7 && horaActual >= 18) {
    return (
      <div className="flex-shrink-0 flex flex-col items-end gap-2 px-5 py-4 rounded-mezo-xl"
        style={{ background: 'rgba(217,164,55,0.08)', border: '1px solid rgba(217,164,55,0.3)', backdropFilter: 'blur(12px)' }}>
        <p className="text-mezo-cream font-body text-sm font-medium">
          Llevan {horasTranscurridas}h en servicio. ¿Listos para cerrar?
        </p>
        <button onClick={onCerrar}
          className="px-4 py-1.5 rounded-mezo-md text-sm font-body font-semibold border transition"
          style={{ borderColor: 'rgba(217,164,55,0.5)', color: '#D9A437', background: 'transparent' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(217,164,55,0.1)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
          Cerrar día
        </button>
      </div>
    );
  }

  // CASO 2 — Menos de 7 horas: operación normal, no mostrar nada
  return null;
}
