import React, { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { APIURL } from '../../services/api.js'

export default function Profile() {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    organization: "",
    website: "",
    location: "",
  });

  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await fetch(`${APIURL}/user/profile`, { 
          headers: { Authorization: `Bearer ${token}` } 
        });

        if (!response.ok) throw new Error("Failed to fetch profile data");

        const userData = await response.json();

        setProfile({
          name: userData.name || "",
          email: userData.email || "",
          organization: userData.company || "",
          website: userData.website || "",
          location: userData.location || "",
        });
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load profile data!", {
          style: { background: "#0F1326", color: "#fff", border: "1px solid #FF6B6B" },
        });
      }
    };

    fetchProfileData();
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication required", {
          style: { background: "#0F1326", color: "#fff", border: "1px solid #FF6B6B" },
        });
        return;
      }

      const response = await fetch(`${APIURL}/user/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: profile.name,
          company: profile.organization,
          website: profile.website,
          location: profile.location,
        }),
      });

      if (!response.ok) throw new Error("Failed to update profile");

      setEditMode(false);

      toast.success("Profile updated successfully! 🚀", {
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
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile!", {
        style: { background: "#0F1326", color: "#fff", border: "1px solid #FF6B6B" },
      });
    }
  };

  return (
    <div className="text-white">
      {/* Toast provider */}
      <Toaster position="top-right" reverseOrder={false} />

      <h2 className="text-3xl font-semibold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-[#C5A3FF] to-[#9E7BFF] drop-shadow-[0_0_10px_rgba(158,123,255,0.6)]">
        My Profile
      </h2>

      <div className="bg-white/10 backdrop-blur-lg border border-white/10 p-8 rounded-2xl shadow-[0_0_25px_rgba(158,123,255,0.2)] max-w-2xl mx-auto flex flex-col gap-5">
        {/* Name */}
        <label className="font-medium text-[#C5A3FF]">Full Name</label>
        <input
          type="text"
          name="name"
          value={profile.name}
          onChange={handleChange}
          disabled={!editMode}
          className="w-full border border-white/20 p-3 rounded-xl bg-white/5 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#C5A3FF] transition-all duration-200"
        />

        {/* Email */}
        <label className="font-medium text-[#C5A3FF]">Email</label>
        <input
          type="email"
          name="email"
          value={profile.email}
          onChange={handleChange}
          disabled
          className="w-full border border-white/20 p-3 rounded-xl bg-white/5 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#C5A3FF] transition-all duration-200 opacity-70 cursor-not-allowed"
        />

        {/* Organization */}
        <label className="font-medium text-[#C5A3FF]">Organization</label>
        <input
          type="text"
          name="organization"
          value={profile.organization}
          onChange={handleChange}
          disabled={!editMode}
          className="w-full border border-white/20 p-3 rounded-xl bg-white/5 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#C5A3FF] transition-all duration-200"
        />

        {/* Website */}
        <label className="font-medium text-[#C5A3FF]">Website</label>
        <input
          type="url"
          name="website"
          value={profile.website}
          onChange={handleChange}
          disabled={!editMode}
          className="w-full border border-white/20 p-3 rounded-xl bg-white/5 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#C5A3FF] transition-all duration-200"
        />

        {/* Location */}
        <label className="font-medium text-[#C5A3FF]">Location</label>
        <input
          type="text"
          name="location"
          value={profile.location}
          onChange={handleChange}
          disabled={!editMode}
          className="w-full border border-white/20 p-3 rounded-xl bg-white/5 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#C5A3FF] transition-all duration-200"
        />

        {/* Buttons */}
        {!editMode ? (
          <button
            onClick={() => setEditMode(true)}
            className="w-full py-3 bg-gradient-to-r from-[#C5A3FF] to-[#9E7BFF] text-white rounded-xl font-semibold hover:opacity-90 transition-all duration-200"
          >
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-4">
            <button
              onClick={handleSave}
              className="flex-1 py-3 bg-gradient-to-r from-[#C5A3FF] to-[#9E7BFF] text-white rounded-xl font-semibold hover:opacity-90 transition-all duration-200"
            >
              Save Changes
            </button>
            <button
              onClick={() => setEditMode(false)}
              className="flex-1 py-3 bg-white/20 text-white rounded-xl font-semibold hover:bg-white/30 transition-all duration-200"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
