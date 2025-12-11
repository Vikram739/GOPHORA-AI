import React from "react";

const plans = [
  {
    name: "Explorer",
    price: "Free",
    description: "Perfect to start your trip",
    features: [
      "5 missions per month",
      "Basic access to AI",
      "Basic blockchain profile",
    ],
    unavailable: ["Premium Missions"],
    buttonText: "Get Started for Free",
  },
  {
    name: "Navigator",
    price: "$19.99",
    duration: "/month",
    description: "For dedicated explorers",
    features: [
      "Unlimited Missions",
      "Full access to AI",
      "Advanced blockchain profile",
      "Access to premium missions",
    ],
    buttonText: "Subscribe Now",
    popular: true,
  },
  {
    name: "Commander",
    price: "$49.99",
    duration: "/month",
    description: "For teams and organizations",
    features: [
      "Everything in Navigator",
      "Up to 5 team members",
      "Advanced analytics",
      "Priority support",
    ],
    buttonText: "Contact Sales",
  },
];

export default function PricingPlans() {
  return (
    <section className="relative bg-[#0A0F2C] text-white py-20 px-6 overflow-hidden">
      {/* Space animated background */}
      <div className="absolute inset-0 space-bg"></div>
      <div className="absolute inset-0 bg-[#050c24]/70 backdrop-blur-sm z-[1]" />

      <div className="relative z-[2] max-w-6xl mx-auto text-center mb-14">
        <h2 className="text-4xl font-extrabold">
          Membership <span className="text-[#A28EFF]">Plans</span>
        </h2>
        <p className="text-gray-300 text-base mt-3">
          Choose the plan that best fits your exploration journey
        </p>
      </div>

      <div className="relative z-[2] grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan, index) => (
          <div
            key={index}
            className={`group rounded-2xl p-8 border border-[#1F254A] bg-[#161B30]/80
                       transition-all duration-300 ease-in-out hover:scale-[1.03]
                       hover:shadow-[0_0_20px_rgba(162,142,255,0.3)] relative overflow-hidden`}
          >
            {/* Highlight for most popular */}
            {plan.popular && (
              <div className="absolute top-4 right-4">
                <span className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-1 px-3 text-xs rounded-full">
                  Most Popular
                </span>
              </div>
            )}

            <h3 className="text-xl font-semibold mb-1">{plan.name}</h3>
            <p className="text-gray-300 text-sm mb-4">{plan.description}</p>

            <div className="text-4xl font-bold mb-6">
              {plan.price}
              {plan.duration && (
                <span className="text-lg text-gray-400 font-medium">
                  {plan.duration}
                </span>
              )}
            </div>

            <ul className="space-y-2 text-sm">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="text-green-400">✔</span>
                  <span className="text-gray-200">{feature}</span>
                </li>
              ))}
              {plan.unavailable &&
                plan.unavailable.map((item, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="text-red-500">✖</span>
                    <span className="text-gray-500 line-through">{item}</span>
                  </li>
                ))}
            </ul>

            <button
              className="mt-8 w-full py-3 rounded-xl font-medium 
                         bg-indigo-600/30 hover:bg-indigo-600/50 
                         text-white border border-indigo-400/20
                         transition-all duration-300"
            >
              {plan.buttonText}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
