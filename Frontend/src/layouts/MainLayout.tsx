import { Navbar } from "../components/Navbar";
import { useState, type ReactNode } from "react";
import { mockNotifications } from "../pages/NotificationsPage";
import { useProfile } from "../features/profile/useProfile";
import { useProfileContext } from "../features/profile/ProfileContext";

export default function MainLayout({ children }: { children: ReactNode }) {
  const [notifications] = useState(mockNotifications);
  const { userProfile } = useProfileContext();
  const userId = userProfile?.id || "";
  try {
    userId = useProfile().userProfile?.id || "";
  } catch {}
  return (
    <>
      <Navbar notifications={notifications} userId={userId} />
      <main className="min-h-screen flex flex-col items-center py-10 px-4 mt-20 ">{children}</main>
    </>
  );
}