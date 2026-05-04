import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import AuroraGlow from '../components/effects/AuroraGlow';

const ease = [0.22, 1, 0.36, 1];

const VACANTES = [
  {
    titulo: 'Frontend Engineer Senior',
    tipo: 'Tiempo completo',
    ubicacion: 'Bogotá / Remoto Colombia',
    descripcion: 'React, Tailwind, framer-motion. Construirás las vistas que ven los dueños de cafetería todos los días.',
    skills: ['React 19', 'TypeScript', 'Tailwind CSS', 'Diseño centrado en usuario'],
  },
  {
    titulo: 'Backend Engineer',
    tipo: 'Tiempo completo',
    ubicacion: 'Bogotá / Remoto Colombia',
    descripcion: 'Java + Spring Boot. Trabajarás en arqueo, facturación electrónica DIAN, integraciones de pago.',
    skills: ['Java 21', 'Spring Boot', 'PostgreSQL', 'AWS / Render'],
  },
  {
    titulo: 'Customer Success (Bogotá)',
    tipo: 'Tiempo completo',
    ubicacion: 'Bogotá presencial',
    descripcion: 'Visitarás cafeterías, harás onboarding, atenderás soporte. Necesitas conocer el oficio del café.',
    skills: ['Atención al cliente', 'Conocimiento de POS o restaurantes', 'Bogotá'],
  },
];

const S = {
  back: { display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, color: '#7A6A58', textDecoration: 'none', marginBottom: 40, transition: 'color 0.2s' },
};

export default function TrabajaConNosotros() {
  const [formData, setFormData] = useState({ nombre: '', correo: '', posicion: '', linkedin: '', mensaje: '', archivo: null });
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setError('');
    try {
      // TODO: POST /api/careers cuando el backend de Manuel esté vivo
      const aplicaciones = JSON.parse(localStorage.getItem('mezo_aplicaciones') || '[]');
      aplicaciones.push({ ...formData, archivo: formData.archivo?.name || null, fecha: new Date().toISOString() });
      localStorage.setItem('mezo_aplicaciones', JSON.stringify(aplicaciones));
      await new Promise(r => setTimeout(r, 1200));
      setEnviado(true);
    } catch {
      setError('Algo se nos enredó. Intenta otra vez.');
    } finally {
      setEnviando(false);
    }
  };

  if (enviado) {
    return (
      <div style={{ minHeight: '100vh', background: '#080706', color: '#F4ECD8', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease }}
          style={{ textAlign: 'center', maxWidth: 420 }}
        >
          <div style={{ width: 64, height: 64, margin: '0 auto 24px', borderRadius: '50%', background: 'rgba(61,170,104,0.15)', border: '1px solid rgba(61,170,104,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <motion.path
                d="M5 12l5 5 9-9"
                stroke="#3DAA68"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            </svg>
          </div>
          <h2 style={{ fontFamily: '"Fraunces", Georgia, serif', fontStyle: 'italic', fontSize: 32, fontWeight: 700, color: '#F4ECD8', marginBottom: 12 }}>
            ¡Listo!
          </h2>
          <p style={{ fontSize: 15, color: '#9A8A78', marginBottom: 24 }}>
            Recibimos tu aplicación. Te escribimos pronto al correo {formData.correo}.
          </p>
          <Link
            to="/"
            style={{ display: 'inline-block', background: '#C8903F', color: '#080706', padding: '10px 24px', borderRadius: 8, fontWeight: 600, fontSize: 14, textDecoration: 'none', transition: 'background 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#E4B878'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#C8903F'; }}
          >
            Volver al inicio →
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#080706', color: '#F4ECD8' }}>
      <div style={{ maxWidth: 880, margin: '0 auto', padding: '60px 24px 12px' }}>
        <Link to="/" style={S.back}
          onMouseEnter={e => { e.currentTarget.style.color = '#C8903F'; }}
          onMouseLeave={e => { e.currentTarget.style.color = '#7A6A58'; }}>
          ← Volver a mezo
        </Link>
      </div>

      <section className="relative overflow-hidden pb-20 px-6">
        <AuroraGlow variant="top" intensity={0.12} />

        <div className="relative max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
            className="text-center mb-16"
          >
            <span className="text-xs uppercase tracking-widest text-[#C8903F] mb-3 block">Trabaja con nosotros</span>
            <h1
              className="text-4xl md:text-5xl font-medium tracking-tight mb-4 leading-[1.1]"
              style={{ fontFamily: '"Fraunces", Georgia, serif' }}
            >
              Construye con nosotros el{' '}
              <span className="italic text-[#C8903F]">POS de Colombia</span>.
            </h1>
            <p className="text-[#9A8A78] text-lg max-w-2xl mx-auto">
              Equipo pequeño, decisiones rápidas, impacto real. Si te entusiasma resolver problemas reales para dueños de cafetería, escríbenos.
            </p>
          </motion.div>

          {/* Vacantes */}
          <div className="mb-16">
            <h2 className="text-2xl font-medium mb-6">Vacantes abiertas</h2>
            <div className="space-y-3">
              {VACANTES.map((v, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * i, ease }}
                  className="rounded-xl p-5 transition-colors"
                  style={{ background: '#141210', border: '1px solid rgba(244,236,216,0.08)' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(200,144,63,0.3)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(244,236,216,0.08)'; }}
                >
                  <div className="flex flex-wrap justify-between items-start gap-3 mb-2">
                    <h3 className="text-lg font-medium">{v.titulo}</h3>
                    <div className="flex gap-2 text-xs flex-wrap">
                      <span className="px-2.5 py-1 rounded-full" style={{ background: 'rgba(200,144,63,0.1)', color: '#E4B878', border: '1px solid rgba(200,144,63,0.2)' }}>
                        {v.tipo}
                      </span>
                      <span className="px-2.5 py-1 rounded-full" style={{ background: 'rgba(244,236,216,0.04)', color: '#9A8A78' }}>
                        {v.ubicacion}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-[#9A8A78] mb-3">{v.descripcion}</p>
                  <div className="flex flex-wrap gap-2">
                    {v.skills.map((s, si) => (
                      <span key={si} className="text-xs px-2 py-1 rounded" style={{ color: '#7A6A58', background: 'rgba(244,236,216,0.03)' }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Formulario */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease }}
            className="rounded-2xl p-8"
            style={{ background: '#141210', border: '1px solid rgba(244,236,216,0.08)' }}
          >
            <h2 className="text-2xl font-medium mb-2">Aplica</h2>
            <p className="text-sm text-[#9A8A78] mb-6">
              ¿No ves tu rol? Escríbenos igual. Estamos creciendo y nos interesa conocer gente buena.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Nombre completo" type="text" value={formData.nombre}
                  onChange={v => setFormData({ ...formData, nombre: v })} required />
                <FormField label="Correo" type="email" value={formData.correo}
                  onChange={v => setFormData({ ...formData, correo: v })} required />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9A8A78', marginBottom: 8 }}>
                  Posición de interés *
                </label>
                <select
                  value={formData.posicion}
                  onChange={e => setFormData({ ...formData, posicion: e.target.value })}
                  required
                  style={{ width: '100%', background: '#080706', border: '1px solid rgba(244,236,216,0.1)', borderRadius: 8, padding: '12px 16px', color: '#F4ECD8', fontSize: 14, outline: 'none', cursor: 'pointer' }}
                  onFocus={e => { e.currentTarget.style.borderColor = '#C8903F'; }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'rgba(244,236,216,0.1)'; }}
                >
                  <option value="">Selecciona una posición</option>
                  {VACANTES.map((v, i) => (
                    <option key={i} value={v.titulo}>{v.titulo}</option>
                  ))}
                  <option value="otra">Otra (cuéntame en el mensaje)</option>
                </select>
              </div>

              <FormField label="LinkedIn (opcional)" type="url" value={formData.linkedin}
                onChange={v => setFormData({ ...formData, linkedin: v })}
                placeholder="https://linkedin.com/in/..." />

              <div>
                <label style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9A8A78', marginBottom: 8 }}>
                  ¿Por qué quieres trabajar en mezo? *
                </label>
                <textarea
                  value={formData.mensaje}
                  onChange={e => setFormData({ ...formData, mensaje: e.target.value })}
                  required
                  rows={5}
                  placeholder="Cuéntanos qué te entusiasma de mezo y qué traes a la mesa."
                  style={{ width: '100%', background: '#080706', border: '1px solid rgba(244,236,216,0.1)', borderRadius: 8, padding: '12px 16px', color: '#F4ECD8', fontSize: 14, outline: 'none', resize: 'none', boxSizing: 'border-box' }}
                  onFocus={e => { e.currentTarget.style.borderColor = '#C8903F'; }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'rgba(244,236,216,0.1)'; }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9A8A78', marginBottom: 8 }}>
                  CV (PDF, opcional)
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={e => setFormData({ ...formData, archivo: e.target.files[0] })}
                  className="block w-full text-sm text-[#9A8A78] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#C8903F]/10 file:text-[#E4B878] hover:file:bg-[#C8903F]/20 file:cursor-pointer cursor-pointer"
                />
              </div>

              {error && (
                <div style={{ fontSize: 14, color: '#E89D87', background: 'rgba(200,87,63,0.1)', border: '1px solid rgba(200,87,63,0.3)', borderRadius: 8, padding: '12px 16px' }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={enviando}
                style={{ width: '100%', background: enviando ? 'rgba(200,144,63,0.5)' : '#C8903F', color: '#080706', padding: '12px', borderRadius: 8, fontWeight: 700, fontSize: 14, border: 'none', cursor: enviando ? 'not-allowed' : 'pointer', transition: 'background 0.2s' }}
                onMouseEnter={e => { if (!enviando) e.currentTarget.style.background = '#E4B878'; }}
                onMouseLeave={e => { if (!enviando) e.currentTarget.style.background = '#C8903F'; }}
              >
                {enviando ? 'Enviando…' : 'Enviar aplicación →'}
              </button>
            </form>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

function FormField({ label, type, value, onChange, required, placeholder }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9A8A78', marginBottom: 8 }}>
        {label}{required && ' *'}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        style={{ width: '100%', background: '#080706', border: '1px solid rgba(244,236,216,0.1)', borderRadius: 8, padding: '12px 16px', color: '#F4ECD8', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
        onFocus={e => { e.currentTarget.style.borderColor = '#C8903F'; e.currentTarget.style.boxShadow = '0 0 0 2px rgba(200,144,63,0.2)'; }}
        onBlur={e => { e.currentTarget.style.borderColor = 'rgba(244,236,216,0.1)'; e.currentTarget.style.boxShadow = 'none'; }}
      />
    </div>
  );
}
