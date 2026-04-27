// Punto de entrada único para todos los servicios de datos.
// Cuando REACT_APP_USE_MOCK=true, usa datos en memoria (mockApi).
// Cuando REACT_APP_USE_MOCK=false, usa el backend real (api.js).

import * as mockApi from './mockApi';
import * as realApi from './api';

const svc = process.env.REACT_APP_USE_MOCK === 'true' ? mockApi : realApi;

// — Auth —
export const login     = (...a) => svc.login(...a);
export const register  = (...a) => svc.register(...a);
export const verifyOtp = (...a) => svc.verifyOtp(...a);
export const resendOtp = (...a) => svc.resendOtp(...a);

// — Negocio —
export const getNegocio    = (...a) => svc.getNegocio(...a);
export const createNegocio = (...a) => svc.createNegocio(...a);
export const updateNegocio = (...a) => svc.updateNegocio(...a);

// — Productos —
export const getProductos   = (...a) => svc.getProductos(...a);
export const createProducto = (...a) => svc.createProducto(...a);
export const updateProducto = (...a) => svc.updateProducto(...a);
export const deleteProducto = (...a) => svc.deleteProducto(...a);

// — Categorías —
export const getCategorias   = (...a) => svc.getCategorias(...a);
export const createCategoria = (...a) => svc.createCategoria(...a);
export const updateCategoria = (...a) => svc.updateCategoria(...a);
export const deleteCategoria = (...a) => svc.deleteCategoria(...a);

// — Mesas —
export const getMesas    = (...a) => svc.getMesas(...a);
export const createMesa  = (...a) => svc.createMesa(...a);
export const deleteMesa  = (...a) => svc.deleteMesa(...a);
export const updateMesa  = (...a) => svc.updateMesa(...a);
export const cambiarMesa = (...a) => svc.cambiarMesa(...a);

// — Cuentas —
export const getCuentas   = (...a) => svc.getCuentas(...a);
export const createCuenta = (...a) => svc.createCuenta(...a);
export const updateCuenta = (...a) => svc.updateCuenta(...a);
export const getCuenta    = (...a) => svc.getCuenta(...a);

// — Órdenes (flujo de 3 pasos) —
export const getOrdenes  = (...a) => svc.getOrdenes(...a);
export const createOrden = (...a) => svc.createOrden(...a);
export const deliverOrden = (...a) => svc.deliverOrden(...a);
export const createVenta = (...a) => svc.createVenta(...a);
export const updateOrden = (...a) => svc.updateOrden(...a);

// — Empleados —
export const getEmpleados   = (...a) => svc.getEmpleados(...a);
export const createEmpleado = (...a) => svc.createEmpleado(...a);
export const updateEmpleado = (...a) => svc.updateEmpleado(...a);
export const deleteEmpleado = (...a) => svc.deleteEmpleado(...a);

// — Movimientos —
export const getMovimientos   = (...a) => svc.getMovimientos(...a);
export const createMovimiento = (...a) => svc.createMovimiento(...a);

// — Turnos —
export const getTurnoActivo = (...a) => svc.getTurnoActivo(...a);
export const createTurno    = (...a) => svc.createTurno(...a);
export const updateTurno    = (...a) => svc.updateTurno(...a);

// — Reportes —
export const getKPIs         = (...a) => svc.getKPIs(...a);
export const getVentasPorDia = (...a) => svc.getVentasPorDia(...a);

// — Zonas —
export const getZonas    = (...a) => svc.getZonas(...a);
export const createZona  = (...a) => svc.createZona(...a);
export const updateZona  = (...a) => svc.updateZona(...a);
export const deleteZona  = (...a) => svc.deleteZona(...a);

// — Lealtad —
export const getCliente      = (...a) => svc.getCliente(...a);
export const registrarVisita = (...a) => svc.registrarVisita(...a);
