import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import axios from 'axios';
import api from '../../../services/api';
import "leaflet/dist/leaflet.css";
import "./OpportunitiesMap.css"; // Custom styles for popup

// Create glowing marker icons
const createGlowingIcon = (color) =>
  L.divIcon({
    html: `<span class="w-5 h-5 block rounded-full" style="background-color:${color}; box-shadow: 0 0 12px ${color};"></span>`,
    className: "",
    iconSize: [20, 20],
  });

// Random coordinates for demo (you can replace with real geocoding)
const getRandomCoords = () => {
  const cities = [
    { lat: 40.7128, lng: -74.006 },   // New York
    { lat: 34.0522, lng: -118.2437 }, // Los Angeles
    { lat: 37.7749, lng: -122.4194 }, // San Francisco
    { lat: 41.8781, lng: -87.6298 },  // Chicago
    { lat: 29.7604, lng: -95.3698 },  // Houston
    { lat: 25.7617, lng: -80.1918 },  // Miami
    { lat: 47.6062, lng: -122.3321 }, // Seattle
    { lat: 42.3601, lng: -71.0589 },  // Boston
  ];
  return cities[Math.floor(Math.random() * cities.length)];
};

export default function OpportunitiesMap() {
  const [personalizedJobs, setPersonalizedJobs] = useState([]);
  const [generalJobs, setGeneralJobs] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      let personalizedData = [];
      let generalData = [];

      // Fetch personalized jobs (requires auth)
      try {
        const personalizedResponse = await api.get('/jobs/personalized?limit=20');
        personalizedData = personalizedResponse.data.jobs || [];
      } catch (err) {
        console.log('Could not fetch personalized jobs (user may not be logged in)');
      }
      
      // Fetch general jobs (no auth required) - direct API call
      try {
        const generalResponse = await axios.get('http://localhost:8000/jobs/general?limit=50');
        generalData = generalResponse.data.jobs || [];
        console.log('Fetched general jobs:', generalData.length);
      } catch (err) {
        console.error('Error fetching general jobs:', err);
      }

      // Add coordinates to jobs
      const personalizedWithCoords = personalizedData.map(job => ({
        ...job,
        coords: getRandomCoords(),
        type: 'personalized'
      }));

      const generalWithCoords = generalData.map(job => ({
        ...job,
        coords: getRandomCoords(),
        type: 'general'
      }));

      setPersonalizedJobs(personalizedWithCoords);
      setGeneralJobs(generalWithCoords);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setLoading(false);
    }
  };

  // Get unique categories
  const allJobs = [...personalizedJobs, ...generalJobs];
  const categories = ["All", ...new Set(allJobs.map(j => j.category).filter(Boolean))];
  
  // Filter jobs
  const filteredJobs = filter === "All" 
    ? allJobs 
    : allJobs.filter((j) => j.category === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-stark">
        <div className="text-xl">Loading opportunities...</div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 text-stark">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold drop-shadow-md">Opportunities Map 🗺️</h1>
        <p className="text-stark/70 text-sm md:text-base">
          Explore missions in real-time across your area.
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`py-2 px-4 rounded-xl font-medium text-sm ${
              filter === cat
                ? "bg-jewel/80 text-stark shadow-[0_0_12px_rgba(71,23,246,0.25)]"
                : "bg-[#0E0B16]/50 text-stark/70 hover:bg-[#0E0B16]/70 transition"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Map Container */}
      <div className="w-full h-[70vh] rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_12px_rgba(71,23,246,0.15)]">
        <MapContainer center={[37.7749, -122.4194]} zoom={4} scrollWheelZoom={true} className="w-full h-full">
          {/* Gophora themed dark map */}
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
          />

          {/* Markers */}
          {filteredJobs.map((job, index) => {
            // Blue for general/temp jobs, Purple for personalized
            const markerColor = job.type === 'general' ? '#4717F6' : '#A239CA';
            
            return (
              <Marker
                key={`${job.type}-${job.jobId || job.id || index}`}
                position={[job.coords.lat, job.coords.lng]}
                icon={createGlowingIcon(markerColor)}
              >
                <Popup className="custom-popup">
                  <div className="bg-[#0E0B16] border border-white/10 rounded-xl p-4 min-w-[250px] text-stark">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h2 className="font-semibold text-lg text-fuschia">{job.jobTitle}</h2>
                        {job.type === 'general' && (
                          <span className="px-2 py-1 bg-jewel/20 text-jewel text-xs rounded-lg border border-jewel/40">
                            Temp Job
                          </span>
                        )}
                      </div>
                      
                      <div className="space-y-1 text-sm">
                        <p className="text-stark/90"><span className="text-stark/60">Company:</span> {job.company || job.source || 'N/A'}</p>
                        <p className="text-stark/90"><span className="text-stark/60">Location:</span> {job.location || 'Remote'}</p>
                        <p className="text-stark/90"><span className="text-stark/60">Category:</span> {job.category || 'General'}</p>
                        {job.salary && (
                          <p className="text-stark/90"><span className="text-stark/60">Salary:</span> {job.salary}</p>
                        )}
                        {job.estimatedPay && (
                          <p className="text-stark/90"><span className="text-stark/60">Pay:</span> {job.estimatedPay}</p>
                        )}
                        {job.aiValidationScore && (
                          <p className="text-stark/90"><span className="text-stark/60">Match Score:</span> {job.aiValidationScore}%</p>
                        )}
                      </div>

                      {job.description && (
                        <p className="text-stark/70 text-xs mt-2 line-clamp-2">{job.description}</p>
                      )}
                      
                      <button
                        onClick={() => {
                          if (job.sourceLink) {
                            window.open(job.sourceLink, '_blank');
                          }
                        }}
                        className="mt-3 w-full bg-jewel/80 text-stark py-2 rounded-xl hover:shadow-[0_0_12px_rgba(71,23,246,0.25)] transition text-sm font-medium"
                      >
                        Apply Now
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-fuschia">{personalizedJobs.length}</p>
          <p className="text-stark/70 text-sm">Personalized Jobs</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-jewel">{generalJobs.length}</p>
          <p className="text-stark/70 text-sm">Temp/Gig Jobs</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-stark">{filteredJobs.length}</p>
          <p className="text-stark/70 text-sm">Showing</p>
        </div>
      </div>
    </div>
  );
}
