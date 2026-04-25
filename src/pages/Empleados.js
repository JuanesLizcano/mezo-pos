import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { createEmpleado, updateEmpleado } from '../services';
import { emailInvitacionEmpleado } from '../services/emails';
import { useAuth } from '../context/AuthContext';
import { useEmpleados } from '../hooks/useEmpleados';
import Navbar from '../components/layout/Navbar';
import FormEmpleado from '../components/empleados/FormEmpleado';
import TarjetaEmpleado from '../components/empleados/TarjetaEmpleado';

export default function Empleados() {
  const { bumpVersion, negocio }    = useAuth();
  const { empleados, loading }      = useEmpleados();
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando]     = useState(null);
  const [guardando, setGuardando]   = useState(false);

  async function handleGuardar(datos) {
    setGuardando(true);
    try {
      if (editando) {
        await updateEmpleado(editando.id, {
          nombre: datos.nombre,
          correo: datos.correo,
          pin:    datos.pin,
          roles:  datos.roles,
        });
        toast.success('Empleado actualizado ✓');
      } else {
        const nuevo = await createEmpleado(datos);
        toast.success('Empleado creado ✓');
        if (datos.correo) {
          emailInvitacionEmpleado(nuevo ?? datos, negocio ?? {}).catch(() => {});
        }
      }
      bumpVersion();
      setModalAbierto(false);
      setEditando(null);
    } catch {
      toast.error('Error al guardar el empleado. Intenta de nuevo.');
    } finally {
      setGuardando(false);
    }
  }

  async function handleToggleActivo(empleado) {
    const nuevoEstado = empleado.activo !== false ? false : true;
    await updateEmpleado(empleado.id, { activo: nuevoEstado });
    bumpVersion();
  }

  function abrirEditar(emp) {
    setEditando(emp);
    setModalAbierto(true);
  }

  const activos   = empleados.filter(e => e.activo !== false);
  const inactivos = empleados.filter(e => e.activo === false);

  return (
    <div className="h-screen bg-mezo-ink flex flex-col overflow-hidden">
      <Navbar />

      <main className="flex-1 overflow-y-auto px-8 py-6">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-mezo-stone uppercase tracking-widest text-xs mb-1 font-body">Equipo</p>
            <h1 className="text-mezo-cream font-display font-medium leading-none"
              style={{ fontSize: 40, letterSpacing: '-0.02em', fontVariationSettings: '"SOFT" 50, "opsz" 72' }}>
              Empleados
            </h1>
          </div>
          <button onClick={() => { setEditando(null); setModalAbierto(true); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-mezo-gold hover:bg-mezo-gold-deep text-mezo-ink font-semibold text-sm rounded-mezo-md transition font-body">
            <UserPlus size={15} /> Nuevo empleado
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-7 h-7 border-4 border-mezo-gold border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            {activos.length > 0 && (
              <div>
                <p className="text-mezo-stone font-body text-xs uppercase tracking-widest mb-3">
                  Activos ({activos.length})
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {activos.map(emp => (
                    <TarjetaEmpleado key={emp.id} empleado={emp}
                      onEditar={abrirEditar} onToggleActivo={handleToggleActivo} />
                  ))}
                </div>
              </div>
            )}
            {inactivos.length > 0 && (
              <div>
                <p className="text-mezo-stone font-body text-xs uppercase tracking-widest mb-3">
                  Inactivos ({inactivos.length})
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {inactivos.map(emp => (
                    <TarjetaEmpleado key={emp.id} empleado={emp}
                      onEditar={abrirEditar} onToggleActivo={handleToggleActivo} />
                  ))}
                </div>
              </div>
            )}
            {empleados.length === 0 && (
              <div className="flex flex-col items-center justify-center h-48 gap-3 text-center">
                <span style={{ fontSize: 40 }}>👥</span>
                <p className="text-mezo-cream font-body font-medium">Aún no hay empleados</p>
                <p className="text-mezo-stone font-body text-sm">
                  Crea el equipo y asígnales roles para controlar el acceso al sistema.
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(8,7,6,0.85)' }}>
          <div className="bg-mezo-ink-raised border border-mezo-ink-line rounded-mezo-xl p-7 w-full max-w-md shadow-mezo-lg max-h-[90vh] overflow-y-auto">
            <h3 className="font-semibold text-mezo-cream font-body text-lg mb-6">
              {editando ? 'Editar empleado' : 'Nuevo empleado'}
            </h3>
            <FormEmpleado
              inicial={editando}
              onGuardar={handleGuardar}
              onCancelar={() => { setModalAbierto(false); setEditando(null); }}
              loading={guardando}
            />
          </div>
        </div>
      )}
    </div>
  );
}
