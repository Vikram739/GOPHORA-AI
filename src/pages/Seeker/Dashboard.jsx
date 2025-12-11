import React, { useState } from "react";
import { Sparkles, Send, Stars } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Modal from "react-modal";
import { useNavigate, useOutletContext } from "react-router-dom";

Modal.setAppElement("#root"); // Required for accessibility

export default function SeekerDashboard() {
  const { applicationsSent, appliedIds, setAppliedIds, setApplicationsSent } =
    useOutletContext();

  const navigate = useNavigate();
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  // Hardcoded job for demo
  const job = {
    id: 1,
    type: "job",
    title: "Frontend Developer",
    company: "TechCorp",
    description:
      "We are looking for a React developer with experience in building responsive web apps.",
    lat: 30.3753,
    lng: 69.3451,
  };

  const icons = {
    job: L.icon({
      iconUrl:
        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='32' height='32'%3E%3Cpath d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z' fill='%233b82f6'/%3E%3C/svg%3E",
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    }),
  };

  const handleMarkerClick = (job) => {
    setSelectedJob(job);
    setModalIsOpen(true);
  };

  const handleApply = (id) => {
    if (!appliedIds.includes(id)) {
      setAppliedIds([...appliedIds, id]);
      setApplicationsSent((prev) => prev + 1);
      alert("Application submitted!");
    }
  };

  return (
    <div className="text-white p-4">
      <h2 className="text-3xl font-semibold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-[#C5A3FF] to-[#9E7BFF] drop-shadow-[0_0_10px_rgba(158,123,255,0.6)]">
        Welcome, Opportunity Seeker 🌱
      </h2>
      <p className="text-gray-300 mb-8">
        Explore new opportunities tailored to your skills and location.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
        <div className="bg-white/10 backdrop-blur-lg border border-white/10 p-6 rounded-2xl shadow-[0_0_25px_rgba(158,123,255,0.2)]">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-[#C5A3FF]">
              Recommended for You
            </h3>
            <Sparkles className="w-6 h-6 text-[#C5A3FF]" />
          </div>
          <p className="text-4xl font-bold text-white">1</p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg border border-white/10 p-6 rounded-2xl shadow-[0_0_25px_rgba(158,123,255,0.2)]">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-[#C5A3FF]">
              Applications Sent
            </h3>
            <Send className="w-6 h-6 text-[#C5A3FF]" />
          </div>
          <p className="text-4xl font-bold text-white">{applicationsSent}</p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg border border-white/10 p-6 rounded-2xl shadow-[0_0_25px_rgba(158,123,255,0.2)]">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-[#C5A3FF]">New Matches</h3>
            <Stars className="w-6 h-6 text-[#C5A3FF]" />
          </div>
          <p className="text-4xl font-bold text-white">1</p>
        </div>
      </div>

      {/* Map */}
      <div className="h-[450px] rounded-xl overflow-hidden relative">
        <MapContainer
          center={[job.lat, job.lng]}
          zoom={5}
          scrollWheelZoom={true}
          style={{ width: "100%", height: "100%" }}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          />
          <Marker
            position={[job.lat, job.lng]}
            icon={icons[job.type]}
            eventHandlers={{
              click: () => handleMarkerClick(job),
            }}
            riseOnHover
          />
        </MapContainer>
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        contentLabel="Job Info"
        className="bg-gray-900 text-white rounded-xl p-6 max-w-lg w-full mx-4 md:mx-auto mt-24 shadow-lg outline-none relative z-[1000]"
        overlayClassName="fixed inset-0 bg-black/50 flex justify-center items-start z-[1000]"
      >
        {selectedJob && (
          <div>
            <h3 className="text-xl font-bold mb-2">{selectedJob.title}</h3>
            <p className="text-gray-300 mb-2">{selectedJob.company}</p>
            <p className="text-gray-300 mb-4">{selectedJob.description}</p>
            <div className="flex justify-end gap-2">
              <button
                className="bg-gradient-to-r from-[#C5A3FF] to-[#9E7BFF] text-white py-2 px-4 rounded-lg hover:opacity-90 transition"
                onClick={() => navigate(`/opportunity/${selectedJob.id}`)}
              >
                Jump In
              </button>
              <button
                className="text-gray-400 hover:text-white transition py-2 px-4"
                onClick={() => setModalIsOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
