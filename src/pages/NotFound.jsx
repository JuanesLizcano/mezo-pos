import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MezoWordmark from '../components/brand/MezoWordmark';

export default function NotFound() {
  const { user, negocio } = useAuth();
  const navigate          = useNavigate();

  function goHome() {
    if (user) {
      navigate(negocio ? '/dashboard' : '/onboarding', { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#080706',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '0 24px', textAlign: 'center',
      fontFamily: '"DM Sans", system-ui, sans-serif',
    }}>
      {/* Resplandor sutil */}
      <div style={{
        position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: 600, height: 300, borderRadius: '50%',
        background: 'radial-gradient(ellipse at top, rgba(200,144,63,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <MezoWordmark height={40} color="#C8903F" />

        <p style={{
          fontFamily: '"Fraunces", Georgia, serif', fontStyle: 'italic',
          fontSize: 'clamp(6rem, 18vw, 10rem)',
          color: '#1A1713', fontWeight: 700, lineHeight: 1,
          marginTop: 24, marginBottom: 0,
          WebkitTextStroke: '1px rgba(200,144,63,0.25)',
          userSelect: 'none',
        }}>
          404
        </p>

        <h1 style={{
          fontFamily: '"Fraunces", Georgia, serif', fontStyle: 'italic',
          fontSize: 'clamp(1.4rem, 4vw, 2rem)',
          color: '#F4ECD8', fontWeight: 500,
          margin: '16px 0 8px',
        }}>
          Esta página no existe
        </h1>

        <p style={{ color: '#7A6A58', fontSize: 15, lineHeight: 1.7, maxWidth: 380, margin: '0 auto 36px' }}>
          Puede que el enlace esté roto o que la página haya sido movida.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={goHome}
            style={{
              background: '#C8903F', color: '#080706',
              fontWeight: 600, fontSize: 14, padding: '10px 24px',
              borderRadius: 10, border: 'none', cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#E4B878'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#C8903F'; }}
          >
            {user ? '← Volver al panel' : '← Ir a la página principal'}
          </button>

          {!user && (
            <Link to="/login" style={{
              color: '#E4B878', fontSize: 14, fontWeight: 500,
              padding: '10px 24px', borderRadius: 10,
              border: '1px solid rgba(200,144,63,0.35)',
              textDecoration: 'none', transition: 'background 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(200,144,63,0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
              Iniciar sesión
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
