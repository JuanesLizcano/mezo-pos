import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useReducedMotion } from 'framer-motion';
import AuroraGlow from '../effects/AuroraGlow';
import Typewriter from '../effects/Typewriter';
import ArrowIcon from '../icons/ArrowIcon';
import MagneticButton from '../effects/MagneticButton';
import HeroMockupCard from './HeroMockupCard';

const PARTICLES = [
  { left: '8%',  top: '22%', size: 3, dur: 3.2, delay: 0   },
  { left: '18%', top: '15%', size: 4, dur: 2.8, delay: 0.8 },
  { left: '55%', top: '72%', size: 3, dur: 3.3, delay: 1.8 },
  { left: '82%', top: '20%', size: 4, dur: 2.6, delay: 0.4 },
];

const WORDS = ['turno', 'cliente', 'menú', 'inventario', 'negocio'];

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
    <path d="M3 7L6 10L11 4" stroke="#3DAA68" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SparklesIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
    <path d="M7 1L8.2 4.8L12 6L8.2 7.2L7 11L5.8 7.2L2 6L5.8 4.8L7 1Z" fill="#E4B878"/>
    <circle cx="11.5" cy="2.5" r="0.8" fill="#E4B878"/>
    <circle cx="2.5" cy="11.5" r="0.6" fill="#E4B878"/>
  </svg>
);

function scrollToComoFunciona(e) {
  e.preventDefault();
  document.querySelector('#como-funciona')?.scrollIntoView({ behavior: 'smooth' });
}

export default function Hero() {
  const [mounted, setMounted] = useState(false);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  const fadeUp = (delay) => ({
    opacity:   mounted ? 1 : 0,
    transform: mounted ? 'translateY(0)' : 'translateY(24px)',
    transition: prefersReduced
      ? 'opacity 0.01s'
      : `opacity 0.75s ease ${delay}ms, transform 0.75s ease ${delay}ms`,
  });

  return (
    <section className="relative min-h-screen flex items-center px-4 pt-20 pb-16 overflow-hidden">
      {/* Fondo fotográfico */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1559305616-3f99cd43e353?w=1600"
          alt="" loading="eager" decoding="async"
          className="w-full h-full object-cover"
          style={{ opacity: 0.22 }}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, rgba(8,7,6,0.55) 0%, rgba(8,7,6,0.80) 50%, #080706 100%)' }}
        />
      </div>

      {/* Grid de puntos con máscara radial */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(rgba(244,236,216,0.025) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          maskImage: 'radial-gradient(ellipse 70% 60% at 50% 50%, black 30%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 50%, black 30%, transparent 100%)',
        }}
      />

      <AuroraGlow variant="top" intensity={0.18} />

      {/* Partículas doradas */}
      {PARTICLES.map((p, i) => (
        <div
          key={i}
          className="absolute pointer-events-none rounded-full"
          style={{
            left: p.left, top: p.top,
            width: p.size, height: p.size,
            background: '#C8903F',
            animation: prefersReduced ? 'none' : `particleFloat ${p.dur}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}

      {/* Layout dos columnas */}
      <div className="relative z-10 w-full max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.15fr] gap-12 items-center">

          {/* Columna izquierda */}
          <div>
            {/* Badge Colombia */}
            <div style={fadeUp(0)}>
              <span
                className="inline-flex items-center gap-2 text-[10px] font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full mb-6"
                style={{
                  background: 'rgba(200,144,63,0.12)',
                  color: '#E4B878',
                  border: '1px solid rgba(200,144,63,0.3)',
                  letterSpacing: '0.12em',
                }}
              >
                🇨🇴 Hecho en Colombia · Para Colombia
              </span>
            </div>

            {/* Headline */}
            <h1
              style={{
                fontFamily: '"Fraunces", Georgia, serif',
                fontSize: 'clamp(2.6rem, 5.5vw, 4.5rem)',
                color: '#F4ECD8',
                lineHeight: 1.08,
                fontWeight: 700,
                letterSpacing: '-0.02em',
                marginBottom: '1.25rem',
                ...fadeUp(120),
              }}
            >
              Encárgate de tu{' '}
              <Typewriter
                words={WORDS}
                className="text-[#C8903F]"
                style={{ fontFamily: '"Fraunces", Georgia, serif', fontStyle: 'italic' }}
                cursorColor="#C8903F"
                speed={90}
                deleteSpeed={50}
                waitTime={1600}
              />
              <span style={{ fontStyle: 'italic', color: '#C8903F' }}>.</span>
            </h1>

            {/* Descripción */}
            <p
              className="font-body mb-8"
              style={{
                ...fadeUp(240),
                color: '#A89880',
                fontSize: 'clamp(0.95rem, 1.6vw, 1.05rem)',
                lineHeight: 1.7,
                maxWidth: 480,
              }}
            >
              POS, mesas en tiempo real, arqueo sin susto y reportes con IA que te dicen qué vender más, qué pedir y dónde estás perdiendo plata. Todo en una pantalla.
            </p>

            {/* CTAs */}
            <div style={fadeUp(380)}>
              <div className="flex flex-col sm:flex-row items-start gap-4 mb-5">
                <MagneticButton
                  as={Link}
                  to="/register"
                  strength={0.25}
                  className="group mezo-cta-shimmer font-body font-semibold px-8 py-4 rounded-xl text-base inline-flex items-center gap-2"
                  style={{
                    background: '#C8903F',
                    color: '#080706',
                    boxShadow: '0 0 36px rgba(200,144,63,0.35)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Probar gratis
                  <ArrowIcon />
                </MagneticButton>
                <a
                  href="#como-funciona"
                  onClick={scrollToComoFunciona}
                  className="font-body font-medium px-6 py-4 rounded-xl text-base border transition"
                  style={{ borderColor: 'rgba(200,144,63,0.4)', color: '#E4B878' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(200,144,63,0.08)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  Ver cómo funciona ↓
                </a>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-3 text-sm">
                <span className="flex items-center gap-1.5" style={{ color: '#9A8A78' }}>
                  <CheckIcon />30 días gratis
                </span>
                <span className="flex items-center gap-1.5" style={{ color: '#9A8A78' }}>
                  <SparklesIcon />Análisis con IA
                </span>
                <span className="flex items-center gap-1.5" style={{ color: '#9A8A78' }}>
                  <CheckIcon />Soporte en español
                </span>
              </div>
            </div>
          </div>

          {/* Columna derecha — mockup animado */}
          <div style={fadeUp(200)} className="hidden lg:flex justify-center items-center">
            <HeroMockupCard />
          </div>

        </div>
      </div>
    </section>
  );
}
