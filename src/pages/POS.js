import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import MenuPOS from '../components/pos/MenuPOS';
import CarritoPOS from '../components/pos/CarritoPOS';
import { useCategorias } from '../hooks/useCategorias';
import { useProductos } from '../hooks/useProductos';
import { useCarrito } from '../hooks/useCarrito';
import { useTimer } from '../hooks/useTimer';
import { getMesas } from '../services';

export default function POS() {
  const [searchParams]        = useSearchParams();
  const mesaId                = searchParams.get('mesaId');
  const [mesa, setMesa]       = useState(null);

  const { categorias } = useCategorias();
  const { productos }  = useProductos();
  const carrito        = useCarrito();

  const { formatted: tiempoMesa } = useTimer(mesa?.ocupadaEn ?? null);

  // Carga la mesa y pre-llena el carrito con sus productos
  useEffect(() => {
    if (!mesaId) return;
    getMesas().then(mesas => {
      const m = mesas.find(ma => ma.id === mesaId);
      if (!m) return;
      setMesa(m);
      if (m.lineas?.length) carrito.cargarDesdeMesa(m.lineas);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mesaId]);

  return (
    <div className="h-screen bg-mezo-ink flex flex-col overflow-hidden">
      <Navbar />

      {/* Banner de mesa cuando se llega desde "Cobrar →" */}
      {mesa && (
        <div className="flex items-center gap-3 px-6 py-2.5 border-b border-mezo-ink-line flex-shrink-0"
          style={{ background: 'rgba(200,144,63,0.07)' }}>
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#C8903F' }} />
          <p className="text-mezo-cream font-body text-sm font-medium">
            Mesa {mesa.numero}
            {mesa.personas && (
              <span className="text-mezo-stone"> · {mesa.personas} persona{mesa.personas !== 1 ? 's' : ''}</span>
            )}
            <span className="text-mezo-stone"> · {tiempoMesa} en servicio</span>
          </p>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* Panel izquierdo — menú */}
        <div className="flex-1 border-r border-mezo-ink-line overflow-hidden">
          <MenuPOS
            categorias={categorias}
            productos={productos}
            onAgregar={carrito.agregar}
          />
        </div>

        {/* Panel derecho — carrito */}
        <div className="w-80 xl:w-96 flex-shrink-0 overflow-hidden">
          <CarritoPOS
            lineas={carrito.lineas}
            total={carrito.total}
            count={carrito.count}
            onAgregar={carrito.agregar}
            onQuitar={carrito.quitar}
            onEliminar={carrito.eliminar}
            onVaciar={carrito.vaciar}
            mesa={mesa}
          />
        </div>
      </div>
    </div>
  );
}
