// Lazo tricolor colombiano — decoración sutil para esquina inferior derecha
export default function BanderaColombiana() {
  return (
    <svg
      width="90" height="110"
      viewBox="0 0 90 110"
      className="absolute bottom-0 right-0 pointer-events-none select-none"
      aria-hidden="true"
    >
      <line x1="40" y1="-5" x2="12"  y2="115" stroke="#FCD116" strokeWidth="3.5" strokeLinecap="round" opacity="0.6" />
      <line x1="54" y1="-5" x2="26"  y2="115" stroke="#003893" strokeWidth="3.5" strokeLinecap="round" opacity="0.6" />
      <line x1="68" y1="-5" x2="40"  y2="115" stroke="#CE1126" strokeWidth="3.5" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}
