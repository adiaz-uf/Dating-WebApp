import { Navbar } from "../components/Navbar";
import { useState, type ReactNode } from "react";
// Import the notifications array (adjust the import according to your NotificationsPage export)
import { mockNotifications } from "../pages/NotificationsPage";

export default function MainLayout({ children }: { children: ReactNode }) {
  const [notifications] = useState(mockNotifications);

  return (
    <>
      <Navbar notifications={notifications} />
      <main className="min-h-screen flex flex-col items-center py-10 px-4 mt-20 ">{children}</main>
    </>
  );
}