import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import BorderBeam from '../effects/BorderBeam';
import AnimatedNumber from '../effects/AnimatedNumber';

const MESAS = [
  {
    numero: 4,
    items: [
      { nombre: '2× Tinto',      precio: 5000 },
      { nombre: '1× Croissant',  precio: 4500 },
      { nombre: '1× Almojábana', precio: 3000 },
      { nombre: '1× Capuccino',  precio: 7500 },
      { nombre: '1× Pan de bono',precio: 2500 },
    ],
    total: 22500,
    hora: '3:42 p.m.',
  },
  {
    numero: 7,
    items: [
      { nombre: '1× Capuccino',   precio: 7500 },
      { nombre: '2× Pan de bono', precio: 5000 },
      { nombre: '1× Brownie',     precio: 4000 },
      { nombre: '1× Limonada',    precio: 5500 },
    ],
    total: 22000,
    hora: '3:44 p.m.',
  },
  {
    numero: 2,
    items: [
      { nombre: '3× Americano',    precio: 9000 },
      { nombre: '1× Tostada',      precio: 6500 },
      { nombre: '2× Jugo natural', precio: 8000 },
      { nombre: '1× Croissant',    precio: 4500 },
      { nombre: '2× Agua',         precio: 3000 },
    ],
    total: 31000,
    hora: '3:47 p.m.',
  },
];

const ease = [0.22, 1, 0.36, 1];

export default function HeroMockupCard() {
  const [idx, setIdx] = useState(0);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    if (prefersReduced) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % MESAS.length), 4500);
    return () => clearInterval(id);
  }, [prefersReduced]);

  const mesa = MESAS[idx];

  return (
    <motion.div
      whileHover={prefersReduced ? {} : { y: -4 }}
      transition={{ duration: 0.4, ease }}
      className="relative py-12 px-6"
    >
      {/* Card principal */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2, ease }}
        className="relative z-10 overflow-hidden rounded-2xl border shadow-[0_30px_60px_rgba(0,0,0,0.5)] min-w-[340px] sm:min-w-[420px]"
        style={{
          background: '#141210',
          borderColor: 'rgba(244,236,216,0.10)',
          padding: '1.5rem 1.75rem',
        }}
      >
        <BorderBeam duration={6} />

        {/* Header */}
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
              hidden:  { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: prefersReduced ? 0 : 0.07 } },
              exit:    { opacity: 0 },
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
          <AnimatePresence mode="wait">
            <motion.span
              key={mesa.total + '-' + mesa.numero}
              initial={{ opacity: 0, y: prefersReduced ? 0 : 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: prefersReduced ? 0 : -8 }}
              transition={{ duration: 0.3, ease }}
              className="text-3xl font-medium tabular-nums"
              style={{ color: '#C8903F' }}
            >
              ${mesa.total.toLocaleString('es-CO')}
            </motion.span>
          </AnimatePresence>
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
      </motion.div>

      {/* Tarjeta flotante: Caja cuadró (arriba derecha) */}
      <motion.div
        initial={{ opacity: 0, y: prefersReduced ? 0 : -12, rotate: prefersReduced ? 0 : 8 }}
        animate={{ opacity: 1, y: 0, rotate: prefersReduced ? 0 : 5 }}
        transition={{ duration: 0.7, delay: 0.4, ease }}
        className="absolute -top-3 -right-2 z-20 rounded-lg shadow-[0_8px_24px_rgba(200,144,63,0.25)]"
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

      {/* Tarjeta flotante: Ventas hoy (abajo izquierda) */}
      <motion.div
        initial={{ opacity: 0, y: prefersReduced ? 0 : 12, rotate: prefersReduced ? 0 : -8 }}
        animate={{ opacity: 1, y: 0, rotate: prefersReduced ? 0 : -5 }}
        transition={{ duration: 0.7, delay: 0.6, ease }}
        className="absolute -bottom-4 -left-3 z-20 rounded-xl shadow-[0_12px_32px_rgba(0,0,0,0.6)]"
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
  );
}
