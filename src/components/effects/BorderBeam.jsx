import React from 'react';

/**
 * BorderBeam: punto de luz dorado que recorre el perímetro del contenedor.
 * Usa @property CSS para animar el conic-gradient sin jank.
 * Requiere que el padre tenga position: relative y overflow: hidden (o rounded).
 * Soporte: Chrome 85+, Edge 85+, Safari 16.4+, Firefox 128+.
 */
export default function BorderBeam({
  duration = 7,
  colorFrom = '#C8903F',
  colorTo = '#E4B878',
  borderWidth = 1.5,
}) {
  const id = React.useId().replace(/:/g, '');

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 rounded-[inherit]"
      style={{
        padding: `${borderWidth}px`,
        background: `conic-gradient(from var(--mz-angle-${id}, 0deg), transparent 0%, ${colorFrom} 10%, ${colorTo} 16%, transparent 24%)`,
        WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
        WebkitMaskComposite: 'xor',
        maskComposite: 'exclude',
        animation: `mz-spin-${id} ${duration}s linear infinite`,
      }}
    >
      <style>{`
        @property --mz-angle-${id} {
          syntax: '<angle>';
          initial-value: 0deg;
          inherits: false;
        }
        @keyframes mz-spin-${id} {
          to { --mz-angle-${id}: 360deg; }
        }
        @media (prefers-reduced-motion: reduce) {
          [aria-hidden] { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
