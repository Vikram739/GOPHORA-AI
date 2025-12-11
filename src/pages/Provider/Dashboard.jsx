import React, { useState, useEffect } from "react";
import { Briefcase, Users, Activity, ShieldCheck, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { APIURL } from '../../services/api.js'

export default function ProviderDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalOpportunities: 0,
    applicationsReceived: 0,
    activeListings: 0,
  });
  const [verification, setVerification] = useState({
    status: "not_verified", // verified | pending_review | denied | not_verified
    trustScore: null,
    reason: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Authentication token not found.");

        // Fetch opportunities stats
        const oppsRes = await fetch(`${APIURL}/api/opportunities/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (oppsRes.ok) {
          const opportunities = await oppsRes.json();
          let totalApplications = 0;

          for (const opportunity of opportunities) {
            const appsRes = await fetch(
              `${APIURL}/api/opportunities/${opportunity.id}/applications`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            if (appsRes.ok) {
              const applications = await appsRes.json();
              totalApplications += applications.length;
            }
          }

          setStats({
            totalOpportunities: opportunities.length,
            activeListings: opportunities.filter((op) => op.status === "open").length,
            applicationsReceived: totalApplications,
          });
        }

        // Fetch verification data (mock API for now)
        const verifyRes = await fetch(`${APIURL}/api/verification/status`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (verifyRes.ok) {
          const data = await verifyRes.json();
          setVerification({
            status: data.status, // verified | pending_review | denied
            trustScore: data.trust_score,
            reason: data.reason,
          });
        }
      } catch (err) {
        setError(err.message);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="text-white">
      <h2 className="text-3xl font-semibold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-[#C5A3FF] to-[#9E7BFF] drop-shadow-[0_0_10px_rgba(158,123,255,0.6)]">
        Welcome, Opportunity Provider 👋
      </h2>
      <p className="text-gray-300 mb-8">
        Manage your posted opportunities and track engagement here.
      </p>

      {error && (
        <p className="text-red-500 bg-red-500/10 p-3 rounded-lg mb-4">{error}</p>
      )}

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
        {/* Total Opportunities */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/10 p-6 rounded-2xl shadow-[0_0_25px_rgba(158,123,255,0.2)]">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-[#C5A3FF]">Total Opportunities</h3>
            <Briefcase className="w-6 h-6 text-[#C5A3FF]" />
          </div>
          <p className="text-4xl font-bold text-white">{stats.totalOpportunities}</p>
        </div>

        {/* Applications Received */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/10 p-6 rounded-2xl shadow-[0_0_25px_rgba(158,123,255,0.2)]">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-[#C5A3FF]">Applications Received</h3>
            <Users className="w-6 h-6 text-[#C5A3FF]" />
          </div>
          <p className="text-4xl font-bold text-white">{stats.applicationsReceived}</p>
        </div>

        {/* Active Listings */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/10 p-6 rounded-2xl shadow-[0_0_25px_rgba(158,123,255,0.2)]">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-[#C5A3FF]">Active Listings</h3>
            <Activity className="w-6 h-6 text-[#C5A3FF]" />
          </div>
          <p className="text-4xl font-bold text-white">{stats.activeListings}</p>
        </div>
      </div>

      {/* 🔐 Verification Section */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/10 p-6 rounded-2xl shadow-[0_0_25px_rgba(158,123,255,0.2)]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-[#C5A3FF] flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-[#C5A3FF]" /> Verification Status
          </h3>
        </div>

        {/* Status variations */}
        {verification.status === "verified" ? (
          <div className="bg-green-500/10 border border-green-400/40 rounded-xl p-4">
            <p className="text-green-400 font-semibold text-lg">
              ✅ AI Verified – Professional Level
            </p>
            <p className="text-white mt-2">Trust Score: {verification.trustScore}%</p>
            <p className="text-gray-300 text-sm mt-1">Reason: {verification.reason}</p>
            <button
              onClick={() => navigate("/provider/verify")}
              className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Re-verify
            </button>
          </div>
        ) : verification.status === "pending_review" ? (
          <div className="bg-yellow-500/10 border border-yellow-400/40 rounded-xl p-4">
            <p className="text-yellow-400 font-semibold text-lg flex items-center gap-1">
              <AlertTriangle className="w-5 h-5" /> Under Review
            </p>
            <p className="text-gray-300 mt-2">
              Your profile is currently being reviewed by our verification team.
            </p>
          </div>
        ) : verification.status === "denied" ? (
          <div className="bg-red-500/10 border border-red-400/40 rounded-xl p-4">
            <p className="text-red-400 font-semibold text-lg">❌ Verification Failed</p>
            <p className="text-gray-300 mt-2">
              Reason: {verification.reason || "Your profile did not meet the minimum requirements."}
            </p>
            <button
              onClick={() => navigate("/provider/verify")}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div>
            <p className="text-gray-300 mb-4">
              Your profile is not yet verified. Complete verification to increase trust and visibility on GOPHORA.
            </p>
            <button
              onClick={() => navigate("/provider/verify")}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Start Verification
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
