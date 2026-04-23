// Servicio para analizar ventas con Claude AI.
// PRODUCCIÓN: esta llamada falla en prod por CORS. Reemplazar con una
// Cloud Function o endpoint Express que actúe de proxy.
// Configura REACT_APP_ANTHROPIC_API_KEY en tu .env para activar en dev.
export async function analizarVentas(resumen) {
  const apiKey = process.env.REACT_APP_ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('API_KEY_MISSING');

  const prompt = `Eres un asesor de negocios especializado en restaurantes y cafeterías colombianas.
Analiza estos datos reales de ventas y da exactamente 3 recomendaciones específicas y accionables.
Menciona cifras concretas cuando las tengas. Escribe en español, tono profesional pero cercano.

DATOS DE VENTAS:
${JSON.stringify(resumen, null, 2)}

Responde con este formato exacto (sin markdown extra):
1. [Título corto] — [Explicación de 1-2 oraciones con datos concretos]
2. [Título corto] — [Explicación de 1-2 oraciones con datos concretos]
3. [Título corto] — [Explicación de 1-2 oraciones con datos concretos]`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type':      'application/json',
      'x-api-key':         apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model:      'claude-opus-4-7',
      max_tokens: 800,
      messages:   [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.error?.message || `Error ${res.status}`);
  }

  const data = await res.json();
  const texto = data?.content?.[0]?.text;
  if (!texto) throw new Error('Respuesta vacía de Claude');
  return texto;
}
