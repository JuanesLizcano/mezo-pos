import { useEffect, useState, useCallback } from 'react';
import { getZonas } from '../services';
import { useAuth } from '../context/AuthContext';

export function useZonas() {
  const { user, dataVersion } = useAuth();
  const [zonas, setZonas]     = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getZonas();
      setZonas(data);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetch(); }, [fetch, dataVersion]);

  return { zonas, loading };
}
