// Servicio de emails transaccionales con Resend.
// En modo mock (REACT_APP_USE_MOCK=true) solo loguea en consola.
// En producción usa REACT_APP_RESEND_API_KEY y envía desde noreply@mezoapp.co.

import { Resend } from 'resend';

const IS_MOCK = process.env.REACT_APP_USE_MOCK === 'true';
const FROM    = 'mezo <noreply@mezoapp.co>';

function getResend() {
  const key = process.env.REACT_APP_RESEND_API_KEY;
  if (!key) throw new Error('REACT_APP_RESEND_API_KEY no está configurada');
  return new Resend(key);
}

function formatCOP(n) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);
}

// ─── Plantillas HTML ─────────────────────────────────────────────────────────

function wrapHtml(contenido) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body { margin:0; padding:0; background:#F5F3EE; font-family:'Helvetica Neue',Arial,sans-serif; }
    .wrap { max-width:580px; margin:32px auto; background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 2px 12px rgba(0,0,0,.08); }
    .header { background:#1C1C1E; padding:28px 32px; }
    .header h1 { margin:0; color:#E8C97D; font-size:22px; letter-spacing:-.5px; }
    .header p  { margin:4px 0 0; color:#A0A0A0; font-size:13px; }
    .body { padding:28px 32px; }
    .body p { color:#3A3A3C; font-size:15px; line-height:1.6; margin:0 0 16px; }
    .kpi-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin:20px 0; }
    .kpi { background:#F5F3EE; border-radius:8px; padding:16px; }
    .kpi .label { font-size:11px; color:#888; text-transform:uppercase; letter-spacing:.5px; }
    .kpi .value { font-size:22px; font-weight:700; color:#1C1C1E; margin-top:4px; }
    .btn { display:inline-block; background:#1C1C1E; color:#E8C97D!important; text-decoration:none; padding:12px 24px; border-radius:8px; font-size:14px; font-weight:600; margin:8px 0; }
    .footer { background:#F5F3EE; padding:20px 32px; text-align:center; }
    .footer p { margin:0; font-size:12px; color:#888; }
    table.data { width:100%; border-collapse:collapse; margin:16px 0; }
    table.data th { background:#F5F3EE; text-align:left; font-size:12px; color:#666; padding:8px 10px; }
    table.data td { padding:10px; font-size:14px; color:#3A3A3C; border-bottom:1px solid #F0EDE8; }
    .badge { display:inline-block; border-radius:20px; padding:2px 10px; font-size:12px; font-weight:600; }
    .verde  { background:#3DAA6818; color:#3DAA68; }
    .ambar  { background:#D9A43718; color:#D9A437; }
    .rojo   { background:#C8573F18; color:#C8573F; }
  </style>
</head>
<body>
  <div class="wrap">
    ${contenido}
    <div class="footer">
      <p>© ${new Date().getFullYear()} mezo — POS inteligente para restaurantes colombianos</p>
      <p style="margin-top:6px;"><a href="https://mezoapp.co" style="color:#888;">mezoapp.co</a></p>
    </div>
  </div>
</body>
</html>`;
}

function htmlBienvenida(negocio) {
  return wrapHtml(`
    <div class="header">
      <h1>¡Bienvenido a mezo!</h1>
      <p>Tu cuenta está lista para comenzar</p>
    </div>
    <div class="body">
      <p>Hola, estamos muy contentos de tenerte. <strong>${negocio.name ?? 'Tu negocio'}</strong> ya está configurado en mezo y listo para recibir sus primeras ventas.</p>
      <p>Esto es lo que ya tienes disponible:</p>
      <ul style="color:#3A3A3C;font-size:15px;line-height:2;">
        <li>POS completo con mesas y mostrador</li>
        <li>Control de caja (arqueo de turno)</li>
        <li>Reportes de ventas y food cost</li>
        <li>Pantalla de cocina en tiempo real</li>
        <li>Programa de lealtad para clientes frecuentes</li>
      </ul>
      <p>Empieza por agregar tus productos y asignar roles a tu equipo.</p>
      <a href="https://app.mezoapp.co" class="btn">Ir al panel →</a>
      <p style="margin-top:24px;font-size:13px;color:#888;">¿Tienes dudas? Escríbenos a soporte@mezoapp.co o por WhatsApp y te ayudamos en minutos.</p>
    </div>
  `);
}

function htmlReporteDiario(negocio, reporte) {
  const { total = 0, numOrdenes = 0, ticketPromedio = 0, productoTop, productoTopCantidad, mejorHora } = reporte;
  const fecha = new Intl.DateTimeFormat('es-CO', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());

  const margenColor = total > 0 && reporte.costoTotal != null
    ? (((total - reporte.costoTotal) / total) * 100 >= 65 ? 'verde' : ((total - reporte.costoTotal) / total) * 100 >= 45 ? 'ambar' : 'rojo')
    : null;

  return wrapHtml(`
    <div class="header">
      <h1>Reporte del día</h1>
      <p>${fecha} — ${negocio.name ?? ''}</p>
    </div>
    <div class="body">
      <p>Aquí está el resumen de ventas de hoy para <strong>${negocio.name ?? 'tu negocio'}</strong>:</p>
      <div class="kpi-grid">
        <div class="kpi">
          <div class="label">Total ventas</div>
          <div class="value">${formatCOP(total)}</div>
        </div>
        <div class="kpi">
          <div class="label">Órdenes</div>
          <div class="value">${numOrdenes}</div>
        </div>
        <div class="kpi">
          <div class="label">Ticket promedio</div>
          <div class="value">${formatCOP(ticketPromedio)}</div>
        </div>
        <div class="kpi">
          <div class="label">Hora pico</div>
          <div class="value" style="font-size:16px;">${mejorHora ?? '—'}</div>
        </div>
      </div>
      ${productoTop ? `<p>El producto estrella de hoy fue <strong>${productoTop}</strong> con ${productoTopCantidad} unidades vendidas.</p>` : ''}
      ${margenColor ? `<p>Margen del día: <span class="badge ${margenColor}">${Math.round(((total - reporte.costoTotal) / total) * 100)}%</span></p>` : ''}
      <a href="https://app.mezoapp.co/reportes" class="btn">Ver reporte completo →</a>
    </div>
  `);
}

function htmlInvitacionEmpleado(empleado, negocio) {
  const rolLabel = {
    admin:   'Administrador',
    cajero:  'Cajero',
    mesero:  'Mesero',
    cocina:  'Cocina',
    ADMIN:   'Administrador',
    CASHIER: 'Cajero',
    WAITER:  'Mesero',
    KITCHEN: 'Cocina',
  };
  const roles = (empleado.roles ?? []).map(r => rolLabel[r] ?? r).join(', ');

  return wrapHtml(`
    <div class="header">
      <h1>Te invitaron a mezo</h1>
      <p>${negocio.name ?? 'Un negocio'} te está esperando</p>
    </div>
    <div class="body">
      <p>Hola <strong>${empleado.nombre ?? 'nuevo colaborador'}</strong>,</p>
      <p><strong>${negocio.name ?? 'Tu equipo'}</strong> te ha agregado como <strong>${roles}</strong> en mezo, su sistema de punto de venta.</p>
      <p>Con tu cuenta podrás:</p>
      <ul style="color:#3A3A3C;font-size:15px;line-height:2;">
        ${(empleado.roles ?? []).some(r => ['admin','ADMIN'].includes(r)) ? '<li>Gestionar productos, mesas y empleados</li>' : ''}
        ${(empleado.roles ?? []).some(r => ['cajero','CASHIER','admin','ADMIN'].includes(r)) ? '<li>Procesar ventas y cuadrar caja</li>' : ''}
        ${(empleado.roles ?? []).some(r => ['mesero','WAITER','admin','ADMIN'].includes(r)) ? '<li>Tomar órdenes en mesa</li>' : ''}
        ${(empleado.roles ?? []).some(r => ['cocina','KITCHEN','admin','ADMIN'].includes(r)) ? '<li>Ver pedidos en la pantalla de cocina</li>' : ''}
      </ul>
      <p>Usa tu PIN <strong style="font-family:monospace;background:#F5F3EE;padding:2px 8px;border-radius:4px;">${empleado.pin ?? '****'}</strong> para ingresar en el dispositivo del local.</p>
      <a href="https://app.mezoapp.co/login" class="btn">Ingresar a mezo →</a>
      <p style="margin-top:24px;font-size:13px;color:#888;">¿No reconoces este negocio? Ignora este correo.</p>
    </div>
  `);
}

// ─── Funciones exportadas ────────────────────────────────────────────────────

export async function emailBienvenida(negocio, email) {
  if (IS_MOCK) {
    console.log('[emails] emailBienvenida →', email, negocio);
    return { id: 'mock-email-bienvenida' };
  }
  const resend = getResend();
  return resend.emails.send({
    from:    FROM,
    to:      [email],
    subject: `¡Bienvenido a mezo, ${negocio.name ?? ''}! 🎉`,
    html:    htmlBienvenida(negocio),
  });
}

export async function emailReporteDiario(negocio, reporte, email) {
  if (IS_MOCK) {
    console.log('[emails] emailReporteDiario →', email, reporte);
    return { id: 'mock-email-reporte' };
  }
  const resend = getResend();
  const fecha = new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'long' }).format(new Date());
  return resend.emails.send({
    from:    FROM,
    to:      [email],
    subject: `Reporte del día — ${negocio.name ?? ''} (${fecha})`,
    html:    htmlReporteDiario(negocio, reporte),
  });
}

export async function emailInvitacionEmpleado(empleado, negocio) {
  if (!empleado.correo) throw new Error('El empleado no tiene correo configurado');
  if (IS_MOCK) {
    console.log('[emails] emailInvitacionEmpleado →', empleado.correo, empleado, negocio);
    return { id: 'mock-email-invitacion' };
  }
  const resend = getResend();
  return resend.emails.send({
    from:    FROM,
    to:      [empleado.correo],
    subject: `${negocio.name ?? 'Tu equipo'} te invita a mezo`,
    html:    htmlInvitacionEmpleado(empleado, negocio),
  });
}
