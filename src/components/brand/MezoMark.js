// Marca tipográfica de mezo — italic Fraunces "m" con swash underline.
// No usa paths custom para evitar confusión con arcos genéricos.
export default function MezoMark({ size = 40, color = '#C8903F', bg = 'transparent', rounded = true }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" style={{ display: 'block' }}>
      {bg !== 'transparent' && (
        <rect width="120" height="120" fill={bg} rx={rounded ? 22 : 0} />
      )}
      <text
        x="60"
        y="88"
        textAnchor="middle"
        fill={color}
        style={{
          fontFamily: '"Fraunces", Georgia, serif',
          fontWeight: 500,
          fontSize: '108px',
          fontStyle: 'italic',
          letterSpacing: '-0.04em',
          fontVariationSettings: '"SOFT" 100, "opsz" 144',
        }}
      >
        m
      </text>
      {/* Swash underline — floreo que da carácter artesanal */}
      <path
        d="M 38 96 Q 58 104, 82 96"
        stroke={color}
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.9"
      />
    </svg>
  );
}
