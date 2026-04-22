// Wordmark de mezo — Fraunces italic, tracking apretado, sin serifs visibles a escala pequeña.
export default function MezoWordmark({ height = 32, color = '#C8903F' }) {
  return (
    <span
      style={{
        fontFamily: '"Fraunces", "Playfair Display", Georgia, serif',
        fontWeight: 500,
        fontSize: height,
        letterSpacing: '-0.045em',
        color,
        lineHeight: 1,
        fontVariationSettings: '"SOFT" 100, "opsz" 72',
        display: 'inline-block',
        fontStyle: 'italic',
        userSelect: 'none',
      }}
    >
      mezo
    </span>
  );
}
