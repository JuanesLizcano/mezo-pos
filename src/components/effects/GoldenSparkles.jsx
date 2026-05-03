import { useEffect, useState } from 'react';

/**
 * Punto dorado individual que aparece en posición aleatoria, brilla y desaparece.
 * Patrón async/await + flag mounted (React 19 compatible).
 * Distribución sesgada hacia los costados para no saturar el centro.
 */
function Sparkle({ delay = 0 }) {
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [opacity, setOpacity] = useState(0);
  const [size, setSize] = useState(2);

  useEffect(() => {
    let mounted = true;
    let timeoutId;

    const sleep = (ms) => new Promise(resolve => {
      timeoutId = setTimeout(resolve, ms);
    });

    const run = async () => {
      await sleep(delay);

      while (mounted) {
        // Distribución sesgada hacia los costados
        let newX;
        const bias = Math.random();
        if (bias < 0.3) {
          newX = 10 + Math.random() * 20; // lado izquierdo
        } else if (bias < 0.6) {
          newX = 70 + Math.random() * 20; // lado derecho
        } else {
          newX = Math.random() * 100;     // cualquier posición
        }

        const newY = Math.random() * 100;
        const newSize = 2 + Math.random() * 2;

        if (!mounted) return;
        setPos({ x: newX, y: newY });
        setSize(newSize);
        setOpacity(0);

        await sleep(50);
        if (!mounted) return;
        setOpacity(0.7 + Math.random() * 0.3);

        await sleep(1500 + Math.random() * 1500);
        if (!mounted) return;
        setOpacity(0);

        await sleep(500 + Math.random() * 1000);
        if (!mounted) return;
      }
    };

    run();

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
    };
  }, [delay]);

  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        left: `${pos.x}%`,
        top: `${pos.y}%`,
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        backgroundColor: '#C8903F',
        opacity,
        boxShadow: `0 0 ${size * 4}px rgba(200,144,63,0.7)`,
        transition: 'opacity 1.2s ease-in-out',
        pointerEvents: 'none',
      }}
    />
  );
}

export default function GoldenSparkles({ count = 24 }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <Sparkle key={i} delay={i * 250} />
      ))}
    </div>
  );
}
