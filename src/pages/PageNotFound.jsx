import React from "react";
import { AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PageNotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center bg-gradient-to-br from-[#0F0826] via-[#1A103D] to-[#2B1663] text-white px-6">
      
      {/* Icon */}
      <div className="bg-[#C5A3FF]/10 p-5 rounded-full mb-6">
        <AlertTriangle className="w-16 h-16 text-[#C5A3FF]" />
      </div>

      {/* Heading */}
      <h1 className="text-6xl md:text-7xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-[#C5A3FF] to-[#9E7BFF] drop-shadow-[0_0_10px_rgba(158,123,255,0.6)]">
        404
      </h1>
      <h2 className="text-2xl font-semibold text-gray-300 mb-4">
        Page Not Found
      </h2>

      {/* Description */}
      <p className="text-gray-400 mb-8 max-w-lg">
        Looks like you’re lost in the Gophora network.  
        The page you’re looking for doesn’t exist or may have moved.
      </p>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => navigate("/")}
          className="bg-gradient-to-r from-[#C5A3FF] to-[#9E7BFF] hover:opacity-90 text-white font-semibold py-3 px-8 rounded-xl transition"
        >
          Go to Homepage
        </button>
        <button
          onClick={() => navigate(-1)}
          className="border border-white/20 hover:bg-white/10 text-gray-300 font-medium py-3 px-8 rounded-xl transition"
        >
          Go Back
        </button>
      </div>

      {/* Footer tagline */}
      <p className="mt-12 text-sm text-gray-400">
        Gophora — sensing talent, potential, and possibilities 🌌
      </p>
    </div>
  );
}
