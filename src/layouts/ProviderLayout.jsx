import React, { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Briefcase,
  LayoutDashboard,
  PlusCircle,
  User,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { APIURL } from '../services/api.js'



export default function ProviderLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { path: "/provider/dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { path: "/provider/opportunities", label: "My Invitations", icon: <Briefcase size={18} /> },
    { path: "/provider/create-opportunity", label: "Post Opportunity", icon: <PlusCircle size={18} /> },
    { path: "/provider/profile", label: "My Explorer ID", icon: <User size={18} /> },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("trust_score");
    localStorage.removeItem("provider_level");
    navigate("/login");
  };

  // --- 🧠 Live-updating verification data ---
  const [trustScore, setTrustScore] = useState(null);
  const [providerLevel, setProviderLevel] = useState(null);

  useEffect(() => {
    const fetchVerificationStatus = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await fetch(`${APIURL}/api/verification/status`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.trust_score !== null) {
            setTrustScore(data.trust_score);
            setProviderLevel(data.verification_status);
            // Also update localStorage so other components can see it
            localStorage.setItem("trust_score", data.trust_score);
            localStorage.setItem("provider_level", data.verification_status);
          }
        }
      } catch (error) {
        console.error("Failed to fetch verification status:", error);
      }
    };

    fetchVerificationStatus();

    // Update values whenever verification is completed elsewhere
    const updateStatus = () => {
      setTrustScore(localStorage.getItem("trust_score"));
      setProviderLevel(localStorage.getItem("provider_level"));
    };
    window.addEventListener("verification-updated", updateStatus);
    return () => window.removeEventListener("verification-updated", updateStatus);
  }, []);

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-[#0a0118] via-[#120826] to-[#1a093f] text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-white/5 backdrop-blur-xl border-r border-white/10 p-6 flex flex-col justify-between shadow-[0_0_25px_rgba(158,123,255,0.25)]">
        {/* Top Section */}
        <div>
          {/* Logo */}
          <h1 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[#9E7BFF] to-[#C5A3FF] drop-shadow-[0_0_10px_rgba(158,123,255,0.5)]">
            Gophora
          </h1>

          {/* Navigation */}
          <nav className="flex flex-col gap-2 mb-6">
            {navLinks.map(({ path, label, icon }) => {
              const active = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                    ${
                      active
                        ? "bg-white/20 text-[#C5A3FF] shadow-[0_0_15px_rgba(197,163,255,0.5)]"
                        : "text-gray-300 hover:bg-white/10 hover:text-[#C5A3FF]"
                    }`}
                >
                  {icon}
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Verification Status */}
          <div className="bg-white/10 border border-white/10 rounded-xl p-4 text-sm shadow-[0_0_15px_rgba(158,123,255,0.2)]">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck size={16} className="text-[#C5A3FF]" />
              <h3 className="font-semibold text-[#C5A3FF]">Verification Status</h3>
            </div>

            {trustScore ? (
              <>
                <p className="text-white mb-1">
                  🟣 AI Verified – {providerLevel || "Professional Level"}
                </p>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      trustScore >= 85
                        ? "bg-green-400"
                        : trustScore >= 50
                        ? "bg-yellow-400"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${trustScore}%` }}
                  />
                </div>
                <p className="text-gray-300 text-xs mb-1">
                  Trust Score: {trustScore} / 100
                </p>
                <p className="text-xs text-[#9E7BFF] italic">
                  Verified by Gemini AI
                </p>
              </>
            ) : (
              <>
                <p className="text-gray-400 mb-1">Not Verified</p>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-2">
                  <div className="h-full bg-gray-500 w-[20%]" />
                </div>
                <p className="text-xs text-gray-500">
                  Complete verification to unlock your badge
                </p>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex flex-col gap-2">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full py-2 rounded-xl text-white bg-orange-500 hover:bg-orange-600 transition-all duration-200"
          >
            <LogOut size={16} /> Logout
          </button>
          <div className="mt-2 text-xs text-gray-500 text-center">
            © {new Date().getFullYear()} Gophora
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 text-white">
        <Outlet />
      </main>
    </div>
  );
}
