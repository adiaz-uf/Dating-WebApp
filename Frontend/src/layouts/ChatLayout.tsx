import { useState } from "react";
import { Navbar } from "../components/Navbar";
import { mockNotifications } from "../pages/NotificationsPage";
import { useProfile } from "../features/profile/useProfile";

interface ChatLayoutProps {
  children: React.ReactNode;
}

export const ChatLayout: React.FC<ChatLayoutProps> = ({ children }) => {
  const [notifications] = useState(mockNotifications);
  let userId = "";
  try {
    // Try to get userId from context if available
    // This will only work if ChatLayout is inside ProfileProvider
    // Otherwise, fallback to empty string
    // @ts-ignore
    userId = useProfile().userProfile?.id || "";
  } catch {}
  return (
    <div className="flex flex-col h-screen">
      <Navbar notifications={notifications} userId={userId} />
      <div className="flex flex-1 overflow-hidden mt-15">
        {children}
      </div>
    </div>
  );
};

