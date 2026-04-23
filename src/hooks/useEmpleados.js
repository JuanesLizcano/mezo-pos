import { useEffect, useState, useCallback } from 'react';
import { getEmpleados } from '../services';
import { useAuth } from '../context/AuthContext';

export function useEmpleados() {
  const { user, dataVersion }      = useAuth();
  const [empleados, setEmpleados]  = useState([]);
  const [loading, setLoading]      = useState(true);

  const fetch = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getEmpleados();
      setEmpleados(data);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetch(); }, [fetch, dataVersion]);

  return { empleados, loading, refetch: fetch };
}
