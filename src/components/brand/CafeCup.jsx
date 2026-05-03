export default function CafeCup({ size = 48, color = '#C8903F', opacity = 1 }) {
  return (
    <svg
      width={size} height={size}
      viewBox="0 0 64 64" fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ opacity, display: 'inline-block' }}
      aria-hidden="true"
    >
      {/* Vapor — tres líneas onduladas */}
      <path d="M22 15 Q24 11 22 7"  stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M32 13 Q34 9  32 5"  stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M42 15 Q44 11 42 7"  stroke={color} strokeWidth="1.6" strokeLinecap="round" />

      {/* Taza */}
      <path d="M11 22 L53 22 L47 50 H17 Z"
        stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />

      {/* Asa */}
      <path d="M53 28 C60 28 60 42 53 42"
        stroke={color} strokeWidth="2.2" strokeLinecap="round" />

      {/* Plato */}
      <path d="M6 54 Q32 58 58 54"
        stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
