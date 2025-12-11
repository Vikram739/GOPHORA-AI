import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { APIURL } from '../../services/api.js'

export default function RegisterForm({ role, setRole }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    country: "",
    state: "",
    city: "",
    skills: "",
    organizationName: "",
    website: "",
  });

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // ✅ Fetch countries on mount
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await fetch("https://countriesnow.space/api/v0.1/countries/states");
        if (!res.ok) throw new Error("Failed to fetch countries.");
        const data = await res.json();
        if (data.data) {
          setCountries(data.data);
        }
      } catch (err) {
        console.error("Error fetching countries:", err);
        setError("Unable to load countries. Please refresh.");
      }
    };
    fetchCountries();
  }, []);

  // ✅ Update states when a country is selected
  useEffect(() => {
    if (!formData.country) {
      setStates([]);
      return;
    }
    setLoadingStates(true);
    const selectedCountry = countries.find(
      (c) => c.name === formData.country
    );
    if (selectedCountry && selectedCountry.states) {
      setStates(selectedCountry.states);
    } else {
      setStates([]);
    }
    setLoadingStates(false);
  }, [formData.country, countries]);

  // ✅ Update cities when a state is selected
  useEffect(() => {
    if (!formData.state || !formData.country) {
      setCities([]);
      return;
    }
    
    const fetchCities = async () => {
      setLoadingCities(true);
      try {
        const res = await fetch("https://countriesnow.space/api/v0.1/countries/state/cities", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            country: formData.country,
            state: formData.state,
          }),
        });
        const data = await res.json();
        if (data.data) {
          setCities(data.data.sort());
        } else {
          setCities([]);
        }
      } catch (err) {
        console.error("Error fetching cities:", err);
        setCities([]);
      } finally {
        setLoadingCities(false);
      }
    };
    
    fetchCities();
  }, [formData.state, formData.country]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Safe, production-grade submission with error handling
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Assuming you have a state like: const [error, setError] = useState("");
    setLoading(true); // Assuming you have a state like: const [loading, setLoading] = useState(false);

    // This payload object is the most important part.
    // The keys (e.g., fullName, organizationName) must match exactly what your
    // frontend form state uses, and the final keys sent in the body
    // must match the backend's 'RegisterRequest' schema.
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    const payload = {
      email: formData.email,
      password: formData.password,
      full_name: formData.name,
      skills: formData.skills ? formData.skills.split(',').map(s => s.trim()) : [],
      interests: [],
      experience: "Entry Level"
    };

    try {
      const response = await fetch(`${APIURL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Registration failed. Please try again.");
      }

      const result = await response.json();
      console.log('Registration successful:', result);
      
      // Navigate to login page
      navigate('/login');

    } catch (err) {
      // Set the error message to display it in the UI
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-lg text-center">
          {error}
        </div>
      )}

      {/* Common Fields */}
      {["name", "email", "password", "confirmPassword"].map((field) => (
        <input
          key={field}
          type={
            field === "password" || field === "confirmPassword"
              ? "password"
              : field === "email"
              ? "email"
              : "text"
          }
          name={field}
          value={formData[field]}
          onChange={handleChange}
          placeholder={
            field === "confirmPassword"
              ? "Confirm Password"
              : field.charAt(0).toUpperCase() + field.slice(1)
          }
          required
          className="bg-white/5 border border-white/10 text-white placeholder-gray-400 
                     p-3 rounded-xl focus:outline-none focus:ring-2 
                     focus:ring-[#9E7BFF] transition-all duration-300"
        />
      ))}

      {/* Country Dropdown */}
      <select
        name="country"
        value={formData.country}
        onChange={(e) =>
          setFormData({ ...formData, country: e.target.value, state: "", city: "" })
        }
        required
        className="bg-white/5 border border-white/10 text-white 
                   p-3 rounded-xl focus:outline-none focus:ring-2 
                   focus:ring-[#9E7BFF] transition-all duration-300
                   [&>option]:bg-gray-800 [&>option]:text-white"
      >
        <option value="" className="bg-gray-800 text-white">Select Country</option>
        {countries.map((country, index) => (
          <option key={`${country.name}-${index}`} value={country.name} className="bg-gray-800 text-white">
            {country.name}
          </option>
        ))}
      </select>

      {/* State Dropdown */}
      <select
        name="state"
        value={formData.state}
        onChange={(e) =>
          setFormData({ ...formData, state: e.target.value, city: "" })
        }
        required
        disabled={!formData.country || loadingStates}
        className="bg-white/5 border border-white/10 text-white 
                   p-3 rounded-xl focus:outline-none focus:ring-2 
                   focus:ring-[#9E7BFF] transition-all duration-300 disabled:opacity-50
                   [&>option]:bg-gray-800 [&>option]:text-white"
      >
        <option value="" className="bg-gray-800 text-white">
          {loadingStates
            ? "Loading states..."
            : formData.country
            ? "Select State"
            : "Select Country first"}
        </option>
        {states.map((state, index) => (
          <option key={`${state.name}-${index}`} value={state.name} className="bg-gray-800 text-white">
            {state.name}
          </option>
        ))}
      </select>

      {/* City Dropdown */}
      <select
        name="city"
        value={formData.city}
        onChange={handleChange}
        required
        disabled={!formData.state || loadingCities}
        className="bg-white/5 border border-white/10 text-white 
                   p-3 rounded-xl focus:outline-none focus:ring-2 
                   focus:ring-[#9E7BFF] transition-all duration-300 disabled:opacity-50
                   [&>option]:bg-gray-800 [&>option]:text-white"
      >
        <option value="" className="bg-gray-800 text-white">
          {loadingCities
            ? "Loading cities..."
            : formData.state
            ? "Select City"
            : "Select State first"}
        </option>
        {cities.map((city, index) => (
          <option key={`${city}-${index}`} value={city} className="bg-gray-800 text-white">
            {city}
          </option>
        ))}
      </select>

      {/* Conditional Fields */}
      {role === "seeker" && (
        <textarea
          name="skills"
          value={formData.skills}
          onChange={handleChange}
          placeholder="List your key skills (e.g. React, Python, UI Design)"
          rows="3"
          className="bg-white/5 border border-white/10 text-white placeholder-gray-400 
                     p-3 rounded-xl focus:outline-none focus:ring-2 
                     focus:ring-[#9E7BFF] transition-all duration-300"
        />
      )}

      {role === "provider" && (
        <>
          <input
            type="text"
            name="organizationName"
            value={formData.organizationName}
            onChange={handleChange}
            placeholder="Organization / Company Name"
            required
            className="bg-white/5 border border-white/10 text-white placeholder-gray-400 
                       p-3 rounded-xl focus:outline-none focus:ring-2 
                       focus:ring-[#9E7BFF] transition-all duration-300"
          />
          <input
            type="url"
            name="website"
            value={formData.website}
            onChange={handleChange}
            placeholder="Website or LinkedIn (optional)"
            className="bg-white/5 border border-white/10 text-white placeholder-gray-400 
                       p-3 rounded-xl focus:outline-none focus:ring-2 
                       focus:ring-[#9E7BFF] transition-all duration-300"
          />
        </>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className={`w-full py-3 rounded-xl font-semibold text-white tracking-wide
                   bg-gradient-to-r from-[#7F4DFF] to-[#9E7BFF]
                   hover:shadow-[0_0_30px_rgba(158,123,255,0.6)]
                   transition-all duration-300 ${
                     loading ? "opacity-60 cursor-not-allowed" : ""
                   }`}
      >
        {loading
          ? "Registering..."
          : `Register as ${
              role === "seeker" ? "Opportunity Seeker" : "Provider"
            }`}
      </button>

      {/* Back Button */}
      <button
        type="button"
        onClick={() => setRole("")}
        className="mt-3 text-sm text-gray-400 hover:text-gray-200 transition"
      >
        ← Go back
      </button>
    </form>
  );
}
