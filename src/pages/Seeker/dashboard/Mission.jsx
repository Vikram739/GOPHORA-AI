import React from "react";
import { FiClock, FiMapPin, FiDollarSign } from "react-icons/fi";

const missions = [
  {
    title: "Data Entry Task",
    reward: "$10",
    duration: "30 mins",
    location: "Remote",
    urgency: "High",
  },
  {
    title: "Local Delivery",
    reward: "$15",
    duration: "1 hr",
    location: "City Center",
    urgency: "Medium",
  },
  {
    title: "On-site Assistance",
    reward: "$20",
    duration: "2 hrs",
    location: "Office HQ",
    urgency: "High",
  },
  {
    title: "Quick Survey",
    reward: "$5",
    duration: "15 mins",
    location: "Remote",
    urgency: "Low",
  },
];

export default function Missions() {
  return (
    <div className="p-4 md:p-6 space-y-8 text-stark">
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold text-stark drop-shadow-md">
          Missions 🚀
        </h1>
        <p className="text-stark/70 text-sm md:text-base">
          Explore available missions and start earning immediately.
        </p>
      </div>

      {/* Missions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {missions.map((mission, i) => (
          <div
            key={i}
            className={`bg-[#0F0C19]/70 border border-white/5 rounded-2xl p-6 shadow-[0_0_12px_rgba(71,23,246,0.15)] backdrop-blur-xl hover:shadow-[0_0_18px_rgba(162,57,202,0.25)] transition flex flex-col justify-between gap-4`}
          >
            <h2 className="text-lg font-semibold text-stark">{mission.title}</h2>

            <div className="flex items-center gap-3 text-stark/70 text-sm">
              <FiDollarSign /> <span>{mission.reward}</span>
              <FiClock /> <span>{mission.duration}</span>
              <FiMapPin /> <span>{mission.location}</span>
            </div>

            <span className={`self-start px-3 py-1 rounded-full text-xs font-medium ${
              mission.urgency === 'High'
                ? 'bg-fuschia/70 text-stark'
                : mission.urgency === 'Medium'
                ? 'bg-jewel/70 text-stark'
                : 'bg-stark/20 text-void'
            }`}>{mission.urgency} Urgency</span>

            <button className="mt-3 py-2 w-full bg-jewel/80 hover:bg-jewel/90 text-stark rounded-xl font-medium transition shadow-md">
              Start Mission
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}