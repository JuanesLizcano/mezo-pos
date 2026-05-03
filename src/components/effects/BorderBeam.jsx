import { useId } from 'react';

/**
 * BorderBeam — punto de luz dorado que recorre el perímetro del card.
 * Técnica: div cuadrado 200% que gira sobre su centro; conic-gradient
 * solo visible en ~40° de arco; el overflow:hidden del padre lo recorta
 * al borde, creando la ilusión de un punto de luz recorriendo el perímetro.
 *
 * REQUIERE que el padre tenga: position:relative + overflow:hidden
 */
export default function BorderBeam({
  duration = 6,
  colorFrom = '#C8903F',
  colorTo = '#E4B878',
}) {
  const id = useId().replace(/:/g, '');

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
    >
      <div
        className={`mezo-beam-${id}`}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '200%',
          aspectRatio: '1',
          background: `conic-gradient(from 0deg, transparent 0deg 320deg, ${colorFrom} 340deg, ${colorTo} 350deg, ${colorFrom} 360deg)`,
          transform: 'translate(-50%, -50%) rotate(0deg)',
          animation: `mezo-spin-${id} ${duration}s linear infinite`,
        }}
      />
      <style>{`
        @keyframes mezo-spin-${id} {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to   { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          .mezo-beam-${id} { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
