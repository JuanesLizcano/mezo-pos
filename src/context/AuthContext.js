import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

const AuthContext = createContext(null);

// 8 horas en milisegundos
const INACTIVIDAD_MS = 8 * 60 * 60 * 1000;
const EVENTOS_ACTIVIDAD = ['mousemove', 'keydown', 'click', 'touchstart', 'scroll'];

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [negocio, setNegocio] = useState(null);
  const [loading, setLoading] = useState(true);
  const timeoutRef            = useRef(null);

  // Reinicia el temporizador de inactividad cada vez que hay actividad del usuario
  function resetInactividad() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (auth.currentUser) {
      timeoutRef.current = setTimeout(() => {
        signOut(auth);
      }, INACTIVIDAD_MS);
    }
  }

  useEffect(() => {
    EVENTOS_ACTIVIDAD.forEach(e =>
      window.addEventListener(e, resetInactividad, { passive: true })
    );
    resetInactividad();

    return () => {
      EVENTOS_ACTIVIDAD.forEach(e =>
        window.removeEventListener(e, resetInactividad)
      );
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let unsubNegocio = null;

    const unsubAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (unsubNegocio) {
        unsubNegocio();
        unsubNegocio = null;
      }

      if (firebaseUser) {
        setUser(firebaseUser);
        // onSnapshot en lugar de getDoc: se actualiza cuando el onboarding crea el doc
        unsubNegocio = onSnapshot(
          doc(db, 'negocios', firebaseUser.uid),
          (snap) => {
            setNegocio(snap.exists() ? { id: snap.id, ...snap.data() } : null);
            setLoading(false);
          }
        );
      } else {
        setUser(null);
        setNegocio(null);
        setLoading(false);
      }
    });

    return () => {
      unsubAuth();
      if (unsubNegocio) unsubNegocio();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, negocio, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
