import React, { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export default function OpportunityForm({ onSubmit, initialData = {} }) {
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [errorCities, setErrorCities] = useState(null);

  const [formData, setFormData] = useState({
    title: initialData.title || "",
    type: initialData.type || "job",
    description: initialData.description || "",
    workMode: initialData.workMode || "remote",
    country: initialData.country || "",
    city: initialData.city || "",
    lat: initialData.lat || null,
    lng: initialData.lng || null,
    tags: initialData.tags || "",
  });

  // Fetch countries once
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await fetch("https://countriesnow.space/api/v0.1/countries");
        if (!res.ok) throw new Error("Failed to fetch countries");
        const data = await res.json();
        const countryList = data.data.map((c) => ({
          name: c.country,
          cities: c.cities,
        }));
        setCountries(countryList);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCountries();
  }, []);

  // Update cities when country changes
  useEffect(() => {
    if (!formData.country) {
      setCities([]);
      return;
    }
    const countryObj = countries.find((c) => c.name === formData.country);
    if (countryObj) {
      setCities(countryObj.cities.map((cityName) => ({ name: cityName })));
    }
  }, [formData.country, countries]);

  // Geocode location when city or country changes
  useEffect(() => {
    if (formData.city && formData.country) {
      const location = `${formData.city}, ${formData.country}`;
      const apiKey = import.meta.env.GEOAPIFY_API_KEY;
      if (!apiKey) {
        console.error("Geoapify API key not found.");
        return;
      }
      fetch(`https://api.geoapify.com/v1/geocode/search?text=${location}&apiKey=${apiKey}`)
        .then(response => response.json())
        .then(data => {
          if (data.features.length > 0) {
            const { lat, lon } = data.features[0].properties;
            setFormData(prev => ({ ...prev, lat, lng: lon }));
          }
        })
        .catch(error => console.error('Error fetching geocoding data:', error));
    }
  }, [formData.city, formData.country]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCityChange = (e) => {
    const cityName = e.target.value;
    setFormData((prev) => ({ ...prev, city: cityName }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.workMode === "onsite" && (!formData.country || !formData.city)) {
      alert("Please select a valid country and city!");
      return;
    }
    onSubmit(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 bg-white/10 backdrop-blur-lg border border-white/10 p-8 rounded-2xl shadow-[0_0_25px_rgba(158,123,255,0.2)] max-w-2xl mx-auto"
    >
      <h3 className="text-2xl font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[#C5A3FF] to-[#9E7BFF] drop-shadow-[0_0_10px_rgba(158,123,255,0.6)]">
        Post a New Opportunity
      </h3>

      <input
        type="text"
        name="title"
        value={formData.title}
        onChange={handleChange}
        placeholder="Opportunity Title"
        required
        className="border border-white/20 p-3 rounded-xl bg-[#161B30] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C5A3FF]"
      />

      <div className="relative">
        <select
          name="type"
          value={formData.type}
          onChange={handleChange}
          className="border border-white/20 p-3 pr-10 rounded-xl bg-[#161B30] text-white w-full appearance-none focus:outline-none focus:ring-2 focus:ring-[#C5A3FF]"
        >
          <option value="job">Job</option>
          <option value="internship">Internship</option>
          <option value="hackathon">Hackathon</option>
          <option value="project">Project</option>
          <option value="collaboration">Collaboration</option>
          <option value="education">Education</option>
          <option value="hobby">Hobby</option>
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#C5A3FF]" size={18} />
      </div>

      <div className="relative">
        <select
          name="workMode"
          value={formData.workMode}
          onChange={handleChange}
          className="border border-white/20 p-3 pr-10 rounded-xl bg-[#161B30] text-white w-full appearance-none focus:outline-none focus:ring-2 focus:ring-[#C5A3FF]"
        >
          <option value="remote">Remote</option>
          <option value="onsite">Onsite</option>
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#C5A3FF]" size={18} />
      </div>

      <textarea
        name="description"
        value={formData.description}
        onChange={handleChange}
        placeholder="Description"
        rows="5"
        required
        className="border border-white/20 p-3 rounded-xl bg-[#161B30] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C5A3FF]"
      />

      {formData.workMode === "onsite" && (
        <>
          <div className="relative">
            <select
              name="country"
              value={formData.country}
              onChange={handleChange}
              required
              className="border border-white/20 p-3 pr-10 rounded-xl bg-[#161B30] text-white w-full appearance-none focus:outline-none focus:ring-2 focus:ring-[#C5A3FF]"
            >
              <option value="">Select Country</option>
              {countries.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#C5A3FF]" size={18} />
          </div>

          <div className="relative">
            <select
              name="city"
              value={formData.city}
              onChange={handleCityChange}
              required
              className="border border-white/20 p-3 pr-10 rounded-xl bg-[#161B30] text-white w-full appearance-none focus:outline-none focus:ring-2 focus:ring-[#C5A3FF]"
            >
              <option value="">Select City</option>
              {cities.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#C5A3FF]" size={18} />
          </div>
        </>
      )}

      <input
        type="text"
        name="tags"
        value={formData.tags}
        onChange={handleChange}
        placeholder="Tags / Skills (comma separated)"
        className="border border-white/20 p-3 rounded-xl bg-[#161B30] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C5A3FF]"
      />

      <button
        type="submit"
        className="w-full py-3 bg-gradient-to-r from-[#C5A3FF] to-[#9E7BFF] text-white rounded-xl font-semibold hover:opacity-90"
      >
        Post Opportunity
      </button>
    </form>
  );
}
