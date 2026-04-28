import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { track } from '../services/analytics';
import MezoWordmark from '../components/brand/MezoWordmark';
import BanderaColombiana from '../components/brand/BanderaColombiana';
import StepBienvenida from '../components/onboarding/StepBienvenida';
import StepNombre    from '../components/onboarding/StepNombre';
import StepTipo      from '../components/onboarding/StepTipo';
import StepOperacion from '../components/onboarding/StepOperacion';
import StepProducto  from '../components/onboarding/StepProducto';
import StepFoto      from '../components/onboarding/StepFoto';
import StepEquipo    from '../components/onboarding/StepEquipo';
import StepListo     from '../components/onboarding/StepListo';

const ESTADO_INICIAL = {
  // Paso 1
  nombre: '',
  // Paso 2
  tipo: 'cafetería',
  // Paso 3
  city: '', address: '', phone: '', email: '', nit: '',
  openingTime: '07:00', closingTime: '22:00',
  tieneMesas: true, mesas: 6,
  // Paso 4
  productoNombre: '', productoPrecio: '', productoCosto: '',
  productoDescripcion: '', productoIngredientes: [],
  // Paso 5
  productoEmoji: '🍽️', productoModo: 'emoji', productoPreview: null,
  // Paso 6
  empleados: [],
};

// Pasos de configuración visibles en la barra (1–6)
const TOTAL_PASOS = 6;
// Paso 0 = bienvenida, pasos 1–6 = config, paso 7 = listo (sin barra)
const LABEL_PASOS = ['Nombre', 'Tipo', 'Negocio', 'Producto', 'Foto', 'Equipo'];

export default function Onboarding() {
  const { user, negocio, loading } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [data, setData] = useState(ESTADO_INICIAL);

  useEffect(() => {
    if (!loading && user && negocio) navigate('/dashboard', { replace: true });
  }, [loading, user, negocio, navigate]);

  function updateData(fields) {
    setData(prev => ({ ...prev, ...fields }));
  }

  function next() {
    const siguientePaso = step + 1;
    if (step === 0) track.onboardingIniciado();
    else if (siguientePaso === 7) track.onboardingCompletado({ tipo: data.tipo, tieneMesas: data.tieneMesas });
    else track.onboardingPasoCompletado(step, { paso: LABEL_PASOS[step - 1] });
    setStep(siguientePaso);
  }

  const prev = () => setStep(s => Math.max(s - 1, 0));

  const STEPS = {
    0: <StepBienvenida next={next} />,
    1: <StepNombre    data={data} updateData={updateData} next={next} />,
    2: <StepTipo      data={data} updateData={updateData} next={next} prev={prev} />,
    3: <StepOperacion data={data} updateData={updateData} next={next} prev={prev} />,
    4: <StepProducto  data={data} updateData={updateData} next={next} prev={prev} />,
    5: <StepFoto      data={data} updateData={updateData} next={next} prev={prev} />,
    6: <StepEquipo    data={data} updateData={updateData} next={next} prev={prev} />,
    7: <StepListo     data={data} prev={prev} />,
  };

  const mostrarBarra  = step >= 1 && step <= TOTAL_PASOS;
  const mostrarLogo   = step !== 0;  // el logo lo muestra StepBienvenida con tamaño propio

  if (loading) {
    return (
      <div className="min-h-screen bg-mezo-ink flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-mezo-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-mezo-ink flex items-center justify-center px-4 py-10 overflow-hidden">
      {/* Lazo tricolor colombiano */}
      <BanderaColombiana />

      <div className="w-full max-w-lg">

        {/* Logo — solo en pasos 1+ */}
        {mostrarLogo && (
          <div className="text-center mb-6">
            <MezoWordmark height={40} color="#C8903F" />
          </div>
        )}

        {/* Barra de progreso — pasos 1–6 */}
        {mostrarBarra && (
          <div className="mb-6">
            {/* Segmentos */}
            <div className="flex gap-1.5 mb-3">
              {Array.from({ length: TOTAL_PASOS }, (_, i) => i + 1).map(n => (
                <div key={n} className="flex-1 h-1 rounded-full transition-all duration-300"
                  style={{ background: n <= step ? '#C8903F' : '#2A2520' }} />
              ))}
            </div>
            {/* Dots con número y etiqueta */}
            <div className="flex gap-1.5">
              {Array.from({ length: TOTAL_PASOS }, (_, i) => i + 1).map(n => (
                <div key={n} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold transition-all duration-300"
                    style={
                      n < step
                        ? { background: '#C8903F', color: '#0D0B09' }
                        : n === step
                          ? { background: 'rgba(200,144,63,0.15)', color: '#C8903F', border: '1.5px solid #C8903F' }
                          : { background: '#1A1713', color: '#3A332C', border: '1.5px solid #2A2520' }
                    }
                  >
                    {n < step ? '✓' : n}
                  </div>
                  <span className="font-body hidden sm:block"
                    style={{ fontSize: 9, color: n === step ? '#C8903F' : '#4A3F35' }}>
                    {LABEL_PASOS[n - 1]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contenido del paso */}
        <div className="bg-mezo-ink-raised border border-mezo-ink-line rounded-mezo-xl p-8 shadow-mezo-lg">
          {STEPS[step]}
        </div>

        {/* Pie de página — solo en bienvenida y pasos de config */}
        {step < 7 && (
          <p className="text-center text-xs text-mezo-stone mt-5 font-body">
            Tus datos están protegidos con mezo.
          </p>
        )}
      </div>
    </div>
  );
}
