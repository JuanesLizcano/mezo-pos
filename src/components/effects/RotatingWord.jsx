// Rota entre varias palabras con transición premium usando framer-motion.
// Úsalo inline dentro de un titular para destacar la palabra clave.
import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const easeMezo = [0.22, 1, 0.36, 1];

export default function RotatingWord({ words, interval = 3200, className = '' }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIndex(i => (i + 1) % words.length), interval);
    return () => clearInterval(t);
  }, [words.length, interval]);

  return (
    <span
      className={`relative inline-block align-bottom ${className}`}
      style={{ overflow: 'hidden', verticalAlign: 'bottom' }}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          initial={{ opacity: 0, y: '60%' }}
          animate={{ opacity: 1, y: '0%' }}
          exit={{ opacity: 0, y: '-60%' }}
          transition={{ duration: 0.52, ease: easeMezo }}
          className="inline-block"
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
