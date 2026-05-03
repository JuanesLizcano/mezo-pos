import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const ease = [0.22, 1, 0.36, 1];

const S = {
  logo: { fontFamily: '"Fraunces", Georgia, serif', fontStyle: 'italic', fontSize: 28, color: '#C8903F', fontWeight: 700 },
  back: { display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, color: '#7A6A58', textDecoration: 'none', marginBottom: 40, transition: 'color 0.2s' },
};

const SISTEMAS = [
  { nombre: 'Aplicación web',                estado: 'operativo', uptime: '99.98%' },
  { nombre: 'API de cobros',                 estado: 'operativo', uptime: '99.95%' },
  { nombre: 'Base de datos',                 estado: 'operativo', uptime: '99.99%' },
  { nombre: 'Facturación electrónica DIAN',  estado: 'operativo', uptime: '99.9%'  },
  { nombre: 'Pagos Wompi',                   estado: 'operativo', uptime: '99.97%' },
  { nombre: 'Notificaciones por correo',     estado: 'operativo', uptime: '99.92%' },
];

const COLOR_ESTADO = {
  operativo: { bg: 'rgba(61,170,104,0.1)', border: 'rgba(61,170,104,0.3)', text: '#3DAA68', dot: '#3DAA68', label: 'Operativo' },
  degradado: { bg: 'rgba(228,184,120,0.1)', border: 'rgba(228,184,120,0.3)', text: '#E4B878', dot: '#E4B878', label: 'Rendimiento degradado' },
  caido:     { bg: 'rgba(200,87,63,0.1)',   border: 'rgba(200,87,63,0.3)',   text: '#E89D87', dot: '#C8573F', label: 'Caído' },
};

export default function EstadoSistema() {
  const todosOperativos = SISTEMAS.every(s => s.estado === 'operativo');

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
          style={{ textAlign: 'center', marginBottom: 48, marginTop: 16 }}
        >
          <span style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#C8903F', marginBottom: 12 }}>
            Estado del sistema
          </span>
          <h1 style={{ fontFamily: '"Fraunces", Georgia, serif', fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 700, color: '#F4ECD8', lineHeight: 1.1, marginBottom: 12 }}>
            Todo{' '}
            <span style={{ fontStyle: 'italic', color: todosOperativos ? '#3DAA68' : '#E4B878' }}>
              {todosOperativos ? 'operativo' : 'con incidentes'}
            </span>.
          </h1>
          <p style={{ fontSize: 16, color: '#9A8A78' }}>
            Monitoreamos mezo en tiempo real. Si algo falla, lo verás aquí.
          </p>
        </motion.div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {SISTEMAS.map((s, i) => {
            const color = COLOR_ESTADO[s.estado];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.05 * i, ease }}
                style={{ background: '#141210', border: '1px solid rgba(244,236,216,0.08)', borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ position: 'relative', display: 'inline-flex', width: 8, height: 8, flexShrink: 0 }}>
                    <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', backgroundColor: color.dot, opacity: 0.75, animation: 'ping 1.5s cubic-bezier(0,0,0.2,1) infinite' }} />
                    <span style={{ position: 'relative', display: 'inline-flex', width: 8, height: 8, borderRadius: '50%', backgroundColor: color.dot }} />
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 500, color: '#F4ECD8' }}>{s.nombre}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                  <span style={{ fontSize: 12, color: '#7A6A58', fontVariantNumeric: 'tabular-nums' }}>{s.uptime} uptime</span>
                  <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 999, background: color.bg, border: `0.5px solid ${color.border}`, color: color.text }}>
                    {color.label}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          style={{ marginTop: 24, fontSize: 12, color: '#7A6A58', textAlign: 'center' }}
        >
          Última actualización: hace unos segundos · Datos actualizados cada 60s
        </motion.p>
      </div>
    </div>
  );
}
