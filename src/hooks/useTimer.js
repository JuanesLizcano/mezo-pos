import { useState, useEffect } from 'react';

export function useTimer(startTimestamp) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startTimestamp) { setElapsed(0); return; }

    function calcElapsed() {
      const start = startTimestamp.toDate ? startTimestamp.toDate() : new Date(startTimestamp);
      return Math.floor((Date.now() - start.getTime()) / 1000);
    }

    setElapsed(calcElapsed());
    const id = setInterval(() => setElapsed(calcElapsed()), 1000);
    return () => clearInterval(id);
  }, [startTimestamp]);

  const horas    = Math.floor(elapsed / 3600);
  const minutos  = Math.floor((elapsed % 3600) / 60);
  const segundos = elapsed % 60;

  const formatted = horas > 0
    ? `${horas}h ${String(minutos).padStart(2, '0')}m`
    : `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;

  return { elapsed, formatted };
}
