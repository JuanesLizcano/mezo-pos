import { useState } from 'react';

export function useCarrito() {
  const [items, setItems] = useState({});

  function agregar(producto) {
    setItems(prev => ({
      ...prev,
      [producto.id]: {
        producto,
        cantidad: (prev[producto.id]?.cantidad ?? 0) + 1,
      },
    }));
  }

  function quitar(productoId) {
    setItems(prev => {
      const actual = prev[productoId]?.cantidad ?? 0;
      if (actual <= 1) {
        const { [productoId]: _removed, ...resto } = prev;
        return resto;
      }
      return { ...prev, [productoId]: { ...prev[productoId], cantidad: actual - 1 } };
    });
  }

  function eliminar(productoId) {
    setItems(prev => {
      const { [productoId]: _removed, ...resto } = prev;
      return resto;
    });
  }

  function vaciar() { setItems({}); }

  const lineas  = Object.values(items);
  const total   = lineas.reduce((s, { producto, cantidad }) => s + producto.precio * cantidad, 0);
  const count   = lineas.reduce((s, { cantidad }) => s + cantidad, 0);

  return { items, lineas, total, count, agregar, quitar, eliminar, vaciar };
}
