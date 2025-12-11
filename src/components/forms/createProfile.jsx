import React, { useState } from "react";

export default function CreateResumeForm({ onFinish }) {
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    name: "",
    headline: "",
    location: "",
    contact: "",
    photo: "",
    experience: [{ role: "", organization: "", description: "" }],
    skills: [],
    bio: "",
    languages: [],
  });

  const next = () => setStep(step + 1);
  const prev = () => setStep(step - 1);
  const update = (field, value) => setFormData({ ...formData, [field]: value });

  const handleSubmit = () => {
    onFinish(formData);
  };

  return (
    <div className="min-h-screen flex justify-center p-6 bg-[#050A1A]">
      <div
        className="
        w-full max-w-4xl 
        bg-[#0D1224]/80 
        backdrop-blur-xl 
        shadow-[0_0_30px_rgba(158,123,255,0.2)] 
        border border-white/10 
        rounded-2xl 
        p-8 
        animate-fadeIn
      "
      >
        {/* HEADING */}
        <h1 className="text-4xl font-bold mb-10 text-center 
          text-transparent bg-clip-text 
          bg-gradient-to-r from-[#C5A3FF] to-[#8F6AFF] 
          drop-shadow-[0_0_12px_rgba(158,123,255,0.8)]
        ">
          Create Your Resume
        </h1>

        {/* PROGRESS INDICATOR */}
        <div className="flex justify-between mb-10">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className={`
                w-1/3 h-2 mx-1 rounded-xl transition-all duration-500
                ${step >= n ? "bg-gradient-to-r from-[#C5A3FF] to-[#8F6AFF]" : "bg-white/10"}
              `}
            ></div>
          ))}
        </div>

        {/* ================= STEP 1 ================= */}
        {step === 1 && (
          <div className="flex flex-col gap-5 animate-slideUp">
            <FieldInput
              placeholder="Full Name"
              value={formData.name}
              onChange={(e) => update("name", e.target.value)}
            />
            <FieldInput
              placeholder="Headline (e.g. Frontend Developer)"
              value={formData.headline}
              onChange={(e) => update("headline", e.target.value)}
            />
            <FieldInput
              placeholder="Location"
              value={formData.location}
              onChange={(e) => update("location", e.target.value)}
            />
            <FieldInput
              placeholder="Contact Details"
              value={formData.contact}
              onChange={(e) => update("contact", e.target.value)}
            />
            <FieldInput
              placeholder="Profile Photo URL"
              type="url"
              value={formData.photo}
              onChange={(e) => update("photo", e.target.value)}
            />

            <PrimaryButton text="Next" onClick={next} />
          </div>
        )}

        {/* ================= STEP 2 ================= */}
        {step === 2 && (
          <div className="flex flex-col gap-5 animate-slideUp">
            <TextArea
              placeholder="Short Bio"
              value={formData.bio}
              onChange={(e) => update("bio", e.target.value)}
            />

            <FieldInput
              placeholder="Skills (comma separated)"
              value={formData.skills.join(", ")}
              onChange={(e) =>
                update(
                  "skills",
                  e.target.value.split(",").map((s) => s.trim())
                )
              }
            />

            <FieldInput
              placeholder="Languages (comma separated)"
              value={formData.languages.join(", ")}
              onChange={(e) =>
                update(
                  "languages",
                  e.target.value.split(",").map((s) => s.trim())
                )
              }
            />

            <div className="flex gap-3 mt-4">
              <SecondaryButton text="Back" onClick={prev} />
              <PrimaryButton text="Next" onClick={next} />
            </div>
          </div>
        )}

        {/* ================= STEP 3 ================= */}
        {step === 3 && (
          <div className="flex flex-col gap-5 animate-slideUp">
            {formData.experience.map((exp, idx) => (
              <div
                key={idx}
                className="
                  bg-[#161B30]/50 
                  p-4 
                  border border-white/10 
                  rounded-xl 
                  shadow-[0_0_15px_rgba(255,255,255,0.03)]
                "
              >
                <FieldInput
                  placeholder="Role"
                  value={exp.role}
                  onChange={(e) => {
                    const updated = [...formData.experience];
                    updated[idx].role = e.target.value;
                    update("experience", updated);
                  }}
                />

                <FieldInput
                  placeholder="Organization"
                  value={exp.organization}
                  onChange={(e) => {
                    const updated = [...formData.experience];
                    updated[idx].organization = e.target.value;
                    update("experience", updated);
                  }}
                />

                <TextArea
                  placeholder="Description"
                  value={exp.description}
                  onChange={(e) => {
                    const updated = [...formData.experience];
                    updated[idx].description = e.target.value;
                    update("experience", updated);
                  }}
                />
              </div>
            ))}

            <button
              onClick={() =>
                update("experience", [
                  ...formData.experience,
                  { role: "", organization: "", description: "" },
                ])
              }
              className="text-[#C5A3FF] underline text-center hover:text-[#E2C3FF] transition"
            >
              + Add Experience
            </button>

            <div className="flex gap-3 mt-4">
              <SecondaryButton text="Back" onClick={prev} />
              <PrimaryButton text="Preview Resume" onClick={handleSubmit} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------
    REUSABLE COMPONENTS (GOPHORA THEME)
-------------------------------------------*/

function FieldInput({ placeholder, value, onChange, type = "text" }) {
  return (
    <input
      type={type}
      className="
        w-full p-3
        bg-[#0F162C]
        border border-white/10
        rounded-xl
        text-white placeholder-gray-400 
        focus:outline-none 
        focus:ring-2 focus:ring-[#C5A3FF]
        transition-all
      "
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
  );
}

function TextArea({ placeholder, value, onChange }) {
  return (
    <textarea
      className="
        w-full p-3
        bg-[#0F162C]
        border border-white/10 
        rounded-xl
        text-white placeholder-gray-300
        focus:outline-none 
        focus:ring-2 focus:ring-[#C5A3FF]
        transition-all
      "
      rows={4}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
  );
}

function PrimaryButton({ text, onClick }) {
  return (
    <button
      onClick={onClick}
      className="
        w-full py-3 font-semibold 
        rounded-xl 
        text-white 
        bg-gradient-to-r from-[#C5A3FF] to-[#8F6AFF]
        shadow-[0_0_20px_rgba(158,123,255,0.4)]
        hover:shadow-[0_0_25px_rgba(158,123,255,0.7)]
        transition-all
      "
    >
      {text}
    </button>
  );
}

function SecondaryButton({ text, onClick }) {
  return (
    <button
      onClick={onClick}
      className="
        w-full py-3 
        rounded-xl 
        bg-white/10 
        text-white 
        border border-white/20
        hover:bg-white/20
        transition
      "
    >
      {text}
    </button>
  );
}
