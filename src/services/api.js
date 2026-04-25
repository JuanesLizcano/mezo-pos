import toast from 'react-hot-toast';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
const TOKEN_KEY = 'mezo_token';

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  window.location.href = '/login';
}

async function request(method, path, body = null) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const config = { method, headers };
  if (body) config.body = JSON.stringify(body);

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, config);
  } catch {
    toast.error('Sin conexión con el servidor.');
    throw new Error('network_error');
  }

  if (res.status === 401) {
    clearSession();
    throw new Error('session_expired');
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = data.message || data.error || 'Error del servidor';
    toast.error(message);
    throw new Error(message);
  }

  return data;
}

// — Auth —
export const login      = (email, password) => request('POST', '/api/auth/login', { email, password });
export const register   = (email, password) => request('POST', '/api/auth/register', { email, password });
export const verifyOtp  = (email, code)     => request('POST', '/api/auth/verify-otp', { email, code });
export const resendOtp  = (email)           => request('POST', '/api/auth/resend-otp', { email });

// — Negocio —
export const getNegocio    = ()     => request('GET',  '/api/negocio');
export const createNegocio = (data) => request('POST', '/api/negocio', data);
export const updateNegocio = (data) => request('PUT',  '/api/negocio', data);

// — Productos —
export const getProductos    = ()         => request('GET',    '/api/productos');
export const createProducto  = (data)     => request('POST',   '/api/productos', data);
export const updateProducto  = (id, data) => request('PUT',    `/api/productos/${id}`, data);
export const deleteProducto  = (id)       => request('DELETE', `/api/productos/${id}`);

// — Categorías —
export const getCategorias    = ()         => request('GET',    '/api/categorias');
export const createCategoria  = (data)     => request('POST',   '/api/categorias', data);
export const updateCategoria  = (id, data) => request('PUT',    `/api/categorias/${id}`, data);
export const deleteCategoria  = (id)       => request('DELETE', `/api/categorias/${id}`);

// — Mesas —
export const getMesas    = ()         => request('GET', '/api/mesas');
export const updateMesa  = (id, data) => request('PUT', `/api/mesas/${id}`, data);
export const cambiarMesa = (origenId, destinoId) =>
  request('POST', '/api/mesas/cambiar', { origenId, destinoId });

// — Cuentas —
export const getCuentas    = ()         => request('GET',  '/api/cuentas');
export const createCuenta  = (data)     => request('POST', '/api/cuentas', data);
export const updateCuenta  = (id, data) => request('PUT',  `/api/cuentas/${id}`, data);
export const getCuenta     = (id)       => request('GET',  `/api/cuentas/${id}`);

// — Órdenes (flujo de 3 pasos del backend) —
export const getOrdenes   = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return request('GET', `/api/orders${query ? `?${query}` : ''}`);
};
// Paso 1: crear orden → estado OPEN
export const createOrden  = (data)     => request('POST', '/api/orders', data);
// Paso 2: marcar como entregada → estado DELIVERED
export const deliverOrden = (id)       => request('POST', `/api/orders/${id}/deliver`);
// Paso 3: cerrar venta con método de pago
export const createVenta  = (data)     => request('POST', '/api/sales', data);
export const updateOrden  = (id, data) => request('PUT',  `/api/orders/${id}`, data);

// — Empleados —
export const getEmpleados    = ()         => request('GET',    '/api/empleados');
export const createEmpleado  = (data)     => request('POST',   '/api/empleados', data);
export const updateEmpleado  = (id, data) => request('PUT',    `/api/empleados/${id}`, data);
export const deleteEmpleado  = (id)       => request('DELETE', `/api/empleados/${id}`);

// — Movimientos de caja —
export const getMovimientos   = (fecha) =>
  request('GET', `/api/movimientos${fecha ? `?fecha=${fecha}` : ''}`);
export const createMovimiento = (data) => request('POST', '/api/movimientos', data);

// — Turnos —
export const getTurnoActivo = ()         => request('GET',  '/api/turnos/activo');
export const createTurno    = (data)     => request('POST', '/api/turnos', data);
export const updateTurno    = (id, data) => request('PUT',  `/api/turnos/${id}`, data);

// — Reportes —
export const getKPIs          = (desde, hasta) =>
  request('GET', `/api/reportes/kpis?desde=${desde}&hasta=${hasta}`);
export const getVentasPorDia  = (desde, hasta) =>
  request('GET', `/api/reportes/ventas?desde=${desde}&hasta=${hasta}`);

// — Lealtad —
export const getCliente      = (celular) => request('GET',  `/api/clientes/${celular}`);
export const registrarVisita = (celular) => request('POST', `/api/clientes/${celular}/visita`);
