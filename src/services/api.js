import toast from 'react-hot-toast';

const BASE_URL     = process.env.REACT_APP_API_URL || 'http://localhost:8080';
const TOKEN_KEY    = 'mezo_token';
const BUSINESS_KEY = 'mezo_business_id';

function getToken()      { return localStorage.getItem(TOKEN_KEY); }
function getBusinessId() { return localStorage.getItem(BUSINESS_KEY); }
function biz(path)       { return `/api/v1/businesses/${getBusinessId()}${path}`; }

// Convierte cualquier fecha a YYYY-MM-DD para query params del backend
function toISODate(d) {
  const dt = d instanceof Date ? d : new Date(d);
  return dt.toISOString().split('T')[0];
}

// El backend envuelve montos en { amount, currency } — extraemos el número
function moneyVal(v) {
  if (v == null) return 0;
  return typeof v === 'object' ? (v.amount ?? 0) : v;
}

function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(BUSINESS_KEY);
  window.location.href = '/';
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

  if (res.status === 401) { clearSession(); throw new Error('session_expired'); }
  if (res.status === 204) return { ok: true };

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = data.message || data.error || 'Error del servidor';
    toast.error(message);
    throw new Error(message);
  }

  return data;
}

// ─── Mappers (backend EN ↔ frontend ES) ─────────────────────────────────────
// El backend devuelve campos en inglés; el frontend espera español.
// Todos los mappers viven aquí para que los componentes no cambien.

function fromProduct(p) {
  return {
    id:          p.id,
    nombre:      p.name,
    precio:      moneyVal(p.price),
    costo:       moneyVal(p.cost),
    categoriaId: p.categoryId,
    emoji:       p.image ?? '🍽️',
    imageType:   p.imageType ?? 'EMOJI',
    disponible:  p.available ?? true,
    creadoEn:    p.createdAt ? new Date(p.createdAt) : new Date(),
    businessId:  p.businessId,
  };
}

function toProduct(p) {
  return {
    name:        p.nombre,
    price:       p.precio,
    currency:    'COP',
    imageType:   p.imageType ?? 'EMOJI',
    image:       p.emoji ?? '🍽️',
    categoryId:  p.categoriaId,
    description: p.description ?? null,
    ingredients: p.ingredients ?? null,
  };
}

function fromCategoria(c) {
  return {
    id:         c.id,
    nombre:     c.name,
    emoji:      c.icon,
    orden:      c.sortOrder ?? 0,
    businessId: c.businessId,
    creadoEn:   c.createdAt ? new Date(c.createdAt) : new Date(),
  };
}

function toCategoria(c) {
  return { name: c.nombre, icon: c.emoji, sortOrder: c.orden ?? 0 };
}

function fromNegocio(n) {
  if (!n) return null;
  return {
    id:          n.id,
    name:        n.name,
    type:        n.type,
    phone:       n.phone ?? null,
    address:     n.address,
    city:        n.city,
    country:     n.country,
    openingTime: n.openAt ?? null,
    closingTime: n.closeAt ?? null,
    isOpen:      n.open ?? false,
    tableCount:  n.tableCount ?? 0,
  };
}

function toNegocio(n) {
  return {
    name:       n.name,
    type:       n.type,
    phone:      n.phone ?? null,
    address:    n.address,
    city:       n.city,
    country:    n.country,
    openAt:     n.openingTime ?? null,
    closeAt:    n.closingTime ?? null,
    tableCount: n.tableCount ?? 0,
  };
}

function fromOrderLines(lines) {
  if (!lines?.length) return [];
  return lines.map(l => ({
    productId: l.productId,
    name:      l.productName,
    unitPrice: moneyVal(l.unitPrice),
    quantity:  l.quantity,
    subtotal:  moneyVal(l.subtotal),
  }));
}

function toOrderLines(items) {
  return (items ?? []).map(i => ({
    productId: i.productId,
    quantity:  i.quantity,
    unitPrice: i.unitPrice ?? i.precio ?? 0,
  }));
}

function fromOrder(o) {
  if (!o) return null;
  const items  = fromOrderLines(o.lines);
  const total  = moneyVal(o.total);
  const tip    = o.tip ? moneyVal(o.tip) : null;
  // Backend CLOSED → frontend PAID (mismo concepto, distinto nombre)
  const status = o.status === 'CLOSED' ? 'PAID' : o.status;
  // estadoCocina: campo que espera PantallaCocina para filtrar comandas
  let estadoCocina = null;
  if (['OPEN', 'PREPARING'].includes(o.status)) estadoCocina = 'preparando';
  else if (o.status === 'READY')                estadoCocina = 'listo';

  return {
    id:            o.id,
    status,
    estadoCocina,
    cocinaEn:      o.createdAt ? new Date(o.createdAt) : null,
    items,
    subtotal:      items.reduce((s, i) => s + i.subtotal, 0),
    tip,
    total,
    paymentMethod: o.paymentMethod ?? null,
    saleNumber:    null,
    tableId:       o.tableId ?? null,
    employeeName:  null,
    shiftId:       null,
    createdAt:     o.createdAt ? new Date(o.createdAt) : new Date(),
  };
}

// El frontend envía 'CARD' (datáfono) — el backend usa 'BOLD'
const PAYMENT_MAP = { CARD: 'BOLD' };
function normalizePM(pm) { return PAYMENT_MAP[pm] ?? pm; }

// Deriva el estado de una mesa desde sus órdenes activas
function fromTable(t, activeOrders = []) {
  const order = activeOrders.find(o => o.tableId === t.id);
  const lines = order?.lines?.length
    ? order.lines.map(l => ({
        productId: l.productId,
        nombre:    l.productName,
        precio:    moneyVal(l.unitPrice),
        cantidad:  l.quantity,
        subtotal:  moneyVal(l.subtotal),
      }))
    : null;

  let estado = 'libre';
  if (order) {
    if (['OPEN', 'PREPARING', 'READY'].includes(order.status)) estado = 'ocupada';
    else if (order.status === 'DELIVERED')                      estado = 'pagando';
  }

  return {
    id:        t.id,
    numero:    t.number,
    nombre:    `Mesa ${t.number}`,
    estado,
    ocupadaEn: order ? new Date(order.createdAt) : null,
    total:     order ? moneyVal(order.total) : null,
    personas:  null,
    lineas:    lines,
    zonaId:    'zona-1', // zona única por defecto (backend no tiene zonas)
  };
}

function fromEmpleado(m) {
  const roleMap = { ADMIN: 'admin', CASHIER: 'cajera', WAITER: 'mesero', KITCHEN: 'cocina' };
  return {
    id:       m.id,
    nombre:   m.name ?? m.email?.split('@')[0] ?? '—',
    correo:   m.email,
    pin:      null,
    roles:    [(roleMap[m.role] ?? 'cajera')],
    activo:   m.status === 'ACTIVE',
    creadoEn: m.invitedAt ? new Date(m.invitedAt) : new Date(),
  };
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function login(email, password) {
  const data  = await request('POST', '/api/v1/auth/login', { email, password });
  const bizId = data.user?.businesses?.[0]?.id;
  if (bizId) localStorage.setItem(BUSINESS_KEY, bizId);
  return {
    accessToken:  data.accessToken,
    refreshToken: data.refreshToken,
    user: {
      id:            data.user.id,
      email:         data.user.email,
      role:          data.user.role,
      planType:      data.user.plan,   // backend: plan → frontend: planType
      planExpiresAt: null,
    },
  };
}

export async function register(email, password) {
  return request('POST', '/api/v1/auth/register', { email, password });
}

export async function verifyOtp(email, code) {
  const data  = await request('POST', '/api/v1/auth/verify-otp', { email, code });
  const bizId = data.user?.businesses?.[0]?.id;
  if (bizId) localStorage.setItem(BUSINESS_KEY, bizId);
  if (!data.accessToken) return data;
  return {
    accessToken:  data.accessToken,
    refreshToken: data.refreshToken,
    user: {
      id:            data.user.id,
      email:         data.user.email,
      role:          data.user.role,
      planType:      data.user.plan,
      planExpiresAt: null,
    },
  };
}

export async function resendOtp(email) {
  return request('POST', '/api/v1/auth/resend-otp', { email });
}

// ─── Negocio ──────────────────────────────────────────────────────────────────

export async function getNegocio() {
  const bizId = getBusinessId();
  if (!bizId) return null;
  try {
    return fromNegocio(await request('GET', `/api/v1/businesses/${bizId}`));
  } catch { return null; }
}

export async function createNegocio(data) {
  const result = await request('POST', '/api/v1/businesses', toNegocio(data));
  if (result.id) localStorage.setItem(BUSINESS_KEY, result.id);
  return fromNegocio(result);
}

export async function updateNegocio(data) {
  return fromNegocio(
    await request('PUT', `/api/v1/businesses/${getBusinessId()}`, toNegocio(data))
  );
}

// ─── Productos ────────────────────────────────────────────────────────────────

export async function getProductos() {
  const data = await request('GET', biz('/products'));
  return (Array.isArray(data) ? data : []).map(fromProduct);
}

export async function createProducto(data) {
  return fromProduct(await request('POST', biz('/products'), toProduct(data)));
}

export async function updateProducto(id, data) {
  return fromProduct(await request('PUT', biz(`/products/${id}`), toProduct(data)));
}

export async function deleteProducto(id) {
  await request('DELETE', biz(`/products/${id}`));
  return { ok: true };
}

// ─── Categorías ──────────────────────────────────────────────────────────────

export async function getCategorias() {
  const data = await request('GET', biz('/categories'));
  return (Array.isArray(data) ? data : []).map(fromCategoria);
}

export async function createCategoria(data) {
  return fromCategoria(await request('POST', biz('/categories'), toCategoria(data)));
}

export async function updateCategoria(id, data) {
  return fromCategoria(await request('PUT', biz(`/categories/${id}`), toCategoria(data)));
}

export async function deleteCategoria(id) {
  await request('DELETE', biz(`/categories/${id}`));
  return { ok: true };
}

// ─── Mesas ────────────────────────────────────────────────────────────────────

async function fetchActiveOrders() {
  try {
    const data = await request('GET', biz('/orders'));
    return (Array.isArray(data) ? data : []).filter(o =>
      ['OPEN', 'PREPARING', 'READY', 'DELIVERED'].includes(o.status)
    );
  } catch { return []; }
}

export async function getMesas() {
  const [tables, active] = await Promise.all([
    request('GET', biz('/tables')),
    fetchActiveOrders(),
  ]);
  return (Array.isArray(tables) ? tables : [])
    .map(t => fromTable(t, active))
    .sort((a, b) => a.numero - b.numero);
}

export async function createMesa() {
  return fromTable(await request('POST', biz('/tables')));
}

export async function deleteMesa(id) {
  await request('DELETE', biz(`/tables/${id}`));
  return { ok: true };
}

// El estado de la mesa viene de las órdenes, no de la mesa misma
export async function updateMesa(id, data) { return { id, ...data }; }

export async function cambiarMesa(origenId, destinoId) {
  const active = await fetchActiveOrders();
  const order  = active.find(o => o.tableId === origenId);
  if (!order) throw new Error('No hay orden activa en esta mesa.');
  await request('PUT', biz(`/orders/${order.id}`), { tableId: destinoId });
  return { ok: true };
}

// ─── Zonas — no existen en backend; devolvemos una zona por defecto ───────────

export async function getZonas()        { return [{ id: 'zona-1', nombre: 'Salón', color: '#C8903F' }]; }
export async function createZona(d)     { return { id: `zona-${Date.now()}`, ...d }; }
export async function updateZona(id, d) { return { id, ...d }; }
export async function deleteZona()      { return { ok: true }; }

// ─── Cuentas — no existen en backend ─────────────────────────────────────────

export async function getCuentas()        { return []; }
export async function createCuenta(d)     { return { id: `tmp-${Date.now()}`, ...d, creadoEn: new Date() }; }
export async function updateCuenta(id, d) { return { id, ...d }; }
export async function getCuenta()         { return null; }

// ─── Órdenes ─────────────────────────────────────────────────────────────────

export async function getOrdenes(params = {}) {
  const qs = new URLSearchParams();
  if (params.desde) qs.set('from', toISODate(params.desde));
  if (params.hasta) qs.set('to',   toISODate(params.hasta));
  const q    = qs.toString();
  const data = await request('GET', biz(`/orders${q ? `?${q}` : ''}`));
  return (Array.isArray(data) ? data : []).map(fromOrder);
}

// Paso 1: crear orden → OPEN
export async function createOrden(data) {
  const payload = {
    tableId:       data.tableId ?? null,
    paymentMethod: null,
    tip:           0,
    lines:         toOrderLines(data.items ?? data.lines ?? []),
  };
  return fromOrder(await request('POST', biz('/orders'), payload));
}

// Paso 2: marcar como entregada → DELIVERED
export async function deliverOrden(id) {
  try {
    return fromOrder(
      await request('PATCH', biz(`/orders/${id}/status`), { status: 'DELIVERED' })
    );
  } catch {
    // El backend puede no aceptar saltar estados intermedios para órdenes de mostrador
    return fromOrder(await request('GET', biz(`/orders/${id}`)));
  }
}

// Paso 3: cerrar venta con método de pago
export async function createVenta(data) {
  // Obtenemos las líneas desde el backend para incluirlas en el cierre
  const orderRaw = await request('GET', biz(`/orders/${data.orderId}`));
  const lines    = toOrderLines(fromOrderLines(orderRaw.lines ?? []));

  const payload = {
    orderId:       data.orderId,
    paymentMethod: normalizePM(data.paymentMethod),
    tip:           data.tip?.amount ?? (typeof data.tip === 'number' ? data.tip : 0),
    lines,
  };
  const result = await request('POST', biz('/sales'), payload);
  const total  = moneyVal(result.total);
  return {
    id:            result.id,
    saleNumber:    null,
    orderId:       result.orderId,
    paymentMethod: result.paymentMethod,
    subtotal:      total,
    tip:           result.tip ? moneyVal(result.tip) : null,
    total,
    amountPaid:    data.amountPaid ?? null,
    change:        data.change ?? null,
    createdAt:     result.createdAt ? new Date(result.createdAt) : new Date(),
  };
}

export async function updateOrden(id, data) {
  // PantallaCocina marca listo con { estadoCocina: 'listo' }
  if (data.estadoCocina === 'listo') {
    return fromOrder(
      await request('PATCH', biz(`/orders/${id}/status`), { status: 'READY' })
    );
  }
  return fromOrder(await request('PUT', biz(`/orders/${id}`), data));
}

// ─── Empleados ────────────────────────────────────────────────────────────────

const ROLE_MAP = { admin: 'ADMIN', cajera: 'CASHIER', mesero: 'WAITER', cocina: 'KITCHEN' };

export async function getEmpleados() {
  const data = await request('GET', biz('/team'));
  return (Array.isArray(data) ? data : []).map(fromEmpleado);
}

export async function createEmpleado(data) {
  const rol    = (data.roles?.[0] ?? 'cajera').toLowerCase();
  const result = await request('POST', biz('/team/invite'), {
    email: data.correo,
    role:  ROLE_MAP[rol] ?? 'CASHIER',
  });
  return fromEmpleado(result);
}

export async function updateEmpleado(id, data) {
  if (data.roles?.length) {
    const rol    = data.roles[0].toLowerCase();
    const result = await request('PUT', biz(`/team/${id}/role`), { role: ROLE_MAP[rol] ?? 'CASHIER' });
    return fromEmpleado(result);
  }
  return fromEmpleado({ id, email: data.correo, role: data.roles?.[0], status: data.activo ? 'ACTIVE' : 'INACTIVE' });
}

export async function deleteEmpleado(id) {
  await request('DELETE', biz(`/team/${id}`));
  return { ok: true };
}

// ─── Movimientos — no existen en backend ─────────────────────────────────────

export async function getMovimientos()   { return []; }
export async function createMovimiento() { return {}; }

// ─── Turnos — no existen en backend ──────────────────────────────────────────

export async function getTurnoActivo() { return null; }
export async function createTurno()    { return { id: null, fin: null }; }
export async function updateTurno()    { return {}; }

// ─── Reportes ────────────────────────────────────────────────────────────────

function diffDays(desde, hasta) {
  return (new Date(hasta) - new Date(desde)) / 86400000;
}

function periodFromRange(desde, hasta) {
  const d = diffDays(desde, hasta);
  if (d > 300) return 'year';
  if (d > 80)  return 'quarter';
  if (d > 20)  return 'month';
  if (d > 1)   return 'week';
  return 'today';
}

export async function getKPIs(desde, hasta) {
  const time = periodFromRange(desde, hasta);
  const [sales, peak, tops] = await Promise.all([
    request('GET', biz(`/reports/sales?time=${time}`)),
    request('GET', biz(`/reports/peak-hour?time=${time}`)).catch(() => null),
    request('GET', biz(`/reports/top-products?time=${time}&limit=1`)).catch(() => []),
  ]);
  const totalVentas = moneyVal(sales.totalSales);
  const numOrdenes  = sales.salesCount ?? 0;
  return {
    totalVentas,
    numOrdenes,
    ticketProm:  numOrdenes ? Math.round(totalVentas / numOrdenes) : 0,
    mejorHora:   peak?.peakHour ?? null,
    productoTop: (Array.isArray(tops) ? tops[0] : null)?.productName ?? null,
    metodoTop:   null,
  };
}

export async function getVentasPorDia(desde, hasta) {
  const ordenes = await getOrdenes({ desde, hasta });
  const porDia  = {};
  ordenes.filter(o => o.status === 'PAID').forEach(o => {
    const d = new Date(o.createdAt);
    const k = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    porDia[k] = (porDia[k] ?? 0) + o.total;
  });
  return Object.entries(porDia)
    .map(([fecha, total]) => ({ fecha, total }))
    .sort((a, b) => a.fecha.localeCompare(b.fecha));
}

// ─── Lealtad — no existe en backend ──────────────────────────────────────────

export async function getCliente()      { return null; }
export async function registrarVisita() { return null; }
