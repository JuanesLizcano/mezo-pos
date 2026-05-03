// Landing page v3 — mezo POS para Colombia
import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, X, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// ─── Keyframes globales ───────────────────────────────────────────────────────
const GLOBAL_STYLES = `
  @keyframes cardPulse {
    0%, 100% {
      box-shadow: 0 0 0 1px #C8903F,
                  0 0 20px rgba(200,144,63,0.1),
                  0 0 0px rgba(200,144,63,0);
    }
    50% {
      box-shadow: 0 0 0 1.5px #E4B878,
                  0 0 40px rgba(200,144,63,0.25),
                  0 0 80px rgba(200,144,63,0.08);
    }
  }
  @keyframes mezoPulseTimer {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.55; }
  }
  @keyframes mezoGlow {
    0%, 100% { box-shadow: 0 0 0 0 rgba(200,144,63,0); }
    50%       { box-shadow: 0 0 20px 2px rgba(200,144,63,0.18); }
  }
  @keyframes particleFloat {
    0%, 100% { transform: translateY(0) scale(1); opacity: 0.4; }
    50%       { transform: translateY(-12px) scale(1.1); opacity: 0.6; }
  }
  @keyframes iaGlow {
    0%, 100% { box-shadow: 0 0 0 1px rgba(200,144,63,0.3), 0 0 16px rgba(200,144,63,0.05); }
    50%       { box-shadow: 0 0 0 1px rgba(61,170,104,0.3), 0 0 16px rgba(61,170,104,0.05); }
  }
`;

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

// ─── Wrapper fade-in al scroll ────────────────────────────────────────────────
function Fade({ children, delay = 0, className = '' }) {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} className={className} style={{
      opacity:   inView ? 1 : 0,
      transform: inView ? 'translateY(0)' : 'translateY(20px)',
      transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`,
    }}>
      {children}
    </div>
  );
}

// ─── Hook: texto rotativo con fade ────────────────────────────────────────────
function useTextRotator(texts, interval = 3000) {
  const [index, setIndex]     = useState(0);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const t = setInterval(() => {
      setVisible(false);
      setTimeout(() => { setIndex(i => (i + 1) % texts.length); setVisible(true); }, 300);
    }, interval);
    return () => clearInterval(t);
  }, [texts.length, interval]);
  return { text: texts[index], visible };
}

// ─── Hook: contador animado desde 0 ──────────────────────────────────────────
function useCountUp(target, duration = 1600) {
  const [ref, inView] = useInView(0.1);
  const [count, setCount] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    if (!inView || started.current) return;
    started.current = true;
    const t0 = Date.now();
    const id = setInterval(() => {
      const p = Math.min((Date.now() - t0) / duration, 1);
      setCount(Math.round(target * (1 - Math.pow(1 - p, 3)))); // ease-out cubic
      if (p >= 1) clearInterval(id);
    }, 16);
    return () => clearInterval(id);
  }, [inView, target, duration]);
  return [ref, count];
}

// ─── Datos ────────────────────────────────────────────────────────────────────
const CTA_TEXTS = ['Prueba gratis →', 'Empieza hoy →', 'Regístrate →', 'Comienza gratis →'];

const TIPOS_NEGOCIO = [
  { emoji: '☕', label: 'Cafeterías',    img: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400' },
  { emoji: '🍽️', label: 'Restaurantes', img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400' },
  { emoji: '🥐', label: 'Panaderías',   img: 'https://images.unsplash.com/photo-1568254183919-78a4f43a2877?w=400' },
  { emoji: '🍺', label: 'Bares',        img: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400' },
  { emoji: '🍔', label: 'Comida rápida',img: 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=400' },
  { emoji: '🍦', label: 'Heladerías',   img: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400' },
  { emoji: '🧃', label: 'Fruterías',    img: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400' },
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
  { q: '¿Cómo funciona el período de prueba?',a: '30 días completamente gratis en el plan Pro. Sin cobros hasta que decidas continuar. Al terminar eliges si continúas o no.' },
  { q: '¿Puedo tener varios empleados?',      a: 'Sí. En plan Semilla hasta 5 empleados; en Pro y Élite ilimitados, cada uno con su propio acceso y rol.' },
  { q: '¿Qué pasa con mis datos si cancelo?', a: 'Puedes exportar toda tu información antes de cancelar. Tus datos se eliminan de nuestros servidores 30 días después.' },
  { q: '¿Funciona para múltiples sedes?',     a: 'Plan Élite incluye sedes ilimitadas con reportes consolidados. Los planes Semilla y Pro son para una sola sede.' },
  { q: '¿Tienen soporte en español?',         a: 'Sí, todo el soporte es en español colombiano. Chat en el dashboard, WhatsApp y email.' },
];

const PLANES = {
  semilla: {
    nombre: 'Semilla', precio: { mensual: 39900, anual: 31900 },
    items: [
      { ok: true,  text: 'Hasta 8 mesas' },
      { ok: true,  text: 'Hasta 50 productos' },
      { ok: true,  text: 'Hasta 5 empleados' },
      { ok: true,  text: '1 sede · POS completo' },
      { ok: true,  text: 'Todos los métodos de pago' },
      { ok: true,  text: 'Reporte de ventas del día' },
      { ok: false, text: 'Historial y reportes avanzados' },
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
      { ok: true,  text: 'Reportes completos (semana, mes, año)' },
      { ok: true,  text: 'Exportar datos' },
      { ok: false, text: 'Funciones IA' },
    ],
    cta: 'Comenzar ahora', ctaStyle: 'gold',
  },
  elite: {
    nombre: 'Élite', precio: { mensual: 249900, anual: 199900 },
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

const STATS = [
  { value: 59, display: n => `${n}%`,     label: 'de negocios gastronómicos sin sistema digital' },
  { value: 5,  display: n => `<${n} min`, label: 'de configuración desde cero' },
  { value: 10, display: n => `<${n}s`,    label: 'segundos por orden en el POS' },
];

function formatCOP(n) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);
}

// ─── SVGs redes sociales ──────────────────────────────────────────────────────
const SVG_INSTAGRAM = (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);
const SVG_TIKTOK = (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z"/>
  </svg>
);
const SVG_LINKEDIN = (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

// ─── Slides del mockup ────────────────────────────────────────────────────────

function Slide1POS() {
  const productos = [
    { nombre: 'Tinto',     precio: '$2.500',  popular: true  },
    { nombre: 'Capuchino', precio: '$7.800',  popular: true  },
    { nombre: 'Latte',     precio: '$8.200',  popular: false },
    { nombre: 'Americano', precio: '$4.500',  popular: false },
    { nombre: 'Cortado',   precio: '$6.500',  popular: false },
    { nombre: 'Matcha',    precio: '$10.500', popular: false },
  ];
  return (
    <div className="flex flex-col md:flex-row" style={{ minHeight: 320 }}>
      <div className="flex-1 p-4 border-b md:border-b-0 md:border-r" style={{ borderColor: '#2A2520' }}>
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {['Café', 'Especiales', 'Panadería', 'Fríos'].map((cat, i) => (
            <span key={cat} className="font-body text-xs px-3 py-1.5 rounded-lg whitespace-nowrap"
              style={i === 0
                ? { background: '#C8903F', color: '#080706', fontWeight: 600 }
                : { background: '#1A1713', color: '#7A6A58', border: '1px solid #2A2520' }}>
              {cat}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {productos.map(p => (
            <div key={p.nombre} className="relative p-3 rounded-lg border" style={{ background: '#0D0B09', borderColor: '#2A2520' }}>
              {p.popular && (
                <span className="absolute -top-1.5 -right-1.5 font-bold rounded-full"
                  style={{ background: '#C8903F', color: '#080706', fontSize: 9, padding: '2px 6px' }}>popular</span>
              )}
              <p className="font-body font-semibold text-xs mb-1" style={{ color: '#D9CEB5' }}>{p.nombre}</p>
              <p className="font-mono font-bold text-sm" style={{ color: '#C8903F' }}>{p.precio}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="md:w-56 p-4 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-body font-semibold text-sm" style={{ color: '#F4ECD8' }}>Orden</h3>
          <span className="font-mono text-xs px-2 py-0.5 rounded" style={{ background: '#1A1713', color: '#C8903F', border: '1px solid rgba(200,144,63,0.3)' }}>#0247</span>
        </div>
        <div className="flex-1 space-y-2 mb-3">
          {[{ cant: 2, nombre: 'Latte', precio: '$16.400' }, { cant: 1, nombre: 'Almojábana', precio: '$3.500' }].map((item, i) => (
            <div key={i} className="flex items-center justify-between py-1.5 border-b" style={{ borderColor: '#2A2520' }}>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs rounded px-1.5 py-0.5" style={{ background: '#1A1713', color: '#C8903F', fontSize: 10 }}>×{item.cant}</span>
                <span className="font-body text-xs" style={{ color: '#D9CEB5' }}>{item.nombre}</span>
              </div>
              <span className="font-mono text-xs" style={{ color: '#A89880' }}>{item.precio}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center mb-3 pt-2 border-t" style={{ borderColor: '#2A2520' }}>
          <span className="font-body text-xs font-semibold" style={{ color: '#D9CEB5' }}>Total</span>
          <span style={{ fontFamily: '"Fraunces", Georgia, serif', fontSize: 20, color: '#C8903F', fontWeight: 700 }}>$21.890</span>
        </div>
        <button className="w-full font-body text-xs font-semibold py-2.5 rounded-lg" style={{ background: '#C8903F', color: '#080706' }}>
          Cobrar →
        </button>
      </div>
    </div>
  );
}

function Slide2Mesas() {
  const mesas = [
    { id: 1, estado: 'ocupada',   personas: 3, tiempo: '47:23', total: '$27.000' },
    { id: 2, estado: 'libre' },
    { id: 3, estado: 'pagando',   personas: 4, tiempo: '1h 35m', total: '$45.000' },
    { id: 4, estado: 'libre' },
    { id: 5, estado: 'ocupada',   personas: 2, tiempo: '25:47', total: '$13.500' },
    { id: 6, estado: 'reservada' },
  ];
  const C = {
    ocupada:   { bg: 'rgba(200,144,63,0.12)', border: 'rgba(200,144,63,0.4)',  txt: '#E4B878', badge: 'Ocupada' },
    pagando:   { bg: 'rgba(61,170,104,0.12)', border: 'rgba(61,170,104,0.4)', txt: '#3DAA68', badge: 'Pagando' },
    libre:     { bg: 'rgba(20,18,16,0.6)',    border: '#2A2520',               txt: '#4A3F35', badge: 'Libre' },
    reservada: { bg: 'rgba(155,127,232,0.1)', border: 'rgba(155,127,232,0.4)',txt: '#C8B8FF', badge: 'Reservada' },
  };
  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-body font-semibold text-sm" style={{ color: '#F4ECD8' }}>Mesas en tiempo real</h3>
        <span className="font-body text-xs px-2.5 py-0.5 rounded-full" style={{ background: 'rgba(61,170,104,0.12)', color: '#3DAA68', border: '1px solid rgba(61,170,104,0.3)' }}>🟢 En vivo</span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {mesas.map(m => {
          const c = C[m.estado];
          return (
            <div key={m.id} className="p-3.5 rounded-xl" style={{ background: c.bg, border: `1px solid ${c.border}` }}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-body font-semibold text-xs" style={{ color: c.txt }}>Mesa {m.id}</span>
                <span className="font-body rounded px-1.5 py-0.5" style={{ background: 'rgba(0,0,0,0.2)', color: c.txt, fontSize: 9 }}>{c.badge}</span>
              </div>
              {m.estado === 'libre'
                ? <p className="font-body text-xs" style={{ color: c.txt }}>Disponible</p>
                : m.estado === 'reservada'
                  ? <p className="font-body text-xs" style={{ color: c.txt }}>20:00 · 2 pers.</p>
                  : <>
                      <p className="font-mono font-bold text-sm" style={{ color: c.txt }}>{m.total}</p>
                      <p className="font-body text-xs mt-0.5" style={{ color: c.txt, opacity: 0.75 }}>{m.personas}p · {m.tiempo}</p>
                    </>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Slide3Reportes() {
  const dias = [
    { label: 'Lun', pct: 58 }, { label: 'Mar', pct: 43 }, { label: 'Mié', pct: 72 },
    { label: 'Jue', pct: 55 }, { label: 'Vie', pct: 95 }, { label: 'Sáb', pct: 78 }, { label: 'Dom', pct: 40 },
  ];
  const maxH = 140;
  return (
    <div className="p-5">
      <div className="flex flex-wrap gap-4 mb-5">
        {[
          { label: 'Órdenes', valor: '47', color: '#3DAA68' },
          { label: 'Total semana', valor: '$487.000', color: '#C8903F' },
          { label: 'Mejor día', valor: 'Viernes', color: '#E4B878' },
        ].map(k => (
          <div key={k.label} className="flex items-center gap-2.5 px-3 py-2 rounded-lg border" style={{ background: '#0D0B09', borderColor: '#2A2520' }}>
            <p className="font-mono font-bold text-sm" style={{ color: k.color }}>{k.valor}</p>
            <p className="font-body text-xs" style={{ color: '#7A6A58' }}>{k.label}</p>
          </div>
        ))}
      </div>
      <div className="flex items-end gap-2" style={{ height: maxH + 24 }}>
        {dias.map(d => (
          <div key={d.label} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full rounded-t-md overflow-hidden" style={{ height: Math.round(d.pct / 100 * maxH) }}>
              <div className="w-full h-full" style={{
                background: d.pct === 95
                  ? 'linear-gradient(to top, #C8903F, #E4B878)'
                  : 'rgba(200,144,63,0.45)',
              }} />
            </div>
            <span className="font-body text-xs" style={{ color: d.pct === 95 ? '#C8903F' : '#5A4F46', fontWeight: d.pct === 95 ? 700 : 400 }}>{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Slide4Cocina() {
  const comandas = [
    { num: '#012', mesa: 'Mesa 3', tiempo: '2:34', estado: 'verde',  items: ['Latte grande', 'Tinto simple', 'Almojábana ×2'] },
    { num: '#013', mesa: 'Mesa 7', tiempo: '7:12', estado: 'ambar',  items: ['Capuchino doble', 'Medialuna ×2', 'Jugo natural'] },
    { num: '#014', mesa: 'Mesa 1', tiempo: '12:45',estado: 'rojo',   items: ['Bandeja paisa', 'Jugo de lulo', 'Agua con gas'] },
  ];
  const COL = {
    verde: { bg: 'rgba(61,170,104,0.08)',  border: 'rgba(61,170,104,0.4)',  txt: '#3DAA68', pulse: false },
    ambar: { bg: 'rgba(217,164,55,0.08)',  border: 'rgba(217,164,55,0.4)',  txt: '#D9A437', pulse: false },
    rojo:  { bg: 'rgba(200,87,63,0.08)',   border: 'rgba(200,87,63,0.45)', txt: '#C8573F', pulse: true  },
  };
  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-body font-semibold text-sm" style={{ color: '#F4ECD8' }}>Pantalla de cocina</h3>
        <span className="font-body text-xs" style={{ color: '#7A6A58' }}>3 en preparación</span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {comandas.map(c => {
          const col = COL[c.estado];
          return (
            <div key={c.num} className="rounded-xl p-3" style={{ background: col.bg, border: `1px solid ${col.border}` }}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold" style={{ color: col.txt }}>{c.num}</span>
                <span className="font-body text-xs" style={{ color: '#7A6A58' }}>{c.mesa}</span>
              </div>
              <div className="font-mono font-bold text-center py-1.5 rounded-lg mb-2"
                style={{
                  background: `${col.txt}18`, color: col.txt, fontSize: 18,
                  animation: col.pulse ? 'mezoPulseTimer 1.2s ease-in-out infinite' : 'none',
                }}>
                {c.tiempo}
              </div>
              <ul className="space-y-0.5">
                {c.items.map((item, i) => (
                  <li key={i} className="font-body text-xs" style={{ color: '#A89880' }}>· {item}</li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Slide5Empleados() {
  const empleados = [
    { nombre: 'Carolina R.', rol: 'Cajera',  estado: 'turno', initials: 'CR' },
    { nombre: 'Sebastián M.', rol: 'Mesero', estado: 'turno', initials: 'SM' },
    { nombre: 'María V.',     rol: 'Cocina', estado: 'turno', initials: 'MV' },
    { nombre: 'Juan P.',      rol: 'Admin',  estado: 'fuera', initials: 'JP' },
  ];
  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-body font-semibold text-sm" style={{ color: '#F4ECD8' }}>Equipo de hoy</h3>
        <span className="font-body text-xs font-semibold px-2.5 py-1 rounded-full"
          style={{ background: 'rgba(61,170,104,0.12)', color: '#3DAA68', border: '1px solid rgba(61,170,104,0.3)' }}>
          3 en turno
        </span>
      </div>
      <div className="space-y-2.5">
        {empleados.map(e => (
          <div key={e.nombre} className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl border"
            style={{ background: '#0D0B09', borderColor: e.estado === 'turno' ? 'rgba(200,144,63,0.2)' : '#2A2520' }}>
            <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0"
              style={{ background: 'rgba(200,144,63,0.14)', color: '#C8903F', fontFamily: 'monospace' }}>
              {e.initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-body font-semibold text-sm" style={{ color: '#F4ECD8' }}>{e.nombre}</p>
              <p className="font-body text-xs" style={{ color: '#7A6A58' }}>{e.rol}</p>
            </div>
            <span className="font-body text-xs flex items-center gap-1" style={{ color: e.estado === 'turno' ? '#3DAA68' : '#4A3F35' }}>
              <span style={{ fontSize: 8 }}>{e.estado === 'turno' ? '🟢' : '⚫'}</span>
              {e.estado === 'turno' ? 'En turno' : 'Fuera'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Slide6WhatsApp() {
  // Vista del dueño: lista de conversaciones + chat activo
  const conversaciones = [
    { nombre: 'Carlos Rodríguez', hora: '14:23', preview: '2 capuchinos y una...', activo: true,  initials: 'CR' },
    { nombre: 'María González',   hora: '13:45', preview: '¿Hacen domicilios a...',activo: false, initials: 'MG' },
    { nombre: 'Juan Pérez',       hora: '12:30', preview: 'Pedido confirmado',      activo: false, initials: 'JP', listo: true },
  ];
  const mensajes = [
    { de: 'cliente', texto: 'Hola! Quiero pedir 2 capuchinos y una porción de medialunas para llevar 🙏', hora: '14:21' },
    { de: 'bot', texto: '¡Hola Carlos! Tu pedido:\n- 2× Capuchino — $17.000\n- 1× Medialunas — $3.500\nTotal: $20.500 💰\n¿Confirmas el pedido?', hora: '14:21' },
    { de: 'cliente', texto: 'Sí perfecto!', hora: '14:22' },
    { de: 'bot', texto: '✅ Pedido confirmado y enviado a cocina. Listo en ~10 min. ¡Gracias!', hora: '14:23' },
  ];
  return (
    <div className="flex" style={{ minHeight: 320 }}>
      {/* Panel izquierdo — lista de conversaciones estilo WhatsApp Business */}
      <div className="flex flex-col" style={{ width: 190, background: '#0F1A0F', borderRight: '1px solid #1A2E1A', flexShrink: 0 }}>
        <div className="px-3 py-2.5 flex items-center justify-between border-b" style={{ borderColor: '#1A2E1A' }}>
          <span className="font-body font-semibold" style={{ color: '#F4ECD8', fontSize: 10 }}>📱 Pedidos WhatsApp</span>
          <span className="font-mono font-bold rounded-full px-1.5 py-0.5" style={{ background: '#25D366', color: '#fff', fontSize: 9 }}>3</span>
        </div>
        {conversaciones.map((c, i) => (
          <div key={i} className="px-3 py-2.5 border-b cursor-pointer"
            style={{ borderColor: '#1A2E1A', background: c.activo ? 'rgba(37,211,102,0.08)' : 'transparent' }}>
            <div className="flex items-center justify-between mb-0.5">
              <div className="flex items-center gap-1">
                <span style={{ fontSize: 7, color: c.listo ? '#A89880' : '#25D366' }}>{c.listo ? '✅' : '🟢'}</span>
                <span className="font-body font-semibold" style={{ color: c.activo ? '#F4ECD8' : '#A89880', fontSize: 10 }}>{c.nombre}</span>
              </div>
              <span className="font-body" style={{ color: '#5A4F46', fontSize: 9 }}>{c.hora}</span>
            </div>
            <p className="font-body" style={{ color: '#5A4F46', fontSize: 9 }}>{c.preview}</p>
          </div>
        ))}
      </div>

      {/* Panel derecho — conversación activa con Carlos */}
      <div className="flex-1 flex flex-col" style={{ background: '#0A0A0A', minWidth: 0 }}>
        {/* Header del chat */}
        <div className="flex items-center gap-2 px-3 py-2.5 border-b" style={{ borderColor: '#2A2520', background: '#141210' }}>
          <div className="w-7 h-7 rounded-full flex items-center justify-center font-bold flex-shrink-0"
            style={{ background: 'rgba(37,211,102,0.15)', color: '#25D366', fontSize: 10 }}>CR</div>
          <div className="flex-1 min-w-0">
            <p className="font-body font-semibold" style={{ color: '#F4ECD8', fontSize: 11 }}>Carlos Rodríguez</p>
            <p className="font-body" style={{ color: '#25D366', fontSize: 9 }}>● En línea</p>
          </div>
          {/* Botón "Convertir en orden" — acción clave para el dueño */}
          <button className="font-body font-semibold rounded-lg transition flex-shrink-0"
            style={{ background: 'rgba(200,144,63,0.15)', color: '#C8903F', border: '1px solid rgba(200,144,63,0.4)', fontSize: 9, padding: '4px 8px' }}>
            → Convertir en orden
          </button>
        </div>

        {/* Mensajes del chat */}
        <div className="flex-1 p-3 space-y-2 overflow-hidden">
          {mensajes.map((m, i) => (
            <div key={i} className={`flex ${m.de === 'bot' ? 'justify-start' : 'justify-end'}`}>
              <div className="max-w-[80%] px-2.5 py-1.5 font-body"
                style={m.de === 'bot'
                  ? { background: '#1A1713', color: '#D9CEB5', borderRadius: '12px 12px 12px 3px', border: '1px solid rgba(200,144,63,0.18)', fontSize: 10, lineHeight: 1.5 }
                  : { background: 'rgba(37,211,102,0.1)', color: '#D9CEB5', borderRadius: '12px 12px 3px 12px', border: '1px solid rgba(37,211,102,0.18)', fontSize: 10, lineHeight: 1.5 }}>
                {m.de === 'bot' && <p className="font-semibold mb-0.5" style={{ color: '#C8903F', fontSize: 8 }}>Bot mezo ✨</p>}
                <span style={{ whiteSpace: 'pre-line' }}>{m.texto}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer con caption y badge */}
        <div className="px-3 pb-2 pt-1 flex items-center justify-between border-t" style={{ borderColor: '#1A1713' }}>
          <span className="font-body italic" style={{ color: '#4A3F46', fontSize: 9 }}>Tu bot toma pedidos mientras tú cocinas</span>
          <span className="font-body font-semibold rounded-full"
            style={{ background: 'rgba(155,127,232,0.15)', color: '#C8B8FF', border: '1px solid rgba(155,127,232,0.3)', fontSize: 8, padding: '3px 8px' }}>
            ✨ Próximamente · Plan Élite
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Slider de mockups ────────────────────────────────────────────────────────
const SLIDES_CONFIG = [
  { componente: <Slide1POS />,       label: 'POS / Caja', emoji: '🧾' },
  { componente: <Slide2Mesas />,     label: 'Mesas',      emoji: '🪑' },
  { componente: <Slide3Reportes />,  label: 'Reportes',   emoji: '📊' },
  { componente: <Slide4Cocina />,    label: 'Cocina',     emoji: '👨‍🍳' },
  { componente: <Slide5Empleados />, label: 'Empleados',  emoji: '👥' },
  { componente: <Slide6WhatsApp />,  label: 'WhatsApp',   emoji: '💬' },
];

function SliderMockups() {
  const [slide, setSlide]   = useState(0);
  const [opacity, setOpacity] = useState(1);
  const [paused, setPaused] = useState(false);
  const TOTAL = SLIDES_CONFIG.length;

  const goTo = useCallback((n) => {
    const target = ((n % TOTAL) + TOTAL) % TOTAL;
    setOpacity(0);
    setTimeout(() => { setSlide(target); setOpacity(1); }, 260);
  }, [TOTAL]);

  // Auto-avance: se reinicia con cada cambio de slide
  useEffect(() => {
    if (paused) return;
    const t = setTimeout(() => goTo(slide + 1), 4000);
    return () => clearTimeout(t);
  }, [slide, paused, goTo]);

  return (
    <section id="mockup" className="py-24 px-4" style={{ background: 'linear-gradient(180deg, #080706 0%, #0D0B09 100%)' }}>
      <div className="max-w-5xl mx-auto">
        <Fade>
          <p className="text-center font-body text-xs uppercase tracking-widest mb-2" style={{ color: '#7A6A58' }}>Interfaz del sistema</p>
          <h2 className="text-center mb-2"
            style={{ fontFamily: '"Fraunces", Georgia, serif', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: '#F4ECD8', fontWeight: 700, lineHeight: 1.1 }}>
            Así se ve mezo en tu negocio
          </h2>
          <p className="text-center font-body mb-10" style={{ color: '#7A6A58', fontSize: 15 }}>
            Cada pantalla diseñada para que tu equipo la aprenda en minutos
          </p>
        </Fade>

        {/* Tabs de navegación */}
        <div className="flex justify-center flex-wrap gap-2 mb-5">
          {SLIDES_CONFIG.map((s, i) => (
            <button key={i} onClick={() => goTo(i)}
              className="font-body text-xs font-medium px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5"
              style={i === slide
                ? { background: 'rgba(200,144,63,0.2)', color: '#E4B878', border: '1px solid rgba(200,144,63,0.4)' }
                : { background: '#141210', color: '#7A6A58', border: '1px solid #2A2520' }}>
              <span style={{ fontSize: 12 }}>{s.emoji}</span>
              {s.label}
            </button>
          ))}
        </div>

        {/* Ventana del mockup */}
        <div
          className="rounded-2xl overflow-hidden border"
          style={{ background: '#141210', borderColor: '#2A2520', boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(200,144,63,0.08)' }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Barra superior */}
          <div className="flex items-center justify-between px-5 py-3 border-b" style={{ background: '#0D0B09', borderColor: '#2A2520' }}>
            <div className="flex items-center gap-3">
              <span style={{ fontFamily: '"Fraunces", Georgia, serif', fontStyle: 'italic', fontSize: 18, color: '#C8903F', fontWeight: 700 }}>mezo</span>
              <span className="font-body text-xs px-3 py-1 rounded-full" style={{ background: '#1A1713', color: '#7A6A58', border: '1px solid #2A2520' }}>
                {SLIDES_CONFIG[slide].emoji} {SLIDES_CONFIG[slide].label}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {/* Dots de posición */}
              <div className="flex items-center gap-1.5">
                {SLIDES_CONFIG.map((_, i) => (
                  <button key={i} onClick={() => goTo(i)} className="rounded-full transition"
                    style={{ width: 6, height: 6, background: i === slide ? '#C8903F' : '#2A2520', flexShrink: 0 }} />
                ))}
              </div>
              {/* Flechas */}
              <div className="flex items-center gap-1">
                {[{ icon: <ChevronLeft size={13} />, dir: -1 }, { icon: <ChevronRight size={13} />, dir: 1 }].map(({ icon, dir }) => (
                  <button key={dir} onClick={() => goTo(slide + dir)}
                    className="w-6 h-6 rounded flex items-center justify-center transition"
                    style={{ background: '#1A1713', color: '#7A6A58', border: '1px solid #2A2520' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#C8903F'; e.currentTarget.style.borderColor = 'rgba(200,144,63,0.4)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#7A6A58'; e.currentTarget.style.borderColor = '#2A2520'; }}>
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Contenido con fade */}
          <div style={{ transition: 'opacity 0.26s ease', opacity }}>
            {SLIDES_CONFIG[slide].componente}
          </div>
        </div>

        <p className="text-center font-body text-sm mt-4" style={{ color: '#5A4F46' }}>
          Pasa el cursor para pausar · Usa las flechas o los tabs para navegar
        </p>
      </div>
    </section>
  );
}

// ─── Partículas del hero — posiciones fijas para evitar re-renders ───────────
const HERO_PARTICLES = [
  { left: '12%', top: '22%', size: 3, dur: 3.2, delay: 0    },
  { left: '28%', top: '15%', size: 4, dur: 2.8, delay: 0.8  },
  { left: '45%', top: '30%', size: 3, dur: 3.8, delay: 1.5  },
  { left: '63%', top: '18%', size: 4, dur: 2.5, delay: 0.3  },
  { left: '78%', top: '25%', size: 3, dur: 3.5, delay: 1.1  },
  { left: '18%', top: '65%', size: 4, dur: 2.9, delay: 0.6  },
  { left: '55%', top: '72%', size: 3, dur: 3.3, delay: 1.8  },
  { left: '82%', top: '60%', size: 4, dur: 2.6, delay: 0.4  },
  { left: '35%', top: '80%', size: 3, dur: 3.7, delay: 1.2  },
  { left: '90%', top: '40%', size: 3, dur: 3.0, delay: 0.9  },
];

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar({ scrolled }) {
  const { text: ctaText, visible: ctaVisible } = useTextRotator(CTA_TEXTS, 3000);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 transition-all duration-300"
      style={{
        background:     scrolled ? 'rgba(8,7,6,0.88)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)'        : 'none',
        borderBottom:   scrolled ? '1px solid rgba(42,37,32,0.8)' : 'none',
      }}>

      {/* Logo — anclado a la izquierda */}
      <div className="absolute left-6 md:left-12 top-1/2 -translate-y-1/2">
        <span style={{ fontFamily: '"Fraunces", Georgia, serif', fontStyle: 'italic', fontSize: 26, color: '#C8903F', fontWeight: 700 }}>
          mezo
        </span>
      </div>

      {/* Links — centro real con absolute */}
      <div className="absolute inset-0 hidden md:flex items-center justify-center pointer-events-none">
        <div className="flex items-center gap-8 pointer-events-auto">
          {[['#mockup','Producto'],['#beneficios','Beneficios'],['#precios','Precios'],['#faqs','FAQ']].map(([href, label]) => (
            <a key={label} href={href} className="text-sm font-body transition" style={{ color: '#D9CEB5' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#C8903F'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#D9CEB5'; }}>
              {label}
            </a>
          ))}
        </div>
      </div>

      {/* Botones — anclados a la derecha */}
      <div className="absolute right-6 md:right-12 top-1/2 -translate-y-1/2 flex items-center gap-3">
        <Link to="/login"
          className="text-sm font-body font-medium px-4 py-2 rounded-lg border transition hidden sm:block"
          style={{ color: '#E4B878', borderColor: 'rgba(200,144,63,0.4)', background: 'transparent' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(200,144,63,0.1)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
          Iniciar sesión
        </Link>
        <Link to="/register"
          className="text-sm font-body font-semibold px-5 py-2 rounded-lg transition"
          style={{ background: '#C8903F', color: '#080706', minWidth: 148, textAlign: 'center', display: 'block' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#A87528'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#C8903F'; }}>
          <span style={{ display: 'inline-block', opacity: ctaVisible ? 1 : 0, transition: 'opacity 0.3s ease', pointerEvents: 'none' }}>
            {ctaText}
          </span>
        </Link>
      </div>
    </nav>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 60); return () => clearTimeout(t); }, []);

  // Animación estándar — deslizamiento desde abajo
  const anim = (delay) => ({
    opacity:    mounted ? 1 : 0,
    transform:  mounted ? 'translateY(0)' : 'translateY(30px)',
    transition: `opacity 0.8s ease ${delay}ms, transform 0.8s ease ${delay}ms`,
  });

  // Animación con blur — para el wordmark
  const animBlur = {
    opacity:    mounted ? 1 : 0,
    filter:     mounted ? 'blur(0)' : 'blur(8px)',
    transform:  mounted ? 'translateY(0)' : 'translateY(20px)',
    transition: 'opacity 1s ease-out, filter 1s ease-out, transform 1s ease-out',
  };

  // Palabras del título con stagger escalonado de 50ms
  const palabras1 = ['Cobra', 'más', 'rápido.'];
  const palabras2 = ['Vende', 'más', 'inteligente.'];

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 pt-20 pb-24 overflow-hidden">
      <div className="absolute inset-0">
        <img src="https://images.unsplash.com/photo-1559305616-3f99cd43e353?w=1600"
          alt="" loading="eager" decoding="async"
          className="w-full h-full object-cover" style={{ opacity: 0.28 }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(8,7,6,0.6) 0%, rgba(8,7,6,0.82) 55%, #080706 100%)' }} />
      </div>

      {/* Glow central */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, rgba(200,144,63,0.14) 0%, transparent 70%)' }} />

      {/* Partículas de luz doradas */}
      {HERO_PARTICLES.map((p, i) => (
        <div key={i} className="absolute pointer-events-none rounded-full"
          style={{
            left: p.left, top: p.top,
            width: p.size, height: p.size,
            background: '#C8903F',
            animation: `particleFloat ${p.dur}s ease-in-out ${p.delay}s infinite`,
          }} />
      ))}

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Wordmark con blur de entrada */}
        <div style={{ ...animBlur, marginBottom: 18 }}>
          <span style={{ fontFamily: '"Fraunces", Georgia, serif', fontStyle: 'italic', fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', color: '#C8903F', fontWeight: 700, opacity: 0.9 }}>
            mezo
          </span>
        </div>

        <div style={anim(200)}>
          <span className="inline-flex items-center gap-2 text-xs font-body font-semibold px-4 py-1.5 rounded-full mb-6"
            style={{ background: 'rgba(200,144,63,0.12)', color: '#E4B878', border: '1px solid rgba(200,144,63,0.3)' }}>
            🇨🇴 El POS hecho para Colombia
          </span>
        </div>

        {/* Título con stagger por palabra */}
        <h1 style={{ fontFamily: '"Fraunces", Georgia, serif', fontSize: 'clamp(2.4rem, 6vw, 5rem)', color: '#F4ECD8', lineHeight: 1.05, fontWeight: 700, letterSpacing: '-0.02em', fontVariationSettings: '"SOFT" 50, "opsz" 72' }}>
          {palabras1.map((w, i) => (
            <span key={i} style={{
              display: 'inline-block',
              opacity:    mounted ? 1 : 0,
              transform:  mounted ? 'translateY(0)' : 'translateY(40px)',
              transition: `opacity 0.7s ease ${360 + i * 50}ms, transform 0.7s ease ${360 + i * 50}ms`,
              marginRight: '0.25em',
            }}>{w}</span>
          ))}<br />
          <span style={{ fontStyle: 'italic', color: '#C8903F' }}>
            {palabras2.map((w, i) => (
              <span key={i} style={{
                display: 'inline-block',
                opacity:    mounted ? 1 : 0,
                transform:  mounted ? 'translateY(0)' : 'translateY(40px)',
                transition: `opacity 0.7s ease ${360 + (palabras1.length + i) * 50}ms, transform 0.7s ease ${360 + (palabras1.length + i) * 50}ms`,
                marginRight: i < palabras2.length - 1 ? '0.25em' : 0,
              }}>{w}</span>
            ))}
          </span>
        </h1>

        <p className="font-body mt-6 mb-8 mx-auto" style={{ ...anim(600), color: '#A89880', fontSize: 'clamp(1rem, 2vw, 1.15rem)', maxWidth: 560, lineHeight: 1.7 }}>
          El sistema de punto de venta que entiende cómo funciona tu negocio. Mesas en tiempo real, todos los métodos de pago colombianos y reportes con inteligencia artificial.
        </p>

        <div style={anim(750)}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link to="/register"
              className="font-body font-semibold px-8 py-4 rounded-xl text-base transition w-full sm:w-auto"
              style={{ background: '#C8903F', color: '#080706', boxShadow: '0 0 36px rgba(200,144,63,0.35)' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#A87528'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#C8903F'; }}>
              Empieza gratis — 30 días →
            </Link>
            <a href="#mockup"
              className="font-body font-medium px-6 py-4 rounded-xl text-base border transition w-full sm:w-auto text-center"
              style={{ borderColor: 'rgba(200,144,63,0.4)', color: '#E4B878' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(200,144,63,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
              Ver cómo funciona ↓
            </a>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6">
            {['Cancela cuando quieras', 'Configuración en 5 minutos', 'Soporte en español'].map(t => (
              <span key={t} className="flex items-center gap-2 font-body text-sm" style={{ color: '#7A6A58' }}>
                <span style={{ color: '#3DAA68', fontWeight: 700 }}>✓</span> {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Stats con contadores animados ────────────────────────────────────────────
function StatCard({ value, display, label }) {
  const [ref, count] = useCountUp(value, 1800);
  return (
    <div ref={ref} className="text-center">
      <p style={{ fontFamily: '"Fraunces", Georgia, serif', fontSize: 'clamp(2rem, 4vw, 2.8rem)', color: '#C8903F', fontWeight: 700, lineHeight: 1 }}>
        {display(count)}
      </p>
      <p className="font-body text-sm mt-2" style={{ color: '#7A6A58', lineHeight: 1.5 }}>{label}</p>
    </div>
  );
}

function StatsSection() {
  return (
    <section className="py-16 px-4 border-t border-b" style={{ background: '#0A0907', borderColor: 'rgba(200,144,63,0.08)' }}>
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
          {STATS.map((s, i) => (
            <Fade key={i} delay={i * 130}>
              <StatCard value={s.value} display={s.display} label={s.label} />
            </Fade>
          ))}
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
          <p className="text-center font-body text-xs uppercase tracking-widest mb-2" style={{ color: '#7A6A58' }}>Para todo tipo de negocio</p>
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
            <Fade key={t.label} delay={i * 60}>
              <div className="relative h-44 rounded-2xl overflow-hidden border cursor-default group" style={{ borderColor: '#2A2520' }}>
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

// ─── Sub-mockups para Beneficios ──────────────────────────────────────────────
function MockupMesas() {
  const mesas = [
    { id: 1, estado: 'ocupada', tiempo: '43 min', total: '$27.000', personas: 3 },
    { id: 2, estado: 'libre' },
    { id: 3, estado: 'pagando', tiempo: '1h 32m', total: '$45.000', personas: 4 },
    { id: 4, estado: 'libre' },
    { id: 5, estado: 'ocupada', tiempo: '22 min', total: '$13.500', personas: 2 },
    { id: 6, estado: 'libre' },
  ];
  const colores = {
    ocupada: { bg: 'rgba(200,144,63,0.12)', border: 'rgba(200,144,63,0.35)', text: '#E4B878' },
    pagando: { bg: 'rgba(61,170,104,0.12)', border: 'rgba(61,170,104,0.35)', text: '#3DAA68' },
    libre:   { bg: 'rgba(20,18,16,0.6)',    border: '#2A2520',               text: '#4A3F35' },
  };
  return (
    <div className="p-4 rounded-2xl border" style={{ background: '#141210', borderColor: '#2A2520' }}>
      <div className="flex items-center justify-between mb-3">
        <span className="font-body text-xs font-semibold uppercase tracking-widest" style={{ color: '#7A6A58' }}>Mesas hoy</span>
        <span className="font-body text-xs px-2.5 py-0.5 rounded-full" style={{ background: 'rgba(61,170,104,0.12)', color: '#3DAA68', border: '1px solid rgba(61,170,104,0.3)' }}>🟢 En vivo</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {mesas.map(m => {
          const c = colores[m.estado];
          return (
            <div key={m.id} className="p-3 rounded-xl" style={{ background: c.bg, border: `1px solid ${c.border}` }}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-body text-xs font-semibold" style={{ color: c.text }}>Mesa {m.id}</span>
                {m.tiempo && <span className="font-body" style={{ color: '#7A6A58', fontSize: 10 }}>{m.tiempo}</span>}
              </div>
              {m.estado === 'libre'
                ? <span className="font-body text-xs" style={{ color: '#4A3F35' }}>Libre</span>
                : <>
                    <p className="font-mono font-bold text-sm" style={{ color: c.text }}>{m.total}</p>
                    <p className="font-body" style={{ color: '#7A6A58', fontSize: 10 }}>{m.personas} personas</p>
                  </>}
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
    { id: 'efectivo', label: '💵', nombre: 'Efectivo' },
    { id: 'datafono', label: '💳', nombre: 'Datáfono' },
    { id: 'nequi',    label: '📱', nombre: 'Nequi' },
    { id: 'daviplata',label: '📲', nombre: 'Daviplata' },
    { id: 'transfer', label: '🏦', nombre: 'Transferencia' },
  ];
  return (
    <div className="p-4 rounded-2xl border" style={{ background: '#141210', borderColor: '#2A2520' }}>
      <p className="font-body text-xs uppercase tracking-widest mb-1" style={{ color: '#7A6A58' }}>Método de pago</p>
      <div className="mb-4" style={{ fontFamily: '"Fraunces", Georgia, serif', fontSize: 32, color: '#C8903F', fontWeight: 700 }}>$21.492</div>
      <div className="grid grid-cols-5 gap-1.5 mb-4">
        {metodos.map(m => (
          <button key={m.id} onClick={() => setMetodo(m.id)}
            className="flex flex-col items-center gap-1 p-2 rounded-xl transition"
            style={metodo === m.id
              ? { background: 'rgba(200,144,63,0.15)', border: '1px solid rgba(200,144,63,0.4)' }
              : { background: '#0D0B09', border: '1px solid #2A2520' }}>
            <span style={{ fontSize: 16 }}>{m.label}</span>
            <span className="font-body" style={{ fontSize: 9, color: metodo === m.id ? '#E4B878' : '#7A6A58' }}>{m.nombre}</span>
          </button>
        ))}
      </div>
      <button className="w-full font-body font-semibold py-3 rounded-xl text-sm" style={{ background: '#C8903F', color: '#080706' }}>
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
    <div className="p-4 rounded-2xl border" style={{ background: '#141210', borderColor: '#2A2520' }}>
      <p className="font-body text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#7A6A58' }}>Arqueo — Miércoles 23</p>
      <div className="space-y-2 mb-4">
        {filas.map(f => (
          <div key={f.label} className="flex items-center justify-between p-2.5 rounded-xl border" style={{ background: '#0D0B09', borderColor: '#2A2520' }}>
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
                  Efectivo con cambio automático. Datáfono. Nequi. Daviplata. Transferencia bancaria. Todo registrado, todo reportado.
                </p>
                <div className="flex flex-wrap gap-2">
                  {['💵 Efectivo','💳 Datáfono','📱 Nequi','📲 Daviplata','🏦 Transferencia'].map(m => (
                    <span key={m} className="font-body text-xs px-3 py-1.5 rounded-full"
                      style={{ background: '#141210', color: '#A89880', border: '1px solid #2A2520' }}>{m}</span>
                  ))}
                </div>
              </div>
            </div>
          </Fade>
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
    { emoji: '🧠', titulo: 'Análisis de ventas',         desc: 'Cada semana mezo analiza tus datos y te dice qué está funcionando y qué no. Sin jerga, en español colombiano.',                        plan: 'Pro',   planColor: '#C8903F' },
    { emoji: '📈', titulo: 'Estrategias personalizadas', desc: '"Tus ventas bajan los martes entre 3 y 5pm. Aquí hay 3 estrategias para ese horario." Basadas en tus datos reales.',                   plan: 'Pro',   planColor: '#C8903F' },
    { emoji: '🎯', titulo: 'Predicción de demanda',      desc: 'Sabe cuántos capuchinos preparar el viernes antes de que abras. Reduce el desperdicio y nunca te quedas sin stock.',                  plan: 'Élite', planColor: '#9B7FE8' },
    { emoji: '💬', titulo: 'Chatbot de WhatsApp',        desc: 'Tus clientes piden por WhatsApp, la IA toma la orden, cobra y avisa a cocina sola. Tú solo sirves.',                                  plan: 'Élite', planColor: '#9B7FE8' },
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
              Tu negocio con<br /><span style={{ fontStyle: 'italic', color: '#C8903F' }}>superpoderes</span>
            </h2>
            <p className="font-body mt-4 mx-auto" style={{ color: '#7A6A58', maxWidth: 500, lineHeight: 1.7 }}>
              mezo no solo registra tus ventas — las entiende y te dice exactamente qué hacer.
            </p>
          </div>
        </Fade>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-14">
          {cards.map((card, i) => (
            <Fade key={i} delay={i * 90}>
              <div className="p-6 rounded-2xl border relative overflow-hidden transition"
                style={{ background: 'linear-gradient(135deg, rgba(20,18,16,0.9) 0%, rgba(28,23,18,0.9) 100%)', borderColor: 'rgba(200,144,63,0.18)', animation: `iaGlow 3s ease-in-out ${i * 0.75}s infinite` }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(200,144,63,0.4)'; e.currentTarget.style.animation = 'none'; e.currentTarget.style.boxShadow = '0 0 30px rgba(200,144,63,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(200,144,63,0.18)'; e.currentTarget.style.animation = `iaGlow 3s ease-in-out ${i * 0.75}s infinite`; e.currentTarget.style.boxShadow = 'none'; }}>
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
        <Fade>
          <div className="max-w-xl mx-auto p-6 rounded-2xl border text-center"
            style={{ background: 'rgba(20,18,16,0.6)', borderColor: 'rgba(200,144,63,0.18)' }}>
            <div className="w-11 h-11 rounded-full mx-auto mb-4 flex items-center justify-center font-bold text-sm"
              style={{ background: 'linear-gradient(135deg, #C8903F, #E4B878)', color: '#080706' }}>CR</div>
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
              <div className="p-5 rounded-2xl border"
                style={{ background: '#141210', borderColor: '#2A2520', transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)' }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(200,144,63,0.4)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  const ico = e.currentTarget.querySelector('.feat-ico');
                  if (ico) ico.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = '#2A2520';
                  e.currentTarget.style.transform = 'translateY(0)';
                  const ico = e.currentTarget.querySelector('.feat-ico');
                  if (ico) ico.style.transform = 'scale(1)';
                }}>
                <div className="feat-ico text-2xl mb-3" style={{ display: 'inline-block', transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1)' }}>{f.emoji}</div>
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

// ─── Modal contacto plan Élite ────────────────────────────────────────────────
const CIUDADES_MODAL = [
  'Bogotá D.C.', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena',
  'Cúcuta', 'Bucaramanga', 'Pereira', 'Santa Marta', 'Ibagué',
  'Manizales', 'Villavicencio', 'Pasto', 'Montería', 'Valledupar',
  'Armenia', 'Neiva', 'Popayán', 'Sincelejo', 'Tunja',
  'Florencia', 'Chía', 'Zipaquirá', 'Otra ciudad',
];

const TIPOS_NEGOCIO_MODAL = [
  'Cafetería', 'Restaurante', 'Panadería / Pastelería', 'Bar / Taberna',
  'Comida rápida', 'Heladería', 'Frutería / Jugos', 'Pizzería',
  'Cevichería / Mariscos', 'Comida saludable', 'Cocina de mercado', 'Otro',
];

function ModalContactoElite({ open, onClose }) {
  const [form, setForm] = useState({
    nombre: '', negocio: '', whatsapp: '', correo: '',
    ciudad: '', tipo: '', sedes: '', mensaje: '',
  });
  const [toast, setToast] = useState(false);

  if (!open) return null;

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  function handleSubmit(e) {
    e.preventDefault();
    // Guardar en localStorage para seguimiento comercial
    const leads = JSON.parse(localStorage.getItem('mezo_elite_leads') || '[]');
    leads.push({ ...form, fecha: new Date().toISOString() });
    localStorage.setItem('mezo_elite_leads', JSON.stringify(leads));
    // TODO producción: POST a /api/contacto con Resend → ventas@mezo.co
    setToast(true);
    setTimeout(() => { setToast(false); onClose(); }, 2800);
  }

  const inputSt = {
    width: '100%', padding: '10px 14px', borderRadius: 10,
    background: '#0D0B09', border: '1px solid #2A2520',
    color: '#F4ECD8', fontSize: 13, fontFamily: '"DM Sans", system-ui, sans-serif',
    outline: 'none',
  };
  const labelSt = {
    display: 'block', fontSize: 11, fontWeight: 600, color: '#7A6A58',
    fontFamily: '"DM Sans", system-ui, sans-serif', marginBottom: 5,
    textTransform: 'uppercase', letterSpacing: '0.05em',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>

      {/* Toast de confirmación */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl font-body font-semibold text-sm"
          style={{ background: '#3DAA68', color: '#fff', boxShadow: '0 4px 20px rgba(61,170,104,0.4)', pointerEvents: 'none' }}>
          ✅ Recibido. Te contactamos pronto.
        </div>
      )}

      <div className="w-full max-w-lg rounded-2xl border overflow-y-auto"
        style={{ background: '#141210', borderColor: 'rgba(200,144,63,0.3)', maxHeight: '90vh', boxShadow: '0 0 60px rgba(200,144,63,0.15)' }}>

        {/* Encabezado */}
        <div className="flex items-start justify-between px-7 pt-7 pb-5 border-b" style={{ borderColor: '#2A2520' }}>
          <div>
            <h2 style={{ fontFamily: '"Fraunces", Georgia, serif', fontSize: 22, color: '#F4ECD8', fontWeight: 700, lineHeight: 1.2, marginBottom: 6 }}>
              Cuéntanos sobre tu negocio
            </h2>
            <p className="font-body text-sm" style={{ color: '#7A6A58', lineHeight: 1.6, maxWidth: 360 }}>
              Un asesor de mezo te contactará en menos de 24 horas para diseñar el plan perfecto para tu operación.
            </p>
          </div>
          <button onClick={onClose} className="ml-4 mt-1 flex-shrink-0 font-body"
            style={{ color: '#4A3F35', fontSize: 18, lineHeight: 1 }}>✕</button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="px-7 py-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label style={labelSt}>Nombre completo *</label>
              <input required value={form.nombre} onChange={set('nombre')} style={inputSt} placeholder="Tu nombre" />
            </div>
            <div>
              <label style={labelSt}>Nombre del negocio *</label>
              <input required value={form.negocio} onChange={set('negocio')} style={inputSt} placeholder="Café Las Margaritas" />
            </div>
            <div>
              <label style={labelSt}>WhatsApp *</label>
              <input required value={form.whatsapp} onChange={set('whatsapp')} type="tel" style={inputSt} placeholder="+57 300 000 0000" />
            </div>
            <div>
              <label style={labelSt}>Correo electrónico *</label>
              <input required value={form.correo} onChange={set('correo')} type="email" style={inputSt} placeholder="hola@tucafe.com" />
            </div>
            <div>
              <label style={labelSt}>Ciudad</label>
              <select value={form.ciudad} onChange={set('ciudad')} style={{ ...inputSt, cursor: 'pointer' }}>
                <option value="">Selecciona tu ciudad</option>
                {CIUDADES_MODAL.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={labelSt}>Tipo de negocio</label>
              <select value={form.tipo} onChange={set('tipo')} style={{ ...inputSt, cursor: 'pointer' }}>
                <option value="">¿Qué tipo de negocio?</option>
                {TIPOS_NEGOCIO_MODAL.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label style={labelSt}>Número de sedes</label>
            <select value={form.sedes} onChange={set('sedes')} style={{ ...inputSt, cursor: 'pointer' }}>
              <option value="">¿Cuántas sedes tienes?</option>
              <option value="1">1 sede</option>
              <option value="2-5">2 a 5 sedes</option>
              <option value="6-10">6 a 10 sedes</option>
              <option value="+10">Más de 10 sedes</option>
            </select>
          </div>

          <div>
            <label style={labelSt}>Mensaje o preguntas (opcional)</label>
            <textarea value={form.mensaje} onChange={set('mensaje')} rows={3}
              style={{ ...inputSt, resize: 'vertical' }}
              placeholder="Cuéntanos qué necesitas, cuántos empleados tienen, qué problemas quieren resolver..." />
          </div>

          <button type="submit"
            className="w-full font-body font-semibold py-3.5 rounded-xl text-sm transition"
            style={{ background: '#C8903F', color: '#080706', boxShadow: '0 0 20px rgba(200,144,63,0.3)' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#A87528'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#C8903F'; }}>
            Enviar — Te contactamos hoy →
          </button>

          {/* Badges de confianza */}
          <div className="flex flex-wrap justify-center gap-4 pt-1">
            {[
              { icon: '🔒', text: 'Tus datos están protegidos' },
              { icon: '⚡', text: 'Respuesta en menos de 24h' },
              { icon: '🇨🇴', text: 'Equipo colombiano' },
            ].map(b => (
              <span key={b.text} className="font-body text-xs flex items-center gap-1" style={{ color: '#5A4F46' }}>
                {b.icon} {b.text}
              </span>
            ))}
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Precios ──────────────────────────────────────────────────────────────────
function Precios() {
  const [anual, setAnual] = useState(false);
  const [modalElite, setModalElite] = useState(false);
  return (
    <section id="precios" className="py-24 px-4" style={{ background: '#0A0907' }}>
      <div className="max-w-5xl mx-auto">
        <Fade>
          <p className="text-center font-body text-xs uppercase tracking-widest mb-2" style={{ color: '#7A6A58' }}>Precios</p>
          <h2 className="text-center mb-6"
            style={{ fontFamily: '"Fraunces", Georgia, serif', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: '#F4ECD8', fontWeight: 700, lineHeight: 1.1 }}>
            Planes <span style={{ fontStyle: 'italic', color: '#C8903F' }}>simples y honestos</span>
          </h2>
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {Object.entries(PLANES).map(([key, plan], i) => {
            // CTA diferenciado: Élite abre modal, Pro y Semilla van a /register
            const ctaEl = key === 'elite' ? (
              <button onClick={() => setModalElite(true)}
                className="block w-full text-center font-body font-semibold py-3 rounded-xl text-sm transition relative z-10"
                style={{ border: '1px solid rgba(200,144,63,0.4)', color: '#E4B878', background: 'transparent' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(200,144,63,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                {plan.cta}
              </button>
            ) : (
              <Link to="/register"
                className="block text-center font-body font-semibold py-3 rounded-xl text-sm transition relative z-10"
                style={plan.ctaStyle === 'gold'
                  ? { background: '#C8903F', color: '#080706' }
                  : { border: '1px solid rgba(200,144,63,0.4)', color: '#E4B878', background: 'transparent' }}
                onMouseEnter={e => { e.currentTarget.style.background = plan.ctaStyle === 'gold' ? '#A87528' : 'rgba(200,144,63,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = plan.ctaStyle === 'gold' ? '#C8903F' : 'transparent'; }}>
                {plan.cta}
              </Link>
            );

            // Contenido compartido de las 3 cards
            const cardInner = (
              <>
                <p className="font-body font-semibold mb-1" style={{ color: '#7A6A58', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                  {plan.nombre}
                </p>
                <div className="mb-0.5" style={{ fontFamily: '"Fraunces", Georgia, serif', fontSize: 36, color: '#F4ECD8', fontWeight: 700, lineHeight: 1, transition: 'all 0.3s ease' }}>
                  {formatCOP(anual ? plan.precio.anual : plan.precio.mensual)}
                </div>
                <p className="font-body text-xs mb-1" style={{ color: '#7A6A58' }}>
                  /mes{anual ? ' · facturado anualmente' : ''}
                </p>
                <p className="font-body text-xs mb-6" style={{ color: '#3DAA68' }}>30 días gratis incluidos</p>
                <ul className="space-y-3 flex-1 mb-8">
                  {plan.items.map((it, j) => (
                    <li key={j} className="flex items-start gap-2.5 font-body text-sm" style={{ color: it.ok ? '#D9CEB5' : '#4A3F35' }}>
                      {it.ok
                        ? <Check size={14} style={{ color: '#3DAA68', flexShrink: 0, marginTop: 2 }} />
                        : <X     size={14} style={{ color: '#4A3F35', flexShrink: 0, marginTop: 2 }} />}
                      {it.text}
                    </li>
                  ))}
                </ul>
                {ctaEl}
              </>
            );

            if (key === 'pro') {
              return (
                <Fade key={key} delay={i * 100}>
                  {/* Card Pro — badge encima + pulso de luz suave */}
                  <div style={{ position: 'relative', paddingTop: 20 }}>
                    {/* Badge sobresaliente */}
                    <span style={{
                      position: 'absolute', top: 0, left: '50%',
                      transform: 'translateX(-50%) translateY(-50%)',
                      background: 'linear-gradient(135deg, #C8903F 0%, #E4B878 100%)',
                      color: '#080706', fontWeight: 700, fontSize: '0.78rem',
                      padding: '6px 20px', borderRadius: 100, whiteSpace: 'nowrap',
                      fontFamily: '"DM Sans", system-ui, sans-serif', zIndex: 2,
                      boxShadow: '0 2px 14px rgba(200,144,63,0.4)',
                    }}>
                      {plan.badge}
                    </span>
                    {/* Card con pulso de luz — respiración suave en todo el contorno */}
                    <div style={{
                      position: 'relative', borderRadius: 18,
                      background: 'linear-gradient(180deg, rgba(200,144,63,0.08) 0%, #141210 100%)',
                      animation: 'cardPulse 2.5s ease-in-out infinite',
                    }}>
                      <div className="relative flex flex-col p-7">
                        {cardInner}
                      </div>
                    </div>
                  </div>
                </Fade>
              );
            }

            return (
              <Fade key={key} delay={i * 100}>
                <div className="relative flex flex-col p-7 rounded-2xl border h-full"
                  style={{ background: '#141210', borderColor: '#2A2520' }}>
                  {cardInner}
                </div>
              </Fade>
            );
          })}
        </div>

        <p className="text-center font-body text-sm mt-8" style={{ color: '#7A6A58' }}>
          30 días gratis en todos los planes
        </p>
      </div>
      <ModalContactoElite open={modalElite} onClose={() => setModalElite(false)} />
    </section>
  );
}

// ─── FAQs ────────────────────────────────────────────────────────────────────
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
              <div className="rounded-2xl border overflow-hidden transition-colors"
                style={{ borderColor: abierto === i ? 'rgba(200,144,63,0.3)' : '#2A2520', background: '#141210' }}>
                <button className="w-full flex items-center justify-between px-5 py-4 text-left"
                  onClick={() => setAbierto(abierto === i ? null : i)}>
                  <span className="font-body font-semibold text-sm pr-4" style={{ color: '#F4ECD8' }}>{faq.q}</span>
                  <ChevronDown size={17} style={{ color: '#C8903F', flexShrink: 0, transform: abierto === i ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }} />
                </button>
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
            Tu negocio merece<br /><span style={{ fontStyle: 'italic', color: '#C8903F' }}>la mejor herramienta</span>
          </h2>
          <p className="font-body mt-5 mb-8" style={{ color: '#7A6A58', fontSize: 18 }}>Únete hoy. 30 días gratis.</p>
          <Link to="/register"
            className="inline-flex font-body font-semibold px-10 py-4 rounded-xl text-base transition"
            style={{ background: '#C8903F', color: '#080706', boxShadow: '0 0 40px rgba(200,144,63,0.4)' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#A87528'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#C8903F'; }}>
            Crear cuenta gratis →
          </Link>
          <p className="font-body text-sm mt-5" style={{ color: '#4A3F35' }}>
            Cancela cuando quieras · Listo en 5 minutos · Soporte en español
          </p>
        </Fade>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function FooterLink({ href, children, style, onMouseEnter, onMouseLeave }) {
  if (href.startsWith('/')) {
    return <Link to={href} style={style} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>{children}</Link>;
  }
  return <a href={href} style={style} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>{children}</a>;
}

function Footer() {
  const ls = { color: '#7A6A58', fontSize: 14, fontFamily: '"DM Sans", system-ui, sans-serif' };
  const lh = {
    onMouseEnter: e => { e.currentTarget.style.color = '#E4B878'; },
    onMouseLeave: e => { e.currentTarget.style.color = '#7A6A58'; },
  };

  const SOCIAL = [
    { href: 'https://instagram.com/usemezo', title: 'Instagram', svg: SVG_INSTAGRAM },
    { href: 'https://tiktok.com/@usemezo',   title: 'TikTok',    svg: SVG_TIKTOK },
    { href: 'https://linkedin.com/company/mezo-pos', title: 'LinkedIn', svg: SVG_LINKEDIN },
  ];

  const COLS = [
    {
      titulo: 'Producto',
      links: [
        { label: 'Características',     href: '#caracteristicas' },
        { label: 'Precios',             href: '#precios' },
        { label: 'Preguntas frecuentes',href: '#faqs' },
        { label: 'Novedades',           href: '/changelog' },
      ],
    },
    {
      titulo: 'Empresa',
      links: [
        { label: 'Sobre mezo',          href: '/sobre' },
        { label: 'Blog',                href: '/blog' },
        { label: 'Trabaja con nosotros',href: '/careers' },
        { label: 'Contacto',            href: '/contacto' },
      ],
    },
    {
      titulo: 'Legal y soporte',
      links: [
        { label: 'Términos de servicio',   href: '/terminos' },
        { label: 'Política de privacidad', href: '/privacidad' },
        { label: 'Centro de ayuda',        href: '/ayuda' },
        { label: 'Estado del sistema',     href: '/status' },
      ],
    },
  ];

  return (
    <footer className="px-4 pt-16 pb-8 border-t" style={{ borderColor: '#2A2520', background: '#080706' }}>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-14">

          {/* Col 1 — Marca */}
          <div className="col-span-2 md:col-span-1">
            <span style={{ fontFamily: '"Fraunces", Georgia, serif', fontStyle: 'italic', fontSize: 28, color: '#C8903F', fontWeight: 700 }}>mezo</span>
            <p className="font-body text-sm mt-2 mb-4" style={{ color: '#7A6A58', lineHeight: 1.6 }}>
              El POS hecho para Colombia 🇨🇴
            </p>
            <div className="space-y-1.5 mb-5">
              <a href="https://wa.me/573000000000" className="flex items-center gap-2 font-body text-sm transition" style={ls}
                onMouseEnter={e => { e.currentTarget.style.color = '#E4B878'; }} onMouseLeave={e => { e.currentTarget.style.color = '#7A6A58'; }}>
                <span>📞</span> +57 300 000 0000
              </a>
              <a href="mailto:hola@mezo.co" className="flex items-center gap-2 font-body text-sm transition" style={ls}
                onMouseEnter={e => { e.currentTarget.style.color = '#E4B878'; }} onMouseLeave={e => { e.currentTarget.style.color = '#7A6A58'; }}>
                <span>✉️</span> hola@mezo.co
              </a>
            </div>
            <div className="flex items-center gap-2">
              {SOCIAL.map(red => (
                <a key={red.href} href={red.href} target="_blank" rel="noopener noreferrer" title={red.title}
                  className="w-9 h-9 rounded-xl border flex items-center justify-center transition"
                  style={{ borderColor: '#2A2520', background: '#141210', color: '#7A6A58' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(200,144,63,0.4)'; e.currentTarget.style.color = '#C8903F'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#2A2520'; e.currentTarget.style.color = '#7A6A58'; }}>
                  {red.svg}
                </a>
              ))}
            </div>
          </div>

          {/* Cols 2-4 */}
          {COLS.map(col => (
            <div key={col.titulo}>
              <p className="font-body text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#F4ECD8' }}>{col.titulo}</p>
              <ul className="space-y-3">
                {col.links.map(l => (
                  <li key={l.label}>
                    <FooterLink href={l.href} style={ls} {...lh}>{l.label}</FooterLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Línea final */}
        <div className="pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4" style={{ borderColor: '#2A2520' }}>
          <p className="font-body text-xs" style={{ color: '#4A3F35' }}>
            © 2026 mezo · Todos los derechos reservados · Hecho con ☕ en Colombia 🇨🇴
          </p>
          <p className="font-body text-xs" style={{ color: '#4A3F35' }}>
            Desarrollado por{' '}
            <a href="https://juanlizcano.dev" target="_blank" rel="noopener noreferrer"
              className="transition"
              style={{ color: '#7A6A58' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#C8903F'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#7A6A58'; }}>
              Juanes Lizcano
            </a>
          </p>
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

  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => { document.documentElement.style.scrollBehavior = ''; };
  }, []);

  useEffect(() => {
    if (!loading && user) navigate(negocio ? '/dashboard' : '/onboarding', { replace: true });
  }, [loading, user, negocio, navigate]);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  if (loading) return null;

  return (
    <>
      <style>{GLOBAL_STYLES}</style>
      <div style={{ background: '#080706', minHeight: '100vh' }}>
        <Navbar scrolled={scrolled} />
        <Hero />
        <StatsSection />
        <SliderMockups />
        <TiposNegocio />
        <Beneficios />
        <SeccionIA />
        <Features />
        <Precios />
        <FAQs />
        <CTAFinal />
        <Footer />
      </div>
    </>
  );
}
