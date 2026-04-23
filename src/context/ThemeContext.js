import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const ThemeContext = createContext(null);

// Oscurece un color hex en un porcentaje dado (para derivar gold-deep)
function darken(hex, amount = 0.15) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r   = Math.max(0, (num >> 16) - Math.round(255 * amount));
  const g   = Math.max(0, ((num >> 8) & 0xff) - Math.round(255 * amount));
  const b   = Math.max(0, (num & 0xff) - Math.round(255 * amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

// Aclara un color hex en un porcentaje dado (para derivar gold-soft)
function lighten(hex, amount = 0.2) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r   = Math.min(255, (num >> 16) + Math.round(255 * amount));
  const g   = Math.min(255, ((num >> 8) & 0xff) + Math.round(255 * amount));
  const b   = Math.min(255, (num & 0xff) + Math.round(255 * amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

export function ThemeProvider({ children }) {
  const { user, negocio }             = useAuth();
  const [modoOscuro, setModoOscuro]   = useState(true);
  const [colorPrimario, _setColor]    = useState('#C8903F');

  // Cargar preferencia de tema desde localStorage al montar
  useEffect(() => {
    if (!user) return;
    const guardado = localStorage.getItem(`mezo_tema_${user.uid}`);
    if (guardado !== null) setModoOscuro(guardado === 'oscuro');
  }, [user]);

  // Cargar color del negocio desde Firestore cuando cambia negocio
  useEffect(() => {
    if (negocio?.colorPrimario) aplicarColor(negocio.colorPrimario);
  }, [negocio]);

  // Aplicar el tema al <html> cada vez que cambia modoOscuro
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', modoOscuro ? 'oscuro' : 'claro');
  }, [modoOscuro]);

  function toggleModo() {
    const nuevo = !modoOscuro;
    setModoOscuro(nuevo);
    if (user) localStorage.setItem(`mezo_tema_${user.uid}`, nuevo ? 'oscuro' : 'claro');
  }

  function aplicarColor(hex) {
    _setColor(hex);
    const root = document.documentElement;
    root.style.setProperty('--mezo-gold',      hex);
    root.style.setProperty('--mezo-gold-deep',  darken(hex, 0.15));
    root.style.setProperty('--mezo-gold-soft',  lighten(hex, 0.2));
  }

  function setColorPrimario(hex) {
    aplicarColor(hex);
  }

  return (
    <ThemeContext.Provider value={{ modoOscuro, toggleModo, colorPrimario, setColorPrimario }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
