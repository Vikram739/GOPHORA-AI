import React from "react";

export default function ChatInput({ value, onChange, onSend, loading }) {
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSend(); }} className="p-4 border-t border-[#1F254A] flex gap-2">
      <input
        type="text"
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        placeholder="Type your message..."
        className="flex-1 p-2 rounded bg-[#161B30] text-white focus:outline-none"
        disabled={loading}
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-[#A28EFF] px-4 py-2 rounded font-semibold hover:bg-[#8b77f8] disabled:opacity-60"
      >
        Send
      </button>
    </form>
  );
}
