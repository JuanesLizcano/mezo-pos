import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MezoWordmark from '../components/brand/MezoWordmark';
import StepNombre from '../components/onboarding/StepNombre';
import StepTipo from '../components/onboarding/StepTipo';
import StepOperacion from '../components/onboarding/StepOperacion';
import StepProducto from '../components/onboarding/StepProducto';
import StepFoto from '../components/onboarding/StepFoto';

const ESTADO_INICIAL = {
  nombre: '', tipo: 'cafetería',
  ciudad: '', direccion: '', whatsapp: '', horario: '', tieneMesas: true, mesas: 6,
  productoNombre: '', productoPrecio: '', productoDescripcion: '',
  productoIngredientes: [], productoEmoji: '🍽️',
};

const TOTAL_PASOS_NEGOCIO = 5;

// step 0 = crear cuenta (sin barra), steps 1–5 = configuración del negocio (con barra)
export default function Onboarding() {
  const { user, negocio, loading } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [data, setData] = useState(ESTADO_INICIAL);

  // Si el usuario ya tiene negocio configurado, ir directo al dashboard
  useEffect(() => {
    if (!loading && user && negocio) {
      navigate('/dashboard', { replace: true });
    }
  }, [loading, user, negocio, navigate]);


  function updateData(fields) {
    setData(prev => ({ ...prev, ...fields }));
  }

  const next = () => setStep(s => s + 1);
  const prev = () => setStep(s => Math.max(s - 1, 1));

  const STEPS = {
    1: <StepNombre   data={data} updateData={updateData} next={next} />,
    2: <StepTipo     data={data} updateData={updateData} next={next} prev={prev} />,
    3: <StepOperacion data={data} updateData={updateData} next={next} prev={prev} />,
    4: <StepProducto data={data} updateData={updateData} next={next} prev={prev} />,
    5: <StepFoto     data={data} updateData={updateData} prev={prev} />,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-mezo-ink flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-mezo-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mezo-ink flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">

        {/* Logo */}
        <div className="text-center mb-8">
          <MezoWordmark height={120} color="#C8903F" />
          <p className="text-mezo-stone text-sm mt-2 font-body">Configura tu negocio en minutos</p>
        </div>

        {/* Barra de progreso — solo visible en pasos 1–5 */}
        {step >= 1 && (
          <div className="mb-6">
            {/* Segmentos */}
            <div className="flex gap-1.5 mb-3">
              {Array.from({ length: TOTAL_PASOS_NEGOCIO }, (_, i) => i + 1).map(n => (
                <div
                  key={n}
                  className="flex-1 h-1 rounded-full transition-all duration-300"
                  style={{ background: n <= step ? '#C8903F' : '#2A2520' }}
                />
              ))}
            </div>
            {/* Dots con número */}
            <div className="flex gap-1.5">
              {Array.from({ length: TOTAL_PASOS_NEGOCIO }, (_, i) => i + 1).map(n => (
                <div key={n} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold transition-all duration-300"
                    style={
                      n < step
                        ? { background: '#C8903F', color: '#0D0B09' }
                        : n === step
                          ? { background: '#C8903F20', color: '#C8903F', border: '1.5px solid #C8903F' }
                          : { background: '#1A1713', color: '#3A332C', border: '1.5px solid #2A2520' }
                    }
                  >
                    {n < step ? '✓' : n}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contenido del paso */}
        <div className="bg-mezo-ink-raised border border-mezo-ink-line rounded-mezo-xl p-8 shadow-mezo-lg">
          {STEPS[step]}
        </div>

        <p className="text-center text-xs text-mezo-stone mt-6 font-body">
          Tus datos están protegidos y encriptados con mezo.
        </p>
      </div>
    </div>
  );
}
