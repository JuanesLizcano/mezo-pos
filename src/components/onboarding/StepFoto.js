import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Sentry from '@sentry/react';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, collection, writeBatch, serverTimestamp, addDoc } from 'firebase/firestore';
import { Upload } from 'lucide-react';
import { db, storage } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';

// Galería de emojis de comida para el producto
const EMOJIS_COMIDA = [
  '☕','🥐','🍕','🍔','🌮','🍜','🍣','🥗','🍰','🧋',
  '🧇','🥩','🍗','🌯','🥪','🍱','🧆','🥘','🍳','🍦',
];

// Paso 5: foto del producto + guardado final de todo en Firestore
export default function StepFoto({ data, prev }) {
  const { user }              = useAuth();
  const navigate              = useNavigate();
  const fileInputRef          = useRef(null);
  const [preview, setPreview] = useState(null);
  const [archivo, setArchivo] = useState(null);
  const [emoji, setEmoji]     = useState(data.productoEmoji ?? '🍽️');
  const [modo, setModo]       = useState('emoji'); // 'emoji' | 'foto'
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  function handleArchivoChange(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setArchivo(f);
    setPreview(URL.createObjectURL(f));
    setModo('foto');
  }

  async function handleFinalizar() {
    setLoading(true);
    setError('');
    try {
      const batch = writeBatch(db);

      // Negocio
      const negocioRef = doc(db, 'negocios', user.uid);
      batch.set(negocioRef, {
        nombre:           data.nombre,
        tipo:             data.tipo,
        ciudad:           data.ciudad,
        whatsapp:         data.whatsapp ?? '',
        horario:          data.horario ?? '',
        plan:             'pro',
        tieneMesas:       data.tieneMesas,
        mesas:            data.tieneMesas ? data.mesas : 0,
        propietarioUid:   user.uid,
        propietarioEmail: user.email,
        onboardingCompleto: true,
        creadoEn:         serverTimestamp(),
      });

      // Mesas
      if (data.tieneMesas) {
        for (let i = 1; i <= data.mesas; i++) {
          const mesaRef = doc(collection(db, 'negocios', user.uid, 'mesas'));
          batch.set(mesaRef, {
            nombre: `Mesa ${i}`, numero: i,
            estado: 'libre', ocupadaEn: null, total: null,
            creadaEn: serverTimestamp(),
          });
        }
      }

      await batch.commit();

      // Primer producto (si fue llenado)
      if (data.productoNombre?.trim()) {
        let imagenURL = null;

        // Subir foto si eligió archivo
        if (modo === 'foto' && archivo) {
          const snap = await uploadBytes(
            storageRef(storage, `negocios/${user.uid}/productos/primer-producto`),
            archivo
          );
          imagenURL = await getDownloadURL(snap.ref);
        }

        await addDoc(collection(db, 'negocios', user.uid, 'productos'), {
          nombre:       data.productoNombre.trim(),
          precio:       parseInt(data.productoPrecio, 10) || 0,
          descripcion:  data.productoDescripcion ?? '',
          ingredientes: data.productoIngredientes ?? [],
          categoriaId:  null,
          imagen:       imagenURL,
          emoji:        modo === 'emoji' ? emoji : null,
          disponible:   true,
          creadoEn:     serverTimestamp(),
        });
      }

      navigate('/dashboard');
    } catch (err) {
      Sentry.captureException(err);
      setError('Error al guardar. Intenta de nuevo.');
      setLoading(false);
    }
  }

  return (
    <div>
      <p className="text-xs text-mezo-stone uppercase tracking-widest mb-1 font-body">Paso 5 de 5</p>
      <h2 className="text-xl font-semibold text-mezo-cream mb-1 font-body">
        {data.productoNombre ? `Foto de "${data.productoNombre}"` : 'Última configuración'}
      </h2>
      <p className="text-sm text-mezo-stone mb-5 font-body">Elige un emoji o sube una foto del producto.</p>

      {data.productoNombre ? (
        <>
          {/* Selector modo */}
          <div className="flex gap-2 mb-4">
            {['emoji', 'foto'].map(m => (
              <button key={m} type="button" onClick={() => setModo(m)}
                className={`flex-1 py-2 rounded-mezo-md text-sm font-body font-medium border transition
                  ${modo === m
                    ? 'bg-mezo-gold/15 border-mezo-gold text-mezo-gold'
                    : 'border-mezo-ink-line text-mezo-stone hover:text-mezo-cream'}`}>
                {m === 'emoji' ? '🎨 Emoji' : '📷 Foto'}
              </button>
            ))}
          </div>

          {modo === 'emoji' && (
            <div className="grid grid-cols-5 gap-2 mb-4">
              {EMOJIS_COMIDA.map(e => (
                <button key={e} type="button" onClick={() => setEmoji(e)}
                  className={`h-12 rounded-mezo-md text-2xl transition border
                    ${emoji === e
                      ? 'bg-mezo-gold/15 border-mezo-gold'
                      : 'border-mezo-ink-line hover:border-mezo-gold/40 bg-mezo-ink-muted'}`}>
                  {e}
                </button>
              ))}
            </div>
          )}

          {modo === 'foto' && (
            <div className="mb-4">
              {preview ? (
                <div className="relative rounded-mezo-lg overflow-hidden h-40 bg-mezo-ink-muted mb-2">
                  <img src={preview} alt="preview" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => { setPreview(null); setArchivo(null); }}
                    className="absolute top-2 right-2 bg-mezo-ink/80 text-mezo-cream text-xs px-2 py-1 rounded-mezo-sm font-body">
                    Cambiar
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  className="w-full h-40 border-2 border-dashed border-mezo-ink-line rounded-mezo-lg flex flex-col items-center justify-center gap-2 text-mezo-stone hover:border-mezo-gold/40 hover:text-mezo-cream transition">
                  <Upload size={24} />
                  <span className="text-sm font-body">Toca para subir foto</span>
                </button>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                onChange={handleArchivoChange} />
            </div>
          )}
        </>
      ) : (
        <div className="bg-mezo-ink-muted rounded-mezo-lg border border-mezo-ink-line p-4 mb-5 text-center">
          <p className="text-mezo-stone font-body text-sm">
            Saltaste la creación del producto. Podrás agregarlo desde el módulo Productos.
          </p>
        </div>
      )}

      {error && (
        <p className="text-mezo-rojo text-sm bg-mezo-rojo/10 border border-mezo-rojo/30 rounded-mezo-md px-4 py-2 mb-4 font-body">
          {error}
        </p>
      )}

      <div className="flex gap-3 mt-2">
        <button type="button" onClick={prev} disabled={loading}
          className="flex-1 border border-mezo-ink-line text-mezo-cream-dim font-semibold py-2.5 rounded-mezo-md text-sm hover:bg-mezo-ink-muted transition font-body">
          ← Atrás
        </button>
        <button type="button" onClick={handleFinalizar} disabled={loading}
          className="flex-[2] bg-mezo-gold hover:bg-mezo-gold-deep disabled:opacity-50 text-mezo-ink font-bold py-2.5 rounded-mezo-lg text-sm transition font-body">
          {loading ? 'Configurando mezo…' : '🚀 Lanzar mezo'}
        </button>
      </div>
    </div>
  );
}
