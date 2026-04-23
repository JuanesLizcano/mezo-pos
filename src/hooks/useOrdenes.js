import { useEffect, useState, useCallback } from 'react';
import { getOrdenes } from '../services';
import { useAuth } from '../context/AuthContext';

// Devuelve órdenes con filtro opcional de fechas.
export function useOrdenes(desde = null, hasta = null) {
  const { user, dataVersion } = useAuth();
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);

  const desdeStr = desde?.toISOString() ?? null;
  const hastaStr = hasta?.toISOString() ?? null;

  const fetch = useCallback(async () => {
    if (!user) return;
    try {
      const params = {};
      if (desdeStr) params.desde = desdeStr;
      if (hastaStr) params.hasta = hastaStr;
      const data = await getOrdenes(params);
      setOrdenes(data);
    } finally {
      setLoading(false);
    }
  }, [user, desdeStr, hastaStr]);

  useEffect(() => { fetch(); }, [fetch, dataVersion]);

  return { ordenes, loading, refetch: fetch };
}
