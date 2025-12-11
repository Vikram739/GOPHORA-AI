import React, { useState } from "react";
import { X } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function ExploreMissions() {
  const [missions] = useState([
    { id: 1, title: "Prepare Food Contribution", example: "Teach people to prepare healthy meals" },
    { id: 2, title: "Clean Water Project", example: "Collect water samples for sustainability" },
    { id: 3, title: "Community Garden", example: "Grow vegetables for local community" },
    { id: 4, title: "Recycling Initiative", example: "Organize a neighborhood recycling drive" },
    { id: 5, title: "Education Support", example: "Create study plans for children" },
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMission, setSelectedMission] = useState(null);
  const [idea, setIdea] = useState("");

  const openModal = (mission) => {
    setSelectedMission(mission);
    setIdea("");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedMission(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    toast.success("Idea submitted successfully 🚀", {
      style: {
        background: "#0F1326",
        color: "#fff",
        border: "1px solid #C5A3FF",
        fontWeight: "500",
      },
      iconTheme: {
        primary: "#C5A3FF",
        secondary: "#0F1326",
      },
    });

    closeModal();
  };

  return (
    <div className="pt-24 p-8 text-white bg-[#0F1326] min-h-screen">
      {/* Toast provider */}
      <Toaster position="top-right" reverseOrder={false} />

      <h2 className="text-3xl font-semibold mb-4 text-[#C5A3FF]">
        Explore Missions
      </h2>
      <p className="text-gray-300 mb-8">
        Join hands in real-world missions. From food sustainability to space innovation. Your ideas can power the next breakthrough.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {missions.map((mission) => (
          <div
            key={mission.id}
            className="bg-[#0A0F1F] p-5 rounded-2xl shadow-lg flex flex-col justify-between border border-white/10"
          >
            <h3 className="text-xl font-semibold mb-2 text-[#C5A3FF]">
              {mission.title}
            </h3>
            <p className="text-gray-200 mb-4">{mission.example}</p>
            <button
              onClick={() => openModal(mission)}
              className="w-full py-2 bg-gradient-to-r from-[#C5A3FF] to-[#9E7BFF] rounded-xl text-white font-semibold hover:opacity-90 transition-all duration-200"
            >
              Submit Idea
            </button>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#0A0F1F] p-8 rounded-2xl w-full max-w-md relative shadow-xl border border-white/10">
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>
            <h3 className="text-2xl font-semibold text-[#C5A3FF] mb-4">
              Submit Idea for {selectedMission.title}
            </h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <textarea
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="Your idea..."
                required
                rows={5}
                className="border border-white/20 p-3 rounded-xl bg-[#0F1326] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C5A3FF]"
              />
              <button
                type="submit"
                className="py-2 bg-gradient-to-r from-[#C5A3FF] to-[#9E7BFF] rounded-xl text-white font-semibold hover:opacity-90 transition-all duration-200"
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
