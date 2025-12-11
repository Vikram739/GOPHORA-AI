import React from "react";
import { Link } from "react-router-dom";
import {
  UserPlusIcon,
  CursorArrowRaysIcon,
  RocketLaunchIcon,
} from "@heroicons/react/24/solid";

const steps = [
  {
    icon: <UserPlusIcon className="h-6 w-6 text-[#A28EFF]" />,
    title: "Create your Explorer Profile",
    description:
      "Set up your profile with skills, interests, and mission preferences to get personalized recommendations instantly.",
    link: "Start now",
    path: "/register",
  },
  {
    icon: <CursorArrowRaysIcon className="h-6 w-6 text-[#A28EFF]" />,
    title: "Choose Your Mission",
    description:
      "Browse and choose missions that match your interests and skills — your next adventure is just a click away.",
    link: "Explore missions",
    path: "/explore-missions",
  },
  {
    icon: <RocketLaunchIcon className="h-6 w-6 text-[#A28EFF]" />,
    title: "Register & Jump In",
    description:
      "Choose experiences you’d like to jump into. Earn reputation that unlocks credits to keep exploring and growing on GOPHORA.",
    link: "Join now",
    path: "/register",
  },
];

export default function HowItWorks() {
  return (
    <section className="relative bg-[#0A0F2C] text-white py-20 px-6 overflow-hidden">
      {/* Animated star background */}
      <div className="absolute inset-0 space-bg"></div>
      <div className="absolute inset-0 bg-[#050c24]/70 backdrop-blur-sm z-[1]" />

      <div className="relative z-[2] text-center mb-14">
        <h2 className="text-4xl font-extrabold">
          How <span className="text-[#A28EFF]">GOPHORA</span> Works
        </h2>
        <p className="text-gray-300 text-base mt-3 max-w-2xl mx-auto">
          A revolutionary platform that connects people with opportunities in real time — 
          where every explorer finds their next mission.
        </p>
      </div>

      <div className="relative z-[2] grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {steps.map((step, index) => (
          <div
            key={index}
            className="relative bg-[#161B30]/80 border border-[#1F254A] rounded-2xl p-6 text-left
                       hover:scale-[1.03] hover:shadow-[0_0_20px_rgba(162,142,255,0.3)] 
                       transition-all duration-300 ease-in-out"
          >
            {/* Decorative corner */}
            <div className="absolute top-0 right-0 w-16 h-16 bg-[#1F254A] rounded-bl-[32px]" />

            {/* Icon */}
            <div className="w-12 h-12 rounded-full bg-[#1F254A] flex items-center justify-center mb-5 z-10 relative">
              {step.icon}
            </div>

            {/* Title */}
            <h3 className="text-lg font-semibold mb-2 text-white relative z-10">
              {step.title}
            </h3>

            {/* Description */}
            <p className="text-sm text-gray-300 leading-relaxed mb-4 relative z-10">
              {step.description}
            </p>

            {/* Link */}
            <Link
              to={step.path}
              className="text-sm text-[#A28EFF] font-medium inline-flex items-center gap-1 
                         relative z-10 hover:underline hover:text-[#B8A9FF] transition"
            >
              {step.link}
              <span>→</span>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
