// ARCHIVADO — ver _archived/README.md antes de resucitar
// Removido del landing por falta de fuentes verificables.

const STATS = [
  { value: 59, display: n => `${n}%`,     label: 'de restaurantes en Colombia sin sistema digital' },
  { value: 5,  display: n => `<${n} min`, label: 'para montar tu negocio desde cero' },
  { value: 10, display: n => `<${n}s`,    label: 'por orden en el POS — en hora pico' },
];

// Requiere: useCountUp, useInView, Fade (de Landing.jsx)
export function StatCard({ value, display, label, useCountUp }) {
  const [ref, count] = useCountUp(value, 1800);
  return (
    <div ref={ref} className="text-center">
      <p style={{ fontFamily: '"Fraunces", Georgia, serif', fontSize: 'clamp(2rem, 4vw, 2.8rem)', color: '#C8903F', fontWeight: 700, lineHeight: 1 }}>
        {display(count)}
      </p>
      <p className="font-body text-sm mt-2" style={{ color: '#7A6A58', lineHeight: 1.5 }}>{label}</p>
    </div>
  );
}

export default function StatsSection() {
  return (
    <section className="py-16 px-4 border-t border-b" style={{ background: '#0A0907', borderColor: 'rgba(200,144,63,0.08)' }}>
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
          {STATS.map((s, i) => (
            <StatCard key={i} value={s.value} display={s.display} label={s.label} />
          ))}
        </div>
      </div>
    </section>
  );
}
