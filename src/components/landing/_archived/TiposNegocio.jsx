// ARCHIVADO — ver _archived/README.md antes de resucitar
// Removido del landing por diluir el posicionamiento ("para todo tipo" = para nadie).

const TIPOS_NEGOCIO = [
  { emoji: '☕', label: 'Cafeterías',    img: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400' },
  { emoji: '🍽️', label: 'Restaurantes', img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400' },
  { emoji: '🥐', label: 'Panaderías',   img: 'https://images.unsplash.com/photo-1568254183919-78a4f43a2877?w=400' },
  { emoji: '🍺', label: 'Bares',        img: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400' },
  { emoji: '🍔', label: 'Comida rápida',img: 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=400' },
  { emoji: '🍦', label: 'Heladerías',   img: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400' },
  { emoji: '🧃', label: 'Fruterías',    img: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400' },
  { emoji: '🍕', label: 'Pizzerías',    img: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400' },
];

// Requiere: Fade (de Landing.jsx)
export default function TiposNegocio() {
  return (
    <section className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <p className="text-center font-body text-xs uppercase tracking-widest mb-2" style={{ color: '#7A6A58' }}>Para todo tipo de negocio</p>
        <h2 className="text-center mb-3"
          style={{ fontFamily: '"Fraunces", Georgia, serif', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: '#F4ECD8', fontWeight: 700, lineHeight: 1.1 }}>
          Diseñado para <span style={{ fontStyle: 'italic', color: '#C8903F' }}>todo tipo de negocio</span>
        </h2>
        <p className="text-center font-body mb-12 mx-auto" style={{ color: '#7A6A58', maxWidth: 480, lineHeight: 1.6 }}>
          Si vendes comida o bebida en Colombia, mezo funciona para ti.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {TIPOS_NEGOCIO.map((t, i) => (
            <div key={t.label} className="relative h-44 rounded-2xl overflow-hidden border cursor-default group" style={{ borderColor: '#2A2520' }}>
              <img src={t.img} alt={t.label} loading="lazy" decoding="async"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(8,7,6,0.88) 0%, rgba(8,7,6,0.3) 60%, transparent 100%)' }} />
              <div className="absolute bottom-0 left-0 right-0 p-3 flex items-center gap-2">
                <span style={{ fontSize: 18 }}>{t.emoji}</span>
                <span className="font-body font-semibold text-sm" style={{ color: '#F4ECD8' }}>{t.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
