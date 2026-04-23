import Navbar from '../components/layout/Navbar';
import TarjetaMesa from '../components/mesas/TarjetaMesa';
import TarjetaCuenta from '../components/mesas/TarjetaCuenta';
import { useMesas } from '../hooks/useMesas';
import { useCuentas } from '../hooks/useCuentas';

export default function Mesas() {
  const { mesas, loading }       = useMesas();
  const { cuentas, loading: loadingCuentas } = useCuentas();

  const libres   = mesas.filter(m => (m.estado ?? 'libre') === 'libre').length;
  const ocupadas = mesas.filter(m => m.estado === 'ocupada' || m.estado === 'pagando').length;
  const pagando  = mesas.filter(m => m.estado === 'pagando').length;

  return (
    <div className="h-screen bg-mezo-ink flex flex-col overflow-hidden">
      <Navbar />

      <main className="flex-1 flex flex-col overflow-hidden px-8 py-6">
        {/* Encabezado */}
        <div className="flex items-end justify-between mb-6 flex-shrink-0">
          <div>
            <p className="text-mezo-stone uppercase tracking-widest text-xs mb-1 font-body">
              En tiempo real
            </p>
            <h1
              className="text-mezo-cream font-display font-medium leading-none"
              style={{ fontSize: 40, letterSpacing: '-0.02em', fontVariationSettings: '"SOFT" 50, "opsz" 72' }}
            >
              Mesas
            </h1>
          </div>

          {/* Stats */}
          <div className="flex gap-4">
            <Stat label="Libres"   value={libres}   color="#3DAA68" />
            <Stat label="Ocupadas" value={ocupadas} color="#C8903F" />
            {pagando > 0 && <Stat label="Pagando" value={pagando} color="#D9A437" />}
          </div>
        </div>

        {/* Cuentas abiertas a nombre */}
        {!loadingCuentas && cuentas.length > 0 && (
          <div className="mb-6 flex-shrink-0">
            <p className="text-mezo-stone uppercase tracking-widest text-xs mb-3 font-body">
              Cuentas abiertas ({cuentas.length})
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {cuentas.map(c => (
                <TarjetaCuenta key={c.id} cuenta={c} />
              ))}
            </div>
          </div>
        )}

        {/* Grid mesas */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center text-mezo-stone font-body text-sm">
            Cargando mesas…
          </div>
        ) : mesas.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-mezo-stone font-body text-sm">
            No hay mesas configuradas. Ve a Configuración para agregar mesas.
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-4">
              {mesas.map(mesa => (
                <TarjetaMesa key={mesa.id} mesa={mesa} todasMesas={mesas} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div className="text-right">
      <p className="font-display font-medium leading-none" style={{ fontSize: 28, color }}>{value}</p>
      <p className="text-mezo-stone font-body" style={{ fontSize: 11 }}>{label}</p>
    </div>
  );
}
