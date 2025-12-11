import React, { useState } from "react";
import { FiClock, FiMapPin, FiDollarSign } from "react-icons/fi";
import { motion } from "framer-motion";

// Mock data for jobs
const jobsData = [
  {
    id: 1,
    title: "Basic Cleaning",
    location: "New York, NY",
    duration: "2 hrs",
    payment: "$25",
    urgency: "High",
  },
  {
    id: 2,
    title: "On-site Assistance",
    location: "San Francisco, CA",
    duration: "4 hrs",
    payment: "$50",
    urgency: "Medium",
  },
  {
    id: 3,
    title: "Delivery Task",
    location: "Los Angeles, CA",
    duration: "1 hr",
    payment: "$15",
    urgency: "High",
  },
  {
    id: 4,
    title: "Handy Tasks",
    location: "Austin, TX",
    duration: "3 hrs",
    payment: "$40",
    urgency: "Low",
  },
  {
    id: 5,
    title: "Micro Mission",
    location: "Miami, FL",
    duration: "30 min",
    payment: "$10",
    urgency: "High",
  },
];

export default function QuickJobs() {
  const [jobs] = useState(jobsData);

  // Helper to get color based on urgency
  const urgencyColor = (level) => {
    switch (level) {
      case "High":
        return "bg-fuschia text-stark";
      case "Medium":
        return "bg-jewel text-stark";
      case "Low":
        return "bg-stark/30 text-void";
      default:
        return "bg-stark/20";
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 text-stark">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold drop-shadow-md">
          Quick Jobs 🚀
        </h1>
        <p className="text-stark/70 text-sm md:text-base">
          Available high-demand, low-skill missions you can do immediately.
        </p>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.map((job, i) => (
          <motion.div
            key={job.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-[#0F0C19]/70 border border-white/5 rounded-2xl p-5 shadow-[0_0_12px_rgba(71,23,246,0.15)] backdrop-blur-xl flex flex-col justify-between hover:shadow-[0_0_16px_rgba(162,57,202,0.25)] transition"
          >
            <div className="flex justify-between items-start">
              <h2 className="text-lg font-semibold text-stark">{job.title}</h2>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${urgencyColor(
                  job.urgency
                )}`}
              >
                {job.urgency}
              </span>
            </div>

            <div className="mt-3 space-y-2 text-stark/70 text-sm">
              <div className="flex items-center gap-2">
                <FiMapPin /> {job.location}
              </div>
              <div className="flex items-center gap-2">
                <FiClock /> {job.duration}
              </div>
              <div className="flex items-center gap-2">
                <FiDollarSign /> {job.payment}
              </div>
            </div>

            <button className="mt-4 bg-jewel/80 text-stark py-2 rounded-xl w-full hover:shadow-[0_0_12px_rgba(71,23,246,0.25)] transition">
              Accept Mission
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
