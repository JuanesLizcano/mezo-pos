import { useEffect, useState, useCallback } from 'react';
import { getCuentas } from '../services';
import { useAuth } from '../context/AuthContext';

export function useCuentas() {
  const { user, dataVersion }  = useAuth();
  const [cuentas, setCuentas]  = useState([]);
  const [loading, setLoading]  = useState(true);

  const fetch = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getCuentas();
      setCuentas(data);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetch(); }, [fetch, dataVersion]);

  return { cuentas, loading, refetch: fetch };
}
