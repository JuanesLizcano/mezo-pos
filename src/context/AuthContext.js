import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [negocio, setNegocio] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubNegocio = null;

    const unsubAuth = onAuthStateChanged(auth, (firebaseUser) => {
      // Cancelar listener previo del negocio al cambiar sesión
      if (unsubNegocio) {
        unsubNegocio();
        unsubNegocio = null;
      }

      if (firebaseUser) {
        setUser(firebaseUser);
        // onSnapshot en lugar de getDoc: se actualiza cuando Step 5 crea el doc
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
