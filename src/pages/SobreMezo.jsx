import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import AuroraGlow from '../components/effects/AuroraGlow';

const ease = [0.22, 1, 0.36, 1];

const S = {
  logo: { fontFamily: '"Fraunces", Georgia, serif', fontStyle: 'italic', fontSize: 28, color: '#C8903F', fontWeight: 700 },
  back: { display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, color: '#7A6A58', textDecoration: 'none', marginBottom: 40, transition: 'color 0.2s' },
};

export default function SobreMezo() {
  return (
    <div style={{ minHeight: '100vh', background: '#080706', color: '#F4ECD8' }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '60px 24px 80px', position: 'relative' }}>
        <AuroraGlow variant="top" intensity={0.12} />

        <Link to="/" style={S.back}
          onMouseEnter={e => { e.currentTarget.style.color = '#C8903F'; }}
          onMouseLeave={e => { e.currentTarget.style.color = '#7A6A58'; }}>
          ← Volver a mezo
        </Link>

        <div style={S.logo}>mezo</div>

        <motion.span
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
          style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#C8903F', marginTop: 12, marginBottom: 16 }}
        >
          Sobre mezo
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease }}
          style={{ fontFamily: '"Fraunces", Georgia, serif', fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 700, color: '#F4ECD8', lineHeight: 1.1, marginBottom: 32 }}
        >
          Construimos el POS que{' '}
          <span style={{ fontStyle: 'italic', color: '#C8903F' }}>nos hubiera gustado tener</span>.
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease }}
          style={{ fontSize: 17, color: '#9A8A78', lineHeight: 1.8 }}
        >
          <p style={{ marginBottom: 20 }}>
            mezo nació en una cafetería de Bogotá. Veíamos cuadrar caja con calculadora a las once de la noche, hojas de Excel con productos, y dueños que perdían plata sin saber por qué.
          </p>
          <p style={{ marginBottom: 20 }}>
            Probamos los POS que hay en el mercado. Algunos son europeos, otros mexicanos, otros gringos. Ninguno entiende cómo se cobra en Colombia: con propina sugerida, división de cuenta como pide la mesa, factura DIAN con CUFE, pesos con punto como separador.
          </p>
          <p style={{ marginBottom: 20 }}>
            Así arrancamos mezo: un POS hecho en Colombia, para Colombia. Que no solo te dice cuánto facturaste, sino que te dice qué vender más y dónde estás perdiendo plata. Con IA, sin marketing-speak.
          </p>
          <p style={{ color: '#F4ECD8', marginBottom: 0 }}>
            Si tienes una cafetería, restaurante o bar y quieres dejar de pelearte con tu sistema actual, escríbenos. Nos encanta hablar con dueños que entienden el oficio.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease }}
          style={{ marginTop: 48, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 24 }}
        >
          <Stat numero="3" label="Personas en el equipo" />
          <Stat numero="2026" label="Año de fundación" />
          <Stat numero="🇨🇴" label="Hecho en Colombia" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease }}
          style={{ marginTop: 48, padding: '24px 28px', borderRadius: 16, background: 'rgba(200,144,63,0.06)', border: '1px solid rgba(200,144,63,0.18)' }}
        >
          <p style={{ fontSize: 15, color: '#E4B878', fontWeight: 600, marginBottom: 6 }}>¿Quieres hablar con nosotros?</p>
          <p style={{ fontSize: 14, color: '#7A6A58', marginBottom: 16 }}>
            Respondemos por WhatsApp en horario Bogotá. Sin bots, sin formularios.
          </p>
          <a
            href="https://wa.me/573000000000"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'inline-block', background: '#25D366', color: '#fff', padding: '10px 20px', borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: 'none', transition: 'background 0.2s' }}
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

function Stat({ numero, label }) {
  return (
    <div style={{ borderLeft: '2px solid rgba(200,144,63,0.3)', paddingLeft: 16 }}>
      <div style={{ fontFamily: '"Fraunces", Georgia, serif', fontSize: 32, fontWeight: 700, color: '#F4ECD8', marginBottom: 4 }}>
        {numero}
      </div>
      <div style={{ fontSize: 13, color: '#7A6A58' }}>{label}</div>
    </div>
  );
}
