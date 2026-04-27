import { createContext, useContext, useState, useCallback } from 'react';

const DIA_KEY      = 'mezo_dia_estado';
const HISTORICO_KEY = 'mezo_arqueo_historico';

function cargarEstado() {
  try {
    const raw = localStorage.getItem(DIA_KEY);
    if (!raw) return { diaAbierto: false, abiertaAt: null };
    return JSON.parse(raw);
  } catch {
    return { diaAbierto: false, abiertaAt: null };
  }
}

const DiaContext = createContext(null);

export function DiaProvider({ children }) {
  const [estado, setEstado] = useState(cargarEstado);

  // Marca el día como abierto y guarda el timestamp
  const abrirDia = useCallback(() => {
    const nuevo = { diaAbierto: true, abiertaAt: new Date().toISOString() };
    setEstado(nuevo);
    localStorage.setItem(DIA_KEY, JSON.stringify(nuevo));
  }, []);

  // Cierra el día; si se pasan datosArqueo los guarda en el histórico
  const cerrarDia = useCallback((datosArqueo = null) => {
    if (datosArqueo) {
      try {
        const prev = JSON.parse(localStorage.getItem(HISTORICO_KEY) ?? '[]');
        prev.push(datosArqueo);
        localStorage.setItem(HISTORICO_KEY, JSON.stringify(prev));
      } catch { /* localStorage lleno — no es crítico */ }
    }
    const nuevo = { diaAbierto: false, abiertaAt: null };
    setEstado(nuevo);
    localStorage.setItem(DIA_KEY, JSON.stringify(nuevo));
  }, []);

  return (
    <DiaContext.Provider value={{ ...estado, abrirDia, cerrarDia }}>
      {children}
    </DiaContext.Provider>
  );
}

export function useDia() {
  const ctx = useContext(DiaContext);
  if (!ctx) throw new Error('useDia debe usarse dentro de DiaProvider');
  return ctx;
}
