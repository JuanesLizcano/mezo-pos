const copFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

export function formatCOP(amount) {
  return copFormatter.format(amount);
}

// Normaliza texto para búsquedas sin distinción de tildes ni mayúsculas.
// NFD descompone "é" en "e" + acento; luego el replace elimina los acentos.
// Ejemplo: "Café" → "cafe", "Maracuyá" → "maracuya"
export function normalizeText(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}
