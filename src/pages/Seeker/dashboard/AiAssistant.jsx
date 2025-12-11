import React, { useState } from "react";
import { FiSend } from "react-icons/fi";
import api from '../../../services/api';

export default function AIAssistant() {
  const [messages, setMessages] = useState([
    { text: "Hello! I'm Gophora AI, your intelligent assistant. Ask me anything - general questions, job searches, or platform help!", from: "ai" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [opportunities, setOpportunities] = useState([]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage = input.trim();
    setMessages(prev => [...prev, { text: userMessage, from: "user" }]);
    setInput("");
    setLoading(true);
    
    try {
      const response = await api.post('/chat', { message: userMessage });
      const aiReply = response.data.reply || "I'm sorry, I couldn't process that. Please try again.";
      
      setMessages(prev => [...prev, { text: aiReply, from: "ai" }]);
      
      // If there are job recommendations, store and display them
      if (response.data.opportunities && response.data.opportunities.length > 0) {
        setOpportunities(response.data.opportunities);
      } else {
        setOpportunities([]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        text: "Sorry, I'm having trouble connecting right now. Please try again later.", 
        from: "ai" 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full p-4 md:p-6 text-stark">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-fuschia to-jewel flex items-center justify-center text-2xl font-bold text-white shadow-lg">
          G
        </div>
        <h1 className="text-2xl md:text-3xl font-bold drop-shadow-md">Gophora AI</h1>
      </div>
      
      {/* Chat Messages */}
      <div className="flex-1 bg-[#0F0C19]/70 border border-white/5 rounded-2xl p-4 overflow-y-auto shadow-[0_0_12px_rgba(71,23,246,0.15)] backdrop-blur-xl">
        {messages.map((msg, i) => (
          <div key={i} className={`my-2 max-w-xs ${msg.from === 'user' ? 'ml-auto bg-jewel/80 text-stark rounded-l-2xl rounded-r-xl p-3' : 'bg-fuschia/80 text-stark rounded-r-2xl rounded-l-xl p-3'}`}>
            {msg.text}
          </div>
        ))}
      </div>

      {/* Job Opportunities */}
      {opportunities.length > 0 && (
        <div className="mt-4 bg-[#0F0C19]/70 border border-white/5 rounded-2xl p-4 backdrop-blur-xl">
          <h3 className="text-lg font-semibold mb-3 text-jewel">Found {opportunities.length} Job Opportunities:</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {opportunities.map((job, idx) => (
              <div key={idx} className="bg-white/5 border border-white/10 p-3 rounded-xl hover:bg-white/10 transition">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1">
                    <p className="font-semibold text-stark">{job.jobTitle || job.title}</p>
                    <p className="text-sm text-stark/70">{job.company || job.source} • {job.location}</p>
                    <p className="text-xs text-stark/60 mt-1">{job.category}</p>
                  </div>
                  <button
                    onClick={() => job.sourceLink && window.open(job.sourceLink, '_blank')}
                    className="px-3 py-1.5 text-xs rounded-lg bg-gradient-to-r from-[#C5A3FF] to-[#9E7BFF] text-white hover:opacity-90 transition whitespace-nowrap"
                  >
                    Apply
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="mt-4 flex gap-2">
        <input
          type="text"
          className="flex-1 p-3 rounded-2xl bg-[#0E0B16]/80 border border-white/10 text-stark placeholder-stark/50 focus:outline-none focus:ring-2 focus:ring-jewel"
          placeholder="Type your message..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !loading && sendMessage()}
          disabled={loading}
        />
        <button 
          onClick={sendMessage} 
          disabled={loading}
          className="bg-jewel/80 p-3 rounded-2xl hover:shadow-[0_0_12px_rgba(71,23,246,0.25)] transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FiSend className="text-stark" />
        </button>
      </div>
    </div>
  );
}