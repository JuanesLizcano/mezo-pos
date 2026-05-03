import { motion } from 'framer-motion';

/**
 * Highlight horizontal en el borde superior del card.
 * Recorre el ancho de izquierda a derecha, ciclo de ~4s.
 * Requiere que el padre tenga position:relative y overflow:hidden.
 */
export default function TopHighlight() {
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute top-0 left-0 right-0 h-[2px]"
      style={{
        background: 'linear-gradient(90deg, transparent 0%, #C8903F 30%, #E4B878 50%, #C8903F 70%, transparent 100%)',
      }}
      initial={{ x: '-100%', opacity: 0 }}
      animate={{
        x: ['-100%', '100%'],
        opacity: [0, 1, 1, 0],
      }}
      transition={{
        duration: 2.5,
        times: [0, 0.2, 0.8, 1],
        repeat: Infinity,
        repeatDelay: 1.5,
        ease: 'linear',
      }}
    />
  );
}
