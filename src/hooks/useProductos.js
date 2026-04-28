import { useEffect, useState, useCallback } from 'react';
import { getProductos } from '../services';
import { useAuth } from '../context/AuthContext';

export function useProductos() {
  const { user, dataVersion }    = useAuth();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading]     = useState(true);

  const fetch = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getProductos();
      setProductos(data);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetch(); }, [fetch, dataVersion]);

  return { productos, loading, refetch: fetch };
}
