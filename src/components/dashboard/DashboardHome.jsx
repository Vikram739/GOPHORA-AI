import React, { useState, useEffect } from "react";
import { FiBriefcase, FiClock, FiMapPin, FiDollarSign, FiArrowRight, FiStar, FiFilter, FiRefreshCw } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import api from '../../services/api';
import axios from 'axios';

export default function DashboardHome() {
  const [activeTab, setActiveTab] = useState("forYou");
  const [personalizedJobs, setPersonalizedJobs] = useState([]);
  const [quickJobs, setQuickJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("Explorer");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
    fetchJobs();
    
    // Auto-refresh every 30 seconds for real-time updates
    const interval = setInterval(() => {
      fetchJobs();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await api.get('/user/profile');
      const name = response.data.name || response.data.full_name || "Explorer";
      setUserName(name.split(' ')[0]); // Use first name only
    } catch (err) {
      console.log('Could not fetch user profile');
    }
  };

  const fetchJobs = async () => {
    try {
      setLoading(true);
      
      // Fetch personalized jobs (top 10)
      try {
        const personalizedResponse = await api.get('/jobs/personalized?limit=10');
        const pJobs = personalizedResponse.data.jobs || [];
        setPersonalizedJobs(pJobs);
        console.log('Fetched personalized jobs:', pJobs.length);
      } catch (err) {
        console.log('Could not fetch personalized jobs:', err.message);
        setPersonalizedJobs([]);
      }
      
      // Fetch quick/general jobs (all temp jobs)
      try {
        const generalResponse = await axios.get('http://localhost:8000/jobs/general?limit=100');
        const gJobs = generalResponse.data.jobs || [];
        setQuickJobs(gJobs);
        
        // Extract unique categories
        const cats = ['All', ...new Set(gJobs.map(job => job.category || job.jobType).filter(Boolean))];
        setCategories(cats);
        console.log('Fetched quick jobs:', gJobs.length, 'Categories:', cats);
      } catch (err) {
        console.log('Could not fetch quick jobs:', err.message);
        setQuickJobs([]);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setLoading(false);
    }
  };
  
  // Apply filters
  useEffect(() => {
    if (activeTab === "quick") {
      if (selectedFilter === "All") {
        setFilteredJobs(quickJobs);
      } else {
        setFilteredJobs(quickJobs.filter(job => 
          (job.category === selectedFilter) || (job.jobType === selectedFilter)
        ));
      }
    } else {
      setFilteredJobs(personalizedJobs);
    }
  }, [selectedFilter, quickJobs, personalizedJobs, activeTab]);

  const handleApply = (job) => {
    if (job.sourceLink) {
      window.open(job.sourceLink, '_blank');
    }
  };

  const JobCard = ({ job, showRelevance = false }) => (
    <div className="bg-gradient-to-br from-[#0F0C19]/90 to-[#1A1626]/80 border border-white/10 rounded-2xl p-6 hover:border-fuschia/40 hover:shadow-[0_0_25px_rgba(71,23,246,0.3)] transition-all duration-300 backdrop-blur-xl group transform hover:-translate-y-1">
      {/* Job Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-stark group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-fuschia group-hover:to-jewel transition-all line-clamp-1">
            {job.jobTitle || job.title}
          </h3>
          <p className="text-stark/70 text-sm mt-1 font-medium">{job.company || job.source}</p>
        </div>
        {showRelevance && job.aiValidationScore && (
          <div className="flex items-center gap-1 bg-gradient-to-r from-jewel/30 to-fuschia/20 text-jewel px-3 py-1.5 rounded-full text-xs font-bold border border-jewel/30">
            <FiStar size={14} className="fill-current" />
            {job.aiValidationScore}%
          </div>
        )}
      </div>

      {/* Job Details */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex items-center gap-2 text-stark/70 text-sm bg-white/5 px-3 py-1.5 rounded-lg">
          <FiMapPin size={14} className="text-fuschia" />
          <span>{job.location || 'Remote'}</span>
        </div>
        <div className="flex items-center gap-2 text-stark/70 text-sm bg-white/5 px-3 py-1.5 rounded-lg">
          <FiBriefcase size={14} className="text-jewel" />
          <span>{job.jobType || job.category || 'Full-time'}</span>
        </div>
        {job.salary && (
          <div className="flex items-center gap-2 text-stark/70 text-sm bg-gradient-to-r from-fuschia/10 to-jewel/10 px-3 py-1.5 rounded-lg border border-fuschia/20">
            <FiDollarSign size={14} className="text-fuschia" />
            <span className="font-semibold">{job.salary}</span>
          </div>
        )}
      </div>

      {/* Skill Matches */}
      {showRelevance && job.skillMatches && job.skillMatches.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-stark/50 mb-2">Matching Skills:</p>
          <div className="flex flex-wrap gap-2">
            {job.skillMatches.slice(0, 5).map((skill, idx) => (
              <span key={idx} className="text-xs px-2 py-1 bg-jewel/20 text-jewel rounded-md border border-jewel/30">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Description */}
      {job.description && (
        <p className="text-stark/60 text-sm mb-4 line-clamp-3 leading-relaxed">
          {job.description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <div className="flex items-center gap-2 text-stark/50 text-xs">
          <FiClock size={12} />
          <span>Posted {job.postedDate || 'recently'}</span>
        </div>
        <button
          onClick={() => handleApply(job)}
          className="px-5 py-2.5 bg-gradient-to-r from-fuschia to-jewel text-white text-sm font-bold rounded-xl hover:shadow-[0_0_20px_rgba(162,57,202,0.5)] transition-all duration-300 hover:scale-105"
        >
          Apply Now
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-6 space-y-6 text-stark min-h-screen">
      {/* Greeting Section with Stats */}
      <div className="bg-gradient-to-br from-fuschia/10 via-jewel/5 to-transparent border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-sm">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-fuschia via-jewel to-fuschia bg-clip-text text-transparent drop-shadow-lg">
              Welcome Back, {userName} 👋
            </h1>
            <p className="text-stark/70 text-base md:text-lg">
              Your next opportunity is waiting
            </p>
          </div>
          <button
            onClick={fetchJobs}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all hover:scale-110"
            title="Refresh jobs"
          >
            <FiRefreshCw size={20} className="text-fuschia" />
          </button>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <p className="text-stark/50 text-xs mb-1">Personalized</p>
            <p className="text-2xl font-bold text-fuschia">{personalizedJobs.length}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <p className="text-stark/50 text-xs mb-1">Quick Jobs</p>
            <p className="text-2xl font-bold text-jewel">{quickJobs.length}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <p className="text-stark/50 text-xs mb-1">Total</p>
            <p className="text-2xl font-bold text-stark">{personalizedJobs.length + quickJobs.length}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <p className="text-stark/50 text-xs mb-1">Categories</p>
            <p className="text-2xl font-bold text-fuschia">{categories.length}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 border-b border-white/20">
        <button
          onClick={() => { setActiveTab("forYou"); setSelectedFilter("All"); }}
          className={`px-8 py-4 font-bold text-base transition-all duration-300 relative ${
            activeTab === "forYou"
              ? "text-fuschia"
              : "text-stark/60 hover:text-stark"
          }`}
        >
          <span className="flex items-center gap-2">
            <FiStar size={18} />
            Jobs for You
          </span>
          {activeTab === "forYou" && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-fuschia to-jewel rounded-full shadow-[0_0_10px_rgba(71,23,246,0.5)]" />
          )}
        </button>
        <button
          onClick={() => { setActiveTab("quick"); setSelectedFilter("All"); }}
          className={`px-8 py-4 font-bold text-base transition-all duration-300 relative ${
            activeTab === "quick"
              ? "text-fuschia"
              : "text-stark/60 hover:text-stark"
          }`}
        >
          <span className="flex items-center gap-2">
            <FiClock size={18} />
            Quick Jobs
          </span>
          {activeTab === "quick" && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-fuschia to-jewel rounded-full shadow-[0_0_10px_rgba(162,57,202,0.5)]" />
          )}
        </button>
      </div>
      
      {/* Filters for Quick Jobs */}
      {activeTab === "quick" && categories.length > 0 && (
        <div className="bg-[#0F0C19]/70 border border-white/10 rounded-2xl p-4 backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-3">
            <FiFilter className="text-fuschia" size={18} />
            <h3 className="font-semibold text-stark">Filter by Category</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedFilter(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  selectedFilter === cat
                    ? "bg-gradient-to-r from-fuschia to-jewel text-white shadow-[0_0_15px_rgba(71,23,246,0.4)]"
                    : "bg-white/5 text-stark/70 hover:bg-white/10 border border-white/10"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-fuschia"></div>
        </div>
      ) : (
        <>
          {/* Jobs for You Tab */}
          {activeTab === "forYou" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-gradient-to-r from-fuschia/5 to-jewel/5 rounded-2xl p-4 border border-white/10">
                <h2 className="text-2xl font-bold text-stark flex items-center gap-2">
                  <span className="text-3xl">🎯</span>
                  Top Matches for Your Skills
                </h2>
                <span className="text-sm text-stark/60 bg-white/10 px-4 py-2 rounded-lg font-semibold">
                  {personalizedJobs.length} opportunities
                </span>
              </div>

              {personalizedJobs.length === 0 ? (
                <div className="bg-gradient-to-br from-[#0F0C19]/90 to-[#1A1626]/80 border border-white/10 rounded-2xl p-16 text-center backdrop-blur-xl">
                  <div className="bg-fuschia/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FiBriefcase size={48} className="text-fuschia" />
                  </div>
                  <h3 className="text-xl font-bold text-stark mb-3">No Personalized Jobs Yet</h3>
                  <p className="text-stark/60 mb-6 max-w-md mx-auto">
                    Our AI is working hard to find the perfect matches for your skills. Jobs will appear here soon!
                  </p>
                  <button
                    onClick={() => navigate('/seeker/dashboard/profile')}
                    className="px-6 py-3 bg-gradient-to-r from-fuschia to-jewel text-white font-bold rounded-xl hover:shadow-[0_0_20px_rgba(162,57,202,0.5)] transition-all"
                  >
                    Complete Your Profile
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {personalizedJobs.map((job, idx) => (
                      <JobCard key={idx} job={job} showRelevance={true} />
                    ))}
                  </div>

                  <div className="flex justify-center pt-6">
                    <button
                      onClick={() => navigate('/seeker/opportunities')}
                      className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-fuschia to-jewel text-white font-bold rounded-2xl hover:shadow-[0_0_25px_rgba(162,57,202,0.6)] transition-all duration-300 hover:scale-105"
                    >
                      View All Opportunities
                      <FiArrowRight size={20} />
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Quick Jobs Tab */}
          {activeTab === "quick" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-gradient-to-r from-jewel/5 to-fuschia/5 rounded-2xl p-4 border border-white/10">
                <h2 className="text-2xl font-bold text-stark flex items-center gap-2">
                  <span className="text-3xl">⚡</span>
                  Quick & Easy Gigs
                </h2>
                <span className="text-sm text-stark/60 bg-white/10 px-4 py-2 rounded-lg font-semibold">
                  {filteredJobs.length} {selectedFilter !== "All" ? `in ${selectedFilter}` : "available"}
                </span>
              </div>

              {filteredJobs.length === 0 ? (
                <div className="bg-gradient-to-br from-[#0F0C19]/90 to-[#1A1626]/80 border border-white/10 rounded-2xl p-16 text-center backdrop-blur-xl">
                  <div className="bg-jewel/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FiClock size={48} className="text-jewel" />
                  </div>
                  <h3 className="text-xl font-bold text-stark mb-3">
                    {selectedFilter === "All" ? "No Quick Jobs Available" : `No Jobs in ${selectedFilter}`}
                  </h3>
                  <p className="text-stark/60 mb-6">
                    {selectedFilter === "All" 
                      ? "Our scrapers are finding new opportunities. Check back in a few minutes!" 
                      : "Try selecting a different category"}
                  </p>
                  {selectedFilter !== "All" && (
                    <button
                      onClick={() => setSelectedFilter("All")}
                      className="px-6 py-3 bg-gradient-to-r from-fuschia to-jewel text-white font-bold rounded-xl hover:shadow-[0_0_20px_rgba(162,57,202,0.5)] transition-all"
                    >
                      View All Jobs
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredJobs.map((job, idx) => (
                    <JobCard key={idx} job={job} />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
