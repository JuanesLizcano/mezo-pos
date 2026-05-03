// Mock API — simula el backend de Manuel con datos en memoria
// Negocio demo: "Tres Orquídeas" (cafetería en Medellín)
// Los nombres de campos coinciden con el backend real para que
// cambiar REACT_APP_USE_MOCK=false no requiera tocar el frontend.

function delay() {
  return new Promise(r => setTimeout(r, 300 + Math.random() * 300));
}

let _idCounter  = 1000;
let _saleCounter = 87;
function nextId()   { return 'mock-' + (++_idCounter); }
function nextSale() { return ++_saleCounter; }

// ─── Datos iniciales ────────────────────────────────────────────────────────

// Campos del negocio alineados con el backend de Manuel
const NEGOCIO_DEMO = {
  id:          'neg-001',
  name:        'Tres Orquídeas',
  type:        'CAFE',
  phone:       '3121234567',
  address:     'El Poblado, Cra 37 #10A-45',
  city:        'Medellín',
  country:     'Colombia',
  openingTime: '07:00',
  closingTime: '22:00',
  tableCount:  6,
  isOpen:      true,
};

const CATEGORIAS_INIT = [
  { id: 'cat-1', nombre: 'Bebidas calientes', emoji: '☕', orden: 1 },
  { id: 'cat-2', nombre: 'Jugos y fríos',     emoji: '🧃', orden: 2 },
  { id: 'cat-3', nombre: 'Panadería',         emoji: '🥐', orden: 3 },
  { id: 'cat-4', nombre: 'Platos',            emoji: '🍽️', orden: 4 },
];

const PRODUCTOS_INIT = [
  // costo = costo real de producción en COP (ingredientes + empaque)
  { id: 'p-01',  nombre: 'Café tinto',         precio: 3000,  costo: 700,   categoriaId: 'cat-1', emoji: '☕',  disponible: true, creadoEn: new Date('2025-01-15') },
  { id: 'p-02',  nombre: 'Café americano',      precio: 4500,  costo: 1100,  categoriaId: 'cat-1', emoji: '☕',  disponible: true, creadoEn: new Date('2025-01-15') },
  { id: 'p-03',  nombre: 'Café con leche',      precio: 5500,  costo: 1800,  categoriaId: 'cat-1', emoji: '🥛',  disponible: true, creadoEn: new Date('2025-01-15') },
  { id: 'p-04',  nombre: 'Capuchino',           precio: 6500,  costo: 2200,  categoriaId: 'cat-1', emoji: '☕',  disponible: true, creadoEn: new Date('2025-01-15') },
  { id: 'p-05',  nombre: 'Latte de vainilla',   precio: 7000,  costo: 2600,  categoriaId: 'cat-1', emoji: '🥛',  disponible: true, creadoEn: new Date('2025-01-15') },
  { id: 'p-06',  nombre: 'Chocolate caliente',  precio: 5500,  costo: 2100,  categoriaId: 'cat-1', emoji: '🍫',  disponible: true, creadoEn: new Date('2025-01-15') },
  { id: 'p-07',  nombre: 'Agua de panela',      precio: 3000,  costo: 400,   categoriaId: 'cat-1', emoji: '🍵',  disponible: true, creadoEn: new Date('2025-01-15') },
  { id: 'p-08',  nombre: 'Jugo de lulo',        precio: 5000,  costo: 1600,  categoriaId: 'cat-2', emoji: '🍋',  disponible: true, creadoEn: new Date('2025-01-15') },
  { id: 'p-09',  nombre: 'Jugo de maracuyá',    precio: 5500,  costo: 1800,  categoriaId: 'cat-2', emoji: '🟡',  disponible: true, creadoEn: new Date('2025-01-15') },
  { id: 'p-10',  nombre: 'Jugo de mora',        precio: 5000,  costo: 1700,  categoriaId: 'cat-2', emoji: '🫐',  disponible: true, creadoEn: new Date('2025-01-15') },
  { id: 'p-11',  nombre: 'Limonada de coco',    precio: 6000,  costo: 2200,  categoriaId: 'cat-2', emoji: '🥥',  disponible: true, creadoEn: new Date('2025-01-15') },
  { id: 'p-12',  nombre: 'Agua mineral',        precio: 2500,  costo: 800,   categoriaId: 'cat-2', emoji: '💧',  disponible: true, creadoEn: new Date('2025-01-15') },
  { id: 'p-13',  nombre: 'Croissant de jamón',  precio: 4500,  costo: 2000,  categoriaId: 'cat-3', emoji: '🥐',  disponible: true, creadoEn: new Date('2025-01-15') },
  { id: 'p-14',  nombre: 'Pan de bono',         precio: 2500,  costo: 800,   categoriaId: 'cat-3', emoji: '🧀',  disponible: true, creadoEn: new Date('2025-01-15') },
  { id: 'p-15',  nombre: 'Empanada de pipián',  precio: 3500,  costo: 1400,  categoriaId: 'cat-3', emoji: '🥟',  disponible: true, creadoEn: new Date('2025-01-15') },
  { id: 'p-16',  nombre: 'Arepa con queso',     precio: 5000,  costo: 1900,  categoriaId: 'cat-3', emoji: '🫓',  disponible: true, creadoEn: new Date('2025-01-15') },
  { id: 'p-17',  nombre: 'Buñuelo',             precio: 2000,  costo: 600,   categoriaId: 'cat-3', emoji: '🍩',  disponible: true, creadoEn: new Date('2025-01-15') },
  { id: 'p-18',  nombre: 'Changua',             precio: 8000,  costo: 3500,  categoriaId: 'cat-4', emoji: '🍲',  disponible: true, creadoEn: new Date('2025-01-15') },
  { id: 'p-19',  nombre: 'Calentado paisa',     precio: 12000, costo: 5200,  categoriaId: 'cat-4', emoji: '🍳',  disponible: true, creadoEn: new Date('2025-01-15') },
  { id: 'p-20',  nombre: 'Sopa del día',        precio: 14000, costo: 6800,  categoriaId: 'cat-4', emoji: '🥣',  disponible: true, creadoEn: new Date('2025-01-15') },
  { id: 'p-21',  nombre: 'Ensalada del chef',   precio: 15000, costo: 5500,  categoriaId: 'cat-4', emoji: '🥗',  disponible: true, creadoEn: new Date('2025-01-15') },
  { id: 'p-22',  nombre: 'Sancocho de pollo',   precio: 18000, costo: 9000,  categoriaId: 'cat-4', emoji: '🍗',  disponible: true, creadoEn: new Date('2025-01-15') },
  { id: 'p-23',  nombre: 'Bandeja paisa mini',  precio: 25000, costo: 11000, categoriaId: 'cat-4', emoji: '🍽️', disponible: true, creadoEn: new Date('2025-01-15') },
];

const MESAS_INIT = [
  {
    id: 'mesa-1', numero: 1, nombre: 'Mesa 1', estado: 'ocupada',
    ocupadaEn: new Date(Date.now() - 45 * 60000), total: 27000, personas: 3,
    lineas: [
      { productId: 'p-04', nombre: 'Capuchino',        precio: 6500, cantidad: 2, subtotal: 13000 },
      { productId: 'p-13', nombre: 'Croissant de jamón', precio: 4500, cantidad: 2, subtotal: 9000  },
      { productId: 'p-08', nombre: 'Jugo de lulo',     precio: 5000, cantidad: 1, subtotal: 5000  },
    ],
  },
  { id: 'mesa-2', numero: 2, nombre: 'Mesa 2', estado: 'libre',   ocupadaEn: null, total: null, lineas: null },
  {
    id: 'mesa-3', numero: 3, nombre: 'Mesa 3', estado: 'pagando',
    ocupadaEn: new Date(Date.now() - 92 * 60000), total: 45000, personas: 4,
    lineas: [
      { productId: 'p-23', nombre: 'Bandeja paisa mini', precio: 25000, cantidad: 1, subtotal: 25000 },
      { productId: 'p-08', nombre: 'Jugo de lulo',       precio: 5000,  cantidad: 2, subtotal: 10000 },
      { productId: 'p-01', nombre: 'Café tinto',         precio: 3000,  cantidad: 2, subtotal: 6000  },
      { productId: 'p-17', nombre: 'Buñuelo',            precio: 2000,  cantidad: 2, subtotal: 4000  },
    ],
  },
  { id: 'mesa-4', numero: 4, nombre: 'Mesa 4', estado: 'libre',   ocupadaEn: null, total: null, lineas: null },
  {
    id: 'mesa-5', numero: 5, nombre: 'Mesa 5', estado: 'ocupada',
    ocupadaEn: new Date(Date.now() - 22 * 60000), total: 13500, personas: 2,
    lineas: [
      { productId: 'p-08', nombre: 'Jugo de lulo', precio: 5000, cantidad: 1, subtotal: 5000 },
      { productId: 'p-04', nombre: 'Capuchino',    precio: 6500, cantidad: 1, subtotal: 6500 },
      { productId: 'p-17', nombre: 'Buñuelo',      precio: 2000, cantidad: 1, subtotal: 2000 },
    ],
  },
  { id: 'mesa-6', numero: 6, nombre: 'Mesa 6', estado: 'libre',   ocupadaEn: null, total: null, lineas: null },
];

const EMPLEADOS_INIT = [
  { id: 'emp-1', nombre: 'Juanes Lizcano',  correo: 'juanes@tresorquideas.com', pin: '1234', roles: ['admin'],   activo: true, creadoEn: new Date('2025-01-15') },
  { id: 'emp-2', nombre: 'María García',    correo: 'maria@tresorquideas.com',  pin: '2345', roles: ['cajera'],  activo: true, creadoEn: new Date('2025-01-20') },
  { id: 'emp-3', nombre: 'Carlos Muñoz',    correo: 'carlos@tresorquideas.com', pin: '3456', roles: ['mesero'],  activo: true, creadoEn: new Date('2025-02-01') },
];

// Genera órdenes históricas para los reportes (ya con campos del backend)
function generarOrdenesDemo() {
  const ordenes = [];
  const hoy = new Date();

  // paymentMethod usa los enums del backend en mayúsculas
  const plantillas = [
    { items: [{ productId: 'p-02', name: 'Café americano', unitPrice: 4500, quantity: 2, subtotal: 9000 }, { productId: 'p-13', name: 'Croissant de jamón', unitPrice: 4500, quantity: 2, subtotal: 9000 }], paymentMethod: 'CASH' },
    { items: [{ productId: 'p-04', name: 'Capuchino', unitPrice: 6500, quantity: 3, subtotal: 19500 }, { productId: 'p-16', name: 'Arepa con queso', unitPrice: 5000, quantity: 2, subtotal: 10000 }], paymentMethod: 'NEQUI' },
    { items: [{ productId: 'p-18', name: 'Changua', unitPrice: 8000, quantity: 2, subtotal: 16000 }, { productId: 'p-01', name: 'Café tinto', unitPrice: 3000, quantity: 2, subtotal: 6000 }], paymentMethod: 'CARD' },
    { items: [{ productId: 'p-22', name: 'Sancocho de pollo', unitPrice: 18000, quantity: 1, subtotal: 18000 }, { productId: 'p-08', name: 'Jugo de lulo', unitPrice: 5000, quantity: 1, subtotal: 5000 }], paymentMethod: 'CASH' },
    { items: [{ productId: 'p-03', name: 'Café con leche', unitPrice: 5500, quantity: 4, subtotal: 22000 }, { productId: 'p-15', name: 'Empanada de pipián', unitPrice: 3500, quantity: 4, subtotal: 14000 }], paymentMethod: 'TRANSFER' },
    { items: [{ productId: 'p-05', name: 'Latte de vainilla', unitPrice: 7000, quantity: 2, subtotal: 14000 }, { productId: 'p-14', name: 'Pan de bono', unitPrice: 2500, quantity: 3, subtotal: 7500 }], paymentMethod: 'DAVIPLATA' },
    { items: [{ productId: 'p-23', name: 'Bandeja paisa mini', unitPrice: 25000, quantity: 2, subtotal: 50000 }, { productId: 'p-11', name: 'Limonada de coco', unitPrice: 6000, quantity: 2, subtotal: 12000 }], paymentMethod: 'CASH' },
    { items: [{ productId: 'p-19', name: 'Calentado paisa', unitPrice: 12000, quantity: 3, subtotal: 36000 }, { productId: 'p-06', name: 'Chocolate caliente', unitPrice: 5500, quantity: 3, subtotal: 16500 }], paymentMethod: 'NEQUI' },
    { items: [{ productId: 'p-21', name: 'Ensalada del chef', unitPrice: 15000, quantity: 2, subtotal: 30000 }, { productId: 'p-12', name: 'Agua mineral', unitPrice: 2500, quantity: 2, subtotal: 5000 }], paymentMethod: 'CARD' },
    { items: [{ productId: 'p-02', name: 'Café americano', unitPrice: 4500, quantity: 1, subtotal: 4500 }, { productId: 'p-17', name: 'Buñuelo', unitPrice: 2000, quantity: 2, subtotal: 4000 }], paymentMethod: 'CASH' },
  ];

  const horarios  = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
  const empleados = ['María García', 'Carlos Muñoz', 'Juanes Lizcano'];

  for (let dia = 0; dia < 30; dia++) {
    const fecha = new Date(hoy);
    fecha.setDate(fecha.getDate() - dia);

    const esFinde   = fecha.getDay() === 0 || fecha.getDay() === 6;
    const numOrdenes = esFinde
      ? 8 + Math.floor(Math.random() * 6)
      : 4 + Math.floor(Math.random() * 5);

    for (let i = 0; i < numOrdenes; i++) {
      const plantilla  = plantillas[i % plantillas.length];
      const hora       = horarios[Math.floor(Math.random() * horarios.length)];
      const minuto     = Math.floor(Math.random() * 60);
      const createdAt  = new Date(fecha);
      createdAt.setHours(hora, minuto, 0, 0);

      if (createdAt > hoy) continue;

      const subtotal = plantilla.items.reduce((s, l) => s + l.subtotal, 0);
      ordenes.push({
        id:           nextId(),
        status:       'PAID',
        items:        plantilla.items,
        subtotal,
        tip:          null,
        total:        subtotal,
        paymentMethod: plantilla.paymentMethod,
        saleNumber:   nextSale(),
        createdAt,
        employeeName: empleados[Math.floor(Math.random() * empleados.length)],
      });
    }
  }

  return ordenes.sort((a, b) => b.createdAt - a.createdAt);
}

// ─── Órdenes de cocina demo (muestran los tres estados del timer) ────────────

const COCINA_DEMO = [
  {
    id: 'coc-001', status: 'OPEN', estadoCocina: 'preparando',
    cocinaEn: new Date(Date.now() - 2.5 * 60000),
    items: [
      { productId: 'p-04', name: 'Capuchino',        unitPrice: 6500, quantity: 2, subtotal: 13000 },
      { productId: 'p-13', name: 'Croissant de jamón', unitPrice: 4500, quantity: 1, subtotal: 4500  },
    ],
    subtotal: 17500, total: 17500, tip: null, paymentMethod: null, saleNumber: null,
    tableId: 'mesa-1', employeeName: 'Carlos Muñoz', shiftId: null,
    createdAt: new Date(Date.now() - 2.5 * 60000),
  },
  {
    id: 'coc-002', status: 'OPEN', estadoCocina: 'preparando',
    cocinaEn: new Date(Date.now() - 7.5 * 60000),
    items: [
      { productId: 'p-18', name: 'Changua',       unitPrice: 8000, quantity: 2, subtotal: 16000 },
      { productId: 'p-07', name: 'Agua de panela', unitPrice: 3000, quantity: 2, subtotal: 6000  },
    ],
    subtotal: 22000, total: 22000, tip: null, paymentMethod: null, saleNumber: null,
    tableId: 'mesa-3', employeeName: 'María García', shiftId: null,
    createdAt: new Date(Date.now() - 7.5 * 60000),
  },
  {
    id: 'coc-003', status: 'OPEN', estadoCocina: 'preparando',
    cocinaEn: new Date(Date.now() - 11 * 60000),
    items: [
      { productId: 'p-19', name: 'Calentado paisa', unitPrice: 12000, quantity: 1, subtotal: 12000 },
      { productId: 'p-01', name: 'Café tinto',      unitPrice: 3000,  quantity: 2, subtotal: 6000  },
    ],
    subtotal: 18000, total: 18000, tip: null, paymentMethod: null, saleNumber: null,
    tableId: 'mesa-5', employeeName: 'Juanes Lizcano', shiftId: null,
    createdAt: new Date(Date.now() - 11 * 60000),
  },
];

// ─── Estado mutable en memoria ───────────────────────────────────────────────

// ─── Clientes y lealtad ──────────────────────────────────────────────────────
// Mapa celular → { celular, visitas, ultimaVisita }

const DB_CLIENTES = {};

export async function getCliente(celular) {
  await delay();
  return DB_CLIENTES[celular] ?? null;
}

export async function registrarVisita(celular) {
  await delay();
  if (!DB_CLIENTES[celular]) {
    DB_CLIENTES[celular] = { celular, visitas: 0, ultimaVisita: null };
  }
  DB_CLIENTES[celular].visitas    += 1;
  DB_CLIENTES[celular].ultimaVisita = new Date();
  return DB_CLIENTES[celular];
}

// ─── Estado mutable en memoria ───────────────────────────────────────────────

const ZONAS_INIT = [
  { id: 'zona-1', nombre: 'Salón principal', color: '#C8903F' },
];

const DB = {
  // role y planType alineados con los enums del backend
  users: [
    {
      id:            'user-001',
      email:         'admin@tresorquideas.com',
      password:      'demo1234',
      negocioId:     'neg-001',
      role:          'ADMIN',
      planType:      'PRO',
      planExpiresAt: null,
    },
  ],
  negocios:     { 'neg-001': { ...NEGOCIO_DEMO } },
  categorias:   [...CATEGORIAS_INIT],
  productos:    PRODUCTOS_INIT.map(p => ({ ...p, negocioId: 'neg-001' })),
  zonas:        [...ZONAS_INIT],
  mesas:        MESAS_INIT.map(m => ({ ...m, negocioId: 'neg-001', zonaId: 'zona-1' })),
  cuentas:      [],
  ordenes:      [...COCINA_DEMO, ...generarOrdenesDemo()].map(o => ({ ...o, negocioId: 'neg-001' })),
  empleados:    EMPLEADOS_INIT.map(e => ({ ...e, negocioId: 'neg-001' })),
  movimientos:  [],
  turnos:       [],
  pendingOtps:  {},
  currentUserId: null,
};

// ─── Helpers de autenticación ─────────────────────────────────────────────────

// Crea un JWT mock con los campos que devuelve el backend real
function crearToken(user, expiresInSec = 86400) {
  const payload = {
    sub:           user.id,
    email:         user.email,
    role:          user.role,
    planType:      user.planType,
    planExpiresAt: user.planExpiresAt ?? null,
    iat:           Math.floor(Date.now() / 1000),
    exp:           Math.floor(Date.now() / 1000) + expiresInSec,
  };
  return 'mock.' + btoa(JSON.stringify(payload)) + '.sig';
}

function usuarioActual() {
  if (DB.currentUserId) {
    return DB.users.find(u => u.id === DB.currentUserId) ?? null;
  }
  // Al recargar la página el estado RAM se pierde.
  // Recuperamos el userId desde el accessToken guardado en localStorage.
  try {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('mezo_token') : null;
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    const userId = payload.sub ?? payload.uid;
    if (userId) {
      DB.currentUserId = userId;  // restaurar para llamadas siguientes
      return DB.users.find(u => u.id === userId) ?? null;
    }
  } catch { /* token inválido o entorno sin localStorage */ }
  return null;
}

function negocioActual() {
  return usuarioActual()?.negocioId ?? null;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function login(email, password) {
  await delay();

  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const passValida  = typeof password === 'string' && password.length >= 6;
  if (!emailValido || !passValida) {
    throw Object.assign(new Error('Correo o contraseña incorrectos.'), { status: 401 });
  }

  const demoUser = DB.users[0];
  DB.currentUserId = demoUser.id;

  // Respuesta idéntica al backend: accessToken + refreshToken + user
  return {
    accessToken:  crearToken({ ...demoUser, email }, 86400),
    refreshToken: crearToken({ ...demoUser, email }, 604800),
    user: {
      id:            demoUser.id,
      email,
      role:          demoUser.role,
      planType:      demoUser.planType,
      planExpiresAt: demoUser.planExpiresAt,
    },
  };
}

export async function register(email, password) {
  await delay();
  if (DB.users.find(u => u.email === email)) {
    throw Object.assign(new Error('Ya existe una cuenta con ese correo.'), { status: 409 });
  }
  const newUser = {
    id:            nextId(),
    email,
    password,
    negocioId:     null,
    role:          'ADMIN',
    planType:      'SEMILLA',
    planExpiresAt: null,
  };
  DB.users.push(newUser);
  // OTP fijo para demo: 123456
  DB.pendingOtps[email] = { code: '123456', userId: newUser.id, expiresAt: Date.now() + 5 * 60000 };
  return { email, message: 'Código enviado a ' + email };
}

export async function verifyOtp(email, code) {
  await delay();
  const otp = DB.pendingOtps[email];
  if (!otp)                   throw Object.assign(new Error('No hay código pendiente para este correo.'), { status: 400 });
  if (Date.now() > otp.expiresAt) throw Object.assign(new Error('El código expiró. Reenvíalo.'), { status: 400 });
  if (otp.code !== code)      throw Object.assign(new Error('Código incorrecto.'), { status: 400 });

  delete DB.pendingOtps[email];
  const user = DB.users.find(u => u.id === otp.userId);
  if (!user) throw new Error('Usuario no encontrado.');
  DB.currentUserId = user.id;

  // Misma forma de respuesta que login
  return {
    accessToken:  crearToken(user, 86400),
    refreshToken: crearToken(user, 604800),
    user: {
      id:            user.id,
      email:         user.email,
      role:          user.role,
      planType:      user.planType,
      planExpiresAt: user.planExpiresAt,
    },
  };
}

export async function resendOtp(email) {
  await delay();
  const user = DB.users.find(u => u.email === email);
  if (!user) throw Object.assign(new Error('Correo no encontrado.'), { status: 404 });
  DB.pendingOtps[email] = { code: '123456', userId: user.id, expiresAt: Date.now() + 5 * 60000 };
  return { message: 'Código reenviado.' };
}

// ─── Negocio ──────────────────────────────────────────────────────────────────

// Respuesta con los campos del backend de Manuel
export async function getNegocio() {
  await delay();
  const user = usuarioActual();
  if (!user?.negocioId) return null;
  return DB.negocios[user.negocioId] ?? null;
}

export async function createNegocio(data) {
  await delay();
  const user = usuarioActual();
  if (!user) throw new Error('No autenticado.');
  const id = nextId();

  // Guardar con los campos del backend (name, type, phone, etc.)
  const negocio = { id, ...data, isOpen: true };
  DB.negocios[id] = negocio;
  user.negocioId  = id;

  if (data.tableCount > 0) {
    for (let i = 1; i <= data.tableCount; i++) {
      DB.mesas.push({ id: nextId(), negocioId: id, numero: i, nombre: `Mesa ${i}`, estado: 'libre', ocupadaEn: null, total: null });
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
  const negId = negocioActual();
  if (!negId) return [];
  return [...DB.productos].filter(p => p.negocioId === negId).sort((a, b) => b.creadoEn - a.creadoEn);
}

export async function createProducto(data) {
  await delay();
  const user = usuarioActual();
  const p = { id: nextId(), negocioId: user?.negocioId ?? null, ...data, creadoEn: new Date() };
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
  const negId = negocioActual();
  if (!negId) return [];
  return [...DB.mesas].filter(m => m.negocioId === negId).sort((a, b) => a.numero - b.numero);
}

export async function updateMesa(id, data) {
  await delay();
  const idx = DB.mesas.findIndex(m => m.id === id);
  if (idx === -1) throw new Error('Mesa no encontrada.');
  const sanitized = Object.fromEntries(
    Object.entries(data).map(([k, v]) => [k, v === 'serverTimestamp' ? new Date() : v])
  );
  DB.mesas[idx] = { ...DB.mesas[idx], ...sanitized };
  return DB.mesas[idx];
}

export async function createMesa(data) {
  await delay();
  const user = usuarioActual();
  const negId = user?.negocioId ?? null;
  const mesasPropias = negId ? DB.mesas.filter(m => m.negocioId === negId) : DB.mesas;
  const siguienteNumero = mesasPropias.length
    ? Math.max(...mesasPropias.map(m => m.numero)) + 1
    : 1;
  const numero = data.numero ?? siguienteNumero;
  const mesa = {
    id:        nextId(),
    negocioId: negId,
    numero,
    nombre:    data.nombre ?? `Mesa ${numero}`,
    estado:    'libre',
    ocupadaEn: null,
    total:     null,
    lineas:    null,
    zonaId:    data.zonaId ?? 'zona-1',
  };
  DB.mesas.push(mesa);
  return mesa;
}

export async function deleteMesa(id) {
  await delay();
  const idx = DB.mesas.findIndex(m => m.id === id);
  if (idx === -1) throw new Error('Mesa no encontrada.');
  DB.mesas.splice(idx, 1);
  return { ok: true };
}

// ─── Zonas ────────────────────────────────────────────────────────────────────

export async function getZonas() {
  await delay();
  return [...DB.zonas];
}

export async function createZona(data) {
  await delay();
  const zona = { id: nextId(), ...data };
  DB.zonas.push(zona);
  return zona;
}

export async function updateZona(id, data) {
  await delay();
  const idx = DB.zonas.findIndex(z => z.id === id);
  if (idx === -1) throw new Error('Zona no encontrada.');
  DB.zonas[idx] = { ...DB.zonas[idx], ...data };
  return DB.zonas[idx];
}

export async function deleteZona(id) {
  await delay();
  const tieneMesas = DB.mesas.some(m => m.zonaId === id);
  if (tieneMesas) throw new Error('No puedes eliminar una zona que tiene mesas asignadas.');
  DB.zonas = DB.zonas.filter(z => z.id !== id);
  return { ok: true };
}

export async function cambiarMesa(origenId, destinoId) {
  await delay();
  const origen  = DB.mesas.find(m => m.id === origenId);
  const destino = DB.mesas.find(m => m.id === destinoId);
  if (!origen || !destino) throw new Error('Mesa no encontrada.');

  const totalOrigen    = origen.total;
  const lineasOrigen   = origen.lineas ?? null;
  const personasOrigen = origen.personas ?? null;

  Object.assign(origen,  { estado: 'libre',   ocupadaEn: null,       total: null,         lineas: null,        personas: null });
  Object.assign(destino, { estado: 'ocupada', ocupadaEn: new Date(), total: totalOrigen,  lineas: lineasOrigen, personas: personasOrigen });

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

// ─── Órdenes — flujo de 3 pasos ───────────────────────────────────────────────
//
// Paso 1: createOrden  → POST /orders        → status OPEN
// Paso 2: deliverOrden → POST /orders/{id}/deliver → status DELIVERED
// Paso 3: createVenta  → POST /sales         → status PAID + devuelve la venta

export async function getOrdenes(params = {}) {
  await delay();
  const negId = negocioActual();
  if (!negId) return [];
  let result = DB.ordenes.filter(o => o.negocioId === negId);
  if (params.desde) {
    const desde = new Date(params.desde);
    result = result.filter(o => new Date(o.createdAt) >= desde);
  }
  if (params.hasta) {
    const hasta = new Date(params.hasta);
    result = result.filter(o => new Date(o.createdAt) <= hasta);
  }
  return result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

// Paso 1 — crea la orden con estado OPEN y la marca automáticamente como "preparando" en cocina
export async function createOrden(data) {
  await delay();
  const ahora = new Date();
  const orden = {
    id:            nextId(),
    negocioId:     usuarioActual()?.negocioId ?? null,
    status:        'OPEN',
    estadoCocina:  'preparando',
    cocinaEn:      ahora,
    items:         data.items ?? [],
    subtotal:      data.items?.reduce((s, i) => s + i.subtotal, 0) ?? 0,
    tip:           null,
    total:         data.items?.reduce((s, i) => s + i.subtotal, 0) ?? 0,
    paymentMethod: null,
    saleNumber:    null,
    tableId:       data.tableId ?? null,
    employeeName:  data.employeeName ?? null,
    shiftId:       data.shiftId ?? null,
    createdAt:     ahora,
  };
  DB.ordenes.unshift(orden);
  return orden;
}

// Paso 2 — marca la orden como entregada (DELIVERED)
export async function deliverOrden(id) {
  await delay();
  const idx = DB.ordenes.findIndex(o => o.id === id);
  if (idx === -1) throw new Error('Orden no encontrada.');
  DB.ordenes[idx] = { ...DB.ordenes[idx], status: 'DELIVERED' };
  return DB.ordenes[idx];
}

// Paso 3 — cierra la venta con método de pago; retorna la venta creada
export async function createVenta(data) {
  await delay();
  const idx = DB.ordenes.findIndex(o => o.id === data.orderId);
  if (idx === -1) throw new Error('Orden no encontrada.');

  const saleNumber = nextSale();

  // Actualizar la orden al estado final PAID
  DB.ordenes[idx] = {
    ...DB.ordenes[idx],
    status:       'PAID',
    paymentMethod: data.paymentMethod,
    subtotal:     data.subtotal,
    tip:          data.tip ?? null,
    total:        data.total,
    saleNumber,
  };

  return {
    id:            nextId(),
    saleNumber,
    orderId:       data.orderId,
    paymentMethod: data.paymentMethod,
    subtotal:      data.subtotal,
    tip:           data.tip ?? null,
    total:         data.total,
    amountPaid:    data.amountPaid ?? null,
    change:        data.change ?? null,
    createdAt:     new Date(),
  };
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
  const negId = negocioActual();
  if (!negId) return [];
  return [...DB.empleados].filter(e => e.negocioId === negId).sort((a, b) => a.nombre.localeCompare(b.nombre));
}

export async function createEmpleado(data) {
  await delay();
  const user = usuarioActual();
  const emp = { id: nextId(), negocioId: user?.negocioId ?? null, ...data, activo: true, creadoEn: new Date() };
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
  const ordenes   = DB.ordenes.filter(o => {
    const d = new Date(o.createdAt);
    return d >= desdeDate && d <= hastaDate && o.status === 'PAID';
  });

  const totalVentas = ordenes.reduce((s, o) => s + o.total, 0);
  const numOrdenes  = ordenes.length;
  const ticketProm  = numOrdenes ? Math.round(totalVentas / numOrdenes) : 0;

  const porHora = {};
  ordenes.forEach(o => {
    const h = new Date(o.createdAt).getHours();
    porHora[h] = (porHora[h] || 0) + o.total;
  });
  const mejorHora = Object.entries(porHora).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  const porProducto = {};
  ordenes.forEach(o => o.items.forEach(i => {
    porProducto[i.name] = (porProducto[i.name] || 0) + i.quantity;
  }));
  const productoTop = Object.entries(porProducto).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  const porMetodo = {};
  ordenes.forEach(o => {
    if (o.paymentMethod) porMetodo[o.paymentMethod] = (porMetodo[o.paymentMethod] || 0) + 1;
  });
  const metodoTop = Object.entries(porMetodo).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  return { totalVentas, numOrdenes, ticketProm, mejorHora, productoTop, metodoTop };
}

export async function getVentasPorDia(desde, hasta) {
  await delay();
  const desdeDate = new Date(desde);
  const hastaDate = new Date(hasta);
  const ordenes   = DB.ordenes.filter(o => {
    const d = new Date(o.createdAt);
    return d >= desdeDate && d <= hastaDate && o.status === 'PAID';
  });

  const porDia = {};
  ordenes.forEach(o => {
    const fecha = new Date(o.createdAt);
    const key   = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
    porDia[key] = (porDia[key] || 0) + o.total;
  });

  return Object.entries(porDia)
    .map(([fecha, total]) => ({ fecha, total }))
    .sort((a, b) => a.fecha.localeCompare(b.fecha));
}
