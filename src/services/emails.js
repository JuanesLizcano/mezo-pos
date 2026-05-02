// Servicio de emails transaccionales.
// En modo mock (REACT_APP_USE_MOCK=true) solo loguea en consola.
// En producción delega al backend de Manuel via API REST.

const IS_MOCK   = process.env.REACT_APP_USE_MOCK === 'true';
const BASE_URL  = process.env.REACT_APP_API_URL || 'http://localhost:8080';
const TOKEN_KEY = 'mezo_token';

function getToken() { return localStorage.getItem(TOKEN_KEY); }

async function emailRequest(endpoint, body) {
  const res = await fetch(`${BASE_URL}/api/v1/email/${endpoint}`, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${getToken()}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Error enviando email (${endpoint}): ${res.status}`);
  return res.json().catch(() => ({ ok: true }));
}

export async function emailBienvenida(negocio, email) {
  if (IS_MOCK) {
    console.log('[emails] emailBienvenida →', email, negocio);
    return { id: 'mock-email-bienvenida' };
  }
  return emailRequest('welcome', { negocio, email });
}

export async function emailReporteDiario(negocio, reporte, email) {
  if (IS_MOCK) {
    console.log('[emails] emailReporteDiario →', email, reporte);
    return { id: 'mock-email-reporte' };
  }
  return emailRequest('daily-report', { negocio, reporte, email });
}

export async function emailInvitacionEmpleado(empleado, negocio) {
  if (!empleado.correo) throw new Error('El empleado no tiene correo configurado');
  if (IS_MOCK) {
    console.log('[emails] emailInvitacionEmpleado →', empleado.correo, empleado, negocio);
    return { id: 'mock-email-invitacion' };
  }
  return emailRequest('invite', { empleado, negocio });
}
