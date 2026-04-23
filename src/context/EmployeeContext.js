import { createContext, useContext, useState } from 'react';
import { createTurno, updateTurno } from '../services';
import { useAuth } from './AuthContext';

const EmployeeContext = createContext(null);

export function EmployeeProvider({ children }) {
  const { user }   = useAuth();
  const [empleadoActivo, setEmpleadoActivoState] = useState(null);
  const [turnoId, setTurnoId]                     = useState(null);

  async function iniciarTurno(empleado, baseTurno = 0) {
    if (!user || !empleado) return;
    const turno = await createTurno({
      empleadoId:     empleado.id,
      empleadoNombre: empleado.nombre,
      roles:          empleado.rolesSeleccionados ?? empleado.roles ?? [],
      baseTurno,
    });
    setTurnoId(turno.id);
    setEmpleadoActivoState({ ...empleado, turnoId: turno.id, baseTurno });
  }

  async function cerrarTurno() {
    if (!user || !turnoId) return;
    const inicio     = empleadoActivo?.turnoInicio ?? Date.now();
    const duracionMin = Math.round((Date.now() - inicio) / 60000);
    await updateTurno(turnoId, { fin: new Date().toISOString(), duracionMin });
    setTurnoId(null);
    setEmpleadoActivoState(null);
  }

  async function registrarOrdenEnTurno() {
    if (!user || !turnoId) return;
    // El contador de órdenes en el turno se incrementa localmente
    // El backend lo maneja en el endpoint de createOrden
    await updateTurno(turnoId, { numOrdenes: (empleadoActivo?.numOrdenes ?? 0) + 1 });
  }

  function setEmpleadoActivo(emp) {
    setEmpleadoActivoState(emp ? { ...emp, turnoInicio: Date.now(), numOrdenes: 0 } : null);
    setTurnoId(null);
  }

  const tieneRol = (rol) => {
    if (!empleadoActivo) return false;
    const roles = empleadoActivo.rolesSeleccionados ?? empleadoActivo.roles ?? [];
    return roles.includes('admin') || roles.includes(rol);
  };

  return (
    <EmployeeContext.Provider value={{
      empleadoActivo, turnoId,
      setEmpleadoActivo,
      iniciarTurno, cerrarTurno, registrarOrdenEnTurno,
      tieneRol,
    }}>
      {children}
    </EmployeeContext.Provider>
  );
}

export function useEmployee() {
  return useContext(EmployeeContext);
}
