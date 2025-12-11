import React from "react";
import { useNavigate } from "react-router-dom";
import OpportunityForm from "../../components/forms/OpportunityForm";
import { APIURL } from '../../services/api.js'


export default function CreateOpportunity() {
  const navigate = useNavigate();

  const handleSubmit = async (data) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token not found.");

      const processedData = {
        ...data,
        location: data.workMode === 'onsite' ? `${data.city}, ${data.country}` : 'Remote',
        tags: data.tags ? data.tags.split(",").map(tag => tag.trim()) : [],
      };

      const response = await fetch(`${APIURL}/api/opportunities`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(processedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(JSON.stringify(errorData));
      }

      alert("Opportunity posted successfully!");
      navigate("/provider/opportunities");
    } catch (error) {
      console.error("Error creating opportunity:", error);
      alert("Error creating opportunity: " + error.message);
    }
  };

  return (
    <div className="text-white">
      <OpportunityForm onSubmit={handleSubmit} />
    </div>
  );
}
