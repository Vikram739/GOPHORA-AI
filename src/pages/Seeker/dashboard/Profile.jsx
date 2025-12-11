import React, { useState, useEffect } from "react";
import api from '../../../services/api';
import { Edit2, Save, X } from 'lucide-react';

export default function Profile() {
  const [data, setData] = useState({
    name: "Loading...",
    headline: "",
    location: "",
    bio: "",
    skills: [],
    languages: [],
  });
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/user/profile');
        const profile = response.data;
        
        const profileData = {
          name: profile.full_name || profile.name || profile.email || "User",
          headline: profile.headline || profile.experience || "",
          location: profile.location || "Not specified",
          bio: profile.bio || "No bio added yet. Update your profile to add a bio!",
          skills: profile.skills || [],
          languages: profile.languages || [],
        };
        setData(profileData);
        setEditData(profileData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile');
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleEdit = () => {
    setEditMode(true);
    setEditData({ ...data });
  };

  const handleCancel = () => {
    setEditMode(false);
    setEditData({ ...data });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/user/profile', {
        full_name: editData.name,
        headline: editData.headline,
        location: editData.location,
        bio: editData.bio,
        skills: editData.skills,
        languages: editData.languages,
      });
      setData({ ...editData });
      setEditMode(false);
      alert('Profile updated successfully!');
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setEditData({ ...editData, [field]: value });
  };

  const handleArrayAdd = (field, value) => {
    if (value.trim()) {
      setEditData({ ...editData, [field]: [...editData[field], value.trim()] });
    }
  };

  const handleArrayRemove = (field, index) => {
    const newArray = editData[field].filter((_, i) => i !== index);
    setEditData({ ...editData, [field]: newArray });
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full p-6 bg-void text-stark flex items-center justify-center">
        <div className="text-xl">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-full p-6 bg-void text-stark flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full p-6 bg-void text-stark">

      {/* Outer Container */}
      <div className="max-w-5xl mx-auto bg-void/70 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-[0_0_35px_rgba(255,0,255,0.15)] space-y-10">

        {/* Edit Button */}
        <div className="flex justify-end gap-2">
          {!editMode ? (
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 px-4 py-2 bg-jewel/80 hover:bg-jewel text-white rounded-xl transition shadow-[0_0_15px_rgba(71,23,246,0.3)]"
            >
              <Edit2 size={18} />
              Edit Profile
            </button>
          ) : (
            <>
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-xl transition"
              >
                <X size={18} />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-fuschia hover:bg-fuschia/90 text-white rounded-xl transition shadow-[0_0_15px_rgba(162,57,202,0.3)] disabled:opacity-50"
              >
                <Save size={18} />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          )}
        </div>

        {/* Header Section */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <label className="text-sm text-stark/70">Name</label>
            {editMode ? (
              <input
                type="text"
                value={editData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="text-4xl font-bold bg-white/5 border border-white/10 rounded-xl p-3 text-stark focus:outline-none focus:border-jewel/50"
              />
            ) : (
              <h2 className="text-4xl font-bold text-stark">{data.name}</h2>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-sm text-stark/70">Headline</label>
            {editMode ? (
              <input
                type="text"
                value={editData.headline}
                onChange={(e) => handleInputChange('headline', e.target.value)}
                placeholder="e.g., Entry Level Developer"
                className="bg-white/5 border border-white/10 rounded-xl p-3 text-fuschia/80 focus:outline-none focus:border-jewel/50"
              />
            ) : (
              <p className="text-fuschia/80">{data.headline}</p>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-sm text-stark/70">Location</label>
            {editMode ? (
              <input
                type="text"
                value={editData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="e.g., New York, USA"
                className="bg-white/5 border border-white/10 rounded-xl p-3 text-stark/70 focus:outline-none focus:border-jewel/50"
              />
            ) : (
              <p className="text-stark/70">{data.location}</p>
            )}
          </div>
        </div>

        {/* Bio */}
        <div>
          <h3 className="text-2xl font-semibold text-jewel mb-4">Bio</h3>
          {editMode ? (
            <textarea
              value={editData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              rows={4}
              className="w-full bg-white/5 p-5 rounded-2xl border border-white/10 text-stark/90 shadow-[0_0_25px_rgba(80,120,255,0.15)] focus:outline-none focus:border-jewel/50"
              placeholder="Tell us about yourself..."
            />
          ) : (
            <div className="bg-white/5 p-5 rounded-2xl border border-white/10 text-stark/90 shadow-[0_0_25px_rgba(80,120,255,0.15)]">
              {data.bio}
            </div>
          )}
        </div>

        {/* Skills */}
        <div>
          <h3 className="text-2xl font-semibold text-jewel mb-4">Skills</h3>
          {editMode && (
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                id="skill-input"
                placeholder="Add a skill (e.g., Python)"
                className="flex-1 bg-white/5 border border-white/10 rounded-xl p-2 text-stark focus:outline-none focus:border-jewel/50"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleArrayAdd('skills', e.target.value);
                    e.target.value = '';
                  }
                }}
              />
              <button
                onClick={() => {
                  const input = document.getElementById('skill-input');
                  handleArrayAdd('skills', input.value);
                  input.value = '';
                }}
                className="px-4 py-2 bg-fuschia/80 hover:bg-fuschia text-white rounded-xl transition"
              >
                Add
              </button>
            </div>
          )}
          <div className="flex flex-wrap gap-3">
            {(editMode ? editData.skills : data.skills).map((skill, i) => (
              <span
                key={i}
                className="px-3 py-1.5 bg-fuschia/20 text-stark rounded-xl border border-fuschia/40 shadow-[0_0_15px_rgba(255,0,255,0.2)] text-sm flex items-center gap-2"
              >
                {skill}
                {editMode && (
                  <button
                    onClick={() => handleArrayRemove('skills', i)}
                    className="text-red-400 hover:text-red-300"
                  >
                    ×
                  </button>
                )}
              </span>
            ))}
          </div>
        </div>

        {/* Languages */}
        <div>
          <h3 className="text-2xl font-semibold text-jewel mb-4">Languages</h3>
          {editMode && (
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                id="language-input"
                placeholder="Add a language (e.g., English)"
                className="flex-1 bg-white/5 border border-white/10 rounded-xl p-2 text-stark focus:outline-none focus:border-jewel/50"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleArrayAdd('languages', e.target.value);
                    e.target.value = '';
                  }
                }}
              />
              <button
                onClick={() => {
                  const input = document.getElementById('language-input');
                  handleArrayAdd('languages', input.value);
                  input.value = '';
                }}
                className="px-4 py-2 bg-jewel/80 hover:bg-jewel text-white rounded-xl transition"
              >
                Add
              </button>
            </div>
          )}
          <div className="flex flex-wrap gap-3">
            {(editMode ? editData.languages : data.languages).map((lang, i) => (
              <span
                key={i}
                className="px-3 py-1.5 bg-jewel/20 text-stark rounded-xl border border-jewel/40 shadow-[0_0_15px_rgba(80,120,255,0.2)] text-sm flex items-center gap-2"
              >
                {lang}
                {editMode && (
                  <button
                    onClick={() => handleArrayRemove('languages', i)}
                    className="text-red-400 hover:text-red-300"
                  >
                    ×
                  </button>
                )}
              </span>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
