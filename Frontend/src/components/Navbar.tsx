import { Menu, X } from "lucide-react";
import { BiLogOut } from "react-icons/bi";
import { IconContext } from "react-icons";
import { FaBell } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "./Button";
import { useEffect, useState } from "react";
import { useNotificationCount } from "../context/NotificationCountContext";
import { connectNotificationSocket } from "../api/notifications_socket";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { unreadCount, incrementUnread } = useNotificationCount();

  useEffect(() => {
    // Listen for new notifications via socket
    const userId = localStorage.getItem("userId");
    if (!userId) return;
    const socket = connectNotificationSocket(userId);
    const handler = (notif: any) => {
      if (!notif.is_read) incrementUnread();
    };
    socket.on("receive_reminder", handler);
    return () => {
      socket.off("receive_reminder", handler);
    };
  }, [incrementUnread]);

  const navLinks = [
    { label: "Browse", href: "/" },
    { label: "Chats", href: "/chats" },
    { label: "Profile", href: "/profile" },
    { label: "Logout", href: "/logout" },
  ];



  return (
    <header className="bg-pink-50 shadow-md fixed top-0 left-0 w-full z-50 py-1 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center flex-wrap">
        {/* Logo */}
        <h1 className="text-xl font-bold text-pink-600">Matcha</h1>
        <div className="flex ml-auto">
        <div className="relative text-pink-600 mr-6">
          <Button variant="none" onClick={() => navigate("/notifications")}> 
            <FaBell size={24} />
          </Button>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full px-1.5 text-xs font-bold min-w-[18px] h-4 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </div>
        {/* Toggle (mobile) */}
        <button
          className="md:hidden text-pink-600 mr-1.5"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Menu"
        >
          {isOpen ? <X size={30} /> : <Menu size={30} />}
        </button>
        </div>
        {/* Desktop links */}
        <nav className="hidden md:flex space-x-6">
          {navLinks.map(({ label, href }) => (
            <Link
              key={href}
              to={href}
              className="text-pink-600 hover:text-pink-700 font-medium transition-colors"
            >
              {label === "Logout" ? 
                <IconContext.Provider value={{ className:"mt-0.5 text-2xl"}}>
                  <BiLogOut />
                </IconContext.Provider>
                : label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-pink-50 border-t border-pink-100">
          <nav className="flex flex-col space-y-4 p-4 items-center">
            {navLinks.map(({ label, href }) => (
              <Link
                key={href}
                to={href}
                onClick={() => setIsOpen(false)}
                className="text-pink-600 hover:text-pink-700 font-medium transition-colors"
              >
                {label === "Logout" ? 
                <IconContext.Provider value={{ className:"mt-0.5 text-2xl"}}>
                  <BiLogOut />
                </IconContext.Provider>
                : label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};
