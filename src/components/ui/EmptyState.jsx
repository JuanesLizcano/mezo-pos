import { motion } from 'framer-motion';

export default function EmptyState({
  icon,
  titulo,
  descripcion,
  cta,
  onCta,
  ctaSecondary,
  onCtaSecondary,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center justify-center py-20 px-8 text-center"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
        style={{ background: 'rgba(200,144,63,0.1)', border: '1px solid rgba(200,144,63,0.2)' }}
      >
        {icon}
      </motion.div>

      <h3
        className="text-xl font-medium mb-2"
        style={{ fontFamily: 'Fraunces, Georgia, serif', fontStyle: 'italic', color: '#F4ECD8' }}
      >
        {titulo}
      </h3>

      <p className="text-sm max-w-md mb-6 leading-relaxed font-body" style={{ color: '#9A8A78' }}>
        {descripcion}
      </p>

      {(cta || ctaSecondary) && (
        <div className="flex flex-wrap gap-3 justify-center">
          {cta && (
            <button
              onClick={onCta}
              className="font-body font-semibold text-sm px-5 py-2.5 rounded-lg transition"
              style={{ background: '#C8903F', color: '#080706' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#E4B878'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#C8903F'; }}
            >
              {cta}
            </button>
          )}
          {ctaSecondary && (
            <button
              onClick={onCtaSecondary}
              className="font-body text-sm px-5 py-2.5 rounded-lg border transition"
              style={{ borderColor: 'rgba(244,236,216,0.2)', color: '#F4ECD8', background: 'transparent' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(244,236,216,0.4)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(244,236,216,0.2)'; }}
            >
              {ctaSecondary}
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}
