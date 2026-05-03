// Resplandor de identidad sutil. Solo oro #C8903F a muy baja opacidad.
// No distrae — aporta profundidad y calidez al fondo oscuro.
// variant: 'top' | 'bottom' | 'center' | 'sides'
// intensity: 0–1 (default 0.15)

const GLOWS = {
  top: [
    { top: '-20%', left: '50%', transform: 'translateX(-50%)', width: '80%', height: '50%' },
  ],
  bottom: [
    { bottom: '-20%', left: '50%', transform: 'translateX(-50%)', width: '80%', height: '50%' },
  ],
  center: [
    { top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '70%', height: '70%' },
  ],
  sides: [
    { top: '30%', left: '-10%', width: '40%', height: '60%' },
    { top: '30%', right: '-10%', width: '40%', height: '60%' },
  ],
};

export default function AuroraGlow({ variant = 'top', intensity = 0.15, className = '' }) {
  const spots = GLOWS[variant] ?? GLOWS.top;
  const alpha  = Math.min(Math.max(intensity, 0), 1);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      style={{ zIndex: 0 }}
    >
      {spots.map((style, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            ...style,
            background: `radial-gradient(ellipse at center, rgba(200,144,63,${alpha}) 0%, transparent 70%)`,
            filter: 'blur(60px)',
          }}
        />
      ))}
    </div>
  );
}
