import { useEffect, useState, useCallback } from 'react';
import { getMesas } from '../services';
import { useAuth } from '../context/AuthContext';

export function useMesas() {
  const { user, dataVersion } = useAuth();
  const [mesas, setMesas]     = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getMesas();
      setMesas(data);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetch(); }, [fetch, dataVersion]);

  return { mesas, loading, refetch: fetch };
}
