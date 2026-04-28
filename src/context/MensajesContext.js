import { createContext, useContext, useState } from 'react';

const MensajesContext = createContext(null);

export function MensajesProvider({ children }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const markAllRead = () => setUnreadCount(0);
  return (
    <MensajesContext.Provider value={{ unreadCount, markAllRead }}>
      {children}
    </MensajesContext.Provider>
  );
}

export function useMensajes() {
  return useContext(MensajesContext);
}
