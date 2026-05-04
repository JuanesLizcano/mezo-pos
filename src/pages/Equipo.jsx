import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import AuroraGlow from '../components/effects/AuroraGlow';

const ease = [0.22, 1, 0.36, 1];

const EQUIPO = [
  {
    nombre: 'Juanes Lizcano',
    rol: 'Founder & Diseño de producto',
    bio: 'Diseña interfaces al nivel de las mejores startups del mundo. Su obsesión: que cada pixel tenga propósito. En mezo lidera la dirección de producto y la experiencia de usuario, con la convicción de que un POS bien diseñado debería sentirse como un buen mostrador — limpio, ordenado, listo para trabajar.',
    avatar: '/equipo/juanes.jpg',
    avatarFallback: 'JL',
    socials: {
      linkedin: 'https://linkedin.com/in/juaneslizcano',
      instagram: '@juanlizcanom',
    },
  },
  {
    nombre: 'Manuel Sánchez',
    rol: 'Founding Engineer',
    bio: 'Construye los sistemas que sostienen mezo en producción. Java, Spring Boot, infraestructura cloud — el músculo invisible que hace que todo funcione cuando un cliente cobra a las once de la noche un viernes. Pragmático, riguroso, y de los que dejan código que otros agradecen leer.',
    avatar: '/equipo/manuel.jpg',
    avatarFallback: 'MS',
    socials: {
      linkedin: 'https://linkedin.com/in/manuel-sanchez',
      github: 'https://github.com/MDEVGitH',
    },
  },
  {
    nombre: 'Sofía Pulido',
    rol: 'Growth & Comunidad',
    bio: 'La voz de mezo afuera. Lidera relaciones con clientes, contenido y la presencia de la marca en redes. Tiene un instinto particular para entender qué necesitan los dueños de cafetería antes de que ellos mismos lo sepan, y para traducir eso en un mensaje que conecta.',
    avatar: '/equipo/sofia.jpg',
    avatarFallback: 'SP',
    socials: {
      linkedin: 'https://linkedin.com/in/sofia-pulido',
      instagram: '@tresorquideas',
    },
  },
];

export default function Equipo() {
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

      <section className="relative overflow-hidden pb-20 px-6">
        <AuroraGlow variant="top" intensity={0.12} />

        <div className="relative max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
            className="text-center mb-16 max-w-2xl mx-auto"
          >
            <span className="text-xs uppercase tracking-widest text-[#C8903F] mb-3 block">El equipo</span>
            <h1
              className="text-4xl md:text-5xl font-medium tracking-tight mb-4 leading-[1.1]"
              style={{ fontFamily: '"Fraunces", Georgia, serif' }}
            >
              Equipo pequeño.{' '}
              <span className="italic text-[#C8903F]">Estándar alto.</span>
            </h1>
            <p className="text-[#9A8A78] text-lg">
              Tres personas con experiencia complementaria construyendo mezo desde cero. Decisiones rápidas, código limpio y diseño con criterio.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {EQUIPO.map((persona, i) => (
              <TarjetaPersona key={persona.nombre} persona={persona} delay={0.1 * i} />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease }}
            className="mt-16 text-center"
          >
            <p className="text-[#9A8A78] mb-4">¿Quieres ser parte del equipo?</p>
            <a
              href="mailto:hola@mezo.co?subject=Quiero trabajar en mezo"
              className="inline-block font-semibold text-sm px-6 py-3 rounded-lg transition"
              style={{ background: '#C8903F', color: '#080706' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#E4B878'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#C8903F'; }}
            >
              Escríbenos →
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

function TarjetaPersona({ persona, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      className="rounded-2xl p-6 transition-colors"
      style={{ background: '#141210', border: '1px solid rgba(244,236,216,0.08)' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(200,144,63,0.3)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(244,236,216,0.08)'; }}
    >
      <Avatar persona={persona} />

      <h3 className="text-lg font-medium text-[#F4ECD8] mb-1">{persona.nombre}</h3>
      <p className="text-sm mb-4" style={{ color: '#C8903F' }}>{persona.rol}</p>
      <p className="text-sm text-[#9A8A78] leading-relaxed mb-5">{persona.bio}</p>

      <div className="flex gap-3">
        {persona.socials.linkedin && (
          <SocialLink href={persona.socials.linkedin}>
            <IconLinkedIn />
          </SocialLink>
        )}
        {persona.socials.github && (
          <SocialLink href={persona.socials.github}>
            <IconGitHub />
          </SocialLink>
        )}
        {persona.socials.instagram && (
          <SocialLink href={`https://instagram.com/${persona.socials.instagram.replace('@', '')}`}>
            <IconInstagram />
          </SocialLink>
        )}
      </div>
    </motion.div>
  );
}

function Avatar({ persona }) {
  return (
    <div
      className="w-20 h-20 rounded-2xl flex items-center justify-center text-[#080706] text-2xl font-semibold mb-5 overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #C8903F 0%, #E4B878 100%)',
        fontFamily: '"Fraunces", Georgia, serif',
        fontStyle: 'italic',
      }}
    >
      <img
        src={persona.avatar}
        alt={persona.nombre}
        className="w-full h-full object-cover"
        onError={e => {
          e.currentTarget.style.display = 'none';
          e.currentTarget.parentElement.textContent = persona.avatarFallback;
        }}
      />
    </div>
  );
}

function SocialLink({ href, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{ color: '#7A6A58', transition: 'color 0.2s' }}
      onMouseEnter={e => { e.currentTarget.style.color = '#E4B878'; }}
      onMouseLeave={e => { e.currentTarget.style.color = '#7A6A58'; }}
    >
      {children}
    </a>
  );
}

function IconLinkedIn() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z"/>
    </svg>
  );
}

function IconGitHub() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
    </svg>
  );
}

function IconInstagram() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
    </svg>
  );
}
