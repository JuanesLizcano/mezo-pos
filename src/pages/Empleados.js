import { useState } from 'react';
import { UserPlus, Search, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { createEmpleado, updateEmpleado } from '../services';
import { emailInvitacionEmpleado } from '../services/emails';
import { useAuth } from '../context/AuthContext';
import { useEmpleados } from '../hooks/useEmpleados';
import { normalizeText } from '../utils/formatters';
import Navbar from '../components/layout/Navbar';
import EmptyState from '../components/ui/EmptyState';
import FormEmpleado from '../components/empleados/FormEmpleado';
import TarjetaEmpleado from '../components/empleados/TarjetaEmpleado';

export default function Empleados() {
  const { bumpVersion, negocio }    = useAuth();
  const { empleados, loading }      = useEmpleados();
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando]     = useState(null);
  const [guardando, setGuardando]   = useState(false);
  const [busqueda, setBusqueda]     = useState('');

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

  const query     = normalizeText(busqueda.trim());
  const visibles  = query ? empleados.filter(e => normalizeText(e.nombre ?? '').includes(query)) : empleados;
  const activos   = visibles.filter(e => e.activo !== false);
  const inactivos = visibles.filter(e => e.activo === false);

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

        {/* Búsqueda por nombre */}
        <div className="relative mb-5">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-mezo-stone pointer-events-none" />
          <input
            type="text"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar empleado…"
            className="w-full pl-9 pr-9 py-2 bg-mezo-ink-raised border border-mezo-ink-line text-mezo-cream placeholder-mezo-stone rounded-mezo-md text-sm focus:outline-none focus:ring-2 focus:ring-mezo-gold/50 font-body transition"
          />
          {busqueda && (
            <button onClick={() => setBusqueda('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-mezo-stone hover:text-mezo-cream transition">
              <X size={13} />
            </button>
          )}
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
              <EmptyState
                icon={
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="8" r="4" stroke="#C8903F" strokeWidth="1.5"/>
                    <path d="M4 21c0-4 4-7 8-7s8 3 8 7" stroke="#C8903F" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                }
                titulo="Tu equipo, tu gente"
                descripcion="Agrega meseros, baristas, cajeros. Cada uno con su rol y permisos."
                cta="Agregar primer empleado"
                onCta={() => { setEditando(null); setModalAbierto(true); }}
              />
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
