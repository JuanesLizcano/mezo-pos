import posthog from 'posthog-js';

if (process.env.REACT_APP_POSTHOG_KEY) {
  posthog.init(process.env.REACT_APP_POSTHOG_KEY, {
    api_host: 'https://app.posthog.com',
    loaded: (ph) => {
      if (process.env.NODE_ENV === 'development') {
        ph.opt_out_capturing();
      }
    },
  });
}

export const track = {
  // Onboarding
  onboardingIniciado: () =>
    posthog.capture('onboarding_iniciado'),

  onboardingPasoCompletado: (paso, datos = {}) =>
    posthog.capture('onboarding_paso_completado', { paso, ...datos }),

  onboardingCompletado: (datos = {}) =>
    posthog.capture('onboarding_completado', datos),

  onboardingAbandonado: (paso) =>
    posthog.capture('onboarding_abandonado', { paso }),

  // POS
  ordenCreada: (datos = {}) =>
    posthog.capture('orden_creada', datos),

  ordenCobrada: (datos = {}) =>
    posthog.capture('orden_cobrada', datos),

  metodoPagoSeleccionado: (metodo) =>
    posthog.capture('metodo_pago_seleccionado', { metodo }),

  // Mesas
  mesaOcupada: (zona) =>
    posthog.capture('mesa_ocupada', { zona }),

  cuentaDividida: (personas) =>
    posthog.capture('cuenta_dividida', { personas }),

  // Día
  diaAbierto: () =>
    posthog.capture('dia_abierto'),

  diaCerrado: (resumen = {}) =>
    posthog.capture('dia_cerrado', resumen),

  // Planes
  upgradePromptMostrado: (feature, planActual) =>
    posthog.capture('upgrade_prompt_mostrado', { feature, planActual }),

  // Identificar negocio al hacer login
  identificarNegocio: (negocioId, datos = {}) =>
    posthog.identify(negocioId, datos),
};

export default posthog;
