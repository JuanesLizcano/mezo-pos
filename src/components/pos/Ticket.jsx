import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Tamaño de recibo térmico: 80mm de ancho ≈ 226pt
const ANCHO_RECIBO = 226;

const S = StyleSheet.create({
  page:        { width: ANCHO_RECIBO, backgroundColor: '#fff', padding: '12pt 14pt', fontFamily: 'Helvetica' },
  centro:      { textAlign: 'center' },
  header:      { marginBottom: 8, borderBottom: '1pt solid #ddd', paddingBottom: 8 },
  logoTxt:     { fontSize: 18, fontFamily: 'Helvetica-Bold', textAlign: 'center', letterSpacing: 2 },
  negocio:     { fontSize: 12, fontFamily: 'Helvetica-Bold', textAlign: 'center', marginTop: 2 },
  subtitulo:   { fontSize: 9, color: '#888', textAlign: 'center', marginTop: 1 },
  fiscal:      { fontSize: 8, color: '#666', textAlign: 'center', marginTop: 1 },
  separador:   { borderBottom: '1pt dashed #ccc', marginVertical: 6 },
  fila:        { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  labelTxt:    { fontSize: 9, color: '#444' },
  valorTxt:    { fontSize: 9, color: '#222' },
  itemNombre:  { fontSize: 9, flex: 1, color: '#222' },
  itemQty:     { fontSize: 9, color: '#888', width: 22, textAlign: 'center' },
  itemPrecio:  { fontSize: 9, color: '#222', width: 50, textAlign: 'right' },
  totalFila:   { flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 },
  totalLabel:  { fontSize: 11, fontFamily: 'Helvetica-Bold' },
  totalValor:  { fontSize: 11, fontFamily: 'Helvetica-Bold' },
  footer:      { marginTop: 10, textAlign: 'center' },
  footerTxt:   { fontSize: 8, color: '#aaa', textAlign: 'center' },
  ivaNote:     { fontSize: 8, color: '#aaa', marginTop: 3 },
  regimen:     { fontSize: 8, color: '#666', textAlign: 'center', marginTop: 2 },
  numFactura:  { fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#333', textAlign: 'center', marginTop: 2 },
});

function formatCOPPDF(n) {
  return `$${new Intl.NumberFormat('es-CO').format(Math.round(n))}`;
}

export default function TicketPDF({ orden, negocio }) {
  const {
    id, lineas = [], subtotal = 0, propina = null,
    total = 0, metodo, recibido, cambio, cajero, fecha, numFactura, cliente,
  } = orden;

  const fechaStr = fecha
    ? fecha.toLocaleString('es-CO', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : '';

  const ordenNum     = id?.slice(-6).toUpperCase() ?? '------';
  const facturaNum   = numFactura ? `FAC-${String(numFactura).padStart(6, '0')}` : `#${ordenNum}`;

  const metodoLabels = {
    efectivo: 'Efectivo', datafono: 'Datáfono', nequi: 'Nequi',
    daviplata: 'Daviplata', transferencia: 'Transferencia',
  };

  // Usar campos del backend; todos los campos de contacto son opcionales
  const razonSocial  = negocio?.razonSocial || negocio?.name;
  const nit          = negocio?.nit;
  const email        = negocio?.email;
  const telefono     = negocio?.telefono || negocio?.phone;
  const direccion    = negocio?.direccionFiscal || negocio?.address;
  const regimen      = negocio?.regimenTributario;

  return (
    <Document>
      <Page size={{ width: ANCHO_RECIBO, height: 'auto' }} style={S.page} wrap={false}>

        {/* Encabezado del negocio */}
        <View style={S.header}>
          <Text style={S.logoTxt}>{razonSocial ?? 'mezo'}</Text>
          {nit          && <Text style={S.fiscal}>NIT: {nit}</Text>}
          {email        && <Text style={S.subtitulo}>{email}</Text>}
          {telefono     && <Text style={S.subtitulo}>Tel: {telefono}</Text>}
          {direccion    && <Text style={S.subtitulo}>{direccion}</Text>}
          {negocio?.city && !direccion && <Text style={S.subtitulo}>{negocio.city}</Text>}
          {regimen      && <Text style={S.regimen}>Régimen {regimen}</Text>}
          {negocio?.openingTime && <Text style={S.subtitulo}>{negocio.openingTime} – {negocio.closingTime}</Text>}
          <Text style={S.numFactura}>{facturaNum}</Text>
        </View>

        {/* Info de orden */}
        <View style={S.fila}>
          <Text style={S.labelTxt}>Fecha</Text>
          <Text style={S.valorTxt}>{fechaStr}</Text>
        </View>
        {cajero && (
          <View style={S.fila}>
            <Text style={S.labelTxt}>Cajero</Text>
            <Text style={S.valorTxt}>{cajero}</Text>
          </View>
        )}

        {/* Datos del cliente para factura */}
        {cliente && (
          <>
            <View style={S.separador} />
            <Text style={{ ...S.labelTxt, fontFamily: 'Helvetica-Bold', marginBottom: 3 }}>Facturado a:</Text>
            {cliente.nombre     && <Text style={S.valorTxt}>{cliente.nombre}</Text>}
            {cliente.tributario && <Text style={S.valorTxt}>NIT/No. trib.: {cliente.tributario}</Text>}
            {cliente.telefono   && <Text style={S.valorTxt}>Tel: {cliente.telefono}</Text>}
            {cliente.email      && <Text style={S.valorTxt}>{cliente.email}</Text>}
            {cliente.comentario && <Text style={{ ...S.valorTxt, color: '#888' }}>{cliente.comentario}</Text>}
          </>
        )}

        <View style={S.separador} />

        {/* Ítems */}
        {lineas.map((l, i) => (
          <View key={i} style={S.fila}>
            <Text style={S.itemQty}>{l.quantity}×</Text>
            <Text style={S.itemNombre}>{l.name}</Text>
            <Text style={S.itemPrecio}>{formatCOPPDF(l.subtotal)}</Text>
          </View>
        ))}

        <View style={S.separador} />

        {/* Subtotal solo visible cuando hay propina (si no, subtotal = total) */}
        {propina?.monto > 0 && (
          <View style={S.fila}>
            <Text style={S.labelTxt}>Subtotal</Text>
            <Text style={S.valorTxt}>{formatCOPPDF(subtotal)}</Text>
          </View>
        )}

        {/* Propina */}
        {propina?.monto > 0 && (
          <View style={S.fila}>
            <Text style={S.labelTxt}>Propina ({propina.porcentaje}%)</Text>
            <Text style={S.valorTxt}>{formatCOPPDF(propina.monto)}</Text>
          </View>
        )}

        {/* Total */}
        <View style={{ ...S.totalFila, marginTop: 6, borderTop: '1pt solid #ddd', paddingTop: 6 }}>
          <Text style={S.totalLabel}>TOTAL</Text>
          <Text style={S.totalValor}>{formatCOPPDF(total)}</Text>
        </View>

        <View style={S.separador} />

        {/* Método de pago */}
        <View style={S.fila}>
          <Text style={S.labelTxt}>Método de pago</Text>
          <Text style={S.valorTxt}>{metodoLabels[metodo] ?? metodo}</Text>
        </View>
        {metodo === 'efectivo' && recibido > 0 && (
          <View style={S.fila}>
            <Text style={S.labelTxt}>Recibido</Text>
            <Text style={S.valorTxt}>{formatCOPPDF(recibido)}</Text>
          </View>
        )}
        {metodo === 'efectivo' && cambio > 0 && (
          <View style={S.fila}>
            <Text style={S.labelTxt}>Cambio</Text>
            <Text style={S.valorTxt}>{formatCOPPDF(cambio)}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={S.footer}>
          <Text style={S.footerTxt}>Precios incluyen IVA · Gracias por su visita</Text>
          <Text style={S.footerTxt}>Powered by mezo.app</Text>
        </View>
      </Page>
    </Document>
  );
}
