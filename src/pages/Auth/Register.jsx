// src/pages/Auth/Register.jsx
import React, { useState } from "react";
import RegisterForm from "../../components/forms/RegisterForm";

export default function Register() {
  const [role, setRole] = useState("");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0a0118] via-[#120826] to-[#1a093f] text-white px-4">
      {/* Card */}
      <div className="max-w-md w-full bg-white/5 backdrop-blur-lg border border-white/10 p-8 rounded-2xl shadow-[0_0_35px_rgba(127,77,255,0.25)] transition-all duration-300">
        <h2 className="text-3xl font-semibold mb-8 text-center tracking-wide text-white drop-shadow-[0_0_8px_rgba(158,123,255,0.6)]">
          Create Your Account
        </h2>

        {/* Role Selection */}
        {!role && (
          <div className="flex flex-col gap-4 mb-6">
            <button
              onClick={() => setRole("seeker")}
              className="w-full py-3 rounded-xl 
                         bg-gradient-to-r from-[#7F4DFF] to-[#9E7BFF]
                         hover:shadow-[0_0_30px_rgba(158,123,255,0.7)]
                         font-semibold text-white tracking-wide
                         transition-all duration-300"
            >
              I'm looking for opportunities
            </button>

            <button
              onClick={() => setRole("provider")}
              className="w-full py-3 rounded-xl 
                         bg-gradient-to-r from-[#7F4DFF] to-[#9E7BFF]
                         hover:shadow-[0_0_30px_rgba(158,123,255,0.7)]
                         font-semibold text-white tracking-wide
                         transition-all duration-300"
            >
              I want to post opportunities
            </button>
          </div>
        )}

        {/* Form */}
        {role && (
          <div className="animate-fadeIn">
            <RegisterForm role={role} setRole={setRole} />
          </div>
        )}
      </div>
    </div>
  );
}
