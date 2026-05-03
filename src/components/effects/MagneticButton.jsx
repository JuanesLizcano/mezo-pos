import { useRef, useState } from 'react';
import { motion } from 'framer-motion';

/**
 * Botón con efecto magnético: el elemento sigue levemente al cursor en hover.
 * Respeta prefers-reduced-motion desactivando el offset.
 * Prop `as` permite renderizar como <a>, <button>, <Link>, etc.
 */
export default function MagneticButton({
  as: Tag       = 'button',
  children,
  strength      = 0.35,
  className     = '',
  style         = {},
  ...props
}) {
  const ref      = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const reduced  = typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function handleMouseMove(e) {
    if (reduced || !ref.current) return;
    const rect   = ref.current.getBoundingClientRect();
    const cx     = rect.left + rect.width  / 2;
    const cy     = rect.top  + rect.height / 2;
    setPos({
      x: (e.clientX - cx) * strength,
      y: (e.clientY - cy) * strength,
    });
  }

  function handleMouseLeave() {
    setPos({ x: 0, y: 0 });
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: 'spring', stiffness: 200, damping: 18, mass: 0.5 }}
      style={{ display: 'inline-block' }}
    >
      <Tag className={className} style={style} {...props}>
        {children}
      </Tag>
    </motion.div>
  );
}
