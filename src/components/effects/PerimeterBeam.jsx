import { useId } from 'react';

/**
 * Highlight dorado que recorre el perímetro completo del card.
 * CSS puro con @property animando un ángulo en conic-gradient.
 *
 * Compatible: Chrome 85+, Edge 85+, Safari 16.4+, Firefox 128+.
 * Requiere que el padre tenga: position: relative
 * NO requiere overflow: hidden.
 */
export default function PerimeterBeam({
  duration = 5,
  colorFrom = '#C8903F',
  colorTo = '#E4B878',
  borderRadius = '16px',
  thickness = 1.5,
}) {
  const rawId = useId();
  const id = rawId.replace(/[^a-zA-Z0-9]/g, '');
  const angleVar = `--mz-angle-${id}`;
  const animName = `mz-perimeter-spin-${id}`;

  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        borderRadius,
        padding: `${thickness}px`,
        pointerEvents: 'none',
        background: `conic-gradient(from var(${angleVar}, 0deg), transparent 0deg 320deg, ${colorFrom} 340deg, ${colorTo} 350deg, ${colorFrom} 360deg)`,
        WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
        WebkitMaskComposite: 'xor',
        maskComposite: 'exclude',
        animation: `${animName} ${duration}s linear infinite`,
      }}
    >
      <style>{`
        @property ${angleVar} {
          syntax: '<angle>';
          initial-value: 0deg;
          inherits: false;
        }
        @keyframes ${animName} {
          to { ${angleVar}: 360deg; }
        }
        @media (prefers-reduced-motion: reduce) {
          [aria-hidden] { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
