import React from "react";

export default function QuestionCard({ question, options, selectedOption, onSelectOption }) {
  return (
    <div className="mt-4">
      <h3 className="font-medium mb-2">{question}</h3>
      <div className="flex flex-col gap-3">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onSelectOption(opt)}
            className={`py-3 px-5 rounded-md text-left transition-colors duration-300 ${
              selectedOption === opt
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-900 hover:bg-blue-100"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
