import { useState, useMemo } from 'react';
import { Moon, Sun, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useOrdenes } from '../hooks/useOrdenes';
import { useDia } from '../context/DiaContext';
import { usePlan } from '../hooks/usePlan';
import { track } from '../services/analytics';
import Navbar from '../components/layout/Navbar';
import EmptyState from '../components/ui/EmptyState';
import GraficaVentas from '../components/reportes/GraficaVentas';
import KPIs, { calcularKPIs } from '../components/reportes/KPIs';
import ModalCierreDia from '../components/reportes/ModalCierreDia';
import FoodCost from '../components/reportes/FoodCost';

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
    if (!o.createdAt) return;
    const fecha = new Date(o.createdAt);
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

    grupos[key] = (grupos[key] ?? 0) + (o.total ?? 0);  // total viene del backend
  });

  return Object.entries(grupos).map(([label, valor]) => ({ label, valor }));
}


const TABS_REPORTES = [
  { id: 'ventas',    label: 'Ventas' },
  { id: 'foodcost',  label: 'Food Cost' },
];

export default function Reportes() {
  const { abrirDia, cerrarDia }         = useDia();
  const { limites }                     = usePlan();
  const navigate                        = useNavigate();
  const [tabActivo, setTabActivo]       = useState('ventas');
  const [periodo, setPeriodo]           = useState('hoy');
  const [modalCierre, setModalCierre]   = useState(false);
  const [modalUpgrade, setModalUpgrade] = useState(false);
  const { desde, hasta } = useMemo(() => calcularRango(periodo), [periodo]);
  const { ordenes, loading } = useOrdenes(desde, hasta);

  const reportesCompletos = limites.tieneReportes === 'completo';

  const kpis      = useMemo(() => calcularKPIs(ordenes), [ordenes]);
  const grafData  = useMemo(() => agruparParaGrafica(ordenes, periodo), [ordenes, periodo]);

  function handleEmpezarDia() {
    abrirDia();
    toast.success('¡Buen día! Turno abierto ✓');
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

        {/* Tabs principales: Ventas / Food Cost */}
        <div className="flex gap-1 bg-mezo-ink-raised border border-mezo-ink-line p-1 rounded-mezo-lg w-fit mb-6">
          {TABS_REPORTES.map(t => (
            <button key={t.id} onClick={() => setTabActivo(t.id)}
              className={`px-5 py-2 rounded-mezo-md text-sm font-semibold transition font-body
                ${tabActivo === t.id
                  ? 'bg-mezo-gold text-mezo-ink shadow-sm'
                  : 'text-mezo-stone hover:text-mezo-cream-dim'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ─── Tab Ventas ─────────────────────────────────────────────── */}
        {tabActivo === 'ventas' && (
          <>
            {/* Filtros de período */}
            <div className="flex gap-1.5 mb-6">
              {PERIODOS.map(p => {
                const bloqueado = !reportesCompletos && p.id !== 'hoy';
                return (
                  <button key={p.id}
                    onClick={() => {
                      if (bloqueado) {
                        track.upgradePromptMostrado('reportes_historial', limites.label);
                        setModalUpgrade(true);
                        return;
                      }
                      setPeriodo(p.id);
                    }}
                    title={bloqueado ? 'Disponible en plan Pro — Ver historial completo' : ''}
                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-mezo-md text-sm font-body font-medium transition
                      ${bloqueado
                        ? 'border border-mezo-ink-line text-mezo-stone opacity-50 cursor-not-allowed'
                        : periodo === p.id
                          ? 'bg-mezo-gold text-mezo-ink'
                          : 'border border-mezo-ink-line text-mezo-stone hover:text-mezo-cream hover:border-mezo-gold/40'}`}>
                    {bloqueado && <Lock size={11} />}
                    {p.label}
                  </button>
                );
              })}
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-40">
                <div className="w-7 h-7 border-4 border-mezo-gold border-t-transparent rounded-full animate-spin" />
              </div>
            ) : ordenes.length === 0 ? (
              <EmptyState
                icon={
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <path d="M3 18l4-4 4 4 8-8" stroke="#C8903F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M15 6h4v4" stroke="#C8903F" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                }
                titulo="Aún no hay ventas para reportar"
                descripcion="Cuando empieces a vender, aquí verás tus reportes con análisis de IA."
                cta="Ir al POS"
                onCta={() => navigate('/pos')}
              />
            ) : (
              <div className="space-y-6">
                <KPIs kpis={kpis} />

                <div className="bg-mezo-ink-raised border border-mezo-ink-line rounded-mezo-xl p-5">
                  <GraficaVentas datos={grafData} titulo="Ventas por período" />
                </div>

                {/* Análisis IA — Próximamente */}
                <div className="relative bg-mezo-ink-raised border border-mezo-ink-line rounded-mezo-xl p-5">
                  <span className="absolute top-4 right-4 text-xs font-semibold font-body px-2.5 py-1 rounded-full"
                    style={{ background: 'rgba(200,144,63,0.15)', color: '#C8903F', border: '1px solid rgba(200,144,63,0.3)' }}>
                    Próximamente
                  </span>

                  <div className="mb-4">
                    <span className="inline-flex items-center gap-1.5 text-xs font-body font-semibold px-2.5 py-1 rounded-full"
                      style={{ background: 'rgba(200,144,63,0.12)', color: '#C8903F', border: '1px solid rgba(200,144,63,0.25)' }}>
                      ✨ IA · Próximamente
                    </span>
                    <p className="text-mezo-cream font-body font-semibold text-sm mt-3">
                      Análisis inteligente de ventas
                    </p>
                    <p className="text-mezo-stone font-body text-sm mt-2 leading-relaxed">
                      Pronto podrás recibir recomendaciones personalizadas basadas en tus ventas reales:
                      productos más rentables, estrategias por horario, predicción de demanda y más.
                    </p>
                  </div>

                  <ul className="space-y-2 mb-5">
                    {[
                      'Estrategias de venta personalizadas',
                      'Predicción de demanda por día y hora',
                      'Análisis de rentabilidad por producto',
                      'Alertas de caída de ventas',
                      'Resumen semanal automático',
                    ].map(feature => (
                      <li key={feature} className="flex items-center gap-2 text-mezo-stone font-body text-sm">
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ background: 'rgba(200,144,63,0.5)' }} />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <button
                    disabled
                    title="Disponible próximamente"
                    className="flex items-center gap-2 px-4 py-2 rounded-mezo-md text-sm font-body font-medium opacity-40 cursor-not-allowed"
                    style={{ background: 'rgba(200,144,63,0.1)', border: '1px solid rgba(200,144,63,0.3)', color: '#C8903F' }}>
                    ✨ Analizar con IA
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* ─── Tab Food Cost ───────────────────────────────────────────── */}
        {tabActivo === 'foodcost' && <FoodCost />}
      </main>

      {modalCierre && (
        <ModalCierreDia
          kpis={kpis}
          onCerrar={() => { cerrarDia(); setModalCierre(false); }}
          onCancelar={() => setModalCierre(false)}
        />
      )}

      {/* Modal de upgrade — período bloqueado en plan Semilla */}
      {modalUpgrade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={() => setModalUpgrade(false)}>
          <div className="bg-mezo-ink-raised border border-mezo-gold/30 rounded-mezo-xl p-8 max-w-sm mx-4 text-center"
            onClick={e => e.stopPropagation()}>
            <p className="text-3xl mb-3">🔒</p>
            <h3 className="text-mezo-cream font-body font-semibold text-lg mb-2">
              Disponible en plan Pro
            </h3>
            <p className="text-mezo-stone font-body text-sm mb-6 leading-relaxed">
              El historial completo — semana, mes, trimestre y año — está disponible en el plan Pro.
              Accede a todas las gráficas y analiza el desempeño de tu negocio.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setModalUpgrade(false)}
                className="flex-1 py-2.5 rounded-mezo-md text-sm font-body font-medium border border-mezo-ink-line text-mezo-stone hover:text-mezo-cream transition">
                Cerrar
              </button>
              <button
                onClick={() => { setModalUpgrade(false); navigate('/configuracion'); }}
                className="flex-1 py-2.5 rounded-mezo-md text-sm font-body font-semibold transition"
                style={{ background: '#C8903F', color: '#080706' }}>
                Ver planes →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
