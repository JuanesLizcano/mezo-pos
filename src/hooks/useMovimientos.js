import { useEffect, useState, useCallback } from 'react';
import { getMovimientos } from '../services';
import { useAuth } from '../context/AuthContext';

// Movimientos manuales de caja del día actual.
export function useMovimientos() {
  const { user, dataVersion }              = useAuth();
  const [movimientos, setMovimientos]      = useState([]);
  const [loading, setLoading]              = useState(true);

  const fetch = useCallback(async () => {
    if (!user) return;
    try {
      const hoy = new Date().toISOString().split('T')[0];
      const data = await getMovimientos(hoy);
      setMovimientos(data);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetch(); }, [fetch, dataVersion]);

  return { movimientos, loading, refetch: fetch };
}
