import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import TarjetaMesa from '../components/mesas/TarjetaMesa';
import TarjetaCuenta from '../components/mesas/TarjetaCuenta';
import PanelMesa from '../components/mesas/PanelMesa';
import { useMesas } from '../hooks/useMesas';
import { useZonas } from '../hooks/useZonas';
import { useCuentas } from '../hooks/useCuentas';
import { usePlan } from '../hooks/usePlan';
import { useAuth } from '../context/AuthContext';
import { createMesa, deleteMesa } from '../services';

export default function Mesas() {
  const { mesas, loading }                      = useMesas();
  const { zonas }                               = useZonas();
  const { cuentas, loading: loadingCuentas }    = useCuentas();
  const { limites }                             = usePlan();
  const { bumpVersion }                         = useAuth();
  const navigate                                = useNavigate();

  const [zonaActiva, setZonaActiva]             = useState('todas');
  const [mesaPanel, setMesaPanel]               = useState(null);
  const [modalNuevaMesa, setModalNuevaMesa]     = useState(false);
  const [nombreNuevaMesa, setNombreNuevaMesa]   = useState('');
  const [zonaIdNueva, setZonaIdNueva]           = useState('');
  const [creando, setCreando]                   = useState(false);

  const libres   = mesas.filter(m => (m.estado ?? 'libre') === 'libre').length;
  const ocupadas = mesas.filter(m => m.estado === 'ocupada' || m.estado === 'pagando').length;
  const pagando  = mesas.filter(m => m.estado === 'pagando').length;

  const limiteAlcanzado = limites.maxMesas !== null && mesas.length >= limites.maxMesas;

  const mesasFiltradas = zonaActiva === 'todas'
    ? mesas
    : mesas.filter(m => m.zonaId === zonaActiva);

  function abrirModalNuevaMesa() {
    const siguienteNum = mesas.length > 0 ? Math.max(...mesas.map(m => m.numero)) + 1 : 1;
    setNombreNuevaMesa(`Mesa ${siguienteNum}`);
    setZonaIdNueva(zonas[0]?.id ?? '');
    setModalNuevaMesa(true);
  }

  async function handleCrearMesa() {
    if (!nombreNuevaMesa.trim()) return;
    setCreando(true);
    try {
      await createMesa({ nombre: nombreNuevaMesa.trim(), zonaId: zonaIdNueva || undefined });
      bumpVersion();
      setModalNuevaMesa(false);
    } finally {
      setCreando(false);
    }
  }

  async function handleEliminarMesa(mesaId) {
    const mesa = mesas.find(m => m.id === mesaId);
    if (!mesa || mesa.estado !== 'libre') return;
    await deleteMesa(mesaId);
    bumpVersion();
    if (mesaPanel?.id === mesaId) setMesaPanel(null);
  }

  // Keep panel in sync: if mesas list updates, refresh the displayed mesa
  const mesaPanelActualizada = mesaPanel ? mesas.find(m => m.id === mesaPanel.id) ?? null : null;

  return (
    <div className="h-screen bg-mezo-ink flex flex-col overflow-hidden">
      <Navbar />

      <main className="flex-1 flex flex-col overflow-hidden px-8 py-6">
        {/* Encabezado */}
        <div className="flex items-end justify-between mb-4 flex-shrink-0">
          <div>
            <p className="text-mezo-stone uppercase tracking-widest text-xs mb-1 font-body">En tiempo real</p>
            <h1 className="text-mezo-cream font-display font-medium leading-none"
              style={{ fontSize: 40, letterSpacing: '-0.02em', fontVariationSettings: '"SOFT" 50, "opsz" 72' }}>
              Mesas
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex gap-4">
              <Stat label="Libres"   value={libres}   color="#3DAA68" />
              <Stat label="Ocupadas" value={ocupadas} color="#C8903F" />
              {pagando > 0 && <Stat label="Pagando" value={pagando} color="#D9A437" />}
            </div>

            <div className="relative group">
              <button
                onClick={limiteAlcanzado ? undefined : abrirModalNuevaMesa}
                disabled={limiteAlcanzado}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-mezo-md border text-sm font-body font-semibold transition
                  ${limiteAlcanzado
                    ? 'opacity-40 cursor-not-allowed border-mezo-ink-line text-mezo-stone'
                    : 'border-mezo-gold/50 text-mezo-gold hover:bg-mezo-gold/10 hover:border-mezo-gold'}`}>
                <Plus size={14} />
                Nueva mesa
              </button>
              {limiteAlcanzado && (
                <div className="absolute right-0 top-full mt-1.5 bg-mezo-ink-raised border border-mezo-ink-line rounded-mezo-md px-3 py-2.5 text-xs font-body whitespace-nowrap hidden group-hover:block z-20 shadow-lg"
                  style={{ minWidth: 220 }}>
                  <p className="text-mezo-cream mb-1 font-semibold">
                    Límite del plan {limites.label}: {limites.maxMesas} mesas
                  </p>
                  <button onClick={() => navigate('/configuracion')} className="text-mezo-gold hover:underline">
                    Actualizar a Pro →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Zone filter tabs */}
        {zonas.length > 0 && (
          <div className="flex gap-2 mb-4 flex-shrink-0 overflow-x-auto scrollbar-hide">
            <TabZona activa={zonaActiva === 'todas'} onClick={() => setZonaActiva('todas')} label="Todas" color="#C8903F" />
            {zonas.map(z => (
              <TabZona key={z.id} activa={zonaActiva === z.id}
                onClick={() => setZonaActiva(z.id)} label={z.nombre} color={z.color} />
            ))}
          </div>
        )}

        {/* Cuentas abiertas */}
        {!loadingCuentas && cuentas.length > 0 && (
          <div className="mb-4 flex-shrink-0">
            <p className="text-mezo-stone uppercase tracking-widest text-xs mb-3 font-body">
              Cuentas abiertas ({cuentas.length})
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {cuentas.map(c => <TarjetaCuenta key={c.id} cuenta={c} />)}
            </div>
          </div>
        )}

        {/* Grid de mesas */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center text-mezo-stone font-body text-sm">
            Cargando mesas…
          </div>
        ) : mesasFiltradas.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-mezo-stone font-body text-sm">
            {zonaActiva === 'todas'
              ? 'No hay mesas configuradas. Crea tu primera mesa con "+ Nueva mesa".'
              : 'No hay mesas en esta zona.'}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-4">
              {mesasFiltradas.map(mesa => (
                <TarjetaMesa
                  key={mesa.id}
                  mesa={mesa}
                  zonas={zonas}
                  onVerPanel={() => setMesaPanel(mesa)}
                  activa={mesaPanel?.id === mesa.id}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Slide-in panel */}
      {mesaPanelActualizada && (
        <PanelMesa
          mesa={mesaPanelActualizada}
          todasMesas={mesas}
          zonas={zonas}
          onCerrar={() => setMesaPanel(null)}
          onEliminar={mesaPanelActualizada.estado === 'libre' ? handleEliminarMesa : undefined}
          bumpVersion={bumpVersion}
        />
      )}

      {/* Modal nueva mesa */}
      {modalNuevaMesa && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(8,7,6,0.85)' }}>
          <div className="bg-mezo-ink-raised border border-mezo-ink-line rounded-mezo-xl p-6 w-full max-w-xs shadow-lg">
            <p className="text-mezo-stone text-xs uppercase tracking-widest font-body mb-1">Mesas</p>
            <h3 className="text-mezo-cream font-body font-semibold text-lg mb-4">Nueva mesa</h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-body text-mezo-stone mb-1.5 uppercase tracking-widest">
                  Nombre o número
                </label>
                <input type="text" value={nombreNuevaMesa}
                  onChange={e => setNombreNuevaMesa(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCrearMesa()}
                  autoFocus
                  className="w-full px-3 py-2 bg-mezo-ink-muted border border-mezo-ink-line text-mezo-cream font-body text-sm rounded-mezo-md focus:outline-none focus:ring-2 focus:ring-mezo-gold focus:border-transparent"
                />
              </div>

              {zonas.length > 0 && (
                <div>
                  <label className="block text-xs font-body text-mezo-stone mb-1.5 uppercase tracking-widest">
                    Zona
                  </label>
                  <select value={zonaIdNueva}
                    onChange={e => setZonaIdNueva(e.target.value)}
                    className="w-full px-3 py-2 bg-mezo-ink-muted border border-mezo-ink-line text-mezo-cream font-body text-sm rounded-mezo-md focus:outline-none focus:ring-2 focus:ring-mezo-gold focus:border-transparent">
                    {zonas.map(z => (
                      <option key={z.id} value={z.id}>{z.nombre}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-4">
              <button onClick={() => setModalNuevaMesa(false)}
                className="flex-1 border border-mezo-ink-line text-mezo-cream-dim font-semibold py-2.5 rounded-mezo-md text-sm font-body hover:bg-mezo-ink-muted transition">
                Cancelar
              </button>
              <button onClick={handleCrearMesa}
                disabled={!nombreNuevaMesa.trim() || creando}
                className="flex-[2] bg-mezo-gold hover:bg-mezo-gold-deep text-mezo-ink font-semibold py-2.5 rounded-mezo-md text-sm font-body transition disabled:opacity-40 disabled:cursor-not-allowed">
                {creando ? 'Creando…' : 'Crear mesa'}
              </button>
            </div>
          </div>
        </div>
      )}
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

function TabZona({ activa, onClick, label, color }) {
  return (
    <button onClick={onClick}
      className="flex items-center gap-1.5 px-4 py-1.5 rounded-mezo-md text-sm font-body font-medium whitespace-nowrap transition flex-shrink-0 border"
      style={activa
        ? { background: `${color}20`, color, borderColor: `${color}60` }
        : { background: 'transparent', color: '#6B6055', borderColor: '#2A2520' }}>
      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
      {label}
    </button>
  );
}
