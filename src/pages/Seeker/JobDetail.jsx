import React from "react";
import { useParams } from "react-router-dom";

export default function JobDetail() {
  const { id } = useParams(); // job ID from route

  // Hardcoded job data for demo
  const job = {
    id,
    title: "Frontend Developer",
    description:
      "We are looking for a skilled React developer to build a responsive web application. Must have experience with modern React, TailwindCSS, and REST APIs.",
    location: "New York, USA",
    remote: false,
    duration: "Short-term",
    salary: "$3000 - $4000",
    deadline: "2025-12-31",
    provider: {
      name: "TechCorp Inc.",
      shortDetail: "A leading tech company specializing in web solutions.",
    },
  };

  return (
    <div className="p-6 max-w-4xl mx-auto text-white">
      <h1 className="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[#C5A3FF] to-[#9E7BFF]">
        {job.title}
      </h1>
      <p className="text-gray-300 mb-6">{job.description}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white/10 backdrop-blur-lg p-4 rounded-lg">
          <h3 className="font-semibold mb-1">Location</h3>
          <p>{job.remote ? "Remote" : job.location}</p>
        </div>
        <div className="bg-white/10 backdrop-blur-lg p-4 rounded-lg">
          <h3 className="font-semibold mb-1">Duration</h3>
          <p>{job.duration}</p>
        </div>
        <div className="bg-white/10 backdrop-blur-lg p-4 rounded-lg">
          <h3 className="font-semibold mb-1">Salary</h3>
          <p>{job.salary}</p>
        </div>
        <div className="bg-white/10 backdrop-blur-lg p-4 rounded-lg">
          <h3 className="font-semibold mb-1">Deadline</h3>
          <p>{job.deadline}</p>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-lg p-4 rounded-lg mb-6">
        <h3 className="font-semibold mb-1">Job Provider</h3>
        <p className="font-medium">{job.provider.name}</p>
        <p className="text-gray-300">{job.provider.shortDetail}</p>
      </div>

      <button className="bg-gradient-to-r from-[#C5A3FF] to-[#9E7BFF] py-3 px-6 rounded-xl font-semibold hover:opacity-90 transition">
        Apply Now
      </button>
    </div>
  );
}
