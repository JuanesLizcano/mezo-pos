import { useEffect, useState, useCallback } from 'react';
import { getCategorias } from '../services';
import { useAuth } from '../context/AuthContext';

export function useCategorias() {
  const { user, dataVersion }      = useAuth();
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading]       = useState(true);

  const fetch = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getCategorias();
      setCategorias(data);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetch(); }, [fetch, dataVersion]);

  return { categorias, loading, refetch: fetch };
}
