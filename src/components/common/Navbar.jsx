import React, { useState, useEffect } from "react";
import { LogIn, LogOut, Menu, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from '../../contexts/AuthContext';
import logo from '../../assets/gophora-plomo-logo.png';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navLinks = [
    { name: "Gophora AI", href: "/chat" },
    { name: "About Us", href: "/about" },
    { name: "Explore Missions", href: "/explore-missions" }
  ];

  // Detect scroll for navbar shadow
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleAuthClick = async () => {
    if (user) {
      // Logout using context
      await logout();
    } else {
      // Navigate to login page
      navigate("/login");
    }
  };

  return (
    <nav
      className={`fixed top-0 w-full z-50 text-white transition-all duration-300
        ${scrolled ? "bg-[#03091d]/95 shadow-md border-b border-white/10" : "bg-[#03091d]/80"}
      `}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-3 flex items-center justify-between">
        {/* Left: Logo */}
        <Link to="/" className="flex items-center gap-2 cursor-pointer select-none ml-7">
          <img src={logo} alt="Gophora Logo" className="h-10 w-40" />
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className={`text-[14px] font-medium transition ${
                location.pathname === link.href
                  ? "text-indigo-400"
                  : "text-gray-300 hover:text-indigo-400"
              }`}
            >
              {link.name}
            </Link>
          ))}

          <button
            onClick={handleAuthClick}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-md font-medium text-[13px] transition shadow-sm"
          >
            {user ? <LogOut size={16} /> : <LogIn size={16} />}
            <span>{user ? "Logout" : "Login"}</span>
          </button>
        </div>

        {/* Mobile Toggle Button */}
        <button
          className="md:hidden text-gray-200 hover:text-white transition"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-[#03091d]/95 border-t border-white/10 px-6 py-4 space-y-3 animate-slideDown">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              onClick={() => setIsOpen(false)}
              className={`block text-sm font-medium ${
                location.pathname === link.href
                  ? "text-indigo-400"
                  : "text-gray-300 hover:text-indigo-400"
              }`}
            >
              {link.name}
            </Link>
          ))}

          <button
            onClick={handleAuthClick}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-md font-medium text-sm transition shadow-sm"
          >
            {user ? <LogOut size={16} /> : <LogIn size={16} />}
            <span>{user ? "Logout" : "Login"}</span>
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
