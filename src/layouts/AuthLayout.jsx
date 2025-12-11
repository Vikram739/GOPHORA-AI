// src/layouts/AuthLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-md">
        {/* Optional Logo */}
        <div className="flex justify-center mb-6">
          <h1 className="text-3xl font-bold text-green-600">Gophora</h1>
        </div>

        {/* Render the nested page (login, register, etc.) */}
        <Outlet />
      </div>
    </div>
  );
}
