import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Browse", href: "/browse" },
  { label: "Chats", href: "/chat" },
  { label: "Profile", href: "/profile" },
];

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="bg-pink-50 shadow-md fixed top-0 left-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <h1 className="text-xl font-bold text-pink-600">Matcha</h1>

        {/* Toggle (mobile) */}
        <button
          className="md:hidden text-pink-600"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Desktop links */}
        <nav className="hidden md:flex space-x-6">
          {navLinks.map(({ label, href }) => (
            <Link
              key={href}
              to={href}
              className="text-pink-600 hover:text-pink-700 font-medium transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-pink-50 border-t border-pink-100">
          <nav className="flex flex-col space-y-2 p-4">
            {navLinks.map(({ label, href }) => (
              <Link
                key={href}
                to={href}
                onClick={() => setIsOpen(false)}
                className="text-pink-600 hover:text-pink-700 font-medium transition-colors"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};
