import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Settings, Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import { updateNegocio, getZonas, createZona, updateZona, deleteZona } from '../services';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Navbar from '../components/layout/Navbar';

const COLORES_PRESET = [
  { hex: '#C8903F', nombre: 'Oro mezo'       },
  { hex: '#2E86AB', nombre: 'Azul oceano'    },
  { hex: '#E84855', nombre: 'Rojo carmesí'   },
  { hex: '#3DAA68', nombre: 'Verde esmeralda' },
  { hex: '#7B5EA7', nombre: 'Violeta'         },
  { hex: '#D9A437', nombre: 'Ámbar'           },
  { hex: '#2B6CB0', nombre: 'Azul rey'        },
  { hex: '#C05621', nombre: 'Naranja terra'   },
  { hex: '#2D6A4F', nombre: 'Verde bosque'    },
  { hex: '#6B4226', nombre: 'Café oscuro'     },
];

const REGIMENES = [
  { value: 'simplificado', label: 'Régimen simplificado' },
  { value: 'comun',        label: 'Régimen común'        },
];

function Campo({ label, placeholder, value, onChange, required, type = 'text' }) {
  return (
    <div>
      <label className="block text-xs font-medium text-mezo-cream-dim uppercase tracking-widest mb-2 font-body">
        {label}{required && <span className="text-mezo-rojo ml-1">*</span>}
      </label>
      <input type={type} placeholder={placeholder} value={value}
        onChange={e => onChange(e.target.value)} required={required}
        className="w-full px-4 py-2.5 bg-mezo-ink-muted border border-mezo-ink-line text-mezo-cream placeholder-mezo-stone rounded-mezo-md text-sm focus:outline-none focus:ring-2 focus:ring-mezo-gold focus:border-transparent transition font-body"
      />
    </div>
  );
}

function Seccion({ titulo, children }) {
  return (
    <div className="bg-mezo-ink-raised border border-mezo-ink-line rounded-mezo-xl p-6">
      <h2 className="text-mezo-cream font-body font-semibold text-base mb-5">{titulo}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function SeccionZonas() {
  const [zonas, setZonas]       = useState([]);
  const [editando, setEditando] = useState(null); // { id, nombre, color } | null
  const [nuevo, setNuevo]       = useState(null);  // { nombre, color } | null
  const [saving, setSaving]     = useState(false);

  useEffect(() => {
    getZonas().then(setZonas).catch(() => {});
  }, []);

  async function handleCrear() {
    if (!nuevo?.nombre?.trim()) return;
    setSaving(true);
    try {
      const z = await createZona({ nombre: nuevo.nombre.trim(), color: nuevo.color ?? '#C8903F' });
      setZonas(prev => [...prev, z]);
      setNuevo(null);
      toast.success('Zona creada ✓');
    } catch {
      toast.error('Error al crear la zona.');
    } finally { setSaving(false); }
  }

  async function handleActualizar() {
    if (!editando?.nombre?.trim()) return;
    setSaving(true);
    try {
      const z = await updateZona(editando.id, { nombre: editando.nombre.trim(), color: editando.color });
      setZonas(prev => prev.map(z2 => z2.id === z.id ? z : z2));
      setEditando(null);
      toast.success('Zona actualizada ✓');
    } catch {
      toast.error('Error al actualizar la zona.');
    } finally { setSaving(false); }
  }

  async function handleEliminar(id) {
    try {
      await deleteZona(id);
      setZonas(prev => prev.filter(z => z.id !== id));
      toast.success('Zona eliminada ✓');
    } catch (err) {
      toast.error(err.message ?? 'Error al eliminar la zona.');
    }
  }

  return (
    <div className="bg-mezo-ink-raised border border-mezo-ink-line rounded-mezo-xl p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-mezo-cream font-body font-semibold text-base">Zonas del restaurante</h2>
        {!nuevo && (
          <button onClick={() => setNuevo({ nombre: '', color: '#C8903F' })}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-mezo-md text-xs font-body font-semibold border transition"
            style={{ background: 'rgba(200,144,63,0.1)', borderColor: 'rgba(200,144,63,0.4)', color: '#C8903F' }}>
            <Plus size={12} /> Nueva zona
          </button>
        )}
      </div>

      <div className="space-y-2">
        {zonas.map(z => (
          <div key={z.id} className="flex items-center gap-3 px-3 py-2.5 rounded-mezo-md border border-mezo-ink-line">
            {editando?.id === z.id ? (
              <>
                <input type="color" value={editando.color}
                  onChange={e => setEditando(prev => ({ ...prev, color: e.target.value }))}
                  className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 p-0" />
                <input type="text" value={editando.nombre}
                  onChange={e => setEditando(prev => ({ ...prev, nombre: e.target.value }))}
                  autoFocus
                  onKeyDown={e => { if (e.key === 'Enter') handleActualizar(); if (e.key === 'Escape') setEditando(null); }}
                  className="flex-1 px-2 py-1 bg-mezo-ink-muted border border-mezo-ink-line text-mezo-cream text-sm rounded-mezo-sm focus:outline-none focus:ring-2 focus:ring-mezo-gold font-body"
                />
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={handleActualizar} disabled={saving}
                    className="p-1.5 rounded-mezo-sm transition hover:bg-mezo-verde/20"
                    style={{ color: '#3DAA68' }}>
                    <Check size={13} />
                  </button>
                  <button onClick={() => setEditando(null)}
                    className="p-1.5 rounded-mezo-sm transition hover:bg-mezo-rojo/20"
                    style={{ color: '#C8573F' }}>
                    <X size={13} />
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ background: z.color ?? '#C8903F' }} />
                <span className="flex-1 text-mezo-cream font-body text-sm">{z.nombre}</span>
                <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition"
                  style={{ opacity: 1 }}>
                  <button onClick={() => setEditando({ ...z })}
                    className="p-1.5 rounded-mezo-sm text-mezo-stone hover:text-mezo-cream transition">
                    <Pencil size={12} />
                  </button>
                  <button onClick={() => handleEliminar(z.id)}
                    className="p-1.5 rounded-mezo-sm text-mezo-stone hover:text-mezo-rojo transition">
                    <Trash2 size={12} />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}

        {/* Fila de nueva zona */}
        {nuevo && (
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-mezo-md border border-mezo-gold/40 bg-mezo-gold/5">
            <input type="color" value={nuevo.color}
              onChange={e => setNuevo(prev => ({ ...prev, color: e.target.value }))}
              className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 p-0" />
            <input type="text" value={nuevo.nombre}
              onChange={e => setNuevo(prev => ({ ...prev, nombre: e.target.value }))}
              placeholder="Nombre de la zona…"
              autoFocus
              onKeyDown={e => { if (e.key === 'Enter') handleCrear(); if (e.key === 'Escape') setNuevo(null); }}
              className="flex-1 px-2 py-1 bg-mezo-ink-muted border border-mezo-ink-line text-mezo-cream placeholder-mezo-stone text-sm rounded-mezo-sm focus:outline-none focus:ring-2 focus:ring-mezo-gold font-body"
            />
            <div className="flex gap-1 flex-shrink-0">
              <button onClick={handleCrear} disabled={saving || !nuevo.nombre.trim()}
                className="p-1.5 rounded-mezo-sm transition hover:bg-mezo-verde/20 disabled:opacity-40"
                style={{ color: '#3DAA68' }}>
                <Check size={13} />
              </button>
              <button onClick={() => setNuevo(null)}
                className="p-1.5 rounded-mezo-sm transition hover:bg-mezo-rojo/20"
                style={{ color: '#C8573F' }}>
                <X size={13} />
              </button>
            </div>
          </div>
        )}

        {zonas.length === 0 && !nuevo && (
          <p className="text-mezo-stone font-body text-sm text-center py-4">
            Sin zonas. Crea una para organizar tus mesas.
          </p>
        )}
      </div>
    </div>
  );
}

export default function Configuracion() {
  const { negocio, bumpVersion }        = useAuth();
  const { colorPrimario, setColorPrimario } = useTheme();
  const [guardando, setGuardando]       = useState(false);

  const [razonSocial, setRazonSocial]   = useState('');
  const [nit, setNit]                   = useState('');
  const [direccionFiscal, setDireccion] = useState('');
  const [telefono, setTelefono]         = useState('');
  const [regimen, setRegimen]           = useState('simplificado');
  const [colorHex, setColorHex]         = useState(colorPrimario ?? '#C8903F');

  useEffect(() => {
    if (!negocio) return;
    setRazonSocial(negocio.razonSocial ?? '');
    setNit(negocio.nit ?? '');
    setDireccion(negocio.direccionFiscal ?? negocio.address ?? '');
    setTelefono(negocio.telefono ?? '');
    setRegimen(negocio.regimenTributario ?? 'simplificado');
    setColorHex(negocio.colorPrimario ?? '#C8903F');
  }, [negocio]);

  async function handleGuardarFiscal(e) {
    e.preventDefault();
    setGuardando(true);
    try {
      await updateNegocio({ razonSocial, nit, direccionFiscal, telefono, regimenTributario: regimen });
      bumpVersion();
      toast.success('Datos fiscales actualizados ✓');
    } catch {
      toast.error('Error al guardar. Intenta de nuevo.');
    } finally {
      setGuardando(false);
    }
  }

  async function handleGuardarColor() {
    try {
      setColorPrimario(colorHex);
      await updateNegocio({ colorPrimario: colorHex });
      bumpVersion();
      toast.success('Color actualizado ✓');
    } catch {
      toast.error('Error al guardar el color.');
    }
  }

  return (
    <div className="min-h-screen bg-mezo-ink flex flex-col">
      <Navbar />

      <main className="flex-1 px-8 py-6 max-w-3xl mx-auto w-full">
        <div className="flex items-end gap-3 mb-8">
          <Settings size={32} className="text-mezo-gold mb-1" />
          <div>
            <p className="text-mezo-stone uppercase tracking-widest text-xs font-body">Negocio</p>
            <h1 className="text-mezo-cream font-display font-medium leading-none"
              style={{ fontSize: 40, letterSpacing: '-0.02em', fontVariationSettings: '"SOFT" 50, "opsz" 72' }}>
              Configuración
            </h1>
          </div>
        </div>

        <div className="space-y-6">

          <Seccion titulo="Datos fiscales y legales">
            <form onSubmit={handleGuardarFiscal} className="space-y-4">
              <Campo label="Razón social / Nombre legal"
                placeholder="Ej: Tres Orquídeas S.A.S."
                value={razonSocial} onChange={setRazonSocial} required />

              <div className="grid grid-cols-2 gap-4">
                <Campo label="NIT o Cédula"
                  placeholder="900.123.456-7"
                  value={nit} onChange={setNit} />
                <Campo label="Teléfono"
                  placeholder="+57 604 444 5678"
                  value={telefono} onChange={setTelefono} type="tel" />
              </div>

              <Campo label="Dirección fiscal completa"
                placeholder="Calle 50 #10-30, El Poblado, Medellín"
                value={direccionFiscal} onChange={setDireccion} required />

              <div>
                <label className="block text-xs font-medium text-mezo-cream-dim uppercase tracking-widest mb-2 font-body">
                  Régimen tributario
                </label>
                <div className="flex gap-3">
                  {REGIMENES.map(r => (
                    <button key={r.value} type="button"
                      onClick={() => setRegimen(r.value)}
                      className={`flex-1 py-2.5 rounded-mezo-md text-sm font-body font-semibold border transition
                        ${regimen === r.value
                          ? 'bg-mezo-gold/15 border-mezo-gold text-mezo-gold'
                          : 'border-mezo-ink-line text-mezo-stone hover:border-mezo-gold/40 hover:text-mezo-cream'}`}>
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" disabled={guardando}
                className="w-full bg-mezo-gold hover:bg-mezo-gold-deep disabled:opacity-50 text-mezo-ink font-semibold py-2.5 rounded-mezo-md text-sm font-body transition">
                {guardando ? 'Guardando...' : 'Guardar datos fiscales'}
              </button>
            </form>
          </Seccion>

          <Seccion titulo="Color del negocio">
            <p className="text-mezo-stone font-body text-sm -mt-2">
              Color principal para botones y acentos del dashboard.
            </p>
            <div className="grid grid-cols-5 gap-2">
              {COLORES_PRESET.map(c => (
                <button key={c.hex}
                  onClick={() => setColorHex(c.hex)}
                  title={c.nombre}
                  className={`h-10 rounded-mezo-md border-2 transition ${colorHex === c.hex ? 'border-mezo-cream scale-110' : 'border-transparent hover:scale-105'}`}
                  style={{ background: c.hex }}
                />
              ))}
            </div>

            <div className="flex items-center gap-3">
              <label className="text-mezo-stone font-body text-sm">Hex personalizado:</label>
              <input type="color" value={colorHex}
                onChange={e => setColorHex(e.target.value)}
                className="w-10 h-10 rounded-mezo-md border border-mezo-ink-line cursor-pointer bg-transparent"
              />
              <span className="text-mezo-cream-dim font-mono text-sm">{colorHex}</span>
            </div>

            <button onClick={handleGuardarColor}
              className="w-full py-2.5 rounded-mezo-md text-sm font-body font-semibold border transition"
              style={{ background: `${colorHex}20`, color: colorHex, borderColor: `${colorHex}60` }}>
              Aplicar color
            </button>
          </Seccion>

          <SeccionZonas />

        </div>
      </main>
    </div>
  );
}
