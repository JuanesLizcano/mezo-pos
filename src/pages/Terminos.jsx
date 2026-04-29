// Términos de Servicio — mezo
import { Link } from 'react-router-dom';

const S = {
  page:    { minHeight: '100vh', background: '#080706', color: '#D9CEB5', fontFamily: '"DM Sans", system-ui, sans-serif' },
  wrap:    { maxWidth: 760, margin: '0 auto', padding: '60px 24px 80px' },
  back:    { display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, color: '#7A6A58', textDecoration: 'none', marginBottom: 40, transition: 'color 0.2s' },
  logo:    { fontFamily: '"Fraunces", Georgia, serif', fontStyle: 'italic', fontSize: 28, color: '#C8903F', fontWeight: 700 },
  badge:   { display: 'inline-block', fontSize: 11, padding: '4px 12px', borderRadius: 20, background: 'rgba(200,144,63,0.12)', color: '#E4B878', border: '1px solid rgba(200,144,63,0.3)', marginTop: 12, marginBottom: 8 },
  title:   { fontFamily: '"Fraunces", Georgia, serif', fontSize: 'clamp(2rem, 5vw, 3rem)', color: '#F4ECD8', fontWeight: 700, lineHeight: 1.1, marginBottom: 8 },
  meta:    { fontSize: 13, color: '#7A6A58', marginBottom: 48 },
  divider: { border: 'none', borderTop: '1px solid #2A2520', margin: '40px 0' },
  h2:      { fontFamily: '"Fraunces", Georgia, serif', fontSize: 22, color: '#F4ECD8', fontWeight: 700, marginBottom: 12, marginTop: 0 },
  h3:      { fontSize: 15, color: '#E4B878', fontWeight: 600, marginBottom: 8, marginTop: 24 },
  p:       { fontSize: 15, color: '#A89880', lineHeight: 1.8, marginBottom: 16 },
  ul:      { paddingLeft: 20, color: '#A89880', fontSize: 15, lineHeight: 2 },
  contact: { marginTop: 40, padding: '24px 28px', borderRadius: 16, background: 'rgba(200,144,63,0.06)', border: '1px solid rgba(200,144,63,0.18)' },
  email:   { color: '#C8903F', textDecoration: 'none' },
};

export default function Terminos() {
  return (
    <div style={S.page}>
      <div style={S.wrap}>
        <Link to="/" style={S.back}
          onMouseEnter={e => e.currentTarget.style.color = '#C8903F'}
          onMouseLeave={e => e.currentTarget.style.color = '#7A6A58'}>
          ← Volver a mezo
        </Link>

        <div>
          <span style={S.logo}>mezo</span>
          <span style={S.badge}>Legal</span>
          <h1 style={S.title}>Términos de Servicio</h1>
          <p style={S.meta}>Última actualización: abril de 2026 · Vigencia: desde el registro hasta la cancelación</p>
        </div>

        <hr style={S.divider} />

        <section>
          <h2 style={S.h2}>1. Descripción del servicio</h2>
          <p style={S.p}>mezo es un software de punto de venta (POS) en la nube, ofrecido como servicio por suscripción (SaaS), diseñado para negocios gastronómicos en Colombia. El servicio incluye gestión de mesas, órdenes, métodos de pago, reportes de ventas, roles de empleados y funciones opcionales de inteligencia artificial.</p>
          <p style={S.p}>El acceso al servicio se realiza exclusivamente a través de navegadores web en dispositivos con conexión a internet. No se requiere instalación de software adicional.</p>
        </section>

        <hr style={S.divider} />

        <section>
          <h2 style={S.h2}>2. Condiciones de uso y cuenta</h2>
          <h3 style={S.h3}>2.1 Registro</h3>
          <p style={S.p}>Para usar mezo debes crear una cuenta con información verídica. Eres responsable de mantener la confidencialidad de tus credenciales y de todas las actividades realizadas bajo tu cuenta.</p>
          <h3 style={S.h3}>2.2 Uso aceptable</h3>
          <p style={S.p}>Aceptas usar el servicio únicamente para fines lícitos y comerciales legítimos. Está prohibido:</p>
          <ul style={S.ul}>
            <li>Intentar acceder a cuentas de otros usuarios</li>
            <li>Introducir virus, malware o cualquier código malicioso</li>
            <li>Realizar ingeniería inversa sobre la plataforma</li>
            <li>Usar el servicio para actividades ilegales o fraudulentas</li>
            <li>Revender o sublicenciar el acceso a terceros sin autorización escrita</li>
          </ul>
          <h3 style={S.h3}>2.3 Suspensión de cuenta</h3>
          <p style={S.p}>mezo se reserva el derecho de suspender o terminar cuentas que incumplan estos términos, sin previo aviso en casos de actividad fraudulenta o de alto riesgo.</p>
        </section>

        <hr style={S.divider} />

        <section>
          <h2 style={S.h2}>3. Planes, pagos y cancelación</h2>
          <h3 style={S.h3}>3.1 Planes disponibles</h3>
          <p style={S.p}>mezo ofrece los planes Semilla, Pro y Élite con diferentes funcionalidades y precios. Los precios vigentes se muestran en la página de precios y pueden cambiar con un aviso previo de 30 días.</p>
          <h3 style={S.h3}>3.2 Período de prueba</h3>
          <p style={S.p}>Todos los planes incluyen 30 días de prueba gratuita. Durante este período no se requiere tarjeta de crédito. Al finalizar, el plan se activa solo si el usuario lo confirma con un método de pago válido.</p>
          <h3 style={S.h3}>3.3 Facturación</h3>
          <p style={S.p}>Los pagos se procesan a través de Wompi, la pasarela de pagos de Bancolombia. Al suscribirte, autorizas el cobro recurrente del monto correspondiente al plan seleccionado, ya sea mensual o anual.</p>
          <h3 style={S.h3}>3.4 Cancelación y reembolsos</h3>
          <p style={S.p}>Puedes cancelar tu suscripción en cualquier momento desde el dashboard sin penalizaciones ni contratos. No hay reembolsos prorrateados por períodos no utilizados, salvo cuando la ley colombiana lo exija. El acceso se mantiene activo hasta el final del período pagado.</p>
        </section>

        <hr style={S.divider} />

        <section>
          <h2 style={S.h2}>4. Limitación de responsabilidad</h2>
          <p style={S.p}>mezo se provee "tal como está". No garantizamos disponibilidad ininterrumpida, aunque nos comprometemos a mantener un uptime superior al 99% mensual. En ningún caso mezo será responsable por:</p>
          <ul style={S.ul}>
            <li>Pérdidas de ingresos o ganancias derivadas de interrupciones del servicio</li>
            <li>Errores en datos ingresados por el usuario o sus empleados</li>
            <li>Daños indirectos, incidentales o consecuentes</li>
            <li>Fallas en la conexión a internet del usuario</li>
          </ul>
          <p style={S.p}>La responsabilidad máxima de mezo frente al usuario en cualquier circunstancia no superará el valor pagado por el servicio en los últimos 3 meses.</p>
        </section>

        <hr style={S.divider} />

        <section>
          <h2 style={S.h2}>5. Propiedad intelectual</h2>
          <p style={S.p}>Todo el software, diseño, logotipos, marcas y nombres comerciales de mezo son propiedad exclusiva de sus creadores y están protegidos por la legislación colombiana e internacional de propiedad intelectual.</p>
          <p style={S.p}>Los datos de ventas, productos y clientes ingresados por el usuario son propiedad del usuario. mezo solo los utiliza para prestar el servicio contratado.</p>
          <p style={S.p}>Al usar mezo no adquieres ningún derecho sobre el software, solo una licencia de uso limitada, no exclusiva e intransferible durante la vigencia de tu suscripción.</p>
        </section>

        <hr style={S.divider} />

        <section>
          <h2 style={S.h2}>6. Modificaciones al servicio</h2>
          <p style={S.p}>mezo puede modificar, agregar o eliminar funcionalidades en cualquier momento. Los cambios sustanciales serán comunicados con al menos 15 días de anticipación a través del email registrado en la cuenta.</p>
        </section>

        <hr style={S.divider} />

        <section>
          <h2 style={S.h2}>7. Ley aplicable y jurisdicción</h2>
          <p style={S.p}>Estos términos se rigen por las leyes de la <strong style={{ color: '#F4ECD8' }}>República de Colombia</strong>. Cualquier controversia que no pueda resolverse amigablemente será sometida a la jurisdicción de los jueces competentes de <strong style={{ color: '#F4ECD8' }}>Bogotá D.C.</strong>, renunciando las partes a cualquier otro fuero que pudiera corresponderles.</p>
        </section>

        <hr style={S.divider} />

        <div style={S.contact}>
          <p style={{ ...S.p, marginBottom: 4, color: '#F4ECD8', fontWeight: 600 }}>¿Tienes preguntas sobre estos términos?</p>
          <p style={{ ...S.p, marginBottom: 0 }}>
            Escríbenos a{' '}
            <a href="mailto:soporte@mezo.co" style={S.email}>soporte@mezo.co</a>
            {' '}y te respondemos en español colombiano.
          </p>
        </div>
      </div>
    </div>
  );
}
