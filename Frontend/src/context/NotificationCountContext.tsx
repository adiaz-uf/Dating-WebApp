import React, { createContext, useContext, useState, useCallback } from "react";

interface NotificationCountContextType {
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  incrementUnread: () => void;
  decrementUnread: () => void;
}

const NotificationCountContext = createContext<NotificationCountContextType | undefined>(undefined);

export const NotificationCountProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  const incrementUnread = useCallback(() => setUnreadCount((c) => c + 1), []);
  const decrementUnread = useCallback(() => setUnreadCount((c) => Math.max(0, c - 1)), []);

  return (
    <NotificationCountContext.Provider value={{ unreadCount, setUnreadCount, incrementUnread, decrementUnread }}>
      {children}
    </NotificationCountContext.Provider>
  );
};

export function useNotificationCount() {
  const ctx = useContext(NotificationCountContext);
  if (!ctx) throw new Error("useNotificationCount must be used within NotificationCountProvider");
  return ctx;
}