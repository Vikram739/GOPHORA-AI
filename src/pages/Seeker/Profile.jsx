import React, { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { APIURL } from '../../services/api.js';

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    name: "",
    headline: "",
    location: "",
    contact: "",
    photo: "https://via.placeholder.com/150",
    bio: "",
    experience: [],
    skills: [],
    languages: [],
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${APIURL}/user/profile`, { 
          headers: { Authorization: `Bearer ${token}` } 
        });

        if (!response.ok) throw new Error("Failed to fetch profile data");

        const userData = await response.json();

        setData({
          name: userData.name || "John Doe",
          headline: userData.headline || "Job Seeker",
          location: userData.location || "Location not set",
          contact: userData.email || "",
          photo: userData.photo || "https://via.placeholder.com/150",
          bio: userData.bio || "No bio available",
          experience: userData.experience || [],
          skills: userData.skills || [],
          languages: userData.languages || ["English"],
        });
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load profile data!", {
          style: { background: "#0F1326", color: "#fff", border: "1px solid #FF6B6B" },
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen w-full p-6 bg-void text-stark flex items-center justify-center">
        <div className="text-fuschia text-xl">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full p-6 bg-void text-stark">
      <Toaster position="top-right" reverseOrder={false} />

      {/* Outer Container */}
      <div className="max-w-5xl mx-auto bg-void/70 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-[0_0_35px_rgba(255,0,255,0.15)] space-y-10">

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <img
            src={data.photo}
            alt="Profile"
            className="w-36 h-36 rounded-3xl border-2 border-fuschia/40 shadow-[0_0_20px_rgba(255,0,255,0.35)] object-cover"
          />

          <div className="flex flex-col gap-1">
            <h2 className="text-4xl font-bold text-stark">{data.name}</h2>
            <p className="text-fuschia/80">{data.headline}</p>
            <p className="text-stark/70">{data.location}</p>
            <p className="text-stark/70">{data.contact}</p>
          </div>
        </div>

        {/* Bio */}
        <div className="bg-white/5 p-5 rounded-2xl border border-white/10 text-stark/90 shadow-[0_0_25px_rgba(80,120,255,0.15)]">
          {data.bio}
        </div>

        {/* Experience */}
        {data.experience.length > 0 && (
          <div>
            <h3 className="text-2xl font-semibold text-jewel mb-4">Experience</h3>
            <div className="space-y-4">
              {data.experience.map((exp, idx) => (
                <div
                  key={idx}
                  className="bg-white/5 border border-white/10 p-5 rounded-2xl text-stark shadow-[0_0_20px_rgba(255,0,255,0.15)]"
                >
                  <p className="text-lg font-medium text-fuschia">
                    {exp.role}
                  </p>
                  <p className="text-stark/80">{exp.organization}</p>
                  <p className="text-stark/70 mt-1">{exp.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {data.skills.length > 0 && (
          <div>
            <h3 className="text-2xl font-semibold text-jewel mb-4">Skills</h3>
            <div className="flex flex-wrap gap-3">
              {data.skills.map((skill, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 bg-fuschia/20 text-stark rounded-xl border border-fuschia/40 shadow-[0_0_15px_rgba(255,0,255,0.2)] text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Languages */}
        {data.languages.length > 0 && (
          <div>
            <h3 className="text-2xl font-semibold text-jewel mb-4">Languages</h3>
            <div className="flex flex-wrap gap-3">
              {data.languages.map((lang, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 bg-jewel/20 text-stark rounded-xl border border-jewel/40 shadow-[0_0_15px_rgba(80,120,255,0.2)] text-sm"
                >
                  {lang}
                </span>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
