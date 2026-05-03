import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { login as apiLogin, getNegocio } from '../services';

const AuthContext = createContext(null);

const TOKEN_KEY     = 'mezo_token';
const REFRESH_KEY   = 'mezo_refresh_token';
const INACTIVIDAD_MS = 8 * 60 * 60 * 1000; // 8 horas
const EVENTOS       = ['mousemove', 'keydown', 'click', 'touchstart', 'scroll'];

function parseJwtPayload(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

function tokenExpirado(token) {
  const payload = parseJwtPayload(token);
  if (!payload?.exp) return true;
  return payload.exp * 1000 < Date.now();
}

export function AuthProvider({ children }) {
  const [user,        setUser]        = useState(null);
  const [negocio,     setNegocio]     = useState(null);
  const [loading,     setLoading]     = useState(true);
  // Versión de datos: al incrementar, todos los hooks de datos refetchean
  const [dataVersion, setDataVersion] = useState(0);
  const timeoutRef = useRef(null);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    setUser(null);
    setNegocio(null);
    // Diferir para no navegar durante fase de render (inactividad timer puede llamar esto desde render)
    setTimeout(() => { window.location.href = '/'; }, 0);
  }, []);

  const bumpVersion = useCallback(() => setDataVersion(v => v + 1), []);

  // ── Inactividad ───────────────────────────────────────────────────────────

  const resetInactividad = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (localStorage.getItem(TOKEN_KEY)) {
      timeoutRef.current = setTimeout(logout, INACTIVIDAD_MS);
    }
  }, [logout]);

  useEffect(() => {
    EVENTOS.forEach(e => window.addEventListener(e, resetInactividad, { passive: true }));
    resetInactividad();
    return () => {
      EVENTOS.forEach(e => window.removeEventListener(e, resetInactividad));
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [resetInactividad]);

  // ── Inicializar sesión desde localStorage ─────────────────────────────────

  useEffect(() => {
    async function initSession() {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token || tokenExpirado(token)) {
        localStorage.removeItem(TOKEN_KEY);
        setLoading(false);
        return;
      }
      // Reconstruir el user desde el payload del accessToken (campos del backend)
      const payload = parseJwtPayload(token);
      setUser({
        id:            payload.sub ?? payload.uid,
        email:         payload.email,
        role:          payload.role ?? null,
        planType:      payload.planType ?? null,
        planExpiresAt: payload.planExpiresAt ?? null,
      });
      try {
        const neg = await getNegocio();
        setNegocio(neg);
      } catch {
        setNegocio(null);
      } finally {
        setLoading(false);
      }
    }
    initSession();
  }, []);

  // ── Funciones públicas ────────────────────────────────────────────────────

  async function login(email, password) {
    // El backend devuelve { accessToken, refreshToken, user }
    const { accessToken, refreshToken, user: u } = await apiLogin(email, password);
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_KEY, refreshToken);
    setUser(u);
    // El negocio se consulta por separado (no viene en la respuesta de login)
    let neg = null;
    try {
      neg = await getNegocio();
      setNegocio(neg ?? null);
    } catch {
      setNegocio(null);
    }
    return { user: u, negocio: neg };
  }

  // Guarda la sesión tras verificar OTP; recibe { accessToken, refreshToken, user }
  async function setSession({ accessToken, refreshToken, user: u }) {
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_KEY, refreshToken);
    setUser(u);
    try {
      const neg = await getNegocio();
      setNegocio(neg);
    } catch {
      setNegocio(null);
    }
  }

  async function refreshNegocio() {
    try {
      const neg = await getNegocio();
      setNegocio(neg);
    } catch {
      setNegocio(null);
    }
  }

  return (
    <AuthContext.Provider value={{
      user, negocio, loading,
      login, logout, setSession, refreshNegocio,
      dataVersion, bumpVersion,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
