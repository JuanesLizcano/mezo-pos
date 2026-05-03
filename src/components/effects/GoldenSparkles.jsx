import { useEffect, useState } from 'react';

/**
 * Punto dorado individual que aparece en posición aleatoria, brilla y desaparece.
 * Patrón async/await + flag mounted (React 19 compatible).
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
        const newX = Math.random() * 100;
        const newY = Math.random() * 100;
        const newSize = 1.5 + Math.random() * 2;

        if (!mounted) return;
        setPos({ x: newX, y: newY });
        setSize(newSize);
        setOpacity(0);

        await sleep(50);
        if (!mounted) return;
        setOpacity(0.6 + Math.random() * 0.3);

        await sleep(2000 + Math.random() * 2000);
        if (!mounted) return;
        setOpacity(0);

        await sleep(800 + Math.random() * 1200);
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
        boxShadow: `0 0 ${size * 3}px rgba(200,144,63,0.6)`,
        transition: 'opacity 1.2s ease-in-out',
        pointerEvents: 'none',
      }}
    />
  );
}

export default function GoldenSparkles({ count = 12 }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <Sparkle key={i} delay={i * 400} />
      ))}
    </div>
  );
}
