import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const ease = [0.22, 1, 0.36, 1];

const S = {
  logo: { fontFamily: '"Fraunces", Georgia, serif', fontStyle: 'italic', fontSize: 28, color: '#C8903F', fontWeight: 700 },
  back: { display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, color: '#7A6A58', textDecoration: 'none', marginBottom: 40, transition: 'color 0.2s' },
};

const CATEGORIAS = [
  {
    titulo: 'Empezar con mezo',
    preguntas: [
      { q: '¿Cómo creo mi cuenta?', a: 'En el landing, click en "Probar gratis". Llena el formulario, verifica tu correo y completa el onboarding. En menos de 5 minutos ya estás cobrando.' },
      { q: '¿Cuánto cuesta?', a: 'Tenemos 3 planes: Semilla a $39.900/mes, Pro a $99.900/mes, y Élite a $249.900/mes. Todos incluyen 30 días gratis.' },
      { q: '¿Necesito tarjeta de crédito para empezar?', a: 'No. Pagas cuando ya estás cobrando, no antes. Cancela cuando quieras.' },
    ],
  },
  {
    titulo: 'Cobros y pagos',
    preguntas: [
      { q: '¿Qué métodos de pago acepta?', a: 'Efectivo, tarjetas de crédito y débito, Nequi, Daviplata, transferencias PSE y Bancolombia.' },
      { q: '¿Funciona con factura electrónica DIAN?', a: 'Sí. Emitimos factura electrónica con CUFE válido y reporte automático a la DIAN.' },
      { q: '¿Qué pasa si se cae internet?', a: 'mezo sigue funcionando offline. Cuando vuelva la conexión, todas las ventas se sincronizan automáticamente.' },
    ],
  },
  {
    titulo: 'Equipo y empleados',
    preguntas: [
      { q: '¿Puedo agregar a mis meseros y baristas?', a: 'Sí. Cada empleado tiene su propio usuario con permisos según su rol (mesero, barista, cajero, administrador).' },
      { q: '¿Cómo controlo lo que hace cada uno?', a: 'Cada acción queda registrada con el usuario que la hizo. Puedes ver reportes por empleado en cualquier momento.' },
    ],
  },
  {
    titulo: 'Soporte',
    preguntas: [
      { q: '¿Cómo me contacto con soporte?', a: 'Por WhatsApp al botón verde flotante en cualquier página, o al correo hola@mezo.co. Respondemos en horario Bogotá.' },
      { q: '¿Hay capacitación?', a: 'Sí. En el plan Élite incluimos onboarding personalizado de 1 hora. En Pro y Semilla, te ayudamos por WhatsApp.' },
    ],
  },
];

export default function CentroAyuda() {
  const [openId, setOpenId] = useState(null);

  return (
    <div style={{ minHeight: '100vh', background: '#080706', color: '#F4ECD8' }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '60px 24px 80px' }}>
        <Link to="/" style={S.back}
          onMouseEnter={e => { e.currentTarget.style.color = '#C8903F'; }}
          onMouseLeave={e => { e.currentTarget.style.color = '#7A6A58'; }}>
          ← Volver a mezo
        </Link>

        <div style={S.logo}>mezo</div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          style={{ marginBottom: 48, marginTop: 16 }}
        >
          <span style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#C8903F', marginBottom: 12 }}>
            Centro de ayuda
          </span>
          <h1 style={{ fontFamily: '"Fraunces", Georgia, serif', fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 700, color: '#F4ECD8', lineHeight: 1.1, marginBottom: 12 }}>
            ¿En qué te{' '}
            <span style={{ fontStyle: 'italic', color: '#C8903F' }}>ayudamos</span>?
          </h1>
          <p style={{ fontSize: 16, color: '#9A8A78' }}>Respuestas rápidas a las preguntas más comunes.</p>
        </motion.div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {CATEGORIAS.map((cat, ci) => (
            <motion.div
              key={ci}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.08 * ci, ease }}
            >
              <h2 style={{ fontSize: 18, fontWeight: 600, color: '#E4B878', marginBottom: 12 }}>{cat.titulo}</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {cat.preguntas.map((p, pi) => {
                  const id = `${ci}-${pi}`;
                  const isOpen = openId === id;
                  return (
                    <div
                      key={id}
                      style={{ background: '#141210', border: '1px solid rgba(244,236,216,0.08)', borderRadius: 12, overflow: 'hidden' }}
                    >
                      <button
                        onClick={() => setOpenId(isOpen ? null : id)}
                        style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', color: '#F4ECD8' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(244,236,216,0.02)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
                      >
                        <span style={{ fontSize: 14, fontWeight: 500 }}>{p.q}</span>
                        <motion.svg
                          width="16" height="16" viewBox="0 0 16 16"
                          animate={{ rotate: isOpen ? 180 : 0 }}
                          transition={{ duration: 0.3, ease }}
                          style={{ flexShrink: 0, marginLeft: 12 }}
                        >
                          <path d="M4 6l4 4 4-4" stroke="#C8903F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                        </motion.svg>
                      </button>
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease }}
                            style={{ overflow: 'hidden' }}
                          >
                            <div style={{ padding: '0 16px 14px', fontSize: 14, color: '#9A8A78', lineHeight: 1.7 }}>
                              {p.a}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5, ease }}
          style={{ marginTop: 56, textAlign: 'center', background: '#141210', border: '1px solid rgba(200,144,63,0.2)', borderRadius: 20, padding: '32px 24px' }}
        >
          <h3 style={{ fontSize: 20, fontWeight: 600, color: '#F4ECD8', marginBottom: 8 }}>¿No encuentras lo que buscas?</h3>
          <p style={{ fontSize: 14, color: '#9A8A78', marginBottom: 20 }}>Escríbenos por WhatsApp y te respondemos en minutos.</p>
          <a
            href="https://wa.me/573000000000"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'inline-block', background: '#25D366', color: '#fff', padding: '10px 24px', borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: 'none', transition: 'background 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#20BA56'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#25D366'; }}
          >
            Escribir por WhatsApp →
          </a>
        </motion.div>
      </div>
    </div>
  );
}
