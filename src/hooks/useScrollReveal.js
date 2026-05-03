// Hook para animaciones on-scroll con framer-motion.
// Devuelve `ref` (para asignar al elemento) e `inView` (booleano).
// Se dispara una sola vez cuando el elemento entra al viewport.
import { useRef } from 'react';
import { useInView } from 'framer-motion';

export function useScrollReveal({ margin = '-80px', once = true } = {}) {
  const ref    = useRef(null);
  const inView = useInView(ref, { margin, once });
  return { ref, inView };
}

// Variantes estándar para motion.div — úsalas con el easing mezo.
const easeMezo = [0.22, 1, 0.36, 1];

export const fadeUp = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeMezo } },
};

export const fadeIn = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.55, ease: easeMezo } },
};

// Genera variantes con stagger para listas de elementos.
// Uso: <motion.ul variants={staggerContainer(0.08)}> + <motion.li variants={fadeUp}>
export function staggerContainer(stagger = 0.08, delayChildren = 0) {
  return {
    hidden:  {},
    visible: { transition: { staggerChildren: stagger, delayChildren } },
  };
}
