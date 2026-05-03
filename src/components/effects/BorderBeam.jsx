import { motion } from 'framer-motion';

/**
 * Línea de luz dorada que recorre el borde de un card.
 * Inspirado en Magic UI border-beam.
 * Max loop 8s para no cansar al usuario.
 */
export default function BorderBeam({
  duration = 6,
  delay    = 0,
  colorFrom = '#C8903F',
  colorTo   = '#E4B878',
}) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden"
      style={{ maskImage: 'linear-gradient(transparent, black, transparent)' }}
    >
      <motion.div
        className="absolute aspect-square"
        style={{
          width: '20%',
          background: `conic-gradient(from 0deg, transparent 0%, ${colorFrom} 25%, ${colorTo} 35%, transparent 40%)`,
          offsetPath: 'rect(0 100% 100% 0 round 14px)',
        }}
        animate={{ offsetDistance: ['0%', '100%'] }}
        transition={{
          duration: Math.min(duration, 8), // max 8s por regla de oro
          delay,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  );
}
