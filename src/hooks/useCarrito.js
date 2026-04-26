import { useState, useCallback } from 'react';

export function useCarrito() {
  const [items, setItems] = useState({});

  const agregar = useCallback((producto) => {
    setItems(prev => ({
      ...prev,
      [producto.id]: {
        producto,
        cantidad: (prev[producto.id]?.cantidad ?? 0) + 1,
        deMesa:   prev[producto.id]?.deMesa ?? false,
      },
    }));
  }, []);

  const quitar = useCallback((productoId) => {
    setItems(prev => {
      const actual = prev[productoId]?.cantidad ?? 0;
      if (actual <= 1) {
        const { [productoId]: _r, ...resto } = prev;
        return resto;
      }
      return { ...prev, [productoId]: { ...prev[productoId], cantidad: actual - 1 } };
    });
  }, []);

  const eliminar = useCallback((productoId) => {
    setItems(prev => {
      const { [productoId]: _r, ...resto } = prev;
      return resto;
    });
  }, []);

  const vaciar = useCallback(() => setItems({}), []);

  // Carga las líneas de una mesa al carrito, marcándolas con deMesa: true
  const cargarDesdeMesa = useCallback((lineas) => {
    const newItems = {};
    lineas.forEach(linea => {
      newItems[linea.productId] = {
        producto: { id: linea.productId, nombre: linea.nombre, precio: linea.precio },
        cantidad: linea.cantidad,
        deMesa:   true,
      };
    });
    setItems(newItems);
  }, []);

  const lineas = Object.values(items);
  const total  = lineas.reduce((s, { producto, cantidad }) => s + producto.precio * cantidad, 0);
  const count  = lineas.reduce((s, { cantidad }) => s + cantidad, 0);

  return { items, lineas, total, count, agregar, quitar, eliminar, vaciar, cargarDesdeMesa };
}
