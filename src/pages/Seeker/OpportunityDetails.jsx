import React, { useState, useEffect } from "react";
import { useParams, useOutletContext } from "react-router-dom";
import { APIURL } from "../../services/api";

export default function OpportunityDetails() {
  const { id } = useParams();
  const { setApplicationsSent, appliedIds, setAppliedIds } = useOutletContext();
  const [opportunity, setOpportunity] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOpportunity = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Authentication token not found.");

        const response = await fetch(`${APIURL}/api/opportunities/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setOpportunity(data);
        } else {
          throw new Error("Failed to fetch opportunity details.");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOpportunity();
  }, [id]);

  const handleApply = async () =>
    {
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("Authentication token not found.");
    
            const response = await fetch(`${APIURL}/api/applications/apply?opportunity_id=${id}`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
    
            if (response.ok) {
                alert("Application submitted successfully!");
                setAppliedIds([...appliedIds, parseInt(id)]);
                setApplicationsSent(prev => prev + 1);
            } else {
                throw new Error("Failed to submit application.");
            }
        } catch (err) {
            setError(err.message);
        }
    };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!opportunity) {
    return <div>Opportunity not found.</div>;
  }

  return (
    <div className="text-white">
      <h2 className="text-3xl font-semibold mb-3">{opportunity.title}</h2>
      <p className="text-gray-300 mb-8">{opportunity.description}</p>
      <div className="bg-white/10 backdrop-blur-lg border border-white/10 p-6 rounded-2xl">
        <h3 className="text-xl font-semibold mb-4">Opportunity Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="font-semibold">Location:</p>
            <p>{opportunity.location}</p>
          </div>
          <div>
            <p className="font-semibold">Type:</p>
            <p>{opportunity.type}</p>
          </div>
          <div>
            <p className="font-semibold">Date:</p>
            <p>{new Date(opportunity.date).toLocaleDateString()}</p>
          </div>
        </div>
        <div className="mt-6">
                        <button
              onClick={handleApply}
              disabled={appliedIds.includes(opportunity.id)}
              className={`py-2 px-4 rounded-xl font-semibold transition-all duration-200 ${
                appliedIds.includes(opportunity.id)
                  ? "bg-white/20 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-[#C5A3FF] to-[#9E7BFF] text-white hover:opacity-90"
              }`}
            >
              {appliedIds.includes(opportunity.id) ? "Applied" : "Apply"}
            </button>
        </div>
      </div>
    </div>
  );
}
