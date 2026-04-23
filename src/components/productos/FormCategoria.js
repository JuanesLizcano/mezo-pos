import { useState } from 'react';
import toast from 'react-hot-toast';
import { createCategoria, updateCategoria } from '../../services';
import { useAuth } from '../../context/AuthContext';
import Modal from '../ui/Modal';

const EMOJIS = ['🍕','🍔','🥗','☕','🧃','🍰','🌮','🍜','🥩','🍺',
                 '🥪','🍣','🥤','🍟','🧁','🍦','🥐','🍳','🥞','🍱'];

export default function FormCategoria({ categoria = null, totalCategorias, onClose }) {
  const { bumpVersion }       = useAuth();
  const [nombre, setNombre]   = useState(categoria?.nombre ?? '');
  const [emoji, setEmoji]     = useState(categoria?.emoji ?? '🍽️');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const esEdicion = !!categoria;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!nombre.trim()) return;
    setLoading(true);
    setError('');
    try {
      const base = { nombre: nombre.trim(), emoji };
      if (esEdicion) {
        await updateCategoria(categoria.id, base);
      } else {
        await createCategoria({ ...base, orden: totalCategorias });
      }
      bumpVersion();
      toast.success(esEdicion ? 'Categoría actualizada ✓' : 'Categoría creada ✓');
      onClose();
    } catch {
      setError('Error al guardar. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal titulo={esEdicion ? 'Editar categoría' : 'Nueva categoría'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-mezo-cream-dim uppercase tracking-widest mb-2 font-body">
            Nombre
          </label>
          <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: Bebidas calientes" required maxLength={40}
            className="w-full px-4 py-2.5 bg-mezo-ink-muted border border-mezo-ink-line text-mezo-cream placeholder-mezo-stone rounded-mezo-md text-sm focus:outline-none focus:ring-2 focus:ring-mezo-gold focus:border-transparent transition font-body"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-mezo-cream-dim uppercase tracking-widest mb-2 font-body">
            Emoji
          </label>
          <div className="grid grid-cols-10 gap-1.5">
            {EMOJIS.map((e) => (
              <button key={e} type="button" onClick={() => setEmoji(e)}
                className={`text-xl p-1.5 rounded-mezo-sm transition
                  ${emoji === e ? 'bg-mezo-gold/20 ring-2 ring-mezo-gold' : 'hover:bg-mezo-ink-muted'}`}>
                {e}
              </button>
            ))}
          </div>
          <p className="text-xs text-mezo-stone mt-2 font-body">Seleccionado: {emoji}</p>
        </div>

        {error && (
          <p className="text-mezo-rojo text-sm bg-mezo-rojo/10 border border-mezo-rojo/30 rounded-mezo-md px-4 py-2 font-body">
            {error}
          </p>
        )}

        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose}
            className="flex-1 border border-mezo-ink-line text-mezo-cream-dim font-semibold py-2.5 rounded-mezo-md text-sm hover:bg-mezo-ink-muted transition font-body">
            Cancelar
          </button>
          <button type="submit" disabled={loading}
            className="flex-[2] bg-mezo-gold hover:bg-mezo-gold-deep disabled:opacity-50 text-mezo-ink font-semibold py-2.5 rounded-mezo-md text-sm transition shadow-mezo-gold font-body">
            {loading ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear categoría'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
