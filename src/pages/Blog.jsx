import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import AuroraGlow from '../components/effects/AuroraGlow';

const ease = [0.22, 1, 0.36, 1];

export default function Blog() {
  const [correo, setCorreo] = useState('');
  const [suscrito, setSuscrito] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const handleSuscribir = async (e) => {
    e.preventDefault();
    if (!correo) return;
    setEnviando(true);
    // TODO: Resend o Mailchimp cuando el equipo defina la herramienta
    const subs = JSON.parse(localStorage.getItem('mezo_blog_subs') || '[]');
    if (!subs.includes(correo)) {
      subs.push(correo);
      localStorage.setItem('mezo_blog_subs', JSON.stringify(subs));
    }
    await new Promise(r => setTimeout(r, 900));
    setEnviando(false);
    setSuscrito(true);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#080706', color: '#F4ECD8' }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '60px 24px 12px' }}>
        <Link
          to="/"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, color: '#7A6A58', textDecoration: 'none', marginBottom: 40, transition: 'color 0.2s' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#C8903F'; }}
          onMouseLeave={e => { e.currentTarget.style.color = '#7A6A58'; }}
        >
          ← Volver a mezo
        </Link>
      </div>

      <section className="relative overflow-hidden pb-24 px-6">
        <AuroraGlow variant="top" intensity={0.12} />

        <div className="relative max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
            className="text-center mb-16"
          >
            <span className="text-xs uppercase tracking-widest text-[#C8903F] mb-3 block">Blog</span>
            <h1
              className="text-4xl md:text-5xl font-medium tracking-tight mb-4 leading-[1.1]"
              style={{ fontFamily: '"Fraunces", Georgia, serif' }}
            >
              Historias desde{' '}
              <span className="italic text-[#C8903F]">el mostrador</span>.
            </h1>
            <p className="text-[#9A8A78] text-lg max-w-xl mx-auto">
              Consejos de negocio, novedades de mezo y lo que aprendemos construyendo el POS de Colombia. Próximamente.
            </p>
          </motion.div>

          {/* Placeholder visual */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16"
          >
            {ARTICULOS_PROXIMOS.map((art, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * i + 0.2, ease }}
                className="rounded-xl p-5"
                style={{ background: '#141210', border: '1px solid rgba(244,236,216,0.08)' }}
              >
                <div
                  className="w-full h-32 rounded-lg mb-4 flex items-center justify-center"
                  style={{ background: art.color }}
                >
                  <span style={{ fontSize: 36 }}>{art.emoji}</span>
                </div>
                <span className="text-xs uppercase tracking-widest mb-2 block" style={{ color: '#C8903F' }}>
                  {art.categoria}
                </span>
                <h3 className="text-base font-medium text-[#F4ECD8] mb-2 leading-snug">{art.titulo}</h3>
                <p className="text-sm text-[#9A8A78]">{art.descripcion}</p>
                <div className="mt-4 inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(244,236,216,0.05)', color: '#7A6A58' }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                  Próximamente
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Suscripción */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45, ease }}
            className="rounded-2xl p-8 text-center"
            style={{ background: '#141210', border: '1px solid rgba(244,236,216,0.08)' }}
          >
            {suscrito ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease }}
              >
                <div style={{ width: 48, height: 48, margin: '0 auto 16px', borderRadius: '50%', background: 'rgba(61,170,104,0.15)', border: '1px solid rgba(61,170,104,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <motion.path
                      d="M5 12l5 5 9-9"
                      stroke="#3DAA68"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                  </svg>
                </div>
                <p className="font-medium text-[#F4ECD8] mb-1">¡Listo, te avisamos!</p>
                <p className="text-sm text-[#9A8A78]">Cuando publiquemos el primer artículo, llega directo a {correo}.</p>
              </motion.div>
            ) : (
              <>
                <h2 className="text-xl font-medium mb-2" style={{ fontFamily: '"Fraunces", Georgia, serif' }}>
                  Sé el primero en leerlo.
                </h2>
                <p className="text-sm text-[#9A8A78] mb-6">
                  Deja tu correo y te avisamos cuando publiquemos. Sin spam.
                </p>
                <form onSubmit={handleSuscribir} className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto">
                  <input
                    type="email"
                    value={correo}
                    onChange={e => setCorreo(e.target.value)}
                    required
                    placeholder="tu@correo.com"
                    style={{ flex: 1, background: '#080706', border: '1px solid rgba(244,236,216,0.1)', borderRadius: 8, padding: '10px 14px', color: '#F4ECD8', fontSize: 14, outline: 'none' }}
                    onFocus={e => { e.currentTarget.style.borderColor = '#C8903F'; e.currentTarget.style.boxShadow = '0 0 0 2px rgba(200,144,63,0.2)'; }}
                    onBlur={e => { e.currentTarget.style.borderColor = 'rgba(244,236,216,0.1)'; e.currentTarget.style.boxShadow = 'none'; }}
                  />
                  <button
                    type="submit"
                    disabled={enviando}
                    style={{ background: enviando ? 'rgba(200,144,63,0.5)' : '#C8903F', color: '#080706', padding: '10px 20px', borderRadius: 8, fontWeight: 700, fontSize: 14, border: 'none', cursor: enviando ? 'not-allowed' : 'pointer', transition: 'background 0.2s', whiteSpace: 'nowrap' }}
                    onMouseEnter={e => { if (!enviando) e.currentTarget.style.background = '#E4B878'; }}
                    onMouseLeave={e => { if (!enviando) e.currentTarget.style.background = '#C8903F'; }}
                  >
                    {enviando ? 'Guardando…' : 'Avisar →'}
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
}

const ARTICULOS_PROXIMOS = [
  {
    titulo: 'Cómo cerrar el día sin perder ni un peso: guía de arqueo para cafeterías',
    descripcion: 'La diferencia entre el efectivo real y el sistema suele estar en un paso que muchos se saltan.',
    categoria: 'Operaciones',
    emoji: '🧾',
    color: 'rgba(200,144,63,0.08)',
  },
  {
    titulo: 'Por qué tu cafetería no necesita un POS complicado',
    descripcion: 'Velocidad sobre funcionalidades. Lo que aprendimos hablando con 20 dueños de cafetería en Bogotá.',
    categoria: 'Producto',
    emoji: '☕',
    color: 'rgba(200,144,63,0.08)',
  },
  {
    titulo: 'Facturación electrónica DIAN en 2026: lo que sí necesitas saber',
    descripcion: 'Sin tecnicismos. Lo mínimo para cumplir y no perder tiempo en lo que no importa.',
    categoria: 'Legal',
    emoji: '📋',
    color: 'rgba(244,236,216,0.03)',
  },
  {
    titulo: 'Tres Orquídeas: construir con el primer cliente, no para él',
    descripcion: 'La historia de cómo Sofía Pulido co-fundó mezo desde el otro lado del mostrador.',
    categoria: 'Historia',
    emoji: '🌸',
    color: 'rgba(244,236,216,0.03)',
  },
];
