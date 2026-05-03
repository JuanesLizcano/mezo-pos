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
    ],
    total: 12500,
    hora: '3:42 p.m.',
  },
  {
    numero: 7,
    items: [
      { nombre: '1× Capuccino',   precio: 7500 },
      { nombre: '2× Pan de bono', precio: 5000 },
    ],
    total: 12500,
    hora: '3:44 p.m.',
  },
  {
    numero: 2,
    items: [
      { nombre: '3× Americano',    precio: 9000 },
      { nombre: '1× Tostada',      precio: 6500 },
      { nombre: '2× Jugo natural', precio: 8000 },
    ],
    total: 23500,
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
    <div className="relative py-10 px-4">
      {/* Card principal */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease }}
        className="relative rounded-2xl border p-5 shadow-[0_30px_60px_rgba(0,0,0,0.5)]"
        style={{ background: '#141210', borderColor: 'rgba(244,236,216,0.10)' }}
      >
        <BorderBeam duration={8} />

        {/* Header */}
        <div className="flex justify-between items-center mb-4 pb-3"
          style={{ borderBottom: '1px solid rgba(244,236,216,0.08)' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={mesa.numero}
              initial={{ opacity: 0, x: prefersReduced ? 0 : 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: prefersReduced ? 0 : -8 }}
              transition={{ duration: 0.3, ease }}
              className="flex items-center gap-2"
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#3DAA68] opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#3DAA68]" />
              </span>
              <span className="text-sm font-medium" style={{ color: '#F4ECD8' }}>
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
              visible:  { opacity: 1, transition: { staggerChildren: prefersReduced ? 0 : 0.08 } },
              exit:     { opacity: 0 },
            }}
            className="space-y-2"
          >
            {mesa.items.map((item, i) => (
              <motion.div
                key={`${mesa.numero}-${i}`}
                variants={{
                  hidden:   { opacity: 0, x: prefersReduced ? 0 : 8 },
                  visible:  { opacity: 1, x: 0, transition: { duration: 0.4, ease } },
                  exit:     { opacity: 0, x: prefersReduced ? 0 : -8 },
                }}
                className="flex justify-between text-sm"
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
        <div className="mt-4 pt-3 flex justify-between items-baseline"
          style={{ borderTop: '1px solid rgba(244,236,216,0.08)' }}>
          <span className="text-xs uppercase tracking-wider" style={{ color: '#7A6A58' }}>Total</span>
          <AnimatePresence mode="wait">
            <motion.span
              key={mesa.total + '-' + mesa.numero}
              initial={{ opacity: 0, y: prefersReduced ? 0 : 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: prefersReduced ? 0 : -8 }}
              transition={{ duration: 0.3, ease }}
              className="text-2xl font-medium tabular-nums"
              style={{ color: '#C8903F' }}
            >
              ${mesa.total.toLocaleString('es-CO')}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* Métodos de pago */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="py-2 rounded-md text-center text-xs font-medium"
            style={{ background: 'rgba(61,170,104,0.15)', color: '#3DAA68' }}>
            Efectivo
          </div>
          <div className="py-2 rounded-md text-center text-xs"
            style={{ background: 'rgba(244,236,216,0.04)', color: '#9A8A78' }}>
            Tarjeta
          </div>
          <div className="py-2 rounded-md text-center text-xs"
            style={{ background: 'rgba(244,236,216,0.04)', color: '#9A8A78' }}>
            Nequi
          </div>
        </div>
      </motion.div>

      {/* Tarjeta flotante: Caja cuadró (arriba derecha) */}
      <motion.div
        initial={{ opacity: 0, y: prefersReduced ? 0 : -12, rotate: prefersReduced ? 0 : 8 }}
        animate={{ opacity: 1, y: 0, rotate: prefersReduced ? 0 : 4 }}
        transition={{ duration: 0.7, delay: 0.3, ease }}
        className="absolute top-4 -right-2 rounded-lg px-3 py-2 shadow-[0_10px_30px_rgba(200,144,63,0.15)]"
        style={{
          background: '#141210',
          border: '1px solid rgba(200,144,63,0.40)',
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
        animate={{ opacity: 1, y: 0, rotate: prefersReduced ? 0 : -3 }}
        transition={{ duration: 0.7, delay: 0.5, ease }}
        className="absolute bottom-2 -left-2 rounded-xl px-4 py-3"
        style={{
          background: '#141210',
          border: '1px solid rgba(244,236,216,0.10)',
        }}
      >
        <div className="text-[10px] uppercase tracking-widest mb-1" style={{ color: '#7A6A58' }}>
          Ventas hoy
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-medium tabular-nums" style={{ color: '#F4ECD8' }}>
            $<AnimatedNumber value={487500} />
          </span>
          <svg width="9" height="9" viewBox="0 0 10 10" aria-hidden>
            <path d="M5 1L8 5H2L5 1Z" fill="#3DAA68" />
          </svg>
          <span className="text-xs tabular-nums" style={{ color: '#3DAA68' }}>+18%</span>
        </div>
      </motion.div>
    </div>
  );
}
