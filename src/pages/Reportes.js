import { useState, useMemo } from 'react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Sparkles, Moon, Sun } from 'lucide-react';
import toast from 'react-hot-toast';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { useOrdenes } from '../hooks/useOrdenes';
import Navbar from '../components/layout/Navbar';
import GraficaVentas from '../components/reportes/GraficaVentas';
import KPIs, { calcularKPIs } from '../components/reportes/KPIs';
import ModalCierreDia from '../components/reportes/ModalCierreDia';
import { analizarVentas } from '../services/claude';

const PERIODOS = [
  { id: 'hoy',       label: 'Hoy' },
  { id: 'semana',    label: 'Semana' },
  { id: 'mes',       label: 'Mes' },
  { id: 'trimestre', label: 'Trimestre' },
  { id: 'año',       label: 'Año' },
];

function calcularRango(periodo) {
  const ahora  = new Date();
  const hoy    = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());

  switch (periodo) {
    case 'hoy':
      return { desde: hoy, hasta: ahora };
    case 'semana': {
      const lunes = new Date(hoy);
      lunes.setDate(hoy.getDate() - ((hoy.getDay() + 6) % 7));
      return { desde: lunes, hasta: ahora };
    }
    case 'mes':
      return { desde: new Date(ahora.getFullYear(), ahora.getMonth(), 1), hasta: ahora };
    case 'trimestre': {
      const trimestre = Math.floor(ahora.getMonth() / 3);
      return { desde: new Date(ahora.getFullYear(), trimestre * 3, 1), hasta: ahora };
    }
    case 'año':
      return { desde: new Date(ahora.getFullYear(), 0, 1), hasta: ahora };
    default:
      return { desde: hoy, hasta: ahora };
  }
}

// Agrupa órdenes en puntos de datos para la gráfica según período
function agruparParaGrafica(ordenes, periodo) {
  const grupos = {};

  ordenes.forEach(o => {
    if (!o.creadoEn?.toDate) return;
    const fecha = o.creadoEn.toDate();
    let key;

    switch (periodo) {
      case 'hoy':
        key = `${String(fecha.getHours()).padStart(2, '0')}h`;
        break;
      case 'semana': {
        const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        key = dias[fecha.getDay()];
        break;
      }
      case 'mes':
        key = `${fecha.getDate()}`;
        break;
      case 'trimestre': {
        const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
        const sem = Math.ceil(fecha.getDate() / 7);
        key = `${meses[fecha.getMonth()]} S${sem}`;
        break;
      }
      case 'año': {
        const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
        key = meses[fecha.getMonth()];
        break;
      }
      default:
        key = fecha.toLocaleDateString('es-CO');
    }

    grupos[key] = (grupos[key] ?? 0) + (o.total ?? 0);
  });

  return Object.entries(grupos).map(([label, valor]) => ({ label, valor }));
}

function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function Reportes() {
  const { user }            = useAuth();
  const [periodo, setPeriodo] = useState('hoy');
  const [modalCierre, setModalCierre]   = useState(false);
  const [iaTexto, setIaTexto]           = useState('');
  const [iaLoading, setIaLoading]       = useState(false);
  const [iaError, setIaError]           = useState('');

  const { desde, hasta } = useMemo(() => calcularRango(periodo), [periodo]);
  const { ordenes, loading } = useOrdenes(desde, hasta);

  const kpis      = useMemo(() => calcularKPIs(ordenes), [ordenes]);
  const grafData  = useMemo(() => agruparParaGrafica(ordenes, periodo), [ordenes, periodo]);

  async function handleEmpezarDia() {
    const diaRef = doc(db, 'negocios', user.uid, 'dias', hoyISO());
    await setDoc(diaRef, { fecha: hoyISO(), estado: 'abierto', abiertoEn: serverTimestamp() }, { merge: true });
    toast.success('¡Buen día! Turno abierto ✓');
  }

  async function handleIA() {
    setIaLoading(true);
    setIaError('');
    setIaTexto('');
    try {
      const resumen = {
        periodo,
        totalVendido:    kpis.total,
        numOrdenes:      kpis.numOrdenes,
        ticketPromedio:  kpis.ticketPromedio,
        mejorHora:       kpis.mejorHora,
        productoTop:     kpis.productoTop,
        metodoPagoTop:   kpis.metodoPagoTop,
        datosGrafica:    grafData,
      };
      const texto = await analizarVentas(resumen);
      setIaTexto(texto);
    } catch (err) {
      if (err.message === 'API_KEY_MISSING') {
        setIaError('Configura REACT_APP_ANTHROPIC_API_KEY en tu .env para activar el análisis IA.');
        toast.error('Falta la API key de Claude en .env');
      } else {
        setIaError('Error al conectar con Claude. Revisa tu API key o el proxy de CORS.');
        toast.error('Error al analizar con IA');
      }
    } finally {
      setIaLoading(false);
    }
  }

  return (
    <div className="h-screen bg-mezo-ink flex flex-col overflow-hidden">
      <Navbar />

      <main className="flex-1 overflow-y-auto px-8 py-6">
        {/* Encabezado */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-mezo-stone uppercase tracking-widest text-xs mb-1 font-body">Análisis</p>
            <h1 className="text-mezo-cream font-display font-medium leading-none"
              style={{ fontSize: 40, letterSpacing: '-0.02em', fontVariationSettings: '"SOFT" 50, "opsz" 72' }}>
              Reportes
            </h1>
          </div>
          <div className="flex gap-2">
            <button onClick={handleEmpezarDia}
              className="flex items-center gap-2 px-4 py-2 rounded-mezo-md border border-mezo-verde/40 text-mezo-verde hover:bg-mezo-verde/10 text-sm font-body font-medium transition">
              <Sun size={14} /> Empezar día
            </button>
            <button onClick={() => setModalCierre(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-mezo-md border border-mezo-rojo/40 text-mezo-rojo hover:bg-mezo-rojo/10 text-sm font-body font-medium transition">
              <Moon size={14} /> Cerrar día
            </button>
          </div>
        </div>

        {/* Tabs de período */}
        <div className="flex gap-1.5 mb-6">
          {PERIODOS.map(p => (
            <button key={p.id} onClick={() => setPeriodo(p.id)}
              className={`px-4 py-1.5 rounded-mezo-md text-sm font-body font-medium transition
                ${periodo === p.id
                  ? 'bg-mezo-gold text-mezo-ink'
                  : 'border border-mezo-ink-line text-mezo-stone hover:text-mezo-cream hover:border-mezo-gold/40'}`}>
              {p.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-7 h-7 border-4 border-mezo-gold border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* KPIs */}
            <KPIs kpis={kpis} />

            {/* Gráfica */}
            <div className="bg-mezo-ink-raised border border-mezo-ink-line rounded-mezo-xl p-5">
              <GraficaVentas datos={grafData} titulo="Ventas por período" />
            </div>

            {/* Análisis IA */}
            <div className="bg-mezo-ink-raised border border-mezo-ink-line rounded-mezo-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-mezo-stone uppercase tracking-widest font-body" style={{ fontSize: 10 }}>
                    Claude AI
                  </p>
                  <p className="text-mezo-cream font-body font-semibold text-sm mt-0.5">
                    Análisis inteligente de ventas
                  </p>
                </div>
                <button onClick={handleIA} disabled={iaLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-mezo-gold/15 border border-mezo-gold/40 text-mezo-gold hover:bg-mezo-gold/25 rounded-mezo-md text-sm font-body font-medium transition disabled:opacity-50">
                  <Sparkles size={14} />
                  {iaLoading ? 'Analizando...' : 'Analizar con IA'}
                </button>
              </div>

              {iaError && (
                <p className="text-mezo-stone font-body text-sm bg-mezo-ink-muted rounded-mezo-md px-4 py-3">
                  {iaError}
                </p>
              )}

              {iaTexto && (
                <div className="space-y-3">
                  {iaTexto.split('\n').filter(l => l.trim()).map((linea, i) => (
                    <div key={i} className="flex gap-3">
                      <span className="text-mezo-gold font-mono text-sm shrink-0">{i + 1}.</span>
                      <p className="text-mezo-cream-dim font-body text-sm leading-relaxed">
                        {linea.replace(/^\d+\.\s*/, '')}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {!iaTexto && !iaError && !iaLoading && (
                <p className="text-mezo-stone font-body text-sm">
                  Presiona "Analizar con IA" para recibir recomendaciones personalizadas basadas en tus ventas reales.
                </p>
              )}
            </div>
          </div>
        )}
      </main>

      {modalCierre && (
        <ModalCierreDia
          kpis={kpis}
          onCerrar={() => setModalCierre(false)}
          onCancelar={() => setModalCierre(false)}
        />
      )}
    </div>
  );
}
