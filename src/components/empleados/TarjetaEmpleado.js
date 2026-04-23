import { Pencil, Power } from 'lucide-react';
import { useEmployee } from '../../context/EmployeeContext';

const ROL_COLORS = {
  admin:  '#C8903F', cajero: '#3DAA68',
  mesero: '#6B9ED4', cocina: '#D9A437',
};

export default function TarjetaEmpleado({ empleado, onEditar, onToggleActivo }) {
  const { empleadoActivo } = useEmployee();
  const esActivo = empleadoActivo?.id === empleado.id;

  return (
    <div className={`bg-mezo-ink-raised rounded-mezo-lg border transition
      ${esActivo
        ? 'border-mezo-gold shadow-mezo-gold'
        : empleado.activo !== false
          ? 'border-mezo-ink-line'
          : 'border-mezo-ink-line opacity-50'}`}>
      <div className="px-4 py-4">
        {/* Cabecera */}
        <div className="flex items-start justify-between mb-2">
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-mezo-cream font-body text-sm">{empleado.nombre}</p>
              {esActivo && (
                <span className="text-xs bg-mezo-gold/15 text-mezo-gold border border-mezo-gold/40 px-2 py-0.5 rounded-full font-body">
                  Activo ahora
                </span>
              )}
            </div>
            <p className="text-mezo-stone font-body text-xs mt-0.5">{empleado.correo}</p>
          </div>
          {empleado.activo === false && (
            <span className="text-xs text-mezo-stone border border-mezo-ink-line px-2 py-0.5 rounded-full font-body">
              Inactivo
            </span>
          )}
        </div>

        {/* Roles */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {(empleado.roles ?? []).map(rol => (
            <span key={rol}
              className="text-xs px-2 py-0.5 rounded-full font-body font-medium capitalize"
              style={{
                color:       ROL_COLORS[rol] ?? '#6B6055',
                background:  `${ROL_COLORS[rol] ?? '#6B6055'}18`,
                border:      `1px solid ${ROL_COLORS[rol] ?? '#6B6055'}40`,
              }}>
              {rol}
            </span>
          ))}
        </div>

        {/* Acciones */}
        <div className="flex gap-2">
          <button onClick={() => onEditar(empleado)}
            className="flex-1 flex items-center justify-center gap-1.5 border border-mezo-ink-line text-mezo-stone hover:text-mezo-gold hover:border-mezo-gold/40 text-xs font-medium py-1.5 rounded-mezo-sm transition font-body">
            <Pencil size={11} /> Editar
          </button>
          <button onClick={() => onToggleActivo(empleado)}
            className={`flex items-center justify-center border text-xs px-3 py-1.5 rounded-mezo-sm transition
              ${empleado.activo !== false
                ? 'border-mezo-rojo/40 text-mezo-rojo hover:bg-mezo-rojo/10'
                : 'border-mezo-verde/40 text-mezo-verde hover:bg-mezo-verde/10'}`}>
            <Power size={11} />
          </button>
        </div>
      </div>
    </div>
  );
}
