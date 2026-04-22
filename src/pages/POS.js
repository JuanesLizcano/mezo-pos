import Navbar from '../components/layout/Navbar';
import MenuPOS from '../components/pos/MenuPOS';
import CarritoPOS from '../components/pos/CarritoPOS';
import { useCategorias } from '../hooks/useCategorias';
import { useProductos } from '../hooks/useProductos';
import { useCarrito } from '../hooks/useCarrito';

export default function POS() {
  const { categorias } = useCategorias();
  const { productos }  = useProductos();
  const carrito        = useCarrito();

  return (
    <div className="h-screen bg-mezo-ink flex flex-col overflow-hidden">
      <Navbar />

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
          />
        </div>
      </div>
    </div>
  );
}
