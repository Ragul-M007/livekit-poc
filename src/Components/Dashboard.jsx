// src/Components/Dashboard.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SellerDashboard from "./SellerDashboard";
import BuyerDashboard from "./BuyerDashboard";

const Dashboard = () => {
  const [roleId, setRoleId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const auth = localStorage.getItem("isAuthenticated");
    const role = localStorage.getItem("role_id");

    if (!auth) {
      navigate("/login");
    } else {
      setRoleId(parseInt(role)); // Ensure it's a number
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear(); // Remove all saved data
    navigate("/login");
  };

  return (
    <div>
        <div style={{ textAlign: "right", padding: "10px" }}>
        <button
          onClick={handleLogout}
          style={{
            padding: "8px 16px",
            backgroundColor: "#ff4d4d",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>
      {roleId === 0 && <SellerDashboard />}
      {roleId === 1 && <BuyerDashboard />}
    </div>
  );
};

export default Dashboard;
