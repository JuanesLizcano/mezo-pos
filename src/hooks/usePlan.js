import { useAuth } from '../context/AuthContext';

const PLANES = {
  semilla: {
    maxMesas:       4,
    maxProductos:   25,
    maxCategorias:  3,
    maxEmpleados:   3,
    maxSedes:       1,
    tieneReportes:  false,
    tieneIA:        false,
    label:          'Semilla',
  },
  pro: {
    maxMesas:       null, // ilimitado
    maxProductos:   null,
    maxCategorias:  null,
    maxEmpleados:   null,
    maxSedes:       1,
    tieneReportes:  true,
    tieneIA:        false,
    label:          'Pro',
  },
  elite: {
    maxMesas:       null,
    maxProductos:   null,
    maxCategorias:  null,
    maxEmpleados:   null,
    maxSedes:       null,
    tieneReportes:  true,
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
    if (max === null || max === undefined) return { permitido: true };
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
