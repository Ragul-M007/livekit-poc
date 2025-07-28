import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

const baseURL = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();

  const validatePhoneNumber = () => {
    if (!phoneNumber.trim()) {
      setError("Phone number is required");
      return false;
    } else if (!/^\d{10}$/.test(phoneNumber)) {
      setError("Please enter a valid 10-digit phone number");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validatePhoneNumber()) {
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await axios.post(`${baseURL}/user-login`, {
        phone_number: phoneNumber,
      });

      if (response.data.status) {
        setMessage(response.data.message);

        // Store user data in localStorage
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("user_id", response.data.data.user_id.toString());
        localStorage.setItem("user_name", response.data.data.user_name);
        localStorage.setItem("role_id", response.data.data.role_id.toString());

        // Navigate to dashboard after successful login
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      } else {
        setError(response.data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      if (error.response) {
        setError(error.response.data.message || "Login failed");
      } else {
        setError("Network error. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="phone_number">Phone Number:</label>
            <input
              type="tel"
              id="phone_number"
              value={phoneNumber}
              onChange={(e) => {
                setPhoneNumber(e.target.value);
                if (error) setError("");
              }}
              placeholder="Enter your 10-digit phone number"
              maxLength="10"
              className={error ? "error" : ""}
            />
            {error && <span className="error-message">{error}</span>}
          </div>

          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {message && <div className="message success">{message}</div>}
        {/* 👇 Add this Register section below */}
    <div className="register-link">
      <p>Don't have an account?</p>
      <button
        type="button"
        className="register-btn"
        onClick={() => navigate("/register")}
      >
        Register
      </button>
    </div>
      </div>
    </div>
  );
};

export default Login;
