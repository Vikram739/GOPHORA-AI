import React from "react";
import LoginForm from "../../components/forms/LoginForm";
import { Link } from "react-router-dom";

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0a0118] via-[#120826] to-[#1a093f] text-white px-4">
      {/* Card */}
      <div className="max-w-md w-full bg-white/5 backdrop-blur-lg border border-white/10 p-8 rounded-2xl shadow-[0_0_35px_rgba(124,58,237,0.25)] transition-all duration-300">
        <h2 className="text-3xl font-semibold mb-2 text-center tracking-wide text-white drop-shadow-[0_0_8px_rgba(167,139,250,0.6)]">
          Welcome Back 👋
        </h2>
        <p className="text-gray-300 text-center mb-8">
          Log in to continue exploring <span className="text-[#BCA5FF] font-medium">Gophora</span>.
        </p>

        <LoginForm />

        <p className="text-sm text-center mt-6 text-gray-400">
          Don’t have an account?{" "}
          <Link
            to="/register"
            className="text-[#BCA5FF] hover:text-white font-medium transition-colors"
          >
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
