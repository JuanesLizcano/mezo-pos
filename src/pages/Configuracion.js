import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Settings } from 'lucide-react';
import { updateNegocio } from '../services';
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
    setDireccion(negocio.direccionFiscal ?? negocio.direccion ?? '');
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

        </div>
      </main>
    </div>
  );
}
