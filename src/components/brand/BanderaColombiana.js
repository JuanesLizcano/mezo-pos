// Cinta tricolor colombiana — ribbon en esquina superior derecha
export default function BanderaColombiana() {
  return (
    <svg
      width="120" height="120"
      viewBox="0 0 120 120"
      className="absolute top-0 right-0 pointer-events-none select-none"
      style={{ filter: 'drop-shadow(0 3px 8px rgba(0,0,0,0.4))' }}
      aria-hidden="true"
    >
      {/* Franja amarilla — mitad de la bandera colombiana */}
      <path
        d="M60,0 Q90,20 120,30 L120,50 Q90,40 60,20 Z"
        fill="#FCD116" opacity="0.85"
      />
      {/* Franja azul */}
      <path
        d="M60,20 Q90,40 120,50 L120,65 Q90,55 60,35 Z"
        fill="#003893" opacity="0.85"
      />
      {/* Franja roja */}
      <path
        d="M60,35 Q90,55 120,65 L120,80 Q90,70 60,50 Z"
        fill="#CE1126" opacity="0.85"
      />
    </svg>
  );
}
