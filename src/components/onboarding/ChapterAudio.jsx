import React, { useEffect, useRef, useState } from "react";

const audioScripts = {
  1: { src: "/audios/chapter1.mp3", text: "Hello, explorer. Your purpose is waiting." },
  2: { src: "/audios/chapter2.mp3", text: "Time is your greatest ally. Ignite your spark." },
  3: { src: "/audios/chapter3.mp3", text: "Activate your purpose. Connect with explorers." },
  4: { src: "/audios/chapter4.mp3", text: "Your role here is vital. Build together." },
  5: { src: "/audios/chapter5.mp3", text: "Every effort fuels a new economy of purpose." },
  6: { src: "/audios/chapter6.mp3", text: "Prepare humanity for the stars. You are a pioneer." },
};

export default function ChapterAudio({ chapterId }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  }, [chapterId]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const script = audioScripts[chapterId];
  if (!script) return null;

  return (
    <div className="bg-blue-50 p-4 rounded-md mt-4 flex flex-col md:flex-row md:items-center gap-4">
      <audio ref={audioRef} src={script.src} onEnded={() => setIsPlaying(false)} />
      <button
        onClick={togglePlay}
        className="px-4 py-2 bg-blue-600 text-white rounded-md font-semibold"
      >
        {isPlaying ? "Pause Audio" : "Play Audio"}
      </button>
      <p className="text-blue-900 italic flex-1">{script.text}</p>
    </div>
  );
}
