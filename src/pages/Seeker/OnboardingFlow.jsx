import React, { useState } from "react";
import QuestionCard from "../../components/onboarding/QuestionCard";
import ProgressBar from "../../components/onboarding/ProgressBar";
import ChapterAudio from "../../components/onboarding/ChapterAudio";

const chapters = [
  {
    id: 1,
    title: "The Call",
    text: `A moment arrives when your emotions begin speaking a different language — a signal asking for transformation. GOPHORA begins there.`,
    question: "What emotion do you want to transform into creative energy?",
    options: ["Fear", "Doubt", "Sadness", "Stress", "All of the above"],
  },
  {
    id: 2,
    title: "The 24-Hour Flame",
    text: `Your potential doesn’t need years — it needs activation. In 24 hours, your energy can become productive purpose.`,
    question: "Where do you want your journey to start?",
    options: [
      "Creativity & Content",
      "Technology & Solutions",
      "Wellness & Support",
      "Nature & Sustainability",
      "Education & Mentorship",
    ],
  },
  {
    id: 3,
    title: "Awakening Purpose",
    text: `Purpose is not discovered — it is awakened. Every click here maps your emotional and mental energy into real missions.`,
    question: "What impact do you want to leave in the world?",
    options: ["Inspire", "Heal", "Teach", "Create", "Care", "Transform"],
  },
  {
    id: 4,
    title: "The Digital Society of Explorers",
    text: `You are entering a living society where creativity, care, technology, nature, and wisdom fuse into missions.`,
    question: "Where will you contribute first?",
    options: [
      "Creative Core",
      "Human Heart",
      "Tech Center",
      "Green Base",
      "Education Ring",
    ],
  },
  {
    id: 5,
    title: "The Economy of Purpose",
    text: `Every act becomes energy. Every energy becomes value. Every value becomes opportunity.`,
    question: "What do you want to receive for your energy?",
    options: [
      "Growth",
      "Recognition & Badges",
      "Direct Income",
      "Global Opportunities",
      "All of the above",
    ],
  },
  {
    id: 6,
    title: "The Interplanetary Leap",
    text: `You are training for the future — not just Earth’s future, but humanity’s.`,
    question: "What would you carry with you beyond Earth?",
    options: ["My Purpose", "My Energy", "My Humanity", "My Desire to Connect", "Everything I Am"],
  },
];

export default function OnboardingFlow() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selectedOption, setSelectedOption] = useState(null);

  const chapter = chapters[currentStep];

  const handleNext = () => {
    if (!selectedOption) return alert("Please select an option to continue.");
    setAnswers({ ...answers, [chapter.id]: selectedOption });
    setSelectedOption(null);
    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep === 0) return;
    const prev = answers[chapters[currentStep - 1].id];
    setSelectedOption(prev || null);
    setCurrentStep(currentStep - 1);
  };

  // 🎉 COMPLETION SCREEN
  if (currentStep === chapters.length) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center p-6 text-stark">
        <div className="w-full max-w-xl backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 shadow-xl">
          <h2 className="text-3xl font-bold text-fuschia text-center mb-4">
            Journey Complete
          </h2>

          <p className="text-stark/80 text-center mb-4">
            Your energy profile has been activated. Here’s your Explorer Summary:
          </p>

          <ul className="space-y-3 mt-6">
            {chapters.map((ch) => (
              <li
                key={ch.id}
                className="bg-white/5 p-4 rounded-xl border border-white/10"
              >
                <span className="text-jewel font-medium">{ch.title}:</span>{" "}
                <span className="text-stark/90">{answers[ch.id]}</span>
              </li>
            ))}
          </ul>

          <button
            onClick={() => (window.location.href = "/seeker/dashboard")}
            className="w-full mt-6 py-3 rounded-xl bg-gradient-to-r from-jewel to-fuschia text-white font-semibold shadow-lg hover:opacity-90 transition"
          >
            Begin My Missions
          </button>
        </div>
      </div>
    );
  }

  // 🧭 ONBOARDING UI
  return (
    <div className="min-h-screen bg-void flex items-center justify-center p-6 text-stark">
      <div className="w-full max-w-xl">
        <ProgressBar
          currentStep={currentStep + 1}
          totalSteps={chapters.length}
          theme="gophora"
        />

        <div className="mt-6 backdrop-blur-xl bg-white/5 p-6 rounded-2xl border border-white/10 shadow-lg">
          <h2 className="text-2xl font-bold text-fuschia">
            {chapter.title}
          </h2>

          <p className="mt-3 text-stark/70 leading-relaxed">{chapter.text}</p>

          <ChapterAudio chapterId={chapter.id} />

          <QuestionCard
            question={chapter.question}
            options={chapter.options}
            selectedOption={selectedOption}
            onSelectOption={setSelectedOption}
            theme="gophora"
          />

          <div className="mt-6 flex justify-between">
            <button
              onClick={handleBack}
              className={`px-6 py-2 rounded-xl font-semibold 
                ${currentStep === 0
                  ? "bg-white/10 text-stark/30 cursor-not-allowed"
                  : "bg-white/10 text-stark hover:bg-white/20"}
              `}
            >
              Back
            </button>

            <button
              onClick={handleNext}
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-jewel to-fuschia text-white font-semibold shadow-lg hover:opacity-90"
            >
              {currentStep === chapters.length - 1 ? "Finish" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
