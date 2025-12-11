import React, { useState } from "react";
// --- FIX: Added .jsx extensions to resolve potential import errors ---
import ChatMessage from "./ChatMessage.jsx";
import ChatInput from "./ChatInput.jsx";
import axios from "axios"; 
import { APIURL } from '../../services/api.js'

export default function ChatAgent() {
  const [messages, setMessages] = useState([
    { sender: "ai", text: "Hello! I’m GOPHORA AI. How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { sender: "user", text: input }];
    setMessages(newMessages);
    const userMessage = input; 
    setInput("");
    setLoading(true);

    try {
      const response = await axios.post(`${APIURL}/api/chat`, {
        message: userMessage,
      });

      // --- FIX: This is the core logic update ---
      // 1. Get the entire response from the API
      //    (This object is { reply: "...", opportunities: [...] })
      const aiResponse = response.data;

      // 2. Create a new message object that includes the text AND the opportunities
      const newAiMessage = {
        sender: "ai",
        text: aiResponse.reply,
        opportunities: aiResponse.opportunities // <-- This array holds the "boxes"
      };

      // 3. Add the complete message object to state
      setMessages([...newMessages, newAiMessage]);
      // --- END OF FIX ---

    } catch (error) {
      console.error("Error fetching AI response:", error);
      setMessages([...newMessages, { sender: "ai", text: "Sorry, I'm having trouble connecting. Please try again later." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0E1C] text-white">
      {/* Header */}
      <header className="p-4 text-center border-b border-[#1F254A]">
        <h1 className="text-xl font-bold text-[#A28EFF]">GOPHORA AI Chat</h1>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        
        {/* --- FIX: Use the spread operator (...) ---
            This passes all properties (sender, text, AND opportunities)
            from the 'msg' object directly into ChatMessage as props.
        */}
        {messages.map((msg, idx) => (
          <ChatMessage key={idx} {...msg} />
        ))}
        {/* --- END OF FIX --- */}
        
        {loading && (
          <p className="text-gray-400 text-sm italic">GOPHORA AI is typing...</p>
        )}
      </div>

      {/* Input */}
      <ChatInput
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onSend={handleSend}
        loading={loading}
      />
    </div>
  );
}

