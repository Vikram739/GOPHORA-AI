import React from "react";

const testimonials = [
  {
    id: 1,
    name: "Sarah J.",
    role: "Travel Enthusiast",
    rating: 5,
    text: "Amazing experience! Everything was seamless and well organized. I felt safe and supported throughout the journey.",
  },
  {
    id: 2,
    name: "David P.",
    role: "Adventure Traveler",
    rating: 5,
    text: "Loved the destinations and the support team. The missions were exciting and worth every moment!",
  },
  {
    id: 3,
    name: "Emily R.",
    role: "Solo Explorer",
    rating: 5,
    text: "A seamless experience! The planning saved me hours and I got to enjoy my trip stress-free.",
  },
];

export default function Testimonials() {
  return (
    <section className="relative bg-[#0A0F2C] text-white py-20 px-6 overflow-hidden">
      {/* Background layer */}
      <div className="absolute inset-0 space-bg"></div>
      <div className="absolute inset-0 bg-[#050c24]/70 backdrop-blur-sm z-[1]" />

      <div className="relative z-[2] max-w-6xl mx-auto text-center mb-14">
        <h2 className="text-4xl font-extrabold">
          Satisfied <span className="text-[#A28EFF]">Explorers</span>
        </h2>
        <p className="text-gray-300 text-base mt-3">
          Here’s what our members are saying about their missions
        </p>
      </div>

      {/* Testimonials grid */}
      <div className="relative z-[2] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {testimonials.map((testimonial) => (
          <div
            key={testimonial.id}
            className="bg-[#161B30]/80 border border-[#1F254A] rounded-2xl p-6
                       hover:scale-[1.03] hover:shadow-[0_0_20px_rgba(162,142,255,0.3)]
                       transition-all duration-300 ease-in-out"
          >
            {/* Avatar + info */}
            <div className="flex items-center gap-4 mb-5">
              <div className="w-12 h-12 bg-[#1F254A] rounded-full flex items-center justify-center text-[#A28EFF] font-semibold">
                {testimonial.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-semibold">{testimonial.name}</h3>
                <p className="text-gray-400 text-sm">{testimonial.role}</p>
              </div>
            </div>

            {/* Stars */}
            <div className="flex items-center gap-1 mb-4 text-[#FFD700]">
              {Array.from({ length: testimonial.rating }).map((_, i) => (
                <span key={i}>★</span>
              ))}
            </div>

            {/* Feedback */}
            <p className="text-gray-300 text-sm leading-relaxed">
              “{testimonial.text}”
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
