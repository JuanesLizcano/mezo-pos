import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
// import BorderBeam from '../effects/BorderBeam'; // reemplazado por TopHighlight
// import TopHighlight from '../effects/TopHighlight'; // reemplazado por PerimeterBeam
import PerimeterBeam from '../effects/PerimeterBeam';
import AnimatedNumber from '../effects/AnimatedNumber';
import { useMediaQuery } from '../../hooks/useMediaQuery';

// ─── Datos ────────────────────────────────────────────────────────────────────

const MESAS = [
  {
    numero: 4,
    hora: '3:42 p.m.',
    items: [
      { nombre: '2× Tinto',       precio: 5000 },
      { nombre: '1× Croissant',   precio: 4500 },
      { nombre: '1× Almojábana',  precio: 3000 },
      { nombre: '1× Capuccino',   precio: 7500 },
      { nombre: '1× Pan de bono', precio: 2500 },
    ],
    total: 22500,
  },
  {
    numero: 7,
    hora: '3:44 p.m.',
    items: [
      { nombre: '1× Capuccino',   precio: 7500 },
      { nombre: '2× Pan de bono', precio: 5000 },
      { nombre: '1× Brownie',     precio: 4000 },
      { nombre: '1× Limonada',    precio: 5500 },
    ],
    total: 22000,
  },
  {
    numero: 2,
    hora: '3:47 p.m.',
    items: [
      { nombre: '3× Americano',    precio: 9000 },
      { nombre: '1× Tostada',      precio: 6500 },
      { nombre: '2× Jugo natural', precio: 8000 },
      { nombre: '1× Croissant',    precio: 4500 },
      { nombre: '2× Agua',         precio: 3000 },
    ],
    total: 31000,
  },
];

const SUGERENCIAS_IA = [
  { color: '#C8903F', texto: 'Sube precio del croissant un 8%. Demanda alta, margen bajo.' },
  { color: '#3DAA68', texto: 'Pide 12 libras más de café. Quedas sin stock el viernes.' },
  { color: '#E4B878', texto: 'Tus mejores horas son 8-10 a.m. Promociona allí.' },
];

const INVENTARIO = [
  { producto: 'Café en grano', cantidad: '2 lb',  porcentaje: 15, estado: 'critico' },
  { producto: 'Leche',         cantidad: '8 L',   porcentaje: 40, estado: 'medio'   },
  { producto: 'Azúcar',        cantidad: '15 kg', porcentaje: 75, estado: 'ok'      },
  { producto: 'Croissants',    cantidad: '6 ud',  porcentaje: 25, estado: 'medio'   },
];

const COLOR_ESTADO = { critico: '#C8573F', medio: '#E4B878', ok: '#3DAA68' };

const VISTAS = ['pos', 'ia', 'arqueo', 'inventario'];

const ease = [0.22, 1, 0.36, 1];

// ─── VistaHeader (compartido) ─────────────────────────────────────────────────

function VistaHeader({ titulo, hora, dotColor = '#3DAA68' }) {
  return (
    <div
      className="flex items-center justify-between pb-3 mb-4"
      style={{ borderBottom: '1px solid rgba(244,236,216,0.08)' }}
    >
      <div className="flex items-center gap-2">
        <span className="relative flex h-1.5 w-1.5">
          <span
            className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
            style={{ backgroundColor: dotColor }}
          />
          <span
            className="relative inline-flex h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: dotColor }}
          />
        </span>
        <span className="text-sm font-medium" style={{ color: '#F4ECD8' }}>{titulo}</span>
      </div>
      <span className="text-xs tabular-nums" style={{ color: '#7A6A58' }}>{hora}</span>
    </div>
  );
}

// ─── VistaPOS ─────────────────────────────────────────────────────────────────

function VistaPOS() {
  const [idx, setIdx] = useState(0);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    let mounted = true;
    let timeoutId;

    const sleep = (ms) => new Promise(resolve => {
      timeoutId = setTimeout(resolve, ms);
    });

    const run = async () => {
      while (mounted) {
        await sleep(5000);
        if (!mounted) return;
        setIdx(prev => (prev + 1) % MESAS.length);
      }
    };

    run();

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
    };
  }, []);

  const mesa = MESAS[idx];

  return (
    <>
      {/* Header: Mesa N + hora */}
      <div
        className="flex justify-between items-center mb-5 pb-4"
        style={{ borderBottom: '1px solid rgba(244,236,216,0.08)' }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={mesa.numero}
            initial={{ opacity: 0, x: prefersReduced ? 0 : 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: prefersReduced ? 0 : -8 }}
            transition={{ duration: 0.3, ease }}
            className="flex items-center gap-2"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#3DAA68] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#3DAA68]" />
            </span>
            <span className="text-base font-medium" style={{ color: '#F4ECD8' }}>
              Mesa {mesa.numero}
            </span>
          </motion.div>
        </AnimatePresence>
        <span className="text-xs tabular-nums" style={{ color: '#7A6A58' }}>{mesa.hora}</span>
      </div>

      {/* Items con stagger */}
      <AnimatePresence mode="wait">
        <motion.div
          key={mesa.numero}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={{
            hidden:   { opacity: 0 },
            visible:  { opacity: 1, transition: { staggerChildren: prefersReduced ? 0 : 0.07 } },
            exit:     { opacity: 0 },
          }}
          className="space-y-3"
        >
          {mesa.items.map((item, i) => (
            <motion.div
              key={`${mesa.numero}-${i}`}
              variants={{
                hidden:  { opacity: 0, x: prefersReduced ? 0 : 8 },
                visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease } },
                exit:    { opacity: 0, x: prefersReduced ? 0 : -8 },
              }}
              className="flex justify-between text-base"
            >
              <span style={{ color: '#9A8A78' }}>{item.nombre}</span>
              <span className="tabular-nums" style={{ color: '#F4ECD8' }}>
                ${item.precio.toLocaleString('es-CO')}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Total */}
      <div
        className="mt-5 pt-4 flex justify-between items-baseline"
        style={{ borderTop: '1px solid rgba(244,236,216,0.08)' }}
      >
        <span className="text-xs uppercase tracking-wider" style={{ color: '#7A6A58' }}>Total</span>
        <span className="text-3xl font-medium tabular-nums" style={{ color: '#C8903F' }}>
          $<AnimatedNumber value={mesa.total} duration={800} />
        </span>
      </div>

      {/* Métodos de pago */}
      <div className="mt-5 grid grid-cols-3 gap-2">
        <div
          className="py-3 rounded-md text-center text-sm font-medium"
          style={{ background: 'rgba(61,170,104,0.15)', color: '#3DAA68' }}
        >
          Efectivo
        </div>
        <div
          className="py-3 rounded-md text-center text-sm"
          style={{ background: 'rgba(244,236,216,0.04)', color: '#9A8A78' }}
        >
          Tarjeta
        </div>
        <div
          className="py-3 rounded-md text-center text-sm"
          style={{ background: 'rgba(244,236,216,0.04)', color: '#9A8A78' }}
        >
          Nequi
        </div>
      </div>

      {/* Botón Cobrar con shimmer esporádico */}
      <motion.button
        whileTap={prefersReduced ? {} : { scale: 0.98 }}
        className="relative mt-4 w-full py-3 rounded-xl font-semibold font-body text-sm overflow-hidden"
        style={{ background: '#C8903F', color: '#080706' }}
      >
        Cobrar ${mesa.total.toLocaleString('es-CO')}
        {!prefersReduced && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.25) 50%, transparent 70%)',
            }}
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 6.8, ease: 'linear' }}
          />
        )}
      </motion.button>
    </>
  );
}

// ─── VistaIA ──────────────────────────────────────────────────────────────────

function VistaIA() {
  return (
    <>
      <VistaHeader titulo="Reporte semanal" hora="esta semana" dotColor="#C8903F" />

      <div className="text-xs mb-3 flex items-center gap-1.5" style={{ color: '#7A6A58' }}>
        <svg width="11" height="11" viewBox="0 0 14 14" fill="none" aria-hidden>
          <path d="M7 1L8.2 4.8L12 6L8.2 7.2L7 11L5.8 7.2L2 6L5.8 4.8L7 1Z" fill="#E4B878" />
        </svg>
        Recomendaciones de mezo IA:
      </div>

      <div className="space-y-2">
        {SUGERENCIAS_IA.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.85, x: 8 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 + i * 0.5, ease: [0.34, 1.56, 0.64, 1] }}
            className="text-[13px] leading-relaxed py-2.5 px-3 rounded-md"
            style={{
              background: `${s.color}1A`,
              borderLeft: `2px solid ${s.color}`,
              color: '#F4ECD8',
            }}
          >
            {s.texto}
          </motion.div>
        ))}
      </div>

      <button
        className="mt-4 w-full py-3 rounded-lg font-medium text-sm"
        style={{
          background: 'rgba(200,144,63,0.10)',
          color: '#E4B878',
          border: '1px solid rgba(200,144,63,0.30)',
        }}
      >
        Ver reporte completo →
      </button>
    </>
  );
}

// ─── VistaArqueo ──────────────────────────────────────────────────────────────

function AnimatedCounter({ value, duration = 900, prefix = '$' }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    let mounted = true;
    let rafId;
    let startTime = null;

    const step = (ts) => {
      if (!mounted) return;
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - Math.pow(2, -10 * progress);
      setCurrent(Math.round(value * eased));
      if (progress < 1) rafId = requestAnimationFrame(step);
    };

    rafId = requestAnimationFrame(step);

    return () => {
      mounted = false;
      cancelAnimationFrame(rafId);
    };
  }, [value, duration]);

  return <>{prefix}{current.toLocaleString('es-CO')}</>;
}

function VistaArqueo() {
  const [showCheck, setShowCheck] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setShowCheck(true), 3500);
    return () => clearTimeout(id);
  }, []);

  return (
    <>
      <VistaHeader titulo="Cierre del turno" hora="9:30 p.m." dotColor="#3DAA68" />

      <div className="space-y-1">
        <motion.div
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease }}
          className="flex justify-between items-baseline py-2"
          style={{ borderBottom: '1px solid rgba(244,236,216,0.05)' }}
        >
          <span className="text-sm" style={{ color: '#9A8A78' }}>Esperado</span>
          <span className="text-base font-medium tabular-nums" style={{ color: '#F4ECD8' }}>
            <AnimatedCounter value={487500} duration={900} />
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 1.4, ease }}
          className="flex justify-between items-baseline py-2"
          style={{ borderBottom: '1px solid rgba(244,236,216,0.05)' }}
        >
          <span className="text-sm" style={{ color: '#9A8A78' }}>Contado</span>
          <span className="text-base font-medium tabular-nums" style={{ color: '#F4ECD8' }}>
            <AnimatedCounter value={487500} duration={900} />
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 2.6, ease }}
          className="flex justify-between items-baseline py-2"
        >
          <span className="text-sm" style={{ color: '#3DAA68' }}>Diferencia</span>
          <span className="text-base font-medium tabular-nums" style={{ color: '#3DAA68' }}>$0</span>
        </motion.div>
      </div>

      <AnimatePresence>
        {showCheck && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
            className="mt-4 p-3 rounded-lg flex items-center gap-2"
            style={{
              background: 'rgba(61,170,104,0.10)',
              border: '1px solid rgba(61,170,104,0.30)',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <motion.path
                d="M3 8L7 12L13 4"
                stroke="#3DAA68"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </svg>
            <span className="text-sm font-medium" style={{ color: '#3DAA68' }}>Caja cuadró exacta</span>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        className="mt-4 w-full py-3 rounded-lg font-semibold text-sm"
        style={{ background: '#C8903F', color: '#080706' }}
      >
        Cerrar turno
      </button>
    </>
  );
}

// ─── VistaInventario ──────────────────────────────────────────────────────────

function VistaInventario() {
  return (
    <>
      <VistaHeader titulo="Inventario hoy" hora="tiempo real" dotColor="#C8573F" />

      <div className="space-y-3">
        {INVENTARIO.map((item, i) => {
          const color = COLOR_ESTADO[item.estado];
          const isCritico = item.estado === 'critico';

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1, ease }}
            >
              <div className="flex justify-between text-sm mb-1.5">
                <span style={{ color: '#F4ECD8' }}>{item.producto}</span>
                <span className="tabular-nums text-xs" style={{ color }}>
                  {item.cantidad}{isCritico && ' · crítico'}
                </span>
              </div>
              <div
                className="h-1.5 rounded-full overflow-hidden"
                style={{ background: 'rgba(244,236,216,0.06)' }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${item.porcentaje}%`,
                    x: isCritico ? [0, -2, 2, -1, 1, 0] : 0,
                  }}
                  transition={{
                    width: { duration: 1, delay: 0.4 + i * 0.1, ease },
                    x: isCritico ? { duration: 0.4, delay: 1.5, repeat: 1 } : undefined,
                  }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: color }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      <button
        className="mt-4 w-full py-3 rounded-lg font-medium text-sm"
        style={{
          background: 'rgba(200,87,63,0.10)',
          color: '#E89D87',
          border: '1px solid rgba(200,87,63,0.30)',
        }}
      >
        Pedir reposición
      </button>
    </>
  );
}

// ─── HeroMockupCard ───────────────────────────────────────────────────────────

export default function HeroMockupCard() {
  const [vistaIdx, setVistaIdx] = useState(0);
  const prefersReduced = useReducedMotion();
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Rotación de vistas cada 5s — patrón async/await React 19
  useEffect(() => {
    let mounted = true;
    let timeoutId;

    const sleep = (ms) => new Promise(resolve => {
      timeoutId = setTimeout(resolve, ms);
    });

    const run = async () => {
      while (mounted) {
        await sleep(5000);
        if (!mounted) return;
        setVistaIdx(prev => (prev + 1) % VISTAS.length);
      }
    };

    run();

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
    };
  }, []);

  const vista = VISTAS[vistaIdx];

  return (
    <div className="relative" style={{ perspective: '1500px' }}>

      {/* Badge EN VIVO — fuera del tilt 3D */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1, ease }}
        className="absolute -top-3 -left-2 z-30 flex items-center gap-1.5 px-2.5 py-1 rounded-full"
        style={{
          background: 'rgba(200,87,63,0.10)',
          border: '1px solid rgba(200,87,63,0.30)',
          letterSpacing: '0.1em',
        }}
      >
        <motion.span
          animate={prefersReduced ? {} : { opacity: [1, 0.5, 1] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          className="inline-block w-1.5 h-1.5 rounded-full"
          style={{ background: '#E84D2C' }}
        />
        <span className="text-[10px] font-medium" style={{ color: '#E89D87' }}>EN VIVO</span>
      </motion.div>

      {/* Wrapper 3D oscilante — desactivado en mobile y reduced motion */}
      <motion.div
        style={{ transformStyle: 'preserve-3d' }}
        animate={prefersReduced || isMobile ? {} : {
          rotateY: [-8, -4, -8],
          rotateX: [4,   2,  4],
          rotateZ: [-1, 0.5, -1],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="relative py-12 px-6">

          {/* Card principal */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease }}
            className="relative z-10 rounded-2xl border shadow-[0_30px_60px_rgba(0,0,0,0.5)] min-w-[340px] sm:min-w-[420px]"
            style={{
              background: '#141210',
              borderColor: 'rgba(244,236,216,0.10)',
              padding: '1.5rem 1.75rem',
            }}
          >
            <PerimeterBeam borderRadius="16px" />

            {/* Rotación entre las 4 vistas */}
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={vista}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.45, ease }}
              >
                {vista === 'pos'        && <VistaPOS />}
                {vista === 'ia'         && <VistaIA />}
                {vista === 'arqueo'     && <VistaArqueo />}
                {vista === 'inventario' && <VistaInventario />}
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Tarjeta flotante: Caja cuadró (arriba derecha) */}
          <motion.div
            className="absolute -top-3 -right-2 z-20"
            animate={prefersReduced ? {} : { y: [0, -6, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1.1 }}
          >
            <motion.div
              initial={{ opacity: 0, rotate: 4 }}
              animate={{ opacity: 1, rotate: 3 }}
              transition={{ duration: 0.7, delay: 0.4, ease }}
              className="rounded-lg shadow-[0_8px_24px_rgba(200,144,63,0.25)]"
              style={{
                background: '#141210',
                border: '1px solid rgba(200,144,63,0.40)',
                padding: '0.625rem 1rem',
              }}
            >
              <div className="flex items-center gap-2">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#C8903F] opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#C8903F]" />
                </span>
                <span className="text-xs font-medium whitespace-nowrap" style={{ color: '#E4B878' }}>
                  Caja cuadró ✓
                </span>
              </div>
            </motion.div>
          </motion.div>

          {/* Tarjeta flotante: Ventas hoy (abajo izquierda) */}
          <motion.div
            className="absolute -bottom-4 -left-3 z-20"
            animate={prefersReduced ? {} : { y: [0, -4, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1.6 }}
          >
            <motion.div
              initial={{ opacity: 0, rotate: -8 }}
              animate={{ opacity: 1, rotate: -5 }}
              transition={{ duration: 0.7, delay: 0.6, ease }}
              className="rounded-xl shadow-[0_12px_32px_rgba(0,0,0,0.6)]"
              style={{
                background: '#141210',
                border: '1px solid rgba(244,236,216,0.10)',
                padding: '0.75rem 1.25rem',
              }}
            >
              <div className="text-[10px] uppercase tracking-widest mb-1" style={{ color: '#7A6A58' }}>
                Ventas hoy
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-medium tabular-nums" style={{ color: '#F4ECD8' }}>
                  $<AnimatedNumber value={487500} />
                </span>
                <svg width="9" height="9" viewBox="0 0 10 10" aria-hidden>
                  <path d="M5 1L8 5H2L5 1Z" fill="#3DAA68" />
                </svg>
                <span className="text-xs tabular-nums" style={{ color: '#3DAA68' }}>
                  +<AnimatedNumber value={18} duration={1000} formatter={(n) => `${Math.round(n)}%`} />
                </span>
              </div>
            </motion.div>
          </motion.div>

        </div>
      </motion.div>
    </div>
  );
}
