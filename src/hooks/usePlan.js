import { useAuth } from '../context/AuthContext';

const PLANES = {
  semilla: {
    maxMesas:       8,
    maxProductos:   50,
    maxCategorias:  5,
    maxEmpleados:   5,
    maxSedes:       1,
    tieneReportes:  'basico',  // solo ventas de hoy
    tieneIA:        false,
    label:          'Semilla',
  },
  pro: {
    maxMesas:       Infinity,
    maxProductos:   Infinity,
    maxCategorias:  Infinity,
    maxEmpleados:   Infinity,
    maxSedes:       1,
    tieneReportes:  'completo',
    tieneIA:        false,
    label:          'Pro',
  },
  elite: {
    maxMesas:       Infinity,
    maxProductos:   Infinity,
    maxCategorias:  Infinity,
    maxEmpleados:   Infinity,
    maxSedes:       Infinity,
    tieneReportes:  'completo',
    tieneIA:        true,
    label:          'Elite',
  },
};

export function usePlan() {
  const { user } = useAuth();
  // planType viene en mayúsculas del backend ('SEMILLA', 'PRO', 'ELITE')
  const plan    = (user?.planType ?? 'SEMILLA').toLowerCase();
  const limites = PLANES[plan] ?? PLANES.semilla;

  // Devuelve { permitido: bool, mensaje?: string }
  function verificarLimite(tipo, conteoActual) {
    const max = limites[`max${tipo}`];
    if (max === Infinity || max === null || max === undefined) return { permitido: true };
    if (conteoActual >= max) {
      return {
        permitido: false,
        mensaje:   `Alcanzaste el límite de ${max} ${tipo.toLowerCase()} en tu plan ${limites.label}`,
      };
    }
    return { permitido: true };
  }

  return { plan, limites, verificarLimite, PLANES };
}
