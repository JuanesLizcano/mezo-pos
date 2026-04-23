import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, X, Zap, CreditCard, Layout, BarChart2, Users, ClipboardList } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// ─── Datos ────────────────────────────────────────────────────────────────────

const SLOGANS = [
  'Todo el negocio, una pantalla.',
  'Menos caos. Más caja.',
  'El pulso de tu negocio.',
  'Vende más. Piensa menos.',
  'Tu negocio, bajo control.',
];

const TIPOS_NEGOCIO = [
  { emoji: '☕', label: 'Cafeterías' },
  { emoji: '🍽️', label: 'Restaurantes' },
  { emoji: '🥐', label: 'Panaderías' },
  { emoji: '🍺', label: 'Bares' },
  { emoji: '🍔', label: 'Comida rápida' },
  { emoji: '🍦', label: 'Heladerías' },
  { emoji: '🧃', label: 'Juguerías' },
  { emoji: '🍕', label: 'Pizzerías' },
];

const FEATURES = [
  { icon: Zap,            title: 'POS ultrarrápido',         desc: 'Una orden en menos de 10 segundos.' },
  { icon: CreditCard,     title: 'Todos los pagos',          desc: 'Efectivo, Datáfono, Nequi, Daviplata, Transferencia en un solo sistema.' },
  { icon: Layout,         title: 'Mesas en tiempo real',     desc: 'Timers, estados, división de cuenta y cambio de mesa con un toque.' },
  { icon: BarChart2,      title: 'Reportes inteligentes',    desc: 'Ventas por hora, día, semana, mes y año.' },
  { icon: Users,          title: 'Roles de empleados',       desc: 'Admin, cajero, mesero y cocina.' },
  { icon: ClipboardList,  title: 'Arqueo de caja',           desc: 'Lo registrado vs lo real. En segundos.' },
];

const PLANES = {
  semilla: {
    nombre:  'Semilla',
    precio:  { mensual: 39900, anual: 31900 },
    items: [
      { ok: true,  text: 'Hasta 4 mesas' },
      { ok: true,  text: 'Hasta 25 productos' },
      { ok: true,  text: 'Hasta 3 empleados' },
      { ok: true,  text: '1 sede · POS completo' },
      { ok: false, text: 'Reportes avanzados' },
      { ok: false, text: 'Funciones IA' },
    ],
    cta:    'Empezar gratis',
    ctaStyle: 'outline',
  },
  pro: {
    nombre:  'Pro',
    badge:   '⭐ Más popular',
    precio:  { mensual: 99900, anual: 79900 },
    items: [
      { ok: true,  text: 'Mesas ilimitadas' },
      { ok: true,  text: 'Productos ilimitados' },
      { ok: true,  text: 'Empleados ilimitados' },
      { ok: true,  text: 'Reportes completos' },
      { ok: true,  text: '1 sede · 30 días gratis' },
      { ok: false, text: 'Funciones IA' },
    ],
    cta:    'Comenzar ahora',
    ctaStyle: 'gold',
  },
  elite: {
    nombre:  'Elite',
    precio:  { mensual: 199900, anual: 159900 },
    items: [
      { ok: true, text: 'Todo lo de Pro' },
      { ok: true, text: 'Sedes ilimitadas' },
      { ok: true, text: 'Funciones IA' },
      { ok: true, text: 'Soporte prioritario' },
    ],
    cta:    'Contactar ventas',
    ctaStyle: 'outline',
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCOP(n) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);
}

// ─── Componentes internos ─────────────────────────────────────────────────────

function Navbar({ scrolled }) {
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 h-16 transition-all duration-300"
      style={{
        background:   scrolled ? 'rgba(8,7,6,0.85)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(42,37,32,0.8)' : 'none',
      }}>
      {/* Logo */}
      <span style={{ fontFamily: '"Fraunces", Georgia, serif', fontStyle: 'italic', fontSize: 26, color: '#C8903F', fontWeight: 700, letterSpacing: '-0.01em' }}>
        mezo
      </span>

      {/* Links */}
      <div className="hidden md:flex items-center gap-8">
        {['Características', 'Precios', 'Soporte'].map(l => (
          <a key={l} href={`#${l.toLowerCase()}`}
            className="text-sm font-body transition"
            style={{ color: '#D9CEB5' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#C8903F'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#D9CEB5'; }}>
            {l}
          </a>
        ))}
      </div>

      {/* CTAs */}
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

function Hero() {
  const [idx, setIdx]       = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setInterval(() => {
      setVisible(false);
      setTimeout(() => { setIdx(i => (i + 1) % SLOGANS.length); setVisible(true); }, 400);
    }, 3000);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 pt-20 pb-24 overflow-hidden">
      {/* Glow dorado */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, rgba(200,144,63,0.12) 0%, transparent 70%)' }} />

      {/* Badge */}
      <span className="inline-flex items-center gap-2 text-xs font-body font-semibold px-4 py-1.5 rounded-full mb-6"
        style={{ background: 'rgba(200,144,63,0.12)', color: '#E4B878', border: '1px solid rgba(200,144,63,0.3)' }}>
        🇨🇴 Hecho en Colombia
      </span>

      {/* Título */}
      <h1 style={{ fontFamily: '"Fraunces", Georgia, serif', fontSize: 'clamp(2.5rem, 6vw, 5rem)', color: '#F4ECD8', lineHeight: 1.05, fontWeight: 700, letterSpacing: '-0.02em', maxWidth: 800 }}>
        El POS que tu negocio{' '}
        <span style={{ fontStyle: 'italic', color: '#C8903F' }}>merece</span>
      </h1>

      {/* Subtítulo */}
      <p className="font-body mt-5 mb-4" style={{ color: '#7A6A58', fontSize: 'clamp(1rem, 2vw, 1.2rem)', maxWidth: 520 }}>
        Cobra más rápido. Vende más inteligente.
        <br />Diseñado para Colombia.
      </p>

      {/* Slogan rotativo */}
      <p className="font-body font-medium mb-10 h-7 transition-opacity duration-300"
        style={{ color: '#D9CEB5', fontSize: 16, opacity: visible ? 1 : 0 }}>
        {SLOGANS[idx]}
      </p>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <Link to="/register"
          className="font-body font-semibold px-8 py-4 rounded-mezo-lg text-base transition"
          style={{ background: '#C8903F', color: '#080706' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#A87528'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#C8903F'; }}>
          Empieza gratis — 30 días
        </Link>
        <a href="#características"
          className="font-body font-medium px-6 py-4 rounded-mezo-lg text-base border transition"
          style={{ borderColor: 'rgba(200,144,63,0.4)', color: '#E4B878' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(200,144,63,0.08)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
          Ver características →
        </a>
      </div>

      <p className="font-body text-sm mt-5" style={{ color: '#4A3F35' }}>
        Sin tarjeta · Cancela cuando quieras · Soporte en español
      </p>
    </section>
  );
}

function TiposNegocio() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <p className="text-center font-body text-xs uppercase tracking-widest mb-3" style={{ color: '#7A6A58' }}>
          Para todo tipo de negocio gastronómico
        </p>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3 mt-6">
          {TIPOS_NEGOCIO.map(t => (
            <div key={t.label}
              className="flex flex-col items-center gap-2 py-4 px-2 rounded-mezo-xl border transition cursor-default"
              style={{ background: '#141210', borderColor: '#2A2520' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(200,144,63,0.4)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#2A2520'; }}>
              <span style={{ fontSize: 28 }}>{t.emoji}</span>
              <span className="font-body text-xs text-center" style={{ color: '#7A6A58', fontSize: 11 }}>
                {t.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="características" className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <p className="text-center font-body text-xs uppercase tracking-widest mb-2" style={{ color: '#7A6A58' }}>
          Características
        </p>
        <h2 className="text-center mb-12"
          style={{ fontFamily: '"Fraunces", Georgia, serif', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: '#F4ECD8', fontWeight: 700, lineHeight: 1.1 }}>
          Todo lo que necesitas,<br />
          <span style={{ fontStyle: 'italic', color: '#C8903F' }}>sin lo que no</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(f => (
            <div key={f.title} className="p-6 rounded-mezo-xl border transition"
              style={{ background: '#141210', borderColor: '#2A2520' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(200,144,63,0.35)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#2A2520'; }}>
              <f.icon size={22} style={{ color: '#C8903F', marginBottom: 14 }} />
              <h3 className="font-body font-semibold mb-2" style={{ color: '#F4ECD8', fontSize: 16 }}>
                {f.title}
              </h3>
              <p className="font-body text-sm" style={{ color: '#7A6A58', lineHeight: 1.6 }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Precios() {
  const [anual, setAnual] = useState(false);

  return (
    <section id="precios" className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <p className="text-center font-body text-xs uppercase tracking-widest mb-2" style={{ color: '#7A6A58' }}>
          Precios
        </p>
        <h2 className="text-center mb-4"
          style={{ fontFamily: '"Fraunces", Georgia, serif', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: '#F4ECD8', fontWeight: 700, lineHeight: 1.1 }}>
          Planes <span style={{ fontStyle: 'italic', color: '#C8903F' }}>simples</span>
        </h2>

        {/* Toggle mensual/anual */}
        <div className="flex items-center justify-center gap-3 mb-12">
          <span className="font-body text-sm" style={{ color: anual ? '#7A6A58' : '#F4ECD8' }}>Mensual</span>
          <button
            onClick={() => setAnual(a => !a)}
            className="relative w-12 h-6 rounded-full transition-colors"
            style={{ background: anual ? '#C8903F' : '#2A2520' }}>
            <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform"
              style={{ transform: anual ? 'translateX(26px)' : 'translateX(2px)' }} />
          </button>
          <span className="font-body text-sm" style={{ color: anual ? '#F4ECD8' : '#7A6A58' }}>
            Anual <span style={{ color: '#3DAA68', fontSize: 12, fontWeight: 600 }}>−20%</span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(PLANES).map(([key, plan]) => (
            <div key={key} className="relative flex flex-col p-7 rounded-mezo-xl border transition"
              style={{
                background:   key === 'pro' ? 'linear-gradient(180deg, rgba(200,144,63,0.08) 0%, #141210 100%)' : '#141210',
                borderColor:  key === 'pro' ? '#C8903F' : '#2A2520',
              }}>
              {plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-body font-bold px-3 py-1 rounded-full"
                  style={{ background: '#C8903F', color: '#080706' }}>
                  {plan.badge}
                </span>
              )}

              <p className="font-body font-semibold mb-1" style={{ color: '#7A6A58', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                {plan.nombre}
              </p>

              <div className="flex items-end gap-1 mb-1">
                <span style={{ fontFamily: '"Fraunces", Georgia, serif', fontSize: 38, color: '#F4ECD8', fontWeight: 700, lineHeight: 1 }}>
                  {formatCOP(anual ? plan.precio.anual : plan.precio.mensual)}
                </span>
              </div>
              <p className="font-body text-xs mb-6" style={{ color: '#7A6A58' }}>/mes{anual ? ' · facturado anualmente' : ''}</p>

              <ul className="space-y-2.5 flex-1 mb-8">
                {plan.items.map((it, i) => (
                  <li key={i} className="flex items-start gap-2.5 font-body text-sm"
                    style={{ color: it.ok ? '#D9CEB5' : '#4A3F35' }}>
                    {it.ok
                      ? <Check size={15} style={{ color: '#3DAA68', flexShrink: 0, marginTop: 1 }} />
                      : <X     size={15} style={{ color: '#4A3F35', flexShrink: 0, marginTop: 1 }} />}
                    {it.text}
                  </li>
                ))}
              </ul>

              <Link to="/register"
                className="block text-center font-body font-semibold py-3 rounded-mezo-lg text-sm transition"
                style={
                  plan.ctaStyle === 'gold'
                    ? { background: '#C8903F', color: '#080706' }
                    : { border: '1px solid rgba(200,144,63,0.4)', color: '#E4B878', background: 'transparent' }
                }
                onMouseEnter={e => {
                  if (plan.ctaStyle === 'gold') e.currentTarget.style.background = '#A87528';
                  else e.currentTarget.style.background = 'rgba(200,144,63,0.1)';
                }}
                onMouseLeave={e => {
                  if (plan.ctaStyle === 'gold') e.currentTarget.style.background = '#C8903F';
                  else e.currentTarget.style.background = 'transparent';
                }}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        <p className="text-center font-body text-sm mt-8" style={{ color: '#7A6A58' }}>
          30 días gratis en todos los planes. Sin tarjeta de crédito.
        </p>
      </div>
    </section>
  );
}

function CTAFinal() {
  return (
    <section className="py-24 px-4">
      <div className="max-w-2xl mx-auto text-center">
        <div className="relative p-10 rounded-mezo-xl border overflow-hidden"
          style={{ background: '#141210', borderColor: 'rgba(200,144,63,0.3)' }}>
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(200,144,63,0.12) 0%, transparent 60%)' }} />

          <h2 className="relative mb-3"
            style={{ fontFamily: '"Fraunces", Georgia, serif', fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', color: '#F4ECD8', fontWeight: 700 }}>
            Tu negocio merece la<br />
            <span style={{ fontStyle: 'italic', color: '#C8903F' }}>mejor herramienta</span>
          </h2>
          <p className="font-body text-sm mb-8 relative" style={{ color: '#7A6A58' }}>
            30 días gratis · Sin tarjeta · Soporte en español
          </p>
          <Link to="/register"
            className="relative inline-flex font-body font-semibold px-8 py-4 rounded-mezo-lg text-base transition"
            style={{ background: '#C8903F', color: '#080706' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#A87528'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#C8903F'; }}>
            Crear cuenta gratis →
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="py-12 px-4 border-t" style={{ borderColor: '#2A2520' }}>
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <span style={{ fontFamily: '"Fraunces", Georgia, serif', fontStyle: 'italic', fontSize: 22, color: '#C8903F', fontWeight: 700 }}>
            mezo
          </span>
          <div className="flex items-center gap-6">
            {['Características', 'Precios', 'Soporte', 'Términos', 'Privacidad'].map(l => (
              <a key={l} href="#" className="font-body text-xs transition"
                style={{ color: '#7A6A58' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#E4B878'; }}
                onMouseLeave={e => { e.currentTarget.style.color = '#7A6A58'; }}>
                {l}
              </a>
            ))}
          </div>
        </div>
        <p className="text-center font-body text-xs mt-8" style={{ color: '#4A3F35' }}>
          © 2026 mezo · Hecho en Colombia 🇨🇴
        </p>
      </div>
    </footer>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function Landing() {
  const { user, negocio, loading } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled]   = useState(false);

  // Si ya está logueado, redirigir al dashboard
  useEffect(() => {
    if (!loading && user) {
      navigate(negocio ? '/dashboard' : '/onboarding', { replace: true });
    }
  }, [loading, user, negocio, navigate]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={{ background: '#080706', minHeight: '100vh' }}>
      <Navbar scrolled={scrolled} />
      <Hero />
      <TiposNegocio />
      <Features />
      <Precios />
      <CTAFinal />
      <Footer />
    </div>
  );
}
