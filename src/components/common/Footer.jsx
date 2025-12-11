import React from "react";
import logo from "../../assets/gophora-plomo-logo.png";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaXTwitter,
  FaTiktok,
} from "react-icons/fa6";

const Footer = () => {
  return (
    <footer className="relative bg-[#0A0F2C] text-white py-16 px-6 md:px-20 overflow-hidden">
      {/* Animated background overlay */}
      <div className="absolute inset-0 space-bg"></div>
      <div className="absolute inset-0 bg-[#050c24]/70 backdrop-blur-sm z-[1]" />

      <div className="relative z-[2] max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* --- Brand & Social --- */}
        <div>
          <div className="cursor-pointer select-none">
            <img src={logo} alt="Gophora Logo" className="h-8 sm:h-20" />
          </div>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">
            Empowering global talent through AI, innovation, and real-world
            contribution. Gophora connects humanity with missions that shape
            the future — from education to space collaboration.
          </p>
          <div className="flex space-x-4">
            <a
              href="https://twitter.com/GophoraNft"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 flex items-center justify-center 
                         bg-[#141A2A] rounded-full 
                         hover:bg-[#6D5DD3] hover:shadow-[0_0_12px_rgba(162,142,255,0.4)] 
                         transition-all duration-300"
            >
              <FaXTwitter className="text-gray-300 text-sm" />
            </a>

            <a
              href="https://www.linkedin.com/company/gophora"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 flex items-center justify-center 
                         bg-[#141A2A] rounded-full 
                         hover:bg-[#6D5DD3] hover:shadow-[0_0_12px_rgba(162,142,255,0.4)] 
                         transition-all duration-300"
            >
              <FaLinkedinIn className="text-gray-300 text-sm" />
            </a>

            <a
              href="https://www.instagram.com/gophoranftcollectibles/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 flex items-center justify-center 
                         bg-[#141A2A] rounded-full 
                         hover:bg-[#6D5DD3] hover:shadow-[0_0_12px_rgba(162,142,255,0.4)] 
                         transition-all duration-300"
            >
              <FaInstagram className="text-gray-300 text-sm" />
            </a>

            <a
              href="https://www.facebook.com/profile.php?id=100091940694658"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 flex items-center justify-center 
                         bg-[#141A2A] rounded-full 
                         hover:bg-[#6D5DD3] hover:shadow-[0_0_12px_rgba(162,142,255,0.4)] 
                         transition-all duration-300"
            >
              <FaFacebookF className="text-gray-300 text-sm" />
            </a>

            <a
              href="https://www.tiktok.com/@gophora"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 flex items-center justify-center 
                         bg-[#141A2A] rounded-full 
                         hover:bg-[#6D5DD3] hover:shadow-[0_0_12px_rgba(162,142,255,0.4)] 
                         transition-all duration-300"
            >
              <FaTiktok className="text-gray-300 text-sm" />
            </a>
          </div>
        </div>

        {/* --- Navigation --- */}
        <div>
          <h3 className="font-semibold mb-4 text-[#A28EFF]">Navigation</h3>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li><a href="/" className="hover:text-[#A28EFF] transition">Home</a></li>
            <li><a href="/explore-missions" className="hover:text-[#A28EFF] transition">Explore Missions</a></li>
            <li><a href="/about" className="hover:text-[#A28EFF] transition">About Us</a></li>
            <li><a href="#" className="hover:text-[#A28EFF] transition">How It Works</a></li>
            <li><a href="#" className="hover:text-[#A28EFF] transition">For Organizations</a></li>
          </ul>
        </div>

        {/* --- Mission Info --- */}
        <div>
          <h3 className="font-semibold mb-4 text-[#A28EFF]">Our Vision</h3>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li>🌍 Innovation → Contribution</li>
            <li>🧠 Ambition → AI-driven human perception</li>
            <li>🚀 Mission → Empower & highlight global talent</li>
            <li>💫 Impact → Enable independence through experience, study & collaboration</li>
          </ul>
        </div>

        {/* --- Contact + Newsletter --- */}
        <div>
          <h3 className="font-semibold mb-4 text-[#A28EFF]">Contact</h3>
          <ul className="space-y-2 text-gray-400 text-sm mb-6">
            <li>📧 contact@gophora.com</li>
            <li>📍 Florida, USA</li>
            <li>🎧 24/7 Support</li>
          </ul>

          <h4 className="text-sm font-semibold mb-2 text-white">Stay Connected</h4>
          <div className="flex">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 px-4 py-2 rounded-l-lg bg-[#141A2A] 
                         text-sm text-white placeholder-gray-400 focus:outline-none"
            />
            <button
              className="bg-[#6D5DD3] hover:bg-[#7E6DF4] 
                         text-white px-4 py-2 rounded-r-lg 
                         text-sm font-medium transition-all duration-300"
            >
              Join
            </button>
          </div>
        </div>
      </div>

      {/* --- Bottom Bar --- */}
      <div className="relative z-[2] mt-12 border-t border-[#1C2236] pt-6 
                      flex flex-col md:flex-row items-center justify-between 
                      text-xs text-gray-500">
        <p>© 2025 GOPHORA INC. All rights reserved.</p>
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          <span className="uppercase text-[10px] tracking-wider text-gray-400">
            Exploring Humanity Through AI
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
