import { useEffect, useRef } from 'react';

/**
 * BorderBeam — punto de luz dorado que recorre el borde del card.
 * Técnica: rAF actualiza el ángulo del conic-gradient cada frame.
 * El mask content-box/xor limita la visibilidad al strip del borde.
 * Compatible con todos los navegadores modernos sin @property.
 *
 * REQUIERE que el padre tenga: position:relative
 */
export default function BorderBeam({
  duration = 6,
  colorFrom = '#C8903F',
  colorTo = '#E4B878',
  borderWidth = 1.5,
}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const durationMs = duration * 1000;
    const start = performance.now();
    let raf;

    const update = (now) => {
      const angle = ((now - start) / durationMs * 360) % 360;
      el.style.background = `conic-gradient(from ${angle.toFixed(1)}deg, transparent 0deg 310deg, ${colorFrom} 335deg, ${colorTo} 348deg, ${colorFrom} 360deg)`;
      raf = requestAnimationFrame(update);
    };

    raf = requestAnimationFrame(update);
    return () => cancelAnimationFrame(raf);
  }, [duration, colorFrom, colorTo]);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 rounded-[inherit]"
      style={{
        padding: `${borderWidth}px`,
        background: `conic-gradient(from 0deg, transparent 0deg 310deg, ${colorFrom} 335deg, ${colorTo} 348deg, ${colorFrom} 360deg)`,
        WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
        WebkitMaskComposite: 'xor',
        maskComposite: 'exclude',
      }}
    />
  );
}
