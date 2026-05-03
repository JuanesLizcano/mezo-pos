import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { Settings, Plus, Pencil, Trash2, Check, X, Printer, Building2, Palette, Upload } from 'lucide-react';
import { pdf } from '@react-pdf/renderer';
import { updateNegocio, getZonas, createZona, updateZona, deleteZona } from '../services';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Navbar from '../components/layout/Navbar';
import TicketPDF from '../components/pos/Ticket';

// Colores disponibles para personalizar el color primario del negocio
const COLORES_PRESET = [
  { hex: '#C8903F', nombre: 'Oro mezo'        },
  { hex: '#2E86AB', nombre: 'Azul oceano'     },
  { hex: '#E84855', nombre: 'Rojo carmesí'    },
  { hex: '#3DAA68', nombre: 'Verde esmeralda' },
  { hex: '#7B5EA7', nombre: 'Violeta'          },
  { hex: '#D9A437', nombre: 'Ámbar'            },
  { hex: '#2B6CB0', nombre: 'Azul rey'         },
  { hex: '#C05621', nombre: 'Naranja terra'    },
  { hex: '#2D6A4F', nombre: 'Verde bosque'     },
  { hex: '#6B4226', nombre: 'Café oscuro'      },
];

const REGIMENES = [
  { value: 'simplificado', label: 'Régimen simplificado' },
  { value: 'comun',        label: 'Régimen común'        },
];

const TIPOS_IMPRESORA = [
  { value: '58mm',    label: 'Impresora térmica 58mm' },
  { value: '80mm',    label: 'Impresora térmica 80mm', nota: '← más común' },
  { value: 'no_usar', label: 'No usar'                },
];

const TAMANOS_FUENTE = [
  { value: 'pequena', label: 'Pequeña' },
  { value: 'normal',  label: 'Normal'  },
  { value: 'grande',  label: 'Grande'  },
];

// Lee y escribe todos los ajustes locales bajo una sola clave
function leerSettingsLocales() {
  try {
    return JSON.parse(localStorage.getItem('mezo_settings') ?? '{}');
  } catch {
    return {};
  }
}
function guardarSettingLocal(clave, valor) {
  const prev = leerSettingsLocales();
  localStorage.setItem('mezo_settings', JSON.stringify({ ...prev, [clave]: valor }));
}

// Campo de texto genérico reutilizable
function Campo({ label, placeholder, value, onChange, required, type = 'text' }) {
  return (
    <div>
      <label className="block text-xs font-medium text-mezo-cream-dim uppercase tracking-widest mb-2 font-body">
        {label}{required && <span className="text-mezo-rojo ml-1">*</span>}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        required={required}
        className="w-full px-4 py-2.5 bg-mezo-ink-muted border border-mezo-ink-line text-mezo-cream placeholder-mezo-stone rounded-mezo-md text-sm focus:outline-none focus:ring-2 focus:ring-mezo-gold focus:border-transparent transition font-body"
      />
    </div>
  );
}

// Contenedor visual para cada sección dentro de una tab
function Seccion({ titulo, children }) {
  return (
    <div className="bg-mezo-ink-raised border border-mezo-ink-line rounded-mezo-xl p-6">
      <h2 className="text-mezo-cream font-body font-semibold text-base mb-5">{titulo}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

// ----- TAB 1: FACTURACIÓN -----

function TabFacturacion() {
  const { negocio, bumpVersion } = useAuth();
  const [guardando, setGuardando] = useState(false);
  const inputLogoRef = useRef(null);

  const [razonSocial, setRazonSocial] = useState('');
  const [nit,         setNit        ] = useState('');
  const [direccion,   setDireccion  ] = useState('');
  const [ciudad,      setCiudad     ] = useState('');
  const [telefono,    setTelefono   ] = useState('');
  const [email,       setEmail      ] = useState('');
  const [regimen,     setRegimen    ] = useState('simplificado');
  const [logoPreview, setLogoPreview] = useState(null);

  // Cargar datos desde Firebase al montar
  useEffect(() => {
    if (!negocio) return;
    setRazonSocial(negocio.razonSocial       ?? '');
    setNit        (negocio.nit               ?? '');
    setDireccion  (negocio.direccionFiscal   ?? negocio.address ?? '');
    setCiudad     (negocio.ciudad            ?? '');
    setTelefono   (negocio.telefono          ?? '');
    setEmail      (negocio.email             ?? '');
    setRegimen    (negocio.regimenTributario  ?? 'simplificado');
  }, [negocio]);

  // Cargar logo guardado localmente
  useEffect(() => {
    const settings = leerSettingsLocales();
    if (settings.logoNegocio) setLogoPreview(settings.logoNegocio);
  }, []);

  // Convierte la imagen elegida a base64 y la guarda en localStorage
  function handleLogo(e) {
    const archivo = e.target.files?.[0];
    if (!archivo) return;
    if (archivo.size > 500_000) {
      toast.error('La imagen debe pesar menos de 500 KB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = ev => {
      const base64 = ev.target.result;
      setLogoPreview(base64);
      guardarSettingLocal('logoNegocio', base64);
    };
    reader.readAsDataURL(archivo);
  }

  async function handleGuardar(e) {
    e.preventDefault();
    setGuardando(true);
    try {
      await updateNegocio({
        razonSocial,
        nit,
        direccionFiscal:  direccion,
        ciudad,
        telefono,
        email,
        regimenTributario: regimen,
      });
      bumpVersion();
      toast.success('Datos de facturación guardados ✓');
    } catch {
      toast.error('Error al guardar. Intenta de nuevo.');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="space-y-6">
      <Seccion titulo="Datos del negocio">
        <form onSubmit={handleGuardar} className="space-y-4">

          {/* Logo del negocio */}
          <div>
            <label className="block text-xs font-medium text-mezo-cream-dim uppercase tracking-widest mb-2 font-body">
              Logo del negocio
            </label>
            <div className="flex items-center gap-4">
              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt="Logo del negocio"
                  className="w-16 h-16 rounded-mezo-md object-contain border border-mezo-ink-line bg-mezo-ink-muted"
                />
              ) : (
                <div className="w-16 h-16 rounded-mezo-md border border-dashed border-mezo-ink-line bg-mezo-ink-muted flex items-center justify-center">
                  <Building2 size={20} className="text-mezo-stone" />
                </div>
              )}
              <div>
                <button
                  type="button"
                  onClick={() => inputLogoRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 rounded-mezo-md border border-mezo-ink-line text-mezo-cream-dim text-sm font-body hover:border-mezo-gold/40 hover:text-mezo-cream transition"
                >
                  <Upload size={13} />
                  {logoPreview ? 'Cambiar logo' : 'Subir logo'}
                </button>
                <p className="text-mezo-stone font-body text-xs mt-1.5">PNG, JPG — máx. 500 KB</p>
              </div>
            </div>
            <input
              ref={inputLogoRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleLogo}
              className="hidden"
            />
          </div>

          <Campo
            label="Nombre del negocio *"
            placeholder="Ej: Tres Orquídeas"
            value={razonSocial}
            onChange={setRazonSocial}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Campo label="NIT o Cédula" placeholder="900.123.456-7" value={nit} onChange={setNit} />
            <Campo label="Teléfono" placeholder="+57 604 444 5678" value={telefono} onChange={setTelefono} type="tel" />
          </div>

          <Campo
            label="Dirección"
            placeholder="Calle 50 #10-30, El Poblado"
            value={direccion}
            onChange={setDireccion}
            required
          />

          <Campo
            label="Ciudad"
            placeholder="Medellín"
            value={ciudad}
            onChange={setCiudad}
          />

          <Campo
            label="Correo de facturación"
            placeholder="hola@minegocio.com"
            value={email}
            onChange={setEmail}
            type="email"
          />

          {/* Régimen tributario */}
          <div>
            <label className="block text-xs font-medium text-mezo-cream-dim uppercase tracking-widest mb-2 font-body">
              Régimen tributario
            </label>
            <div className="flex gap-3">
              {REGIMENES.map(r => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRegimen(r.value)}
                  className={`flex-1 py-2.5 rounded-mezo-md text-sm font-body font-semibold border transition
                    ${regimen === r.value
                      ? 'bg-mezo-gold/15 border-mezo-gold text-mezo-gold'
                      : 'border-mezo-ink-line text-mezo-stone hover:border-mezo-gold/40 hover:text-mezo-cream'}`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={guardando}
            className="w-full bg-mezo-gold hover:bg-mezo-gold-deep disabled:opacity-50 text-mezo-ink font-semibold py-2.5 rounded-mezo-md text-sm font-body transition"
          >
            {guardando ? 'Guardando...' : 'Guardar datos de facturación'}
          </button>
        </form>
      </Seccion>

      <SeccionZonas />
    </div>
  );
}

// ----- TAB 2: IMPRESORA -----

function TabImpresora() {
  const { negocio, bumpVersion } = useAuth();
  const [guardando, setGuardando] = useState(false);

  // Datos del ticket — se guardan en Firebase
  const [nombreFactura,   setNombreFactura ] = useState('');
  const [nitFactura,      setNitFactura    ] = useState('');
  const [direccionFactura, setDireccion    ] = useState('');
  const [telefonoFactura,  setTelefono     ] = useState('');
  const [emailFactura,     setEmail        ] = useState('');
  const [pieFactura,       setPieFactura   ] = useState('Precios incluyen IVA · Gracias por su visita');

  // Configuración local de impresora — se guarda en localStorage
  const [nombreImpresora, setNombreImpresora] = useState('');
  const [autoImprimir,    setAutoImprimir   ] = useState(false);
  const [tipoImpresora,   setTipoImpresora  ] = useState('80mm');

  // Cargar datos de Firebase al montar
  useEffect(() => {
    if (!negocio) return;
    setNombreFactura (negocio.razonSocial      ?? negocio.name ?? '');
    setNitFactura    (negocio.nit              ?? '');
    setDireccion     (negocio.direccionFiscal  ?? negocio.address ?? '');
    setTelefono      (negocio.telefono         ?? '');
    setEmail         (negocio.email            ?? '');
    setPieFactura    (negocio.pieFactura        ?? 'Precios incluyen IVA · Gracias por su visita');
  }, [negocio]);

  // Cargar ajustes locales al montar
  useEffect(() => {
    const s = leerSettingsLocales();
    if (s.nombreImpresora !== undefined) setNombreImpresora(s.nombreImpresora);
    if (s.autoImprimir    !== undefined) setAutoImprimir   (s.autoImprimir);
    if (s.tipoImpresora   !== undefined) setTipoImpresora  (s.tipoImpresora);
  }, []);

  function handleToggleAuto(val) {
    setAutoImprimir(val);
    guardarSettingLocal('autoImprimir', val);
  }

  function handleTipoImpresora(val) {
    setTipoImpresora(val);
    guardarSettingLocal('tipoImpresora', val);
  }

  function handleNombreImpresora(val) {
    setNombreImpresora(val);
    guardarSettingLocal('nombreImpresora', val);
  }

  async function handleGuardar(e) {
    e.preventDefault();
    setGuardando(true);
    try {
      await updateNegocio({
        razonSocial:     nombreFactura,
        nit:             nitFactura,
        direccionFiscal: direccionFactura,
        telefono:        telefonoFactura,
        email:           emailFactura,
        pieFactura,
      });
      bumpVersion();
      toast.success('Configuración de impresora guardada ✓');
    } catch {
      toast.error('Error al guardar. Intenta de nuevo.');
    } finally {
      setGuardando(false);
    }
  }

  // Abre un PDF de muestra para probar la impresora
  async function handleTicketPrueba() {
    try {
      const ordenPrueba = {
        id:         'PRUEBA-000001',
        lineas:     [
          { name: 'Café americano',       quantity: 2, subtotal: 8000  },
          { name: 'Croissant mantequilla', quantity: 1, subtotal: 5500 },
          { name: 'Jugo de naranja',      quantity: 1, subtotal: 6000  },
        ],
        subtotal:   19500,
        propina:    null,
        total:      19500,
        metodo:     'efectivo',
        recibido:   20000,
        cambio:     500,
        cajero:     null,
        fecha:      new Date(),
        numFactura: 1,
        cliente:    null,
      };
      const negocioPrueba = {
        razonSocial:     nombreFactura    || negocio?.razonSocial || negocio?.name,
        nit:             nitFactura       || negocio?.nit,
        direccionFiscal: direccionFactura || negocio?.direccionFiscal,
        telefono:        telefonoFactura  || negocio?.telefono,
        email:           emailFactura     || negocio?.email,
        pieFactura,
      };
      console.log('[mezo] Imprimiendo ticket de prueba', negocioPrueba);
      const blob = await pdf(<TicketPDF orden={ordenPrueba} negocio={negocioPrueba} />).toBlob();
      window.open(URL.createObjectURL(blob), '_blank');
    } catch {
      toast.error('Error al generar el ticket de prueba.');
    }
  }

  return (
    <div className="bg-mezo-ink-raised border border-mezo-ink-line rounded-mezo-xl p-6">
      <div className="flex items-center gap-2 mb-5">
        <Printer size={16} className="text-mezo-gold" />
        <h2 className="text-mezo-cream font-body font-semibold text-base">Configuración de impresora</h2>
      </div>

      <form onSubmit={handleGuardar}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Columna izquierda — campos */}
          <div className="space-y-4">

            {/* Nombre de la impresora (local) */}
            <div>
              <label className="block text-xs font-medium text-mezo-cream-dim uppercase tracking-widest mb-2 font-body">
                Nombre de la impresora
              </label>
              <input
                type="text"
                placeholder="Ej: Epson TM-T20, Star TSP100…"
                value={nombreImpresora}
                onChange={e => handleNombreImpresora(e.target.value)}
                className="w-full px-4 py-2.5 bg-mezo-ink-muted border border-mezo-ink-line text-mezo-cream placeholder-mezo-stone rounded-mezo-md text-sm focus:outline-none focus:ring-2 focus:ring-mezo-gold focus:border-transparent transition font-body"
              />
            </div>

            {/* Tipo de impresora (local) */}
            <div>
              <label className="block text-xs font-medium text-mezo-cream-dim uppercase tracking-widest mb-2 font-body">
                Tipo de impresora
              </label>
              <div className="space-y-1.5">
                {TIPOS_IMPRESORA.map(op => (
                  <button
                    key={op.value}
                    type="button"
                    onClick={() => handleTipoImpresora(op.value)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-mezo-md border text-sm font-body transition text-left"
                    style={tipoImpresora === op.value
                      ? { background: 'rgba(200,144,63,0.12)', borderColor: 'rgba(200,144,63,0.5)', color: '#C8903F' }
                      : { background: 'transparent', borderColor: '#2A2520', color: '#9A8A78' }}
                  >
                    <span>{op.label}</span>
                    {op.nota && <span className="text-mezo-stone text-xs">{op.nota}</span>}
                    {tipoImpresora === op.value && <Check size={13} />}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-mezo-stone font-body text-xs uppercase tracking-widest -mb-1">
              Datos del ticket
            </p>

            <Campo
              label="Nombre en el ticket *"
              placeholder="Mi Restaurante"
              value={nombreFactura}
              onChange={setNombreFactura}
              required
            />

            <div className="grid grid-cols-2 gap-3">
              <Campo label="NIT / No. tributario" placeholder="900.123.456-7" value={nitFactura} onChange={setNitFactura} />
              <Campo label="Teléfono" placeholder="+57 300 123 4567" value={telefonoFactura} onChange={setTelefono} type="tel" />
            </div>

            <Campo label="Dirección" placeholder="Calle 50 #10-30" value={direccionFactura} onChange={setDireccion} />
            <Campo label="Correo del negocio" placeholder="hola@minegocio.com" value={emailFactura} onChange={setEmail} type="email" />

            {/* Pie de ticket — textarea para permitir varias líneas */}
            <div>
              <label className="block text-xs font-medium text-mezo-cream-dim uppercase tracking-widest mb-2 font-body">
                Mensaje de pie de ticket
              </label>
              <textarea
                value={pieFactura}
                onChange={e => setPieFactura(e.target.value)}
                placeholder="¡Gracias por tu visita!"
                rows={3}
                className="w-full px-4 py-2.5 bg-mezo-ink-muted border border-mezo-ink-line text-mezo-cream placeholder-mezo-stone rounded-mezo-md text-sm focus:outline-none focus:ring-2 focus:ring-mezo-gold focus:border-transparent transition font-body resize-none"
              />
            </div>

            {/* Toggle auto-imprimir */}
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-mezo-cream font-body text-sm">Imprimir automáticamente al cobrar</p>
                <p className="text-mezo-stone font-body text-xs mt-0.5">
                  El diálogo de impresión abrirá tras cada venta
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleToggleAuto(!autoImprimir)}
                className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ml-4 ${autoImprimir ? 'bg-mezo-gold' : 'bg-mezo-ink-line'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${autoImprimir ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>

            {/* Instrucciones */}
            <div className="rounded-mezo-md px-4 py-3 border border-mezo-ink-line" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <p className="text-mezo-stone font-body text-xs leading-relaxed">
                Para impresoras térmicas, conecta tu impresora al computador antes de imprimir. El navegador abrirá el diálogo de impresión automáticamente.
              </p>
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={handleTicketPrueba}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-mezo-md border text-sm font-body font-semibold transition"
                style={{ background: 'rgba(200,144,63,0.08)', borderColor: 'rgba(200,144,63,0.35)', color: '#C8903F' }}
              >
                <Printer size={13} /> Imprimir prueba
              </button>
              <button
                type="submit"
                disabled={!nombreFactura.trim() || guardando}
                className="flex-1 bg-mezo-gold hover:bg-mezo-gold-deep disabled:opacity-50 text-mezo-ink font-semibold py-2.5 rounded-mezo-md text-sm font-body transition"
              >
                {guardando ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>

          {/* Columna derecha — preview del ticket en tiempo real */}
          <div className="flex flex-col">
            <p className="text-mezo-stone font-body text-xs uppercase tracking-widest mb-3">
              Vista previa del ticket
            </p>
            <div className="flex justify-center">
              <div
                className="rounded shadow-lg text-center"
                style={{ width: 220, background: '#fff', padding: '16px 14px', fontFamily: 'monospace', fontSize: 11, color: '#222', lineHeight: 1.5 }}
              >
                <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1 }}>
                  {nombreFactura || negocio?.name || 'Mi Negocio'}
                </p>
                {(nitFactura || negocio?.nit) && (
                  <p style={{ color: '#666', fontSize: 9 }}>NIT: {nitFactura || negocio?.nit}</p>
                )}
                {(emailFactura || negocio?.email) && (
                  <p style={{ color: '#666', fontSize: 9 }}>{emailFactura || negocio?.email}</p>
                )}
                {(telefonoFactura || negocio?.telefono) && (
                  <p style={{ color: '#666', fontSize: 9 }}>Tel: {telefonoFactura || negocio?.telefono}</p>
                )}
                {(direccionFactura || negocio?.direccionFiscal) && (
                  <p style={{ color: '#666', fontSize: 9 }}>{direccionFactura || negocio?.direccionFiscal}</p>
                )}
                <p style={{ fontWeight: 700, fontSize: 9, color: '#444', marginTop: 2 }}>#FAC-000001</p>

                <div style={{ borderBottom: '1px dashed #ccc', margin: '8px 0' }} />

                {[
                  { n: '2× Café americano', p: '$8.000' },
                  { n: '1× Croissant',      p: '$5.500' },
                  { n: '1× Jugo naranja',   p: '$6.000' },
                ].map(({ n, p }) => (
                  <div key={n} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                    <span style={{ color: '#333', textAlign: 'left', flex: 1 }}>{n}</span>
                    <span style={{ color: '#222' }}>{p}</span>
                  </div>
                ))}

                <div style={{ borderTop: '1px solid #ccc', marginTop: 6, paddingTop: 6, display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 12 }}>
                  <span>TOTAL</span>
                  <span>$19.500</span>
                </div>

                <div style={{ borderBottom: '1px dashed #ccc', margin: '8px 0' }} />

                <p style={{ color: '#aaa', fontSize: 8, marginTop: 4, whiteSpace: 'pre-line' }}>
                  {pieFactura || '¡Gracias por tu visita!'}
                </p>
                <p style={{ color: '#ccc', fontSize: 8 }}>Powered by mezo.app</p>
              </div>
            </div>
          </div>

        </div>
      </form>
    </div>
  );
}

// ----- TAB 3: APARIENCIA -----

function TabApariencia() {
  const { colorPrimario, setColorPrimario } = useTheme();
  const [colorHex,     setColorHex    ] = useState(colorPrimario ?? '#C8903F');
  const [modoOscuro,   setModoOscuro  ] = useState(true);
  const [tamanoFuente, setTamanoFuente] = useState('normal');

  // Cargar ajustes locales al montar
  useEffect(() => {
    const s = leerSettingsLocales();
    if (s.tamanoFuente !== undefined) {
      setTamanoFuente(s.tamanoFuente);
      aplicarTamanoFuente(s.tamanoFuente);
    }
    if (s.modoOscuro !== undefined) {
      setModoOscuro(s.modoOscuro);
      aplicarModo(s.modoOscuro);
    }
  }, []);

  // Sincronizar el color primario cuando cambia desde afuera (ej: carga desde Firebase)
  useEffect(() => {
    setColorHex(colorPrimario ?? '#C8903F');
  }, [colorPrimario]);

  function aplicarModo(oscuro) {
    document.documentElement.setAttribute('data-theme', oscuro ? 'oscuro' : 'claro');
  }

  function handleToggleModo() {
    const nuevo = !modoOscuro;
    setModoOscuro(nuevo);
    aplicarModo(nuevo);
    guardarSettingLocal('modoOscuro', nuevo);
  }

  function aplicarTamanoFuente(tamano) {
    const mapa = { pequena: '14px', normal: '16px', grande: '18px' };
    document.documentElement.style.setProperty('--mezo-font-size-base', mapa[tamano] ?? '16px');
  }

  function handleTamanoFuente(val) {
    setTamanoFuente(val);
    aplicarTamanoFuente(val);
    guardarSettingLocal('tamanoFuente', val);
  }

  async function handleGuardarColor() {
    try {
      setColorPrimario(colorHex);
      await updateNegocio({ colorPrimario: colorHex });
      toast.success('Color actualizado ✓');
    } catch {
      toast.error('Error al guardar el color.');
    }
  }

  return (
    <div className="space-y-6">

      {/* Color primario */}
      <Seccion titulo="Color del negocio">
        <p className="text-mezo-stone font-body text-sm -mt-2">
          Color principal para botones y acentos del dashboard.
        </p>
        <div className="grid grid-cols-5 gap-2">
          {COLORES_PRESET.map(c => (
            <button
              key={c.hex}
              onClick={() => setColorHex(c.hex)}
              title={c.nombre}
              className={`h-10 rounded-mezo-md border-2 transition ${colorHex === c.hex ? 'border-mezo-cream scale-110' : 'border-transparent hover:scale-105'}`}
              style={{ background: c.hex }}
            />
          ))}
        </div>
        <div className="flex items-center gap-3">
          <label className="text-mezo-stone font-body text-sm">Hex personalizado:</label>
          <input
            type="color"
            value={colorHex}
            onChange={e => setColorHex(e.target.value)}
            className="w-10 h-10 rounded-mezo-md border border-mezo-ink-line cursor-pointer bg-transparent"
          />
          <span className="text-mezo-cream-dim font-mono text-sm">{colorHex}</span>
        </div>
        <button
          onClick={handleGuardarColor}
          className="w-full py-2.5 rounded-mezo-md text-sm font-body font-semibold border transition"
          style={{ background: `${colorHex}20`, color: colorHex, borderColor: `${colorHex}60` }}
        >
          Aplicar color
        </button>
      </Seccion>

      {/* Modo oscuro / claro */}
      <Seccion titulo="Tema de la interfaz">
        <div className="flex items-center justify-between py-1">
          <div>
            <p className="text-mezo-cream font-body text-sm">Modo oscuro</p>
            <p className="text-mezo-stone font-body text-xs mt-0.5">
              mezo usa modo oscuro por defecto — el modo claro es experimental
            </p>
          </div>
          <button
            type="button"
            onClick={handleToggleModo}
            className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ml-4 ${modoOscuro ? 'bg-mezo-gold' : 'bg-mezo-ink-line'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${modoOscuro ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </div>
      </Seccion>

      {/* Tamaño de fuente */}
      <Seccion titulo="Tamaño de fuente">
        <p className="text-mezo-stone font-body text-sm -mt-2">
          Ajusta el tamaño del texto en toda la interfaz.
        </p>
        <div className="flex gap-3">
          {TAMANOS_FUENTE.map(t => (
            <button
              key={t.value}
              type="button"
              onClick={() => handleTamanoFuente(t.value)}
              className={`flex-1 py-2.5 rounded-mezo-md text-sm font-body font-semibold border transition
                ${tamanoFuente === t.value
                  ? 'bg-mezo-gold/15 border-mezo-gold text-mezo-gold'
                  : 'border-mezo-ink-line text-mezo-stone hover:border-mezo-gold/40 hover:text-mezo-cream'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </Seccion>
    </div>
  );
}

// ----- ZONAS (sigue en tab Facturación) -----

function SeccionZonas() {
  const [zonas, setZonas]       = useState([]);
  const [editando, setEditando] = useState(null);
  const [nuevo, setNuevo]       = useState(null);
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
          <button
            onClick={() => setNuevo({ nombre: '', color: '#C8903F' })}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-mezo-md text-xs font-body font-semibold border transition"
            style={{ background: 'rgba(200,144,63,0.1)', borderColor: 'rgba(200,144,63,0.4)', color: '#C8903F' }}
          >
            <Plus size={12} /> Nueva zona
          </button>
        )}
      </div>

      <div className="space-y-2">
        {zonas.map(z => (
          <div key={z.id} className="flex items-center gap-3 px-3 py-2.5 rounded-mezo-md border border-mezo-ink-line">
            {editando?.id === z.id ? (
              <>
                <input
                  type="color"
                  value={editando.color}
                  onChange={e => setEditando(prev => ({ ...prev, color: e.target.value }))}
                  className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 p-0"
                />
                <input
                  type="text"
                  value={editando.nombre}
                  onChange={e => setEditando(prev => ({ ...prev, nombre: e.target.value }))}
                  autoFocus
                  onKeyDown={e => { if (e.key === 'Enter') handleActualizar(); if (e.key === 'Escape') setEditando(null); }}
                  className="flex-1 px-2 py-1 bg-mezo-ink-muted border border-mezo-ink-line text-mezo-cream text-sm rounded-mezo-sm focus:outline-none focus:ring-2 focus:ring-mezo-gold font-body"
                />
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={handleActualizar} disabled={saving} className="p-1.5 rounded-mezo-sm transition hover:bg-mezo-verde/20" style={{ color: '#3DAA68' }}>
                    <Check size={13} />
                  </button>
                  <button onClick={() => setEditando(null)} className="p-1.5 rounded-mezo-sm transition hover:bg-mezo-rojo/20" style={{ color: '#C8573F' }}>
                    <X size={13} />
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ background: z.color ?? '#C8903F' }} />
                <span className="flex-1 text-mezo-cream font-body text-sm">{z.nombre}</span>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => setEditando({ ...z })} className="p-1.5 rounded-mezo-sm text-mezo-stone hover:text-mezo-cream transition">
                    <Pencil size={12} />
                  </button>
                  <button onClick={() => handleEliminar(z.id)} className="p-1.5 rounded-mezo-sm text-mezo-stone hover:text-mezo-rojo transition">
                    <Trash2 size={12} />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}

        {nuevo && (
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-mezo-md border border-mezo-gold/40 bg-mezo-gold/5">
            <input
              type="color"
              value={nuevo.color}
              onChange={e => setNuevo(prev => ({ ...prev, color: e.target.value }))}
              className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 p-0"
            />
            <input
              type="text"
              value={nuevo.nombre}
              onChange={e => setNuevo(prev => ({ ...prev, nombre: e.target.value }))}
              placeholder="Nombre de la zona…"
              autoFocus
              onKeyDown={e => { if (e.key === 'Enter') handleCrear(); if (e.key === 'Escape') setNuevo(null); }}
              className="flex-1 px-2 py-1 bg-mezo-ink-muted border border-mezo-ink-line text-mezo-cream placeholder-mezo-stone text-sm rounded-mezo-sm focus:outline-none focus:ring-2 focus:ring-mezo-gold font-body"
            />
            <div className="flex gap-1 flex-shrink-0">
              <button onClick={handleCrear} disabled={saving || !nuevo.nombre.trim()} className="p-1.5 rounded-mezo-sm transition hover:bg-mezo-verde/20 disabled:opacity-40" style={{ color: '#3DAA68' }}>
                <Check size={13} />
              </button>
              <button onClick={() => setNuevo(null)} className="p-1.5 rounded-mezo-sm transition hover:bg-mezo-rojo/20" style={{ color: '#C8573F' }}>
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

// ----- PÁGINA PRINCIPAL -----

const TABS = [
  { id: 'facturacion', label: 'Facturación',  icono: Building2 },
  { id: 'impresora',   label: 'Impresora',    icono: Printer   },
  { id: 'apariencia',  label: 'Apariencia',   icono: Palette   },
];

export default function Configuracion() {
  const [tabActiva, setTabActiva] = useState('facturacion');

  return (
    <div className="min-h-screen bg-mezo-ink flex flex-col">
      <Navbar />

      <main className="flex-1 px-8 py-6 max-w-3xl mx-auto w-full">

        {/* Encabezado */}
        <div className="flex items-end gap-3 mb-8">
          <Settings size={32} className="text-mezo-gold mb-1" />
          <div>
            <p className="text-mezo-stone uppercase tracking-widest text-xs font-body">Negocio</p>
            <h1
              className="text-mezo-cream font-display font-medium leading-none"
              style={{ fontSize: 40, letterSpacing: '-0.02em', fontVariationSettings: '"SOFT" 50, "opsz" 72' }}
            >
              Configuración
            </h1>
          </div>
        </div>

        {/* Tabs de navegación */}
        <div className="flex gap-1 p-1 bg-mezo-ink-raised border border-mezo-ink-line rounded-mezo-lg mb-6">
          {TABS.map(({ id, label, icono: Icono }) => (
            <button
              key={id}
              onClick={() => setTabActiva(id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-mezo-md text-sm font-body font-semibold transition
                ${tabActiva === id
                  ? 'bg-mezo-gold text-mezo-ink shadow-mezo-sm'
                  : 'text-mezo-stone hover:text-mezo-cream'}`}
            >
              <Icono size={14} />
              {label}
            </button>
          ))}
        </div>

        {/* Contenido de la tab activa */}
        {tabActiva === 'facturacion' && <TabFacturacion />}
        {tabActiva === 'impresora'   && <TabImpresora  />}
        {tabActiva === 'apariencia'  && <TabApariencia />}

      </main>
    </div>
  );
}
