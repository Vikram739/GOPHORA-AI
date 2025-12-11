import React from "react";
import {
  FaLightbulb,
  FaUsers,
  FaGlobe,
  FaCode,
  FaDatabase,
  FaRocket,
} from "react-icons/fa";
import FounderImage from "../../assets/Founder.png";
import FrontendDeveloper from "../../assets/FrontendDeveloper.png";
import AiEngineer from "../../assets/AI Engineer.jpeg";
import Founderimage from '../../assets/Founder-image.jpeg'

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-[#0B1021] text-white">
      {/* --- Header --- */}
      <section className="text-center py-20 bg-gradient-to-b from-[#1a1f3c] to-[#0B1021]">
        <h1 className="text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[#C5A3FF] to-[#9E7BFF]">
          About Gophora
        </h1>
        <p className="text-gray-300 text-lg max-w-3xl mx-auto">
          Connecting opportunity seekers with providers — empowering humanity
          through technology, collaboration, and contribution.
        </p>
      </section>

      {/* --- Innovation / Ambition / Mission / Impact --- */}
      <section className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-4 gap-8 text-center">
        <div className="bg-[#161B30] p-8 rounded-2xl border border-white/10 shadow-lg hover:shadow-[0_0_25px_rgba(158,123,255,0.3)] transition">
          <FaLightbulb className="text-[#C5A3FF] text-5xl mx-auto mb-4" />
          <h3 className="text-2xl font-semibold mb-2 text-[#C5A3FF]">
            Innovation → Contribution
          </h3>
          <p className="text-gray-300">
            Transforming innovation into meaningful contributions — enabling
            people to create value that benefits others and the planet.
          </p>
        </div>

        <div className="bg-[#161B30] p-8 rounded-2xl border border-white/10 shadow-lg hover:shadow-[0_0_25px_rgba(158,123,255,0.3)] transition">
          <FaRocket className="text-[#C5A3FF] text-5xl mx-auto mb-4" />
          <h3 className="text-2xl font-semibold mb-2 text-[#C5A3FF]">
            Ambition
          </h3>
          <p className="text-gray-300">
            Extending human perception — allowing people to sense and
            understand their environment through AI-powered systems.
          </p>
        </div>

        <div className="bg-[#161B30] p-8 rounded-2xl border border-white/10 shadow-lg hover:shadow-[0_0_25px_rgba(158,123,255,0.3)] transition">
          <FaUsers className="text-[#C5A3FF] text-5xl mx-auto mb-4" />
          <h3 className="text-2xl font-semibold mb-2 text-[#C5A3FF]">
            Mission
          </h3>
          <p className="text-gray-300">
            To rescue and highlight human talent, connecting people with
            meaningful contributions that align with their purpose.
          </p>
        </div>

        <div className="bg-[#161B30] p-8 rounded-2xl border border-white/10 shadow-lg hover:shadow-[0_0_25px_rgba(158,123,255,0.3)] transition">
          <FaGlobe className="text-[#C5A3FF] text-5xl mx-auto mb-4" />
          <h3 className="text-2xl font-semibold mb-2 text-[#C5A3FF]">
            Impact
          </h3>
          <p className="text-gray-300">
            Enabling people to reach independence and instantly access work,
            study, experience, or hobbies that enrich their lives.
          </p>
        </div>
      </section>

      {/* --- Founder Section --- */}
      <section className="py-20 border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 items-center gap-12">
          <div className="flex justify-center">
            <img
              src={Founderimage}
              alt="Founder Andrea Covarrubias"
              className="rounded-2xl shadow-[0_0_40px_rgba(158,123,255,0.3)] w-80 h-80 object-cover"
            />
          </div>

          <div>
            <h2 className="text-3xl font-bold mb-4 text-[#C5A3FF]">
              Meet Our Founder
            </h2>
            <p className="text-gray-300 mb-4">
              <strong>Andrea V. Covarrubias (Visnity)</strong> — visionary
              Product Owner and Founder Institute alum from Silicon Valley,
              leading Gophora with 15+ years of innovation experience.
            </p>
            <p className="text-gray-300 mb-4">
              Her ambition: merge human perception with AI, fostering a future
              where contribution, creativity, and technology work together for
              global empowerment.
            </p>
            <h3 className="text-2xl font-semibold text-[#9E7BFF]">
              Andrea V. Covarrubias
            </h3>
            <p className="text-gray-400">Founder, Gophora</p>
          </div>
        </div>
      </section>

      {/* --- Team Section --- */}
      <section className="py-20 bg-[#0F1530]">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-12 text-[#C5A3FF]">Our Team</h2>

          <div className="grid md:grid-cols-3 gap-10">
            {/* Frontend Developer */}
            <div className="bg-[#161B30] border border-white/10 rounded-2xl p-8 hover:shadow-[0_0_25px_rgba(158,123,255,0.3)] transition transform hover:-translate-y-2">
              <img
                src={FrontendDeveloper}
                alt="Safia Liaqat"
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
              />
              <h3 className="text-xl font-semibold text-[#C5A3FF] mb-1">
                Safia Liaqat
              </h3>
              <p className="text-gray-400 mb-3">Frontend Developer</p>
              <p className="text-gray-300 text-sm">
                Passionate about crafting interactive, scalable web experiences.
                Safia leads the front-end design of Gophora, ensuring smooth and
                immersive user interactions.
              </p>
              <FaCode className="text-[#9E7BFF] text-3xl mx-auto mt-4" />
            </div>

            {/* AI Engineer */}
            <div className="bg-[#161B30] border border-white/10 rounded-2xl p-8 hover:shadow-[0_0_25px_rgba(158,123,255,0.3)] transition transform hover:-translate-y-2">
              <img
                src={AiEngineer}
                alt="Gia Huy Phung"
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
              />
              <h3 className="text-xl font-semibold text-[#C5A3FF] mb-1">
                Gia Huy Phung (Jerry)
              </h3>
              <p className="text-gray-400 mb-3">Backend & AI Systems Developer</p>
              <p className="text-gray-300 text-sm">
                Data expert specializing in ML and AI-driven systems that power
                Gophora’s smart matchmaking and user experience analytics.
              </p>
              <FaDatabase className="text-[#9E7BFF] text-3xl mx-auto mt-4" />
            </div>

            {/* Founder */}
            <div className="bg-[#161B30] border border-white/10 rounded-2xl p-8 hover:shadow-[0_0_25px_rgba(158,123,255,0.3)] transition transform hover:-translate-y-2">
              <img
                src={Founderimage}
                alt="Andrea Covarrubias"
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
              />
              <h3 className="text-xl font-semibold text-[#C5A3FF] mb-1">
                Andrea V. Covarrubias
              </h3>
              <p className="text-gray-400 mb-3">Founder & Product Owner</p>
              <p className="text-gray-300 text-sm">
                Guiding Gophora’s vision to merge technology with human purpose,
                inspiring global contribution through innovation.
              </p>
              <FaLightbulb className="text-[#9E7BFF] text-3xl mx-auto mt-4" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
