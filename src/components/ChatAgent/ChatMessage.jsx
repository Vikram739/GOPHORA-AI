import React from "react";
import { User, Bot } from "lucide-react"; // Icons for the sender
import { useNavigate } from "react-router-dom"; // <-- IMPORTED NAVIGATE

/**
 * OpportunityCard (The "Box")
 */
function OpportunityCard({ opp }) {
  const navigate = useNavigate(); // <-- INITIALIZED NAVIGATE

  // --- NEW HANDLER FUNCTION ---
  const handleApplyClick = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      // User is logged out, save the ID and redirect
      localStorage.setItem("pending_application_id", opp.id);
      navigate("/login");
    } else {
      // User is logged in, send them to the main "Opportunities" page
      // where they can manage applications.
      navigate("/seeker/opportunities");
    }
  };
  // --- END OF NEW FUNCTION ---

  return (
    <div className="bg-[#161B30]/80 border border-[#1F254A] rounded-lg p-4 mt-2 w-full max-w-sm transition-all hover:border-[#A28EFF]/50">
      
      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-semibold text-base text-white truncate">
            {opp.title}
          </h3>
          <p className="text-xs text-gray-400">{opp.location || "Remote"}</p>
        </div>
        <span className="text-[11px] px-2 py-0.5 rounded-full font-medium text-[#A28EFF] border border-[#A28EFF]/30 bg-[#A28EFF]/10">
          {opp.type}
        </span>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-300 leading-relaxed line-clamp-2 mb-3">
        {opp.description}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {opp.tags && opp.tags.slice(0, 3).map((tag, i) => (
          <span
            key={i}
            className="bg-[#1F254A] text-[#A28EFF] text-[11px] px-2 py-0.5 rounded-md"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Apply Button --- UPDATED --- */}
      <button
        onClick={handleApplyClick} // <-- Use the new handler
        className="bg-gradient-to-r from-[#6D5DD3] to-[#7E6DF4] hover:scale-105 transition-all text-white text-sm font-semibold py-2 rounded-lg w-full"
      >
        🚀 Apply to Mission
      </button>
    </div>
  );
}


/**
 * Main ChatMessage Component
 */
export default function ChatMessage({ sender, text, opportunities = [] }) {
  const isUser = sender === "user";
  const hasOpportunities = opportunities && opportunities.length > 0;

  if (!sender || !text) {
    return null; // Fallback for safety
  }

  return (
    <div className={`flex items-start gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}>
      
      {/* Sender Icon */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser ? "bg-indigo-500" : "bg-[#A28EFF]"
        } ${!isUser ? "mt-1" : ""}`}
      >
        {isUser ? <User size={18} /> : <Bot size={18} />}
      </div>

      {/* Message Bubble + Opportunity Cards */}
      <div className="flex flex-col max-w-md">
        
        {/* Text Bubble */}
        <div
          className={`p-3 rounded-2xl text-sm ${
            isUser
              ? "bg-[#A28EFF] text-white rounded-br-none"
              : "bg-[#161B30] text-gray-200 rounded-bl-none border border-[#1F254A]"
          }`}
        >
          {text}
        </div>

        {/* Render Opportunity Cards if they exist */}
        {hasOpportunities && (
          <div className="flex flex-col gap-2 mt-1">
            {opportunities.map((opp) => (
              <OpportunityCard key={opp.id || opp.title} opp={opp} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}