import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MezoWordmark from '../components/brand/MezoWordmark';
import StepIndicator from '../components/onboarding/StepIndicator';
import Step1Cuenta from '../components/onboarding/Step1Cuenta';
import Step2Negocio from '../components/onboarding/Step2Negocio';
import Step3Plan from '../components/onboarding/Step3Plan';
import Step4Mesas from '../components/onboarding/Step4Mesas';
import Step5Listo from '../components/onboarding/Step5Listo';

const ESTADO_INICIAL = {
  email: '', password: '', confirmPassword: '',
  nombre: '', tipo: 'cafetería', ciudad: '', telefono: '',
  plan: 'pro',
  tieneMesas: true, mesas: 6,
};

export default function Onboarding() {
  const { user, negocio, loading } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [data, setData] = useState(ESTADO_INICIAL);

  useEffect(() => {
    if (!loading && user && negocio) {
      navigate('/dashboard', { replace: true });
    }
  }, [loading, user, negocio, navigate]);

  function updateData(fields) {
    setData((prev) => ({ ...prev, ...fields }));
  }

  const next = () => setStep((s) => Math.min(s + 1, 5));
  const prev = () => setStep((s) => Math.max(s - 1, 1));

  const STEPS = {
    1: <Step1Cuenta data={data} updateData={updateData} next={next} />,
    2: <Step2Negocio data={data} updateData={updateData} next={next} prev={prev} />,
    3: <Step3Plan data={data} updateData={updateData} next={next} prev={prev} />,
    4: <Step4Mesas data={data} updateData={updateData} next={next} prev={prev} />,
    5: <Step5Listo data={data} prev={prev} />,
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
        <div className="text-center mb-8">
          <MezoWordmark height={120} color="#C8903F" />
          <p className="text-mezo-stone text-sm mt-2 font-body">Configura tu negocio en 5 pasos</p>
        </div>

        <StepIndicator actual={step} />

        <div className="bg-mezo-ink-raised border border-mezo-ink-line rounded-mezo-xl p-8 shadow-mezo-lg">
          {STEPS[step]}
        </div>

        <p className="text-center text-xs text-mezo-stone mt-6 font-body">
          Tus datos están protegidos con Firebase Authentication
        </p>
      </div>
    </div>
  );
}
