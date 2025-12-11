import React from "react";
import { FiCheckCircle, FiStar, FiAward, FiTrendingUp, FiUserCheck } from "react-icons/fi";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// Mock data
const missions = [
  {
    id: 1,
    title: "Survey - Tech Feedback",
    date: "2025-11-20",
    earnings: 5,
    skillVerified: ["Surveying"],
    badges: ["Novice Explorer"],
    achievement: "Completed first survey"
  },
  {
    id: 2,
    title: "App Review Task",
    date: "2025-11-21",
    earnings: 12,
    skillVerified: ["App Review"],
    badges: ["Task Master"],
    achievement: "Reviewed 5 apps"
  },
  {
    id: 3,
    title: "Delivery Task",
    date: "2025-11-22",
    earnings: 15,
    skillVerified: ["Delivery"],
    badges: ["Quick Mover"],
    achievement: "First on-time delivery"
  }
];

// Chart data for earnings progression
const earningsData = {
  labels: missions.map((m) => m.date),
  datasets: [
    {
      label: "Earnings ($)",
      data: missions.map((m) => m.earnings),
      borderColor: "#A239CA",
      backgroundColor: "rgba(162,57,202,0.2)",
      tension: 0.4,
      fill: true,
      pointBackgroundColor: "#Fuchsia"
    }
  ]
};

export default function BookHistory() {
  return (
    <div className="p-4 md:p-6 space-y-6 text-stark">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold drop-shadow-md">Explorer Journey Log 🚀</h1>
        <p className="text-stark/70 text-sm md:text-base">
          Track your missions, skills, badges, earnings, and achievements over time.
        </p>
      </div>

      {/* Missions Timeline */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold mb-2">Completed Missions Timeline</h2>
        <div className="relative border-l border-white/10 pl-6 space-y-8">
          {missions.map((mission) => (
            <div key={mission.id} className="relative">
              <div className="absolute -left-3 top-1 w-6 h-6 bg-jewel rounded-full border-2 border-stark flex items-center justify-center">
                <FiCheckCircle className="text-stark" />
              </div>
              <div className="bg-[#0E0B16]/80 p-4 rounded-2xl shadow hover:shadow-[0_0_12px_rgba(71,23,246,0.25)] transition">
                <h3 className="font-semibold text-lg">{mission.title}</h3>
                <p className="text-stark/70 text-sm">{mission.date}</p>
                <div className="flex flex-wrap gap-4 mt-2 text-sm items-center">
                  <span className="flex items-center gap-1"><FiTrendingUp /> Skills: {mission.skillVerified.join(", ")}</span>
                  <span className="flex items-center gap-1"><FiStar /> Badges: {mission.badges.join(", ")}</span>
                  <span className="flex items-center gap-1"><FiAward /> Achievement: {mission.achievement}</span>
                  <span className="flex items-center gap-1"><FiTrendingUp /> Earnings: ${mission.earnings}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Earnings Progression Chart */}
      <div className="bg-[#0E0B16]/80 p-4 rounded-2xl shadow hover:shadow-[0_0_12px_rgba(71,23,246,0.25)] transition">
        <h2 className="text-xl font-semibold mb-4">Earnings Progression</h2>
        <Line data={earningsData} options={{ responsive: true, plugins: { legend: { labels: { color: "#E7DFDD" } } }, scales: { x: { ticks: { color: "#E7DFDD" } }, y: { ticks: { color: "#E7DFDD" } } } }} />
      </div>

      {/* Personal Achievements */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold mb-2">Personal Achievements</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {missions.map((mission) => (
            <div key={mission.id} className="bg-[#0E0B16]/80 p-4 rounded-2xl shadow hover:shadow-[0_0_12px_rgba(162,57,202,0.25)] transition">
              <h3 className="font-semibold">{mission.title}</h3>
              <p className="text-stark/70">{mission.achievement}</p>
              <p className="text-sm text-stark/50 mt-1">Earned: ${mission.earnings}</p>
            </div>
          ))}
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-[#0E0B16]/80 p-4 rounded-2xl shadow hover:shadow-[0_0_12px_rgba(162,57,202,0.25)] transition">
        <h2 className="text-xl font-semibold mb-2">AI-Generated Insights</h2>
        <ul className="list-disc list-inside text-stark/70 text-sm space-y-1">
          <li>Your productivity increased by 15% this week.</li>
          <li>Top skill verified: Delivery. Consider advanced missions in this category.</li>
          <li>You earned 3 new badges this month. Keep exploring!</li>
        </ul>
      </div>
    </div>
  );
}
