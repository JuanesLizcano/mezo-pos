import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, collection, writeBatch, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';

const NOMBRES_PLAN = { semilla: 'Semilla', pro: 'Pro', elite: 'Élite' };

export default function Step5Listo({ data, prev }) {
  const { user }    = useAuth();
  const navigate    = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  async function handleFinalizar() {
    setLoading(true);
    setError('');
    try {
      const batch = writeBatch(db);

      const negocioRef = doc(db, 'negocios', user.uid);
      batch.set(negocioRef, {
        nombre: data.nombre, tipo: data.tipo, ciudad: data.ciudad,
        telefono: data.telefono || '', plan: data.plan,
        tieneMesas: data.tieneMesas, mesas: data.tieneMesas ? data.mesas : 0,
        propietarioUid: user.uid, propietarioEmail: user.email,
        onboardingCompleto: true, creadoEn: serverTimestamp(),
      });

      if (data.tieneMesas) {
        for (let i = 1; i <= data.mesas; i++) {
          const mesaRef = doc(collection(db, 'negocios', user.uid, 'mesas'));
          batch.set(mesaRef, {
            nombre: `Mesa ${i}`, numero: i,
            estado: 'libre', personas: 0, orden: null,
            creadaEn: serverTimestamp(),
          });
        }
      }

      await batch.commit();
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError('Error al guardar. Intenta de nuevo.');
      setLoading(false);
    }
  }

  return (
    <div className="text-center">
      <div className="text-5xl mb-4">🎉</div>
      <h2
        className="font-display font-medium text-mezo-cream mb-2"
        style={{ fontSize: 28, letterSpacing: '-0.02em', fontVariationSettings: '"SOFT" 50, "opsz" 72' }}
      >
        ¡Todo listo!
      </h2>
      <p className="text-mezo-stone text-sm mb-8 font-body">Revisa el resumen antes de entrar a tu panel.</p>

      <div className="bg-mezo-ink-muted rounded-mezo-lg border border-mezo-ink-line p-5 text-left space-y-3 mb-6">
        <Fila label="Negocio" valor={data.nombre} />
        <Fila label="Tipo"    valor={capitalize(data.tipo)} />
        <Fila label="Ciudad"  valor={data.ciudad} />
        <Fila label="Plan"    valor={NOMBRES_PLAN[data.plan]} />
        <Fila label="Mesas"   valor={data.tieneMesas ? `${data.mesas} mesas` : 'Sin mesas (mostrador)'} />
      </div>

      {error && (
        <p className="text-mezo-rojo text-sm bg-mezo-rojo/10 border border-mezo-rojo/30 rounded-mezo-md px-4 py-2 mb-4 font-body">
          {error}
        </p>
      )}

      <button onClick={handleFinalizar} disabled={loading}
        className="w-full bg-mezo-gold hover:bg-mezo-gold-deep disabled:opacity-50 text-mezo-ink font-bold py-3 rounded-mezo-lg text-sm transition shadow-mezo-gold mb-3 font-body">
        {loading ? 'Configurando tu negocio...' : 'Entrar a mi panel →'}
      </button>

      <button type="button" onClick={prev} disabled={loading}
        className="text-sm text-mezo-stone hover:text-mezo-cream-dim transition font-body">
        ← Cambiar algo
      </button>
    </div>
  );
}

function Fila({ label, valor }) {
  return (
    <div className="flex items-center justify-between text-sm font-body">
      <span className="text-mezo-stone">{label}</span>
      <span className="font-medium text-mezo-cream">{valor}</span>
    </div>
  );
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
