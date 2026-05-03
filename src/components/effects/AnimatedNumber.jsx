import { useEffect, useRef, useState } from 'react';

/**
 * Contador que anima de 0 al valor objetivo cuando entra al viewport.
 * Respeta prefers-reduced-motion: salta directo al valor final.
 */
export default function AnimatedNumber({
  value,
  duration  = 1500,
  formatter = (n) => n.toLocaleString('es-CO'),
}) {
  const [current, setCurrent] = useState(0);
  const ref     = useRef(null);
  const reduced = useRef(
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    if (reduced.current) {
      setCurrent(value);
      return;
    }

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        let start = null;
        const step = (ts) => {
          if (!start) start = ts;
          const progress = Math.min((ts - start) / duration, 1);
          const eased    = 1 - Math.pow(2, -10 * progress); // ease-out-expo
          setCurrent(Math.round(value * eased));
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        obs.disconnect();
      },
      { threshold: 0.5 }
    );

    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [value, duration]);

  return <span ref={ref}>{formatter(current)}</span>;
}
