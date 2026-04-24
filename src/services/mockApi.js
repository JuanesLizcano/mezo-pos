// Mock API — simula el backend con datos en memoria
// Negocio demo: "Tres Orquídeas" (cafetería en Medellín)

function delay() {
  return new Promise(r => setTimeout(r, 300 + Math.random() * 300));
}

let _idCounter   = 1000;
let _facCounter  = 87;
function nextId()      { return 'mock-' + (++_idCounter); }
function nextFactura() { return ++_facCounter; }

// ─── Datos iniciales ────────────────────────────────────────────────────────

const NEGOCIO_DEMO = {
  id: 'neg-001',
  nombre: 'Tres Orquídeas',
  tipo: 'cafetería',
  ciudad: 'Medellín',
  direccion: 'El Poblado, Cra 37 #10A-45',
  whatsapp: '3121234567',
  horario: '7:00 a.m. – 10:00 p.m.',
  plan: 'pro',
  tieneMesas: true,
  mesas: 6,
  onboardingCompleto: true,
  propietarioEmail: 'admin@tresorquideas.com',
  creadoEn: new Date('2025-01-15'),
};

const CATEGORIAS_INIT = [
  { id: 'cat-1', nombre: 'Bebidas calientes', emoji: '☕', orden: 1 },
  { id: 'cat-2', nombre: 'Jugos y fríos',     emoji: '🧃', orden: 2 },
  { id: 'cat-3', nombre: 'Panadería',         emoji: '🥐', orden: 3 },
  { id: 'cat-4', nombre: 'Platos',            emoji: '🍽️', orden: 4 },
];

const PRODUCTOS_INIT = [
  { id: 'p-01',  nombre: 'Café tinto',         precio: 3000,  categoriaId: 'cat-1', emoji: '☕',  disponible: true, creadoEn: new Date('2025-01-15') },
  { id: 'p-02',  nombre: 'Café americano',      precio: 4500,  categoriaId: 'cat-1', emoji: '☕',  disponible: true, creadoEn: new Date('2025-01-15') },
  { id: 'p-03',  nombre: 'Café con leche',      precio: 5500,  categoriaId: 'cat-1', emoji: '🥛',  disponible: true, creadoEn: new Date('2025-01-15') },
  { id: 'p-04',  nombre: 'Capuchino',           precio: 6500,  categoriaId: 'cat-1', emoji: '☕',  disponible: true, creadoEn: new Date('2025-01-15') },
  { id: 'p-05',  nombre: 'Latte de vainilla',   precio: 7000,  categoriaId: 'cat-1', emoji: '🥛',  disponible: true, creadoEn: new Date('2025-01-15') },
  { id: 'p-06',  nombre: 'Chocolate caliente',  precio: 5500,  categoriaId: 'cat-1', emoji: '🍫',  disponible: true, creadoEn: new Date('2025-01-15') },
  { id: 'p-07',  nombre: 'Agua de panela',      precio: 3000,  categoriaId: 'cat-1', emoji: '🍵',  disponible: true, creadoEn: new Date('2025-01-15') },
  { id: 'p-08',  nombre: 'Jugo de lulo',        precio: 5000,  categoriaId: 'cat-2', emoji: '🍋',  disponible: true, creadoEn: new Date('2025-01-15') },
  { id: 'p-09',  nombre: 'Jugo de maracuyá',    precio: 5500,  categoriaId: 'cat-2', emoji: '🟡',  disponible: true, creadoEn: new Date('2025-01-15') },
  { id: 'p-10',  nombre: 'Jugo de mora',        precio: 5000,  categoriaId: 'cat-2', emoji: '🫐',  disponible: true, creadoEn: new Date('2025-01-15') },
  { id: 'p-11',  nombre: 'Limonada de coco',    precio: 6000,  categoriaId: 'cat-2', emoji: '🥥',  disponible: true, creadoEn: new Date('2025-01-15') },
  { id: 'p-12',  nombre: 'Agua mineral',        precio: 2500,  categoriaId: 'cat-2', emoji: '💧',  disponible: true, creadoEn: new Date('2025-01-15') },
  { id: 'p-13',  nombre: 'Croissant de jamón',  precio: 4500,  categoriaId: 'cat-3', emoji: '🥐',  disponible: true, creadoEn: new Date('2025-01-15') },
  { id: 'p-14',  nombre: 'Pan de bono',         precio: 2500,  categoriaId: 'cat-3', emoji: '🧀',  disponible: true, creadoEn: new Date('2025-01-15') },
  { id: 'p-15',  nombre: 'Empanada de pipián',  precio: 3500,  categoriaId: 'cat-3', emoji: '🥟',  disponible: true, creadoEn: new Date('2025-01-15') },
  { id: 'p-16',  nombre: 'Arepa con queso',     precio: 5000,  categoriaId: 'cat-3', emoji: '🫓',  disponible: true, creadoEn: new Date('2025-01-15') },
  { id: 'p-17',  nombre: 'Buñuelo',             precio: 2000,  categoriaId: 'cat-3', emoji: '🍩',  disponible: true, creadoEn: new Date('2025-01-15') },
  { id: 'p-18',  nombre: 'Changua',             precio: 8000,  categoriaId: 'cat-4', emoji: '🍲',  disponible: true, creadoEn: new Date('2025-01-15') },
  { id: 'p-19',  nombre: 'Calentado paisa',     precio: 12000, categoriaId: 'cat-4', emoji: '🍳',  disponible: true, creadoEn: new Date('2025-01-15') },
  { id: 'p-20',  nombre: 'Sopa del día',        precio: 14000, categoriaId: 'cat-4', emoji: '🥣',  disponible: true, creadoEn: new Date('2025-01-15') },
  { id: 'p-21',  nombre: 'Ensalada del chef',   precio: 15000, categoriaId: 'cat-4', emoji: '🥗',  disponible: true, creadoEn: new Date('2025-01-15') },
  { id: 'p-22',  nombre: 'Sancocho de pollo',   precio: 18000, categoriaId: 'cat-4', emoji: '🍗',  disponible: true, creadoEn: new Date('2025-01-15') },
  { id: 'p-23',  nombre: 'Bandeja paisa mini',  precio: 25000, categoriaId: 'cat-4', emoji: '🍽️', disponible: true, creadoEn: new Date('2025-01-15') },
];

const MESAS_INIT = [
  { id: 'mesa-1', numero: 1, nombre: 'Mesa 1', estado: 'ocupada',  ocupadaEn: new Date(Date.now() - 45 * 60000), total: 27000, personas: 3 },
  { id: 'mesa-2', numero: 2, nombre: 'Mesa 2', estado: 'libre',    ocupadaEn: null, total: null },
  { id: 'mesa-3', numero: 3, nombre: 'Mesa 3', estado: 'pagando',  ocupadaEn: new Date(Date.now() - 92 * 60000), total: 45000, personas: 4 },
  { id: 'mesa-4', numero: 4, nombre: 'Mesa 4', estado: 'libre',    ocupadaEn: null, total: null },
  { id: 'mesa-5', numero: 5, nombre: 'Mesa 5', estado: 'ocupada',  ocupadaEn: new Date(Date.now() - 22 * 60000), total: 13500, personas: 2 },
  { id: 'mesa-6', numero: 6, nombre: 'Mesa 6', estado: 'libre',    ocupadaEn: null, total: null },
];

const EMPLEADOS_INIT = [
  { id: 'emp-1', nombre: 'Juanes Lizcano',  correo: 'juanes@tresorquideas.com', pin: '1234', roles: ['admin'],   activo: true, creadoEn: new Date('2025-01-15') },
  { id: 'emp-2', nombre: 'María García',    correo: 'maria@tresorquideas.com',  pin: '2345', roles: ['cajera'],  activo: true, creadoEn: new Date('2025-01-20') },
  { id: 'emp-3', nombre: 'Carlos Muñoz',    correo: 'carlos@tresorquideas.com', pin: '3456', roles: ['mesero'],  activo: true, creadoEn: new Date('2025-02-01') },
];

// Genera órdenes históricas para los reportes
function generarOrdenesDemo() {
  const ordenes = [];
  const hoy = new Date();

  const plantillas = [
    { lineas: [{ productoId: 'p-02', nombre: 'Café americano', precio: 4500, cantidad: 2, subtotal: 9000 }, { productoId: 'p-13', nombre: 'Croissant de jamón', precio: 4500, cantidad: 2, subtotal: 9000 }], metodo: 'efectivo' },
    { lineas: [{ productoId: 'p-04', nombre: 'Capuchino', precio: 6500, cantidad: 3, subtotal: 19500 }, { productoId: 'p-16', nombre: 'Arepa con queso', precio: 5000, cantidad: 2, subtotal: 10000 }], metodo: 'nequi' },
    { lineas: [{ productoId: 'p-18', nombre: 'Changua', precio: 8000, cantidad: 2, subtotal: 16000 }, { productoId: 'p-01', nombre: 'Café tinto', precio: 3000, cantidad: 2, subtotal: 6000 }], metodo: 'datafono' },
    { lineas: [{ productoId: 'p-22', nombre: 'Sancocho de pollo', precio: 18000, cantidad: 1, subtotal: 18000 }, { productoId: 'p-08', nombre: 'Jugo de lulo', precio: 5000, cantidad: 1, subtotal: 5000 }], metodo: 'efectivo' },
    { lineas: [{ productoId: 'p-03', nombre: 'Café con leche', precio: 5500, cantidad: 4, subtotal: 22000 }, { productoId: 'p-15', nombre: 'Empanada de pipián', precio: 3500, cantidad: 4, subtotal: 14000 }], metodo: 'transferencia' },
    { lineas: [{ productoId: 'p-05', nombre: 'Latte de vainilla', precio: 7000, cantidad: 2, subtotal: 14000 }, { productoId: 'p-14', nombre: 'Pan de bono', precio: 2500, cantidad: 3, subtotal: 7500 }], metodo: 'daviplata' },
    { lineas: [{ productoId: 'p-23', nombre: 'Bandeja paisa mini', precio: 25000, cantidad: 2, subtotal: 50000 }, { productoId: 'p-11', nombre: 'Limonada de coco', precio: 6000, cantidad: 2, subtotal: 12000 }], metodo: 'efectivo' },
    { lineas: [{ productoId: 'p-19', nombre: 'Calentado paisa', precio: 12000, cantidad: 3, subtotal: 36000 }, { productoId: 'p-06', nombre: 'Chocolate caliente', precio: 5500, cantidad: 3, subtotal: 16500 }], metodo: 'nequi' },
    { lineas: [{ productoId: 'p-21', nombre: 'Ensalada del chef', precio: 15000, cantidad: 2, subtotal: 30000 }, { productoId: 'p-12', nombre: 'Agua mineral', precio: 2500, cantidad: 2, subtotal: 5000 }], metodo: 'datafono' },
    { lineas: [{ productoId: 'p-02', nombre: 'Café americano', precio: 4500, cantidad: 1, subtotal: 4500 }, { productoId: 'p-17', nombre: 'Buñuelo', precio: 2000, cantidad: 2, subtotal: 4000 }], metodo: 'efectivo' },
  ];

  const horarios = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
  const empleados = ['María García', 'Carlos Muñoz', 'Juanes Lizcano'];

  // Genera órdenes para los últimos 30 días
  for (let dia = 0; dia < 30; dia++) {
    const fecha = new Date(hoy);
    fecha.setDate(fecha.getDate() - dia);

    // Menos órdenes los lunes, más los fines de semana
    const esFinde = fecha.getDay() === 0 || fecha.getDay() === 6;
    const numOrdenes = esFinde
      ? 8 + Math.floor(Math.random() * 6)
      : 4 + Math.floor(Math.random() * 5);

    for (let i = 0; i < numOrdenes; i++) {
      const plantilla = plantillas[i % plantillas.length];
      const hora = horarios[Math.floor(Math.random() * horarios.length)];
      const minuto = Math.floor(Math.random() * 60);
      const fechaOrden = new Date(fecha);
      fechaOrden.setHours(hora, minuto, 0, 0);

      // No generar órdenes futuras
      if (fechaOrden > hoy) continue;

      const subtotal = plantilla.lineas.reduce((s, l) => s + l.subtotal, 0);
      ordenes.push({
        id: nextId(),
        lineas: plantilla.lineas,
        subtotal,
        propina: null,
        total: subtotal,
        metodoPago: plantilla.metodo,
        numFactura: nextFactura(),
        creadoEn: fechaOrden,
        estado: 'pagada',
        empleadoNombre: empleados[Math.floor(Math.random() * empleados.length)],
      });
    }
  }

  return ordenes.sort((a, b) => b.creadoEn - a.creadoEn);
}

// ─── Estado mutable en memoria ───────────────────────────────────────────────

const DB = {
  users: [
    { id: 'user-001', email: 'admin@tresorquideas.com', password: 'demo1234', negocioId: 'neg-001', verificado: true },
  ],
  negocios: { 'neg-001': { ...NEGOCIO_DEMO } },
  categorias: [...CATEGORIAS_INIT],
  productos: [...PRODUCTOS_INIT],
  mesas: MESAS_INIT.map(m => ({ ...m })),
  cuentas: [],
  ordenes: generarOrdenesDemo(),
  empleados: [...EMPLEADOS_INIT],
  movimientos: [],
  turnos: [],
  pendingOtps: {},
  currentUserId: null,
};

// ─── Helpers de autenticación ─────────────────────────────────────────────────

function crearToken(user) {
  const payload = {
    uid: user.id,
    email: user.email,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 86400,
  };
  return 'mock.' + btoa(JSON.stringify(payload)) + '.sig';
}

function usuarioActual() {
  return DB.users.find(u => u.id === DB.currentUserId) ?? null;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function login(email, password) {
  await delay();

  // En modo mock acepta cualquier email válido y contraseña ≥ 6 caracteres
  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const passValida  = typeof password === 'string' && password.length >= 6;
  if (!emailValido || !passValida) {
    throw Object.assign(new Error('Correo o contraseña incorrectos.'), { status: 401 });
  }

  // Entra siempre como el usuario demo (datos de "Tres Orquídeas")
  const demoUser = DB.users[0];
  DB.currentUserId = demoUser.id;
  const token   = crearToken({ ...demoUser, email });
  const negocio = DB.negocios[demoUser.negocioId] ?? null;
  return { token, user: { uid: demoUser.id, email }, negocio };
}

export async function register(email, password) {
  await delay();
  if (DB.users.find(u => u.email === email)) {
    throw Object.assign(new Error('Ya existe una cuenta con ese correo.'), { status: 409 });
  }
  const newUser = { id: nextId(), email, password, negocioId: null, verificado: false };
  DB.users.push(newUser);
  // OTP fijo para demo: 123456
  DB.pendingOtps[email] = { code: '123456', userId: newUser.id, expiresAt: Date.now() + 5 * 60000 };
  return { email, message: 'Código enviado a ' + email };
}

export async function verifyOtp(email, code) {
  await delay();
  const otp = DB.pendingOtps[email];
  if (!otp) throw Object.assign(new Error('No hay código pendiente para este correo.'), { status: 400 });
  if (Date.now() > otp.expiresAt) throw Object.assign(new Error('El código expiró. Reenvíalo.'), { status: 400 });
  if (otp.code !== code) throw Object.assign(new Error('Código incorrecto.'), { status: 400 });

  delete DB.pendingOtps[email];
  const user = DB.users.find(u => u.id === otp.userId);
  if (!user) throw new Error('Usuario no encontrado.');
  user.verificado = true;
  DB.currentUserId = user.id;
  const token = crearToken(user);
  return { token, user: { uid: user.id, email: user.email }, negocio: null };
}

export async function resendOtp(email) {
  await delay();
  const user = DB.users.find(u => u.email === email);
  if (!user) throw Object.assign(new Error('Correo no encontrado.'), { status: 404 });
  DB.pendingOtps[email] = { code: '123456', userId: user.id, expiresAt: Date.now() + 5 * 60000 };
  return { message: 'Código reenviado.' };
}

// ─── Negocio ──────────────────────────────────────────────────────────────────

export async function getNegocio() {
  await delay();
  const user = usuarioActual();
  if (!user || !user.negocioId) return null;
  return DB.negocios[user.negocioId] ?? null;
}

export async function createNegocio(data) {
  await delay();
  const user = usuarioActual();
  if (!user) throw new Error('No autenticado.');
  const id = nextId();
  const negocio = {
    id,
    ...data,
    plan: 'pro',
    onboardingCompleto: true,
    creadoEn: new Date(),
  };
  DB.negocios[id] = negocio;
  user.negocioId   = id;

  // Crear las mesas indicadas
  if (data.tieneMesas && data.mesas > 0) {
    for (let i = 1; i <= data.mesas; i++) {
      DB.mesas.push({ id: nextId(), numero: i, nombre: `Mesa ${i}`, estado: 'libre', ocupadaEn: null, total: null });
    }
  }

  return negocio;
}

export async function updateNegocio(data) {
  await delay();
  const user = usuarioActual();
  if (!user?.negocioId) throw new Error('No autenticado.');
  DB.negocios[user.negocioId] = { ...DB.negocios[user.negocioId], ...data };
  return DB.negocios[user.negocioId];
}

// ─── Productos ────────────────────────────────────────────────────────────────

export async function getProductos() {
  await delay();
  return [...DB.productos].sort((a, b) => b.creadoEn - a.creadoEn);
}

export async function createProducto(data) {
  await delay();
  const p = { id: nextId(), ...data, creadoEn: new Date() };
  DB.productos.push(p);
  return p;
}

export async function updateProducto(id, data) {
  await delay();
  const idx = DB.productos.findIndex(p => p.id === id);
  if (idx === -1) throw new Error('Producto no encontrado.');
  DB.productos[idx] = { ...DB.productos[idx], ...data };
  return DB.productos[idx];
}

export async function deleteProducto(id) {
  await delay();
  DB.productos = DB.productos.filter(p => p.id !== id);
  return { ok: true };
}

// ─── Categorías ───────────────────────────────────────────────────────────────

export async function getCategorias() {
  await delay();
  return [...DB.categorias].sort((a, b) => a.orden - b.orden);
}

export async function createCategoria(data) {
  await delay();
  const c = { id: nextId(), ...data };
  DB.categorias.push(c);
  return c;
}

export async function updateCategoria(id, data) {
  await delay();
  const idx = DB.categorias.findIndex(c => c.id === id);
  if (idx === -1) throw new Error('Categoría no encontrada.');
  DB.categorias[idx] = { ...DB.categorias[idx], ...data };
  return DB.categorias[idx];
}

export async function deleteCategoria(id) {
  await delay();
  const tieneProductos = DB.productos.some(p => p.categoriaId === id);
  if (tieneProductos) throw new Error('No puedes eliminar una categoría con productos.');
  DB.categorias = DB.categorias.filter(c => c.id !== id);
  return { ok: true };
}

// ─── Mesas ────────────────────────────────────────────────────────────────────

export async function getMesas() {
  await delay();
  return [...DB.mesas].sort((a, b) => a.numero - b.numero);
}

export async function updateMesa(id, data) {
  await delay();
  const idx = DB.mesas.findIndex(m => m.id === id);
  if (idx === -1) throw new Error('Mesa no encontrada.');
  // serverTimestamp() simulado
  const sanitized = Object.fromEntries(
    Object.entries(data).map(([k, v]) => [k, v === 'serverTimestamp' ? new Date() : v])
  );
  DB.mesas[idx] = { ...DB.mesas[idx], ...sanitized };
  return DB.mesas[idx];
}

export async function cambiarMesa(origenId, destinoId) {
  await delay();
  const origen  = DB.mesas.find(m => m.id === origenId);
  const destino = DB.mesas.find(m => m.id === destinoId);
  if (!origen || !destino) throw new Error('Mesa no encontrada.');

  const totalOrigen   = origen.total;
  const lineasOrigen  = origen.lineas ?? null;
  const personasOrigen = origen.personas ?? null;

  // Origen → libre
  Object.assign(origen,  { estado: 'libre', ocupadaEn: null, total: null, lineas: null, personas: null });
  // Destino → hereda los datos del origen
  Object.assign(destino, { estado: 'ocupada', ocupadaEn: new Date(), total: totalOrigen, lineas: lineasOrigen, personas: personasOrigen });

  return { ok: true };
}

// ─── Cuentas ──────────────────────────────────────────────────────────────────

export async function getCuentas() {
  await delay();
  return DB.cuentas.filter(c => c.estado !== 'pagada').sort((a, b) => b.creadoEn - a.creadoEn);
}

export async function createCuenta(data) {
  await delay();
  const cuenta = { id: nextId(), ...data, creadoEn: new Date() };
  DB.cuentas.push(cuenta);
  return cuenta;
}

export async function updateCuenta(id, data) {
  await delay();
  const idx = DB.cuentas.findIndex(c => c.id === id);
  if (idx === -1) throw new Error('Cuenta no encontrada.');
  DB.cuentas[idx] = { ...DB.cuentas[idx], ...data };
  return DB.cuentas[idx];
}

export async function getCuenta(id) {
  await delay();
  const cuenta = DB.cuentas.find(c => c.id === id);
  if (!cuenta) throw new Error('Cuenta no encontrada.');
  return cuenta;
}

// ─── Órdenes ─────────────────────────────────────────────────────────────────

export async function getOrdenes(params = {}) {
  await delay();
  let result = [...DB.ordenes];
  if (params.desde) {
    const desde = new Date(params.desde);
    result = result.filter(o => new Date(o.creadoEn) >= desde);
  }
  if (params.hasta) {
    const hasta = new Date(params.hasta);
    result = result.filter(o => new Date(o.creadoEn) <= hasta);
  }
  return result.sort((a, b) => new Date(b.creadoEn) - new Date(a.creadoEn));
}

export async function createOrden(data) {
  await delay();
  const numFactura = nextFactura();
  const orden = {
    id: nextId(),
    numFactura,
    ...data,
    creadoEn: new Date(),
    estado: 'pagada',
  };
  DB.ordenes.unshift(orden);
  return orden;
}

export async function updateOrden(id, data) {
  await delay();
  const idx = DB.ordenes.findIndex(o => o.id === id);
  if (idx === -1) throw new Error('Orden no encontrada.');
  DB.ordenes[idx] = { ...DB.ordenes[idx], ...data };
  return DB.ordenes[idx];
}

// ─── Empleados ────────────────────────────────────────────────────────────────

export async function getEmpleados() {
  await delay();
  return [...DB.empleados].sort((a, b) => a.nombre.localeCompare(b.nombre));
}

export async function createEmpleado(data) {
  await delay();
  const emp = { id: nextId(), ...data, activo: true, creadoEn: new Date() };
  DB.empleados.push(emp);
  return emp;
}

export async function updateEmpleado(id, data) {
  await delay();
  const idx = DB.empleados.findIndex(e => e.id === id);
  if (idx === -1) throw new Error('Empleado no encontrado.');
  DB.empleados[idx] = { ...DB.empleados[idx], ...data };
  return DB.empleados[idx];
}

export async function deleteEmpleado(id) {
  await delay();
  DB.empleados = DB.empleados.filter(e => e.id !== id);
  return { ok: true };
}

// ─── Movimientos de caja ─────────────────────────────────────────────────────

export async function getMovimientos(fecha) {
  await delay();
  const ref = fecha ? new Date(fecha) : new Date();
  ref.setHours(0, 0, 0, 0);
  const fin = new Date(ref);
  fin.setDate(fin.getDate() + 1);
  return DB.movimientos.filter(m => {
    const d = new Date(m.creadoEn);
    return d >= ref && d < fin;
  });
}

export async function createMovimiento(data) {
  await delay();
  const mov = { id: nextId(), ...data, creadoEn: new Date() };
  DB.movimientos.push(mov);
  return mov;
}

// ─── Turnos ───────────────────────────────────────────────────────────────────

export async function getTurnoActivo() {
  await delay();
  return DB.turnos.find(t => t.fin === null) ?? null;
}

export async function createTurno(data) {
  await delay();
  const turno = { id: nextId(), ...data, fin: null, duracionMin: null, numOrdenes: 0, inicio: new Date() };
  DB.turnos.push(turno);
  return turno;
}

export async function updateTurno(id, data) {
  await delay();
  const idx = DB.turnos.findIndex(t => t.id === id);
  if (idx === -1) throw new Error('Turno no encontrado.');
  DB.turnos[idx] = { ...DB.turnos[idx], ...data };
  return DB.turnos[idx];
}

// ─── Reportes / KPIs ─────────────────────────────────────────────────────────

export async function getKPIs(desde, hasta) {
  await delay();
  const desdeDate = new Date(desde);
  const hastaDate = new Date(hasta);
  const ordenes = DB.ordenes.filter(o => {
    const d = new Date(o.creadoEn);
    return d >= desdeDate && d <= hastaDate;
  });

  const totalVentas = ordenes.reduce((s, o) => s + o.total, 0);
  const numOrdenes  = ordenes.length;
  const ticketProm  = numOrdenes ? Math.round(totalVentas / numOrdenes) : 0;

  // Mejor hora
  const porHora = {};
  ordenes.forEach(o => {
    const h = new Date(o.creadoEn).getHours();
    porHora[h] = (porHora[h] || 0) + o.total;
  });
  const mejorHora = Object.entries(porHora).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  // Producto top
  const porProducto = {};
  ordenes.forEach(o => o.lineas.forEach(l => {
    porProducto[l.nombre] = (porProducto[l.nombre] || 0) + l.cantidad;
  }));
  const productoTop = Object.entries(porProducto).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  // Método top
  const porMetodo = {};
  ordenes.forEach(o => { porMetodo[o.metodoPago] = (porMetodo[o.metodoPago] || 0) + 1; });
  const metodoTop = Object.entries(porMetodo).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  return { totalVentas, numOrdenes, ticketProm, mejorHora, productoTop, metodoTop };
}

export async function getVentasPorDia(desde, hasta) {
  await delay();
  const desdeDate = new Date(desde);
  const hastaDate = new Date(hasta);
  const ordenes = DB.ordenes.filter(o => {
    const d = new Date(o.creadoEn);
    return d >= desdeDate && d <= hastaDate;
  });

  const porDia = {};
  ordenes.forEach(o => {
    const fecha = new Date(o.creadoEn);
    const key = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
    porDia[key] = (porDia[key] || 0) + o.total;
  });

  return Object.entries(porDia)
    .map(([fecha, total]) => ({ fecha, total }))
    .sort((a, b) => a.fecha.localeCompare(b.fecha));
}
