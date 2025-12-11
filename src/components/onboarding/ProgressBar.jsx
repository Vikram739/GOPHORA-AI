import React from "react";

export default function ProgressBar({ currentStep, totalSteps }) {
  const progressPercent = (currentStep / totalSteps) * 100;
  return (
    <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
      <div
        className="h-3 bg-blue-600 rounded-full"
        style={{ width: `${progressPercent}%` }}
      />
    </div>
  );
}
