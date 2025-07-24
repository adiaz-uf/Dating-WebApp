import { useState } from "react";
import { Navbar } from "../components/Navbar";
import { mockNotifications } from "../pages/NotificationsPage";

interface ChatLayoutProps {
  children: React.ReactNode;
}

export const ChatLayout: React.FC<ChatLayoutProps> = ({ children }) => {
  const [notifications, setNotifications] = useState(mockNotifications);


  return (
    <div className="flex flex-col h-screen">
      <Navbar notifications={notifications} />
      <div className="flex flex-1 overflow-hidden mt-15">
        {children}
      </div>
    </div>
  );
};

