import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/common/Navbar";

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-[#0B1021] text-white">
   
      <div className=""> {/* Adds spacing below navbar */}
        <Outlet />
      </div>
    </div>
  );
}
