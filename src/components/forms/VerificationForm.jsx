import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { APIURL } from '../../services/api.js'

export default function VerificationForm() {
  const navigate = useNavigate();
  const [providerType, setProviderType] = useState("professional");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    provider_name: "",
    email: "",
    website_url: "",
    domain_age: "",
    social_profiles: [{ platform: "linkedin", url: "" }],
    portfolio_url: "",
    video_intro_url: "",
    user_description: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSocialChange = (index, e) => {
    const updatedSocials = formData.social_profiles.map((social, i) =>
      i === index ? { ...social, [e.target.name]: e.target.value } : social
    );
    setFormData({ ...formData, social_profiles: updatedSocials });
  };

  const addSocialField = () => {
    setFormData({
      ...formData,
      social_profiles: [
        ...formData.social_profiles,
        { platform: "linkedin", url: "" },
      ],
    });
  };

  const removeSocialField = (index) => {
    const updatedSocials = formData.social_profiles.filter(
      (_, i) => i !== index
    );
    setFormData({ ...formData, social_profiles: updatedSocials });
  };

  // In VerificationForm.jsx

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // 1. Get the token from localStorage
    const token = localStorage.getItem("token");

    // 2. Check if the user is logged in
    if (!token) {
      setError("Not authenticated. Please log in again.");
      setLoading(false);
      return;
    }

    const payload = {
      provider_type: providerType,
      provider_name: formData.provider_name,
      email: formData.email,
      website_url: formData.website_url,
      // --- UPDATE THIS LINE ---
      domain_age: formData.domain_age ? parseInt(formData.domain_age, 10) : null,
      // --- END UPDATE ---
      social_profiles: formData.social_profiles,
      portfolio_url: formData.portfolio_url,
      video_intro_url: formData.video_intro_url,
      user_description: formData.user_description,
    };

    try {
      const response = await fetch(`${APIURL}/api/verification/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // 3. Add the Authorization header
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json();
        // Handle both 401 and other errors
        if (response.status === 401) {
            throw new Error("Your session has expired. Please log out and log in again.");
        }
        throw new Error(errData.detail || "Verification failed");
      }

      const verificationResult = await response.json();
      setResult(verificationResult);

      localStorage.setItem("trust_score", verificationResult.trust_score);
      localStorage.setItem("provider_level", providerType);
      window.dispatchEvent(new Event("verification-updated"));

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 text-white bg-gradient-to-b from-[#1E1B2E] to-[#0E0C18]">
      <div className="max-w-3xl mx-auto bg-white/10 backdrop-blur-lg border border-white/10 rounded-2xl p-8 shadow-[0_0_25px_rgba(158,123,255,0.3)]">
        <h2 className="text-3xl font-semibold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-[#C5A3FF] to-[#9E7BFF]">
          Provider Verification 🔍
        </h2>
        <p className="text-gray-300 mb-8">
          Complete your verification to unlock trust and visibility on GOPHORA.
        </p>

        {/* Show Gemini Result */}
        {result ? (
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-3 text-green-400">
              Verification Complete ✅
            </h3>
            <p className="text-lg mb-2 text-white">
              Trust Score: {result.trust_score} / 100
            </p>
            <p className="text-gray-300 mb-2">Reason: {result.reason}</p>
            <p className="text-sm text-[#C5A3FF] mb-4 italic">
              Verified by Gemini AI System
            </p>

            {/* Improvement Suggestions */}
            {result.trust_score < 85 && (
              <div className="bg-white/10 border border-white/20 rounded-xl p-4 text-left max-w-md mx-auto mb-6">
                <p className="text-[#C5A3FF] font-semibold mb-1">
                  💡 How to improve your verification:
                </p>
                <ul className="text-gray-300 text-sm list-disc list-inside space-y-1">
                  {providerType === "institutional" && (
                    <>
                      <li>
                        Add complete “About Us” and “Contact” pages on your
                        website.
                      </li>
                      <li>Use a corporate email (e.g., info@yourdomain.com).</li>
                    </>
                  )}
                  {providerType === "professional" && (
                    <>
                      <li>
                        Connect more active social profiles (LinkedIn, Instagram).
                      </li>
                      <li>
                        Increase posting consistency and engagement rate.
                      </li>
                    </>
                  )}
                  {providerType === "new_talent" && (
                    <>
                      <li>
                        Upload a clear introduction video (30–60 seconds).
                      </li>
                      <li>
                        Ask early users for positive reviews to raise your
                        score.
                      </li>
                    </>
                  )}
                </ul>
              </div>
            )}

            <div className="flex justify-center gap-4">
              <button
                onClick={() => setResult(null)}
                className="bg-[#6B5ACD] px-6 py-2 rounded-lg font-semibold hover:bg-[#5948b6]"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate("/provider/dashboard")}
                className="bg-[#9E7BFF] px-6 py-2 rounded-lg font-semibold hover:bg-[#8258ff]"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        ) : (
          // Verification Form
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Provider Type */}
            <div>
              <label className="block text-sm mb-2 text-gray-300">
                Provider Type
              </label>
              <select
                name="provider_type"
                value={providerType}
                onChange={(e) => setProviderType(e.target.value)}
                className="w-full p-3 bg-[#2B2540] text-white border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9E7BFF]"
              >
                <option value="institutional">
                  Institutional (Company / Organization)
                </option>
                <option value="professional">
                  Professional / Freelancer
                </option>
                <option value="new_talent">New Talent / Explorer</option>
              </select>
            </div>

            {/* Common Fields */}
            <div>
              <label className="block text-sm mb-2 text-gray-300">
                Provider Name
              </label>
              <input
                type="text"
                name="provider_name"
                value={formData.provider_name}
                onChange={handleChange}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-2 text-gray-300">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
                required
              />
            </div>

            {/* Institutional Fields */}
            {providerType === "institutional" && (
              <>
                <div>
                  <label className="block text-sm mb-2 text-gray-300">
                    Website URL
                  </label>
                  <input
                    type="url"
                    name="website_url"
                    value={formData.website_url}
                    onChange={handleChange}
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2 text-gray-300">
                    Domain Age (years)
                  </label>
                  <input
                    type="number"
                    name="domain_age"
                    value={formData.domain_age}
                    onChange={handleChange}
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
                  />
                </div>
              </>
            )}

            {/* Professional / Freelancer Fields */}
            {providerType === "professional" && (
              <>
                <div>
                  <label className="block text-sm mb-2 text-gray-300">
                    Social Profiles
                  </label>
                  {formData.social_profiles.map((social, index) => (
                    <div key={index} className="flex items-center gap-2 mb-2">
                      <select
                        name="platform"
                        value={social.platform}
                        onChange={(e) => handleSocialChange(index, e)}
                        className="p-3 bg-white/10 border border-white/20 rounded-lg text-white"
                      >
                        <option className="bg-[#2B2540]" value="linkedin">LinkedIn</option>
                        <option className="bg-[#2B2540]" value="instagram">Instagram</option>
                        <option className="bg-[#2B2540]" value="behance">Behance</option>
                        <option className="bg-[#2B2540]" value="github">GitHub</option>
                        <option className="bg-[#2B2540]" value="other">Other</option>
                      </select>
                      <input
                        type="url"
                        name="url"
                        value={social.url}
                        onChange={(e) => handleSocialChange(index, e)}
                        placeholder="https://linkedin.com/in/your-profile"
                        className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
                      />
                      <button
                        type="button"
                        onClick={() => removeSocialField(index)}
                        className="p-3 bg-red-500/20 text-red-400 rounded-lg"
                      >
                        X
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addSocialField}
                    className="text-[#C5A3FF] font-semibold"
                  >
                    + Add another profile
                  </button>
                </div>
                <div>
                  <label className="block text-sm mb-2 text-gray-300">
                    Portfolio / Website (optional)
                  </label>
                  <input
                    type="url"
                    name="portfolio_url"
                    value={formData.portfolio_url}
                    onChange={handleChange}
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
                  />
                </div>
              </>
            )}

            {/* New Talent / Explorer Fields */}
            {providerType === "new_talent" && (
              <>
                <div>
                  <label className="block text-sm mb-2 text-gray-300">
                    Video Introduction URL
                  </label>
                  <input
                    type="url"
                    name="video_intro_url"
                    value={formData.video_intro_url}
                    onChange={handleChange}
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
                  />
                </div>
              </>
            )}

            {/* Description */}
            <div>
              <label className="block text-sm mb-2 text-gray-300">
                Description / Bio
              </label>
              <textarea
                name="user_description"
                value={formData.user_description}
                onChange={handleChange}
                rows={3}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="bg-[#9E7BFF] w-full py-3 rounded-lg font-semibold hover:bg-[#8258ff] disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Submit for Verification"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
