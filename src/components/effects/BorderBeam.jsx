import { motion } from 'framer-motion';

/**
 * Glow sutil que respira en el borde del card.
 * Reemplaza la versión anterior que usaba offsetPath (triángulo girando roto).
 */
export default function BorderBeam() {
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute inset-0 rounded-[inherit]"
      style={{ boxShadow: '0 0 0 1px rgba(200,144,63,0.15) inset' }}
      animate={{
        boxShadow: [
          '0 0 0 1px rgba(200,144,63,0.15) inset',
          '0 0 0 1px rgba(200,144,63,0.45) inset',
          '0 0 0 1px rgba(200,144,63,0.15) inset',
        ],
      }}
      transition={{ duration: 4, repeat: Infinity, ease: [0.22, 1, 0.36, 1] }}
    />
  );
}
