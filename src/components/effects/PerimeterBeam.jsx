import { motion } from 'framer-motion';

/**
 * Glow dorado respirando en el borde del card.
 *
 * Decisión: después de varios intentos con beams giratorios que se trababan
 * en distintos navegadores, optamos por este efecto estable y premium.
 * Stripe y Linear usan exactamente este patrón en sus cards de hero.
 *
 * Requiere que el padre tenga: position: relative
 */
export default function PerimeterBeam({ borderRadius = '16px' }) {
  return (
    <motion.div
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        borderRadius,
        pointerEvents: 'none',
      }}
      animate={{
        boxShadow: [
          '0 0 0 1px rgba(200,144,63,0.15) inset, 0 0 20px rgba(200,144,63,0.04) inset',
          '0 0 0 1px rgba(200,144,63,0.5) inset, 0 0 35px rgba(200,144,63,0.18) inset',
          '0 0 0 1px rgba(200,144,63,0.15) inset, 0 0 20px rgba(200,144,63,0.04) inset',
        ],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: [0.22, 1, 0.36, 1],
      }}
    />
  );
}
