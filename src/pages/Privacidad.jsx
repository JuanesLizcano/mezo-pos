// Política de Privacidad — mezo · Ley 1581/2012
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
  arco:    { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 16 },
  arcoCard:{ padding: '16px 18px', borderRadius: 12, background: '#141210', border: '1px solid #2A2520' },
  arcoT:   { fontSize: 13, color: '#E4B878', fontWeight: 700, marginBottom: 4 },
  arcoD:   { fontSize: 13, color: '#7A6A58', lineHeight: 1.6 },
};

export default function Privacidad() {
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
          <span style={S.badge}>Privacidad · Ley 1581/2012</span>
          <h1 style={S.title}>Política de Privacidad</h1>
          <p style={S.meta}>Última actualización: abril de 2026 · República de Colombia</p>
        </div>

        <hr style={S.divider} />

        <section>
          <h2 style={S.h2}>1. Responsable del tratamiento</h2>
          <p style={S.p}>El responsable del tratamiento de datos personales es <strong style={{ color: '#F4ECD8' }}>mezo</strong>, plataforma SaaS de punto de venta para negocios gastronómicos en Colombia, operada por Juanes Lizcano.</p>
          <p style={S.p}>Contacto del responsable: <a href="mailto:hola@mezo.co" style={S.email}>hola@mezo.co</a></p>
        </section>

        <hr style={S.divider} />

        <section>
          <h2 style={S.h2}>2. Datos que recopilamos</h2>
          <h3 style={S.h3}>2.1 Datos del titular de la cuenta</h3>
          <ul style={S.ul}>
            <li>Nombre completo</li>
            <li>Correo electrónico</li>
            <li>Nombre y ciudad del negocio</li>
            <li>Tipo de negocio gastronómico</li>
            <li>Número de mesas</li>
          </ul>
          <h3 style={S.h3}>2.2 Datos de uso del servicio</h3>
          <ul style={S.ul}>
            <li>Órdenes, productos y ventas registradas en el sistema</li>
            <li>Empleados y roles configurados</li>
            <li>Métodos de pago utilizados</li>
            <li>Registros de acceso (IP, dispositivo, fecha y hora)</li>
          </ul>
          <h3 style={S.h3}>2.3 Datos de pago</h3>
          <p style={S.p}>Los datos de tarjetas o cuentas bancarias son procesados directamente por <strong style={{ color: '#F4ECD8' }}>Wompi (Bancolombia)</strong>. mezo no almacena información de tarjetas de crédito ni cuentas bancarias.</p>
        </section>

        <hr style={S.divider} />

        <section>
          <h2 style={S.h2}>3. Finalidad del tratamiento</h2>
          <p style={S.p}>Tratamos tus datos únicamente para:</p>
          <ul style={S.ul}>
            <li>Prestar el servicio de punto de venta contratado</li>
            <li>Gestionar tu suscripción y facturación</li>
            <li>Enviarte comunicaciones sobre el servicio (actualizaciones, nuevas funciones)</li>
            <li>Mejorar la plataforma mediante análisis de uso agregado y anonimizado</li>
            <li>Cumplir obligaciones legales aplicables en Colombia</li>
          </ul>
          <p style={S.p}>No compartimos tus datos con terceros para fines publicitarios ni los vendemos a ninguna empresa.</p>
        </section>

        <hr style={S.divider} />

        <section>
          <h2 style={S.h2}>4. Derechos ARCO</h2>
          <p style={S.p}>Como titular de tus datos personales, tienes los siguientes derechos de acuerdo con la Ley 1581 de 2012:</p>
          <div style={S.arco}>
            {[
              { letra: 'A', titulo: 'Acceso', desc: 'Consultar qué datos tenemos sobre ti en cualquier momento.' },
              { letra: 'R', titulo: 'Rectificación', desc: 'Corregir datos inexactos o incompletos.' },
              { letra: 'C', titulo: 'Cancelación', desc: 'Solicitar la eliminación de tus datos cuando ya no sean necesarios.' },
              { letra: 'O', titulo: 'Oposición', desc: 'Oponerte al tratamiento de tus datos para ciertos fines.' },
            ].map(d => (
              <div key={d.letra} style={S.arcoCard}>
                <p style={{ ...S.arcoT, fontSize: 20, marginBottom: 2 }}>{d.letra}</p>
                <p style={{ ...S.arcoT }}>{d.titulo}</p>
                <p style={S.arcoD}>{d.desc}</p>
              </div>
            ))}
          </div>
          <p style={S.p}>Para ejercer cualquiera de estos derechos, escríbenos a <a href="mailto:hola@mezo.co" style={S.email}>hola@mezo.co</a>. Respondemos en un máximo de 15 días hábiles.</p>
        </section>

        <hr style={S.divider} />

        <section>
          <h2 style={S.h2}>5. Datos de los clientes del negocio</h2>
          <p style={S.p}>mezo puede almacenar información sobre los clientes del negocio (por ejemplo, nombre en una reserva o historial de pedidos para el bot de WhatsApp). En este caso, <strong style={{ color: '#F4ECD8' }}>el negocio es el responsable del tratamiento</strong> de los datos de sus propios clientes, y mezo actúa como encargado del tratamiento.</p>
          <p style={S.p}>El negocio es responsable de obtener el consentimiento informado de sus clientes para el tratamiento de sus datos de acuerdo con la Ley 1581 de 2012.</p>
        </section>

        <hr style={S.divider} />

        <section>
          <h2 style={S.h2}>6. Cookies y analíticas</h2>
          <p style={S.p}>mezo utiliza <strong style={{ color: '#F4ECD8' }}>PostHog</strong> para analizar el comportamiento de uso de la plataforma. Los datos recopilados son anonimizados y se usan exclusivamente para mejorar la experiencia del usuario. PostHog no vende datos a terceros.</p>
          <p style={S.p}>Utilizamos cookies de sesión estrictamente necesarias para el funcionamiento del servicio (autenticación). No usamos cookies de seguimiento publicitario de terceros.</p>
        </section>

        <hr style={S.divider} />

        <section>
          <h2 style={S.h2}>7. Transferencia de datos a terceros</h2>
          <p style={S.p}>Para prestar el servicio, compartimos datos únicamente con los siguientes proveedores, bajo estrictas condiciones de confidencialidad:</p>
          <ul style={S.ul}>
            <li><strong style={{ color: '#F4ECD8' }}>Amazon Web Services (AWS)</strong> — infraestructura de servidores y base de datos (región us-east-1)</li>
            <li><strong style={{ color: '#F4ECD8' }}>Wompi / Bancolombia</strong> — procesamiento de pagos</li>
            <li><strong style={{ color: '#F4ECD8' }}>PostHog</strong> — analíticas de uso anonimizadas</li>
            <li><strong style={{ color: '#F4ECD8' }}>Firebase / Google</strong> — autenticación de usuarios</li>
          </ul>
          <p style={S.p}>Ninguno de estos proveedores tiene autorización para usar tus datos con fines distintos a los necesarios para prestar el servicio contratado.</p>
        </section>

        <hr style={S.divider} />

        <section>
          <h2 style={S.h2}>8. Seguridad y retención de datos</h2>
          <p style={S.p}>Implementamos medidas técnicas y organizativas para proteger tus datos: conexiones HTTPS, bases de datos con acceso restringido, autenticación segura y copias de seguridad automáticas.</p>
          <p style={S.p}>Tus datos se conservan mientras tu cuenta esté activa. Al cancelar la suscripción, tienes 30 días para exportar tu información. Pasado ese plazo, los datos son eliminados de forma permanente de nuestros servidores.</p>
        </section>

        <hr style={S.divider} />

        <section>
          <h2 style={S.h2}>9. Ley aplicable</h2>
          <p style={S.p}>Esta política se rige por la <strong style={{ color: '#F4ECD8' }}>Ley 1581 de 2012</strong> (Habeas Data), el <strong style={{ color: '#F4ECD8' }}>Decreto 1377 de 2013</strong> y demás normas complementarias de la República de Colombia. En caso de controversia, el titular puede elevar una queja ante la <strong style={{ color: '#F4ECD8' }}>Superintendencia de Industria y Comercio (SIC)</strong>.</p>
        </section>

        <hr style={S.divider} />

        <div style={S.contact}>
          <p style={{ ...S.p, marginBottom: 4, color: '#F4ECD8', fontWeight: 600 }}>Contacto del responsable de datos</p>
          <p style={{ ...S.p, marginBottom: 0 }}>
            Para consultas, ejercicio de derechos ARCO o solicitudes de eliminación de datos, escríbenos a{' '}
            <a href="mailto:hola@mezo.co" style={S.email}>hola@mezo.co</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
