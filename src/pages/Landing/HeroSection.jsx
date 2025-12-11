// src/components/landing/HeroSection.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import herobg from "../../assets/hero-bg-1.jpg";

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <section
      className="relative flex flex-col items-center justify-center text-center min-h-screen w-full"
      style={{
        backgroundImage: `url(${herobg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        width: "100%",
        margin: 0,
      }}
    >
      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-black/60"></div>

      {/* Content */}
      <div className="relative z-10 max-w-3xl text-white px-6">
        <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-4">
          Feel the Future of{" "}
          <span className="text-blue-400">Opportunities</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-200 mb-8">
          Our mission is to keep humanity busy <br/>
          The first digital platform that senses the world, like sharks feel the ocean.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => navigate("/register")}
            className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-full font-medium transition"
          >
            Join Gophora
          </button>
          <button
            onClick={() => navigate("/login")}
            className="border border-gray-300 text-gray-100 hover:bg-white/10 px-8 py-3 rounded-full font-medium transition"
          >
            Sign In
          </button>
        </div>
      </div>

      {/* Floating tagline at bottom */}
      <p className="absolute bottom-6 text-gray-300 text-sm z-10">
        The first digital platform that{" "}
        <span className="text-blue-400">feels</span> the world.
      </p>
    </section>
  );
}
