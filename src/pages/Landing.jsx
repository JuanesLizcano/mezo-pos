// Landing page v2 — mezo POS para Colombia
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, X, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// ─── Hook: detecta cuando el elemento entra al viewport ──────────────────────
function useInView(threshold = 0.12) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

// ─── Wrapper de animación fade-in al hacer scroll ────────────────────────────
function Fade({ children, delay = 0, className = '' }) {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} className={className} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? 'translateY(0)' : 'translateY(20px)',
      transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`,
    }}>
      {children}
    </div>
  );
}

// ─── Datos estáticos ──────────────────────────────────────────────────────────

const TIPOS_NEGOCIO = [
  { emoji: '☕', label: 'Cafeterías',    img: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400' },
  { emoji: '🍽️', label: 'Restaurantes', img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400' },
  { emoji: '🥐', label: 'Panaderías',   img: 'https://images.unsplash.com/photo-1568254183919-78a4f43a2877?w=400' },
  { emoji: '🍺', label: 'Bares',        img: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400' },
  { emoji: '🍔', label: 'Comida rápida',img: 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=400' },
  { emoji: '🍦', label: 'Heladerías',   img: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400' },
  { emoji: '🧃', label: 'Juguerías',    img: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400' },
  { emoji: '🍕', label: 'Pizzerías',    img: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400' },
];

const FEATURES_GRID = [
  { emoji: '⚡', title: 'POS ultrarrápido',               desc: 'Una orden en menos de 10 segundos. Diseñado para el caos del servicio.' },
  { emoji: '💳', title: 'Todos los pagos colombianos',    desc: 'Efectivo, Datáfono, Nequi, Daviplata, Transferencia. Todo en uno.' },
  { emoji: '🏠', title: 'Mesas en tiempo real',           desc: 'Estados, timers y división de cuenta con actualización instantánea.' },
  { emoji: '👥', title: 'Roles de empleados',             desc: 'Admin, cajero, mesero y cocina. Cada rol ve solo lo que necesita.' },
  { emoji: '🧾', title: 'Arqueo de caja',                 desc: 'Compara lo registrado vs lo real. Detecta diferencias al instante.' },
  { emoji: '📊', title: 'Reportes por período',           desc: 'Gráficas de ventas por hora, día, semana, mes y año.' },
  { emoji: '🔒', title: 'Seguridad por negocio',          desc: 'Cada negocio completamente aislado. Nadie ve los datos de otro.' },
  { emoji: '📱', title: 'Cualquier dispositivo',          desc: 'Tablet, celular o computador. Solo un navegador, nada que instalar.' },
  { emoji: '🇨🇴', title: 'Hecho para Colombia',           desc: 'Pesos colombianos, métodos de pago locales y soporte en español.' },
];

const FAQS = [
  { q: '¿Necesito instalar algo?',            a: 'No. mezo funciona desde cualquier navegador en tablet, celular o computador. Sin descargas, sin instalaciones.' },
  { q: '¿Funciona sin internet?',             a: 'El POS necesita conexión para sincronizar en tiempo real. Recomendamos tener conexión estable o un plan de datos como respaldo.' },
  { q: '¿Puedo cancelar cuando quiera?',      a: 'Sí. Sin contratos, sin penalizaciones. Cancelas desde tu dashboard en cualquier momento.' },
  { q: '¿Cómo funciona el período de prueba?',a: '30 días completamente gratis en el plan Pro. Sin tarjeta de crédito requerida. Al terminar eliges si continúas o no.' },
  { q: '¿Puedo tener varios empleados?',      a: 'Sí. En plan Semilla hasta 3 empleados; en Pro y Élite ilimitados, cada uno con su propio acceso y rol.' },
  { q: '¿Qué pasa con mis datos si cancelo?', a: 'Puedes exportar toda tu información antes de cancelar. Tus datos se eliminan de nuestros servidores 30 días después.' },
  { q: '¿Funciona para múltiples sedes?',     a: 'Plan Élite incluye sedes ilimitadas con reportes consolidados. Los planes Semilla y Pro son para una sola sede.' },
  { q: '¿Tienen soporte en español?',         a: 'Sí, todo el soporte es en español colombiano. Chat en el dashboard, WhatsApp y email.' },
];

const PLANES = {
  semilla: {
    nombre: 'Semilla', precio: { mensual: 39900, anual: 31900 },
    items: [
      { ok: true,  text: 'Hasta 4 mesas' },
      { ok: true,  text: 'Hasta 25 productos' },
      { ok: true,  text: 'Hasta 3 empleados' },
      { ok: true,  text: '1 sede · POS completo' },
      { ok: true,  text: 'Todos los métodos de pago' },
      { ok: false, text: 'Reportes avanzados' },
      { ok: false, text: 'Exportar datos' },
      { ok: false, text: 'Funciones IA' },
    ],
    cta: 'Empezar gratis', ctaStyle: 'outline',
  },
  pro: {
    nombre: 'Pro', badge: '⭐ Más popular', precio: { mensual: 99900, anual: 79900 },
    items: [
      { ok: true,  text: 'Mesas ilimitadas' },
      { ok: true,  text: 'Productos ilimitados' },
      { ok: true,  text: 'Empleados ilimitados' },
      { ok: true,  text: '1 sede · 30 días gratis' },
      { ok: true,  text: 'Todos los métodos de pago' },
      { ok: true,  text: 'Reportes completos' },
      { ok: true,  text: 'Exportar datos' },
      { ok: false, text: 'Funciones IA' },
    ],
    cta: 'Comenzar ahora', ctaStyle: 'gold',
  },
  elite: {
    nombre: 'Élite', precio: { mensual: 199900, anual: 159900 },
    items: [
      { ok: true, text: 'Todo lo de Pro' },
      { ok: true, text: 'Sedes ilimitadas' },
      { ok: true, text: 'Análisis de ventas con IA' },
      { ok: true, text: 'Predicción de demanda' },
      { ok: true, text: 'Chatbot de WhatsApp' },
      { ok: true, text: 'Soporte prioritario 24/7' },
      { ok: true, text: 'API de integración' },
      { ok: true, text: 'Onboarding personalizado' },
    ],
    cta: 'Contactar ventas', ctaStyle: 'outline',
  },
};

// ─── Helper ───────────────────────────────────────────────────────────────────
function formatCOP(n) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar({ scrolled }) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 h-16 transition-all duration-300"
      style={{
        background:     scrolled ? 'rgba(8,7,6,0.88)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)'        : 'none',
        borderBottom:   scrolled ? '1px solid rgba(42,37,32,0.8)' : 'none',
      }}>
      <span style={{ fontFamily: '"Fraunces", Georgia, serif', fontStyle: 'italic', fontSize: 26, color: '#C8903F', fontWeight: 700 }}>
        mezo
      </span>

      <div className="hidden md:flex items-center gap-8">
        {[['#mockup','Producto'],['#beneficios','Beneficios'],['#precios','Precios'],['#faqs','FAQ']].map(([href, label]) => (
          <a key={label} href={href} className="text-sm font-body transition" style={{ color: '#D9CEB5' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#C8903F'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#D9CEB5'; }}>
            {label}
          </a>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <Link to="/login"
          className="text-sm font-body font-medium px-4 py-2 rounded-mezo-md border transition hidden sm:block"
          style={{ color: '#E4B878', borderColor: 'rgba(200,144,63,0.4)', background: 'transparent' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(200,144,63,0.1)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
          Iniciar sesión
        </Link>
        <Link to="/register"
          className="text-sm font-body font-semibold px-4 py-2 rounded-mezo-md transition"
          style={{ background: '#C8903F', color: '#080706' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#A87528'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#C8903F'; }}>
          Prueba gratis
        </Link>
      </div>
    </nav>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 pt-20 pb-24 overflow-hidden">
      {/* Imagen de fondo — cafetería colombiana */}
      <div className="absolute inset-0">
        <img src="https://images.unsplash.com/photo-1559305616-3f99cd43e353?w=1600"
          alt="" loading="eager" decoding="async"
          className="w-full h-full object-cover" style={{ opacity: 0.28 }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(8,7,6,0.6) 0%, rgba(8,7,6,0.82) 55%, #080706 100%)' }} />
      </div>
      {/* Glow central */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, rgba(200,144,63,0.14) 0%, transparent 70%)' }} />

      <div className="relative z-10 max-w-4xl mx-auto">
        <span className="inline-flex items-center gap-2 text-xs font-body font-semibold px-4 py-1.5 rounded-full mb-6"
          style={{ background: 'rgba(200,144,63,0.12)', color: '#E4B878', border: '1px solid rgba(200,144,63,0.3)' }}>
          🇨🇴 El POS hecho para Colombia
        </span>

        <h1 style={{ fontFamily: '"Fraunces", Georgia, serif', fontSize: 'clamp(2.4rem, 6vw, 5rem)', color: '#F4ECD8', lineHeight: 1.05, fontWeight: 700, letterSpacing: '-0.02em', fontVariationSettings: '"SOFT" 50, "opsz" 72' }}>
          Cobra más rápido.<br />
          <span style={{ fontStyle: 'italic', color: '#C8903F' }}>Vende más inteligente.</span>
        </h1>

        <p className="font-body mt-6 mb-8 mx-auto" style={{ color: '#A89880', fontSize: 'clamp(1rem, 2vw, 1.15rem)', maxWidth: 560, lineHeight: 1.7 }}>
          El sistema de punto de venta que entiende cómo funciona tu negocio. Mesas en tiempo real, todos los métodos de pago colombianos y reportes con inteligencia artificial.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <Link to="/register"
            className="font-body font-semibold px-8 py-4 rounded-mezo-lg text-base transition w-full sm:w-auto"
            style={{ background: '#C8903F', color: '#080706', boxShadow: '0 0 36px rgba(200,144,63,0.35)' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#A87528'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#C8903F'; }}>
            Empieza gratis — 30 días →
          </Link>
          <a href="#mockup"
            className="font-body font-medium px-6 py-4 rounded-mezo-lg text-base border transition w-full sm:w-auto text-center"
            style={{ borderColor: 'rgba(200,144,63,0.4)', color: '#E4B878' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(200,144,63,0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
            Ver cómo funciona ↓
          </a>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6">
          {['Sin tarjeta de crédito', 'Configuración en 5 minutos', 'Soporte en español'].map(t => (
            <span key={t} className="flex items-center gap-2 font-body text-sm" style={{ color: '#7A6A58' }}>
              <span style={{ color: '#3DAA68', fontWeight: 700 }}>✓</span> {t}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Mockup visual del POS ────────────────────────────────────────────────────
function MockupPOS() {
  const [catActiva, setCatActiva] = useState('Café');
  const [ref, inView] = useInView();

  const productos = [
    { nombre: 'Tinto',     precio: '$2.500',  popular: true  },
    { nombre: 'Capuchino', precio: '$7.800',  popular: true  },
    { nombre: 'Latte',     precio: '$8.200',  popular: false },
    { nombre: 'Americano', precio: '$4.500',  popular: false },
    { nombre: 'Cortado',   precio: '$6.500',  popular: false },
    { nombre: 'Matcha',    precio: '$10.500', popular: false },
  ];

  return (
    <section id="mockup" className="py-24 px-4" style={{ background: 'linear-gradient(180deg, #080706 0%, #0D0B09 100%)' }}>
      <div className="max-w-6xl mx-auto">
        <Fade>
          <p className="text-center font-body text-xs uppercase tracking-widest mb-2" style={{ color: '#7A6A58' }}>Interfaz del sistema</p>
          <h2 className="text-center mb-14"
            style={{ fontFamily: '"Fraunces", Georgia, serif', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: '#F4ECD8', fontWeight: 700, lineHeight: 1.1 }}>
            Así se ve mezo en tu negocio
          </h2>
        </Fade>

        <div ref={ref} style={{
          opacity:    inView ? 1 : 0,
          transform:  inView ? 'translateY(0) scale(1)' : 'translateY(32px) scale(0.98)',
          transition: 'opacity 0.7s ease 200ms, transform 0.7s ease 200ms',
        }}>
          {/* Ventana del POS */}
          <div className="rounded-mezo-xl overflow-hidden border"
            style={{ background: '#141210', borderColor: '#2A2520', boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(200,144,63,0.08)' }}>

            {/* Barra superior */}
            <div className="flex items-center justify-between px-5 py-3 border-b" style={{ background: '#0D0B09', borderColor: '#2A2520' }}>
              <div className="flex items-center gap-3">
                <span style={{ fontFamily: '"Fraunces", Georgia, serif', fontStyle: 'italic', fontSize: 18, color: '#C8903F', fontWeight: 700 }}>mezo</span>
                <span className="font-body text-xs px-3 py-1 rounded-full" style={{ background: '#1A1713', color: '#7A6A58', border: '1px solid #2A2520' }}>☕ Buenos días — Caja 01</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs" style={{ color: '#7A6A58' }}>14:32</span>
                <div className="w-2 h-2 rounded-full" style={{ background: '#3DAA68' }} />
              </div>
            </div>

            {/* Contenido */}
            <div className="flex flex-col md:flex-row" style={{ minHeight: 400 }}>
              {/* Panel izquierdo — Menú */}
              <div className="flex-1 p-4 border-b md:border-b-0 md:border-r" style={{ borderColor: '#2A2520' }}>
                {/* Tabs */}
                <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
                  {['Café', 'Especiales', 'Panadería', 'Fríos'].map(cat => (
                    <button key={cat} onClick={() => setCatActiva(cat)}
                      className="font-body text-xs px-3 py-1.5 rounded-mezo-md whitespace-nowrap transition"
                      style={catActiva === cat
                        ? { background: '#C8903F', color: '#080706', fontWeight: 600 }
                        : { background: '#1A1713', color: '#7A6A58', border: '1px solid #2A2520' }}>
                      {cat}
                    </button>
                  ))}
                </div>
                {/* Grid de productos */}
                <div className="grid grid-cols-3 gap-2.5">
                  {productos.map(p => (
                    <div key={p.nombre}
                      className="relative p-3 rounded-mezo-lg border cursor-pointer transition"
                      style={{ background: '#0D0B09', borderColor: '#2A2520' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(200,144,63,0.4)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = '#2A2520'; }}>
                      {p.popular && (
                        <span className="absolute -top-1.5 -right-1.5 font-body font-bold rounded-full"
                          style={{ background: '#C8903F', color: '#080706', fontSize: 9, padding: '2px 6px' }}>
                          popular
                        </span>
                      )}
                      <p className="font-body font-semibold text-xs mb-1" style={{ color: '#D9CEB5' }}>{p.nombre}</p>
                      <p className="font-mono font-bold text-sm" style={{ color: '#C8903F' }}>{p.precio}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Panel derecho — Orden */}
              <div className="md:w-64 lg:w-72 p-4 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-body font-semibold" style={{ color: '#F4ECD8', fontSize: 14 }}>Orden</h3>
                  <span className="font-mono text-xs px-2 py-0.5 rounded" style={{ background: '#1A1713', color: '#C8903F', border: '1px solid rgba(200,144,63,0.3)' }}>#0247</span>
                </div>

                <div className="flex-1 space-y-2.5 mb-4">
                  {[{ cant: 2, nombre: 'Latte', precio: '$16.400' }, { cant: 1, nombre: 'Almojábana', precio: '$3.500' }].map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b" style={{ borderColor: '#2A2520' }}>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs rounded px-1.5 py-0.5" style={{ background: '#1A1713', color: '#C8903F', fontSize: 11 }}>×{item.cant}</span>
                        <span className="font-body text-sm" style={{ color: '#D9CEB5' }}>{item.nombre}</span>
                      </div>
                      <span className="font-mono text-sm" style={{ color: '#A89880' }}>{item.precio}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-1.5 mb-5 pt-3 border-t" style={{ borderColor: '#2A2520' }}>
                  <div className="flex justify-between font-body text-xs" style={{ color: '#7A6A58' }}>
                    <span>Subtotal</span><span>$19.900</span>
                  </div>
                  <div className="flex justify-between font-body text-xs" style={{ color: '#7A6A58' }}>
                    <span>IVA 8%</span><span>$1.592</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="font-body text-sm font-semibold" style={{ color: '#D9CEB5' }}>Total</span>
                    <span style={{ fontFamily: '"Fraunces", Georgia, serif', fontSize: 24, color: '#C8903F', fontWeight: 700 }}>$21.492</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 font-body text-xs font-semibold py-2.5 rounded-mezo-md border transition"
                    style={{ borderColor: '#2A2520', color: '#7A6A58' }}>
                    Guardar
                  </button>
                  <button className="flex-[2] font-body text-xs font-semibold py-2.5 rounded-mezo-md transition"
                    style={{ background: '#C8903F', color: '#080706' }}>
                    Cobrar →
                  </button>
                </div>
              </div>
            </div>
          </div>

          <p className="text-center font-body text-sm mt-5" style={{ color: '#7A6A58' }}>
            Una orden completa en menos de 10 segundos
          </p>
        </div>
      </div>
    </section>
  );
}

// ─── Para quién es ────────────────────────────────────────────────────────────
function TiposNegocio() {
  return (
    <section className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <Fade>
          <p className="text-center font-body text-xs uppercase tracking-widest mb-2" style={{ color: '#7A6A58' }}>Para todo tipo de negocio gastronómico</p>
          <h2 className="text-center mb-3"
            style={{ fontFamily: '"Fraunces", Georgia, serif', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: '#F4ECD8', fontWeight: 700, lineHeight: 1.1 }}>
            Diseñado para <span style={{ fontStyle: 'italic', color: '#C8903F' }}>todo tipo de negocio</span>
          </h2>
          <p className="text-center font-body mb-12 mx-auto" style={{ color: '#7A6A58', maxWidth: 480, lineHeight: 1.6 }}>
            Si vendes comida o bebida en Colombia, mezo funciona para ti.
          </p>
        </Fade>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {TIPOS_NEGOCIO.map((t, i) => (
            <Fade key={t.label} delay={i * 55}>
              <div className="relative h-44 rounded-mezo-xl overflow-hidden border cursor-default group"
                style={{ borderColor: '#2A2520' }}>
                <img src={t.img} alt={t.label} loading="lazy" decoding="async"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(8,7,6,0.88) 0%, rgba(8,7,6,0.3) 60%, transparent 100%)' }} />
                <div className="absolute bottom-0 left-0 right-0 p-3 flex items-center gap-2">
                  <span style={{ fontSize: 18 }}>{t.emoji}</span>
                  <span className="font-body font-semibold text-sm" style={{ color: '#F4ECD8' }}>{t.label}</span>
                </div>
              </div>
            </Fade>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Sub-mockups para la sección de Beneficios ────────────────────────────────

function MockupMesas() {
  const mesas = [
    { id: 1, estado: 'ocupada', tiempo: '43 min', total: '$27.000', personas: 3 },
    { id: 2, estado: 'libre',   tiempo: null,     total: null,       personas: 0 },
    { id: 3, estado: 'pagando', tiempo: '1h 32m', total: '$45.000', personas: 4 },
    { id: 4, estado: 'libre',   tiempo: null,     total: null,       personas: 0 },
    { id: 5, estado: 'ocupada', tiempo: '22 min', total: '$13.500', personas: 2 },
    { id: 6, estado: 'libre',   tiempo: null,     total: null,       personas: 0 },
  ];
  const colores = {
    ocupada: { bg: 'rgba(200,144,63,0.12)', border: 'rgba(200,144,63,0.35)', text: '#E4B878' },
    pagando: { bg: 'rgba(61,170,104,0.12)', border: 'rgba(61,170,104,0.35)', text: '#3DAA68' },
    libre:   { bg: 'rgba(20,18,16,0.6)',    border: '#2A2520',               text: '#4A3F35' },
  };
  return (
    <div className="p-4 rounded-mezo-xl border" style={{ background: '#141210', borderColor: '#2A2520' }}>
      <div className="flex items-center justify-between mb-3">
        <span className="font-body text-xs font-semibold uppercase tracking-widest" style={{ color: '#7A6A58' }}>Mesas hoy</span>
        <span className="font-body text-xs px-2.5 py-0.5 rounded-full" style={{ background: 'rgba(61,170,104,0.12)', color: '#3DAA68', border: '1px solid rgba(61,170,104,0.3)' }}>🟢 En vivo</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {mesas.map(m => {
          const c = colores[m.estado];
          return (
            <div key={m.id} className="p-3 rounded-mezo-lg" style={{ background: c.bg, border: `1px solid ${c.border}` }}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-body text-xs font-semibold" style={{ color: c.text }}>Mesa {m.id}</span>
                {m.tiempo && <span className="font-body" style={{ color: '#7A6A58', fontSize: 10 }}>{m.tiempo}</span>}
              </div>
              {m.estado === 'libre'
                ? <span className="font-body text-xs" style={{ color: '#4A3F35' }}>Libre</span>
                : <>
                    <p className="font-mono font-bold text-sm" style={{ color: c.text }}>{m.total}</p>
                    <p className="font-body" style={{ color: '#7A6A58', fontSize: 10 }}>{m.personas} personas</p>
                  </>
              }
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MockupCobro() {
  const [metodo, setMetodo] = useState('nequi');
  const metodos = [
    { id: 'efectivo', label: '💵', nombre: 'Efectivo'     },
    { id: 'datafono', label: '💳', nombre: 'Datáfono'     },
    { id: 'nequi',    label: '📱', nombre: 'Nequi'        },
    { id: 'daviplata',label: '📲', nombre: 'Daviplata'    },
    { id: 'transfer', label: '🏦', nombre: 'Transferencia'},
  ];
  return (
    <div className="p-4 rounded-mezo-xl border" style={{ background: '#141210', borderColor: '#2A2520' }}>
      <p className="font-body text-xs uppercase tracking-widest mb-1" style={{ color: '#7A6A58' }}>Método de pago</p>
      <div className="mb-4" style={{ fontFamily: '"Fraunces", Georgia, serif', fontSize: 32, color: '#C8903F', fontWeight: 700 }}>$21.492</div>
      <div className="grid grid-cols-5 gap-1.5 mb-4">
        {metodos.map(m => (
          <button key={m.id} onClick={() => setMetodo(m.id)}
            className="flex flex-col items-center gap-1 p-2 rounded-mezo-md transition"
            style={metodo === m.id
              ? { background: 'rgba(200,144,63,0.15)', border: '1px solid rgba(200,144,63,0.4)' }
              : { background: '#0D0B09', border: '1px solid #2A2520' }}>
            <span style={{ fontSize: 16 }}>{m.label}</span>
            <span className="font-body" style={{ fontSize: 9, color: metodo === m.id ? '#E4B878' : '#7A6A58' }}>{m.nombre}</span>
          </button>
        ))}
      </div>
      <button className="w-full font-body font-semibold py-3 rounded-mezo-lg text-sm"
        style={{ background: '#C8903F', color: '#080706' }}>
        Confirmar cobro ✓
      </button>
    </div>
  );
}

function MockupArqueo() {
  const filas = [
    { label: 'Efectivo', esperado: '$280.000', real: '$275.000', diff: '−$5.000', ok: false },
    { label: 'Nequi',    esperado: '$134.500', real: '$134.500', diff: '$0',       ok: true  },
    { label: 'Datáfono', esperado: '$358.000', real: '$358.000', diff: '$0',       ok: true  },
  ];
  return (
    <div className="p-4 rounded-mezo-xl border" style={{ background: '#141210', borderColor: '#2A2520' }}>
      <p className="font-body text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#7A6A58' }}>Arqueo — Miércoles 23</p>
      <div className="space-y-2 mb-4">
        {filas.map(f => (
          <div key={f.label} className="flex items-center justify-between p-2.5 rounded-mezo-md border"
            style={{ background: '#0D0B09', borderColor: '#2A2520' }}>
            <span className="font-body text-xs font-medium" style={{ color: '#D9CEB5' }}>{f.label}</span>
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs" style={{ color: '#7A6A58' }}>{f.esperado}</span>
              <span className="font-mono text-xs font-bold" style={{ color: f.ok ? '#3DAA68' : '#C8573F' }}>{f.diff}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between items-center pt-3 border-t" style={{ borderColor: '#2A2520' }}>
        <span className="font-body text-xs" style={{ color: '#7A6A58' }}>Total del día</span>
        <span style={{ fontFamily: '"Fraunces", Georgia, serif', fontSize: 22, color: '#C8903F', fontWeight: 700 }}>$772.500</span>
      </div>
    </div>
  );
}

// ─── Beneficios alternados ────────────────────────────────────────────────────
function Beneficios() {
  return (
    <section id="beneficios" className="py-24 px-4" style={{ background: '#0A0907' }}>
      <div className="max-w-5xl mx-auto">
        <Fade>
          <p className="text-center font-body text-xs uppercase tracking-widest mb-2" style={{ color: '#7A6A58' }}>Ventajas</p>
          <h2 className="text-center mb-4"
            style={{ fontFamily: '"Fraunces", Georgia, serif', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: '#F4ECD8', fontWeight: 700, lineHeight: 1.1 }}>
            ¿Por qué mezo y no <span style={{ fontStyle: 'italic', color: '#C8903F' }}>cualquier otro?</span>
          </h2>
          <p className="text-center font-body mb-20 mx-auto" style={{ color: '#7A6A58', maxWidth: 480, lineHeight: 1.65 }}>
            Diseñado desde cero para Colombia. No es un software gringo adaptado.
          </p>
        </Fade>

        <div className="space-y-24">
          {/* Bloque 1 — Mesas en tiempo real */}
          <Fade delay={100}>
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="w-full md:w-1/2"><MockupMesas /></div>
              <div className="w-full md:w-1/2">
                <span className="font-body text-xs font-semibold px-3 py-1.5 rounded-full mb-4 inline-block"
                  style={{ background: 'rgba(200,144,63,0.12)', color: '#E4B878', border: '1px solid rgba(200,144,63,0.25)' }}>
                  ⏱️ Sin recargar
                </span>
                <h3 style={{ fontFamily: '"Fraunces", Georgia, serif', fontSize: 'clamp(1.4rem, 3vw, 2.2rem)', color: '#F4ECD8', fontWeight: 700, lineHeight: 1.15, marginBottom: 14 }}>
                  Mesas en tiempo real, sin recargar la página
                </h3>
                <p className="font-body mb-5" style={{ color: '#7A6A58', lineHeight: 1.75, fontSize: 16 }}>
                  Ve al instante qué mesas están ocupadas, cuánto tiempo llevan en servicio y qué han pedido. El mesero toma la orden en su celular y aparece en cocina en segundos.
                </p>
                <span className="font-body text-sm font-semibold px-4 py-2 rounded-full inline-block"
                  style={{ background: 'rgba(61,170,104,0.12)', color: '#3DAA68', border: '1px solid rgba(61,170,104,0.3)' }}>
                  🟢 Sin aplicación extra
                </span>
              </div>
            </div>
          </Fade>

          {/* Bloque 2 — Métodos de pago (invertido) */}
          <Fade delay={100}>
            <div className="flex flex-col md:flex-row-reverse items-center gap-12">
              <div className="w-full md:w-1/2"><MockupCobro /></div>
              <div className="w-full md:w-1/2">
                <span className="font-body text-xs font-semibold px-3 py-1.5 rounded-full mb-4 inline-block"
                  style={{ background: 'rgba(200,144,63,0.12)', color: '#E4B878', border: '1px solid rgba(200,144,63,0.25)' }}>
                  💳 Pagos colombianos
                </span>
                <h3 style={{ fontFamily: '"Fraunces", Georgia, serif', fontSize: 'clamp(1.4rem, 3vw, 2.2rem)', color: '#F4ECD8', fontWeight: 700, lineHeight: 1.15, marginBottom: 14 }}>
                  Todos los pagos que usan tus clientes
                </h3>
                <p className="font-body mb-5" style={{ color: '#7A6A58', lineHeight: 1.75, fontSize: 16 }}>
                  Efectivo con cambio automático. Datáfono Bold. Nequi. Daviplata. Transferencia bancaria. Todo registrado, todo reportado.
                </p>
                <div className="flex flex-wrap gap-2">
                  {['💵 Efectivo','💳 Datáfono','📱 Nequi','📲 Daviplata','🏦 Transferencia'].map(m => (
                    <span key={m} className="font-body text-xs px-3 py-1.5 rounded-full"
                      style={{ background: '#141210', color: '#A89880', border: '1px solid #2A2520' }}>
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Fade>

          {/* Bloque 3 — Arqueo de caja */}
          <Fade delay={100}>
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="w-full md:w-1/2"><MockupArqueo /></div>
              <div className="w-full md:w-1/2">
                <span className="font-body text-xs font-semibold px-3 py-1.5 rounded-full mb-4 inline-block"
                  style={{ background: 'rgba(200,144,63,0.12)', color: '#E4B878', border: '1px solid rgba(200,144,63,0.25)' }}>
                  🧾 Cierre sin sorpresas
                </span>
                <h3 style={{ fontFamily: '"Fraunces", Georgia, serif', fontSize: 'clamp(1.4rem, 3vw, 2.2rem)', color: '#F4ECD8', fontWeight: 700, lineHeight: 1.15, marginBottom: 14 }}>
                  Arqueo de caja que no te da sorpresas
                </h3>
                <p className="font-body" style={{ color: '#7A6A58', lineHeight: 1.75, fontSize: 16 }}>
                  Compara lo que registró el sistema contra lo que hay físicamente en tu caja. Detecta diferencias al instante. Cierra el día con tranquilidad.
                </p>
              </div>
            </div>
          </Fade>
        </div>
      </div>
    </section>
  );
}

// ─── Sección IA ───────────────────────────────────────────────────────────────
function SeccionIA() {
  const cards = [
    { emoji: '🧠', titulo: 'Análisis de ventas',            desc: 'Cada semana mezo analiza tus datos y te dice qué está funcionando y qué no. Sin jerga, en español colombiano.',                                   plan: 'Pro',   planColor: '#C8903F' },
    { emoji: '📈', titulo: 'Estrategias personalizadas',    desc: '"Tus ventas bajan los martes entre 3 y 5pm. Aquí hay 3 estrategias para ese horario." Basadas en tus datos reales.',                            plan: 'Pro',   planColor: '#C8903F' },
    { emoji: '🎯', titulo: 'Predicción de demanda',         desc: 'Sabe cuántos capuchinos preparar el viernes antes de que abras. Reduce el desperdicio y nunca te quedas sin stock.',                           plan: 'Élite', planColor: '#9B7FE8' },
    { emoji: '💬', titulo: 'Chatbot de WhatsApp',           desc: 'Tus clientes piden por WhatsApp, la IA toma la orden, cobra y avisa a cocina sola. Tú solo sirves.',                                           plan: 'Élite', planColor: '#9B7FE8' },
  ];

  return (
    <section className="py-24 px-4" style={{ background: '#0F0C08', borderTop: '1px solid rgba(200,144,63,0.08)', borderBottom: '1px solid rgba(200,144,63,0.08)' }}>
      <div className="max-w-5xl mx-auto">
        <Fade>
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-2 text-xs font-body font-semibold px-4 py-1.5 rounded-full mb-5"
              style={{ background: 'rgba(155,127,232,0.12)', color: '#C8B8FF', border: '1px solid rgba(155,127,232,0.3)' }}>
              ✨ Inteligencia Artificial
            </span>
            <h2 style={{ fontFamily: '"Fraunces", Georgia, serif', fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: '#F4ECD8', fontWeight: 700, lineHeight: 1.05, letterSpacing: '-0.02em' }}>
              Tu negocio con<br />
              <span style={{ fontStyle: 'italic', color: '#C8903F' }}>superpoderes</span>
            </h2>
            <p className="font-body mt-4 mx-auto" style={{ color: '#7A6A58', maxWidth: 500, lineHeight: 1.7 }}>
              mezo no solo registra tus ventas — las entiende y te dice exactamente qué hacer.
            </p>
          </div>
        </Fade>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-14">
          {cards.map((card, i) => (
            <Fade key={i} delay={i * 90}>
              <div className="p-6 rounded-mezo-xl border relative overflow-hidden transition"
                style={{ background: 'linear-gradient(135deg, rgba(20,18,16,0.9) 0%, rgba(28,23,18,0.9) 100%)', borderColor: 'rgba(200,144,63,0.18)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(200,144,63,0.4)'; e.currentTarget.style.boxShadow = '0 0 40px rgba(200,144,63,0.07)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(200,144,63,0.18)'; e.currentTarget.style.boxShadow = 'none'; }}>
                <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none"
                  style={{ background: `radial-gradient(ellipse at top right, ${card.planColor}18 0%, transparent 70%)` }} />
                <div className="text-3xl mb-3">{card.emoji}</div>
                <h3 className="font-body font-semibold mb-2" style={{ color: '#F4ECD8', fontSize: 16 }}>{card.titulo}</h3>
                <p className="font-body text-sm mb-4" style={{ color: '#7A6A58', lineHeight: 1.65 }}>{card.desc}</p>
                <span className="font-body text-xs font-semibold px-3 py-1 rounded-full"
                  style={{ background: `${card.planColor}18`, color: card.planColor, border: `1px solid ${card.planColor}40` }}>
                  Disponible en {card.plan}
                </span>
              </div>
            </Fade>
          ))}
        </div>

        {/* Testimonial */}
        <Fade>
          <div className="max-w-xl mx-auto p-6 rounded-mezo-xl border text-center"
            style={{ background: 'rgba(20,18,16,0.6)', borderColor: 'rgba(200,144,63,0.18)' }}>
            <div className="w-11 h-11 rounded-full mx-auto mb-4 flex items-center justify-center font-bold text-sm"
              style={{ background: 'linear-gradient(135deg, #C8903F, #E4B878)', color: '#080706' }}>
              CR
            </div>
            <p className="font-body italic mb-4" style={{ color: '#D9CEB5', fontSize: 15, lineHeight: 1.7 }}>
              "mezo me dijo que mi producto más rentable no era el que más vendía. Cambié el menú y subí 23% en un mes."
            </p>
            <p className="font-body text-sm font-semibold" style={{ color: '#E4B878' }}>Carolina Ríos</p>
            <p className="font-body text-xs mt-0.5" style={{ color: '#7A6A58' }}>Café del Parque · Bogotá</p>
          </div>
        </Fade>
      </div>
    </section>
  );
}

// ─── Features 3×3 ────────────────────────────────────────────────────────────
function Features() {
  return (
    <section id="características" className="py-24 px-4">
      <div className="max-w-5xl mx-auto">
        <Fade>
          <p className="text-center font-body text-xs uppercase tracking-widest mb-2" style={{ color: '#7A6A58' }}>Características</p>
          <h2 className="text-center mb-14"
            style={{ fontFamily: '"Fraunces", Georgia, serif', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: '#F4ECD8', fontWeight: 700, lineHeight: 1.1 }}>
            Todo lo que necesitas <span style={{ fontStyle: 'italic', color: '#C8903F' }}>desde el día 1</span>
          </h2>
        </Fade>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES_GRID.map((f, i) => (
            <Fade key={f.title} delay={i * 55}>
              <div className="p-5 rounded-mezo-xl border transition"
                style={{ background: '#141210', borderColor: '#2A2520' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(200,144,63,0.35)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#2A2520'; }}>
                <div className="text-2xl mb-3">{f.emoji}</div>
                <h3 className="font-body font-semibold mb-2" style={{ color: '#F4ECD8', fontSize: 14 }}>{f.title}</h3>
                <p className="font-body text-sm" style={{ color: '#7A6A58', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            </Fade>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Precios ──────────────────────────────────────────────────────────────────
function Precios() {
  const [anual, setAnual] = useState(false);

  return (
    <section id="precios" className="py-24 px-4" style={{ background: '#0A0907' }}>
      <div className="max-w-5xl mx-auto">
        <Fade>
          <p className="text-center font-body text-xs uppercase tracking-widest mb-2" style={{ color: '#7A6A58' }}>Precios</p>
          <h2 className="text-center mb-6"
            style={{ fontFamily: '"Fraunces", Georgia, serif', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: '#F4ECD8', fontWeight: 700, lineHeight: 1.1 }}>
            Planes <span style={{ fontStyle: 'italic', color: '#C8903F' }}>simples y honestos</span>
          </h2>

          {/* Toggle mensual/anual */}
          <div className="flex items-center justify-center gap-3 mb-14">
            <span className="font-body text-sm" style={{ color: anual ? '#7A6A58' : '#F4ECD8' }}>Mensual</span>
            <button onClick={() => setAnual(a => !a)}
              className="relative w-12 h-6 rounded-full transition-colors"
              style={{ background: anual ? '#C8903F' : '#2A2520' }}>
              <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-300"
                style={{ left: 0, transform: anual ? 'translateX(26px)' : 'translateX(2px)' }} />
            </button>
            <span className="font-body text-sm flex items-center gap-2" style={{ color: anual ? '#F4ECD8' : '#7A6A58' }}>
              Anual
              <span className="font-body text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(61,170,104,0.15)', color: '#3DAA68' }}>−20%</span>
            </span>
          </div>
        </Fade>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(PLANES).map(([key, plan], i) => (
            <Fade key={key} delay={i * 100}>
              <div className="relative flex flex-col p-7 rounded-mezo-xl border h-full"
                style={{
                  background:   key === 'pro' ? 'linear-gradient(180deg, rgba(200,144,63,0.08) 0%, #141210 100%)' : '#141210',
                  borderColor:  key === 'pro' ? '#C8903F' : '#2A2520',
                  boxShadow:    key === 'pro' ? '0 0 40px rgba(200,144,63,0.1)' : 'none',
                }}>
                {plan.badge && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-xs font-body font-bold px-4 py-1 rounded-full whitespace-nowrap"
                    style={{ background: '#C8903F', color: '#080706' }}>
                    {plan.badge}
                  </span>
                )}

                <p className="font-body font-semibold mb-1" style={{ color: '#7A6A58', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                  {plan.nombre}
                </p>
                <div className="mb-1" style={{ fontFamily: '"Fraunces", Georgia, serif', fontSize: 36, color: '#F4ECD8', fontWeight: 700, lineHeight: 1, transition: 'all 0.3s ease' }}>
                  {formatCOP(anual ? plan.precio.anual : plan.precio.mensual)}
                </div>
                <p className="font-body text-xs mb-6" style={{ color: '#7A6A58' }}>
                  /mes{anual ? ' · facturado anualmente' : ''}
                </p>

                <ul className="space-y-3 flex-1 mb-8">
                  {plan.items.map((it, j) => (
                    <li key={j} className="flex items-start gap-2.5 font-body text-sm"
                      style={{ color: it.ok ? '#D9CEB5' : '#4A3F35' }}>
                      {it.ok
                        ? <Check size={14} style={{ color: '#3DAA68', flexShrink: 0, marginTop: 2 }} />
                        : <X     size={14} style={{ color: '#4A3F35', flexShrink: 0, marginTop: 2 }} />}
                      {it.text}
                    </li>
                  ))}
                </ul>

                <Link to="/register"
                  className="block text-center font-body font-semibold py-3 rounded-mezo-lg text-sm transition"
                  style={plan.ctaStyle === 'gold'
                    ? { background: '#C8903F', color: '#080706' }
                    : { border: '1px solid rgba(200,144,63,0.4)', color: '#E4B878', background: 'transparent' }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = plan.ctaStyle === 'gold' ? '#A87528' : 'rgba(200,144,63,0.1)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = plan.ctaStyle === 'gold' ? '#C8903F' : 'transparent';
                  }}>
                  {plan.cta}
                </Link>
              </div>
            </Fade>
          ))}
        </div>

        <p className="text-center font-body text-sm mt-8" style={{ color: '#7A6A58' }}>
          30 días gratis en todos los planes · Sin tarjeta de crédito
        </p>
      </div>
    </section>
  );
}

// ─── FAQs con acordeón ────────────────────────────────────────────────────────
function FAQs() {
  const [abierto, setAbierto] = useState(null);

  return (
    <section id="faqs" className="py-24 px-4">
      <div className="max-w-2xl mx-auto">
        <Fade>
          <p className="text-center font-body text-xs uppercase tracking-widest mb-2" style={{ color: '#7A6A58' }}>FAQ</p>
          <h2 className="text-center mb-12"
            style={{ fontFamily: '"Fraunces", Georgia, serif', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: '#F4ECD8', fontWeight: 700, lineHeight: 1.1 }}>
            Preguntas <span style={{ fontStyle: 'italic', color: '#C8903F' }}>frecuentes</span>
          </h2>
        </Fade>

        <div className="space-y-2">
          {FAQS.map((faq, i) => (
            <Fade key={i} delay={i * 45}>
              <div className="rounded-mezo-xl border overflow-hidden transition-colors"
                style={{ borderColor: abierto === i ? 'rgba(200,144,63,0.3)' : '#2A2520', background: '#141210' }}>
                <button className="w-full flex items-center justify-between px-5 py-4 text-left"
                  onClick={() => setAbierto(abierto === i ? null : i)}>
                  <span className="font-body font-semibold text-sm pr-4" style={{ color: '#F4ECD8' }}>{faq.q}</span>
                  <ChevronDown size={17} style={{ color: '#C8903F', flexShrink: 0, transform: abierto === i ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }} />
                </button>
                {/* Respuesta con altura animada */}
                <div style={{ maxHeight: abierto === i ? '300px' : '0', overflow: 'hidden', transition: 'max-height 0.35s ease' }}>
                  <p className="font-body text-sm px-5 pb-5" style={{ color: '#7A6A58', lineHeight: 1.75 }}>{faq.a}</p>
                </div>
              </div>
            </Fade>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA Final ────────────────────────────────────────────────────────────────
function CTAFinal() {
  return (
    <section className="relative py-32 px-4 overflow-hidden">
      <div className="absolute inset-0">
        <img src="https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=1600"
          alt="" loading="lazy" decoding="async"
          className="w-full h-full object-cover" style={{ opacity: 0.22 }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(8,7,6,0.75) 0%, rgba(8,7,6,0.92) 100%)' }} />
      </div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, rgba(200,144,63,0.14) 0%, transparent 70%)' }} />

      <div className="relative z-10 max-w-2xl mx-auto text-center">
        <Fade>
          <h2 style={{ fontFamily: '"Fraunces", Georgia, serif', fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: '#F4ECD8', fontWeight: 700, lineHeight: 1.05, letterSpacing: '-0.02em' }}>
            Tu cafetería merece<br />
            <span style={{ fontStyle: 'italic', color: '#C8903F' }}>la mejor herramienta</span>
          </h2>
          <p className="font-body mt-5 mb-8" style={{ color: '#7A6A58', fontSize: 18 }}>Únete hoy. 30 días gratis.</p>
          <Link to="/register"
            className="inline-flex font-body font-semibold px-10 py-4 rounded-mezo-lg text-base transition"
            style={{ background: '#C8903F', color: '#080706', boxShadow: '0 0 40px rgba(200,144,63,0.4)' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#A87528'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#C8903F'; }}>
            Crear cuenta gratis →
          </Link>
          <p className="font-body text-sm mt-5" style={{ color: '#4A3F35' }}>
            Sin tarjeta · Cancela cuando quieras · Soporte en español
          </p>
        </Fade>
      </div>
    </section>
  );
}

// ─── Footer 4 columnas ────────────────────────────────────────────────────────
function Footer() {
  const linkStyle = { color: '#7A6A58' };
  const linkHover = {
    onMouseEnter: e => { e.currentTarget.style.color = '#E4B878'; },
    onMouseLeave: e => { e.currentTarget.style.color = '#7A6A58'; },
  };

  return (
    <footer className="px-4 pt-16 pb-8 border-t" style={{ borderColor: '#2A2520', background: '#080706' }}>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-14">
          {/* Columna 1 — Marca */}
          <div className="col-span-2 md:col-span-1">
            <span style={{ fontFamily: '"Fraunces", Georgia, serif', fontStyle: 'italic', fontSize: 28, color: '#C8903F', fontWeight: 700 }}>mezo</span>
            <p className="font-body text-sm mt-2 mb-5" style={{ color: '#7A6A58', lineHeight: 1.6 }}>El POS hecho para Colombia.</p>
            <div className="flex items-center gap-2.5">
              {[
                { href: 'https://instagram.com/usemezo',          label: '📸', title: '@usemezo en Instagram' },
                { href: 'https://tiktok.com/@usemezo',            label: '🎵', title: '@usemezo en TikTok'    },
                { href: 'https://linkedin.com/company/mezo-co',   label: '💼', title: 'mezo en LinkedIn'      },
              ].map(red => (
                <a key={red.href} href={red.href} target="_blank" rel="noopener noreferrer" title={red.title}
                  className="w-9 h-9 rounded-mezo-md border flex items-center justify-center text-sm transition"
                  style={{ borderColor: '#2A2520', background: '#141210' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(200,144,63,0.4)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#2A2520'; }}>
                  {red.label}
                </a>
              ))}
            </div>
          </div>

          {/* Columna 2 — Producto */}
          <div>
            <p className="font-body text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#F4ECD8' }}>Producto</p>
            <ul className="space-y-3">
              {['Características', 'Precios', 'Integraciones', 'Changelog'].map(l => (
                <li key={l}><a href="#" className="font-body text-sm transition" style={linkStyle} {...linkHover}>{l}</a></li>
              ))}
            </ul>
          </div>

          {/* Columna 3 — Empresa */}
          <div>
            <p className="font-body text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#F4ECD8' }}>Empresa</p>
            <ul className="space-y-3">
              {['Sobre mezo', 'Blog', 'Trabaja con nosotros', 'Contacto'].map(l => (
                <li key={l}><a href="#" className="font-body text-sm transition" style={linkStyle} {...linkHover}>{l}</a></li>
              ))}
            </ul>
          </div>

          {/* Columna 4 — Soporte */}
          <div>
            <p className="font-body text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#F4ECD8' }}>Soporte</p>
            <ul className="space-y-3">
              {['Centro de ayuda', 'WhatsApp: +57 300 000 0000', 'Email: hola@mezo.co', 'Estado del sistema'].map(l => (
                <li key={l}><a href="#" className="font-body text-sm transition" style={linkStyle} {...linkHover}>{l}</a></li>
              ))}
            </ul>
          </div>
        </div>

        {/* Línea final */}
        <div className="pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4" style={{ borderColor: '#2A2520' }}>
          <p className="font-body text-xs" style={{ color: '#4A3F35' }}>
            © 2026 mezo · Todos los derechos reservados · Hecho con ☕ en Colombia 🇨🇴
          </p>
          <div className="flex items-center gap-5">
            {['Términos de uso', 'Política de privacidad'].map(l => (
              <a key={l} href="#" className="font-body text-xs transition" style={{ color: '#4A3F35' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#7A6A58'; }}
                onMouseLeave={e => { e.currentTarget.style.color = '#4A3F35'; }}>
                {l}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function Landing() {
  const { user, negocio, loading } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  // Scroll suave entre secciones
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => { document.documentElement.style.scrollBehavior = ''; };
  }, []);

  // Si ya está autenticado, redirigir al dashboard
  useEffect(() => {
    if (!loading && user) {
      navigate(negocio ? '/dashboard' : '/onboarding', { replace: true });
    }
  }, [loading, user, negocio, navigate]);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  if (loading) return null;

  return (
    <div style={{ background: '#080706', minHeight: '100vh' }}>
      <Navbar scrolled={scrolled} />
      <Hero />
      <MockupPOS />
      <TiposNegocio />
      <Beneficios />
      <SeccionIA />
      <Features />
      <Precios />
      <FAQs />
      <CTAFinal />
      <Footer />
    </div>
  );
}
