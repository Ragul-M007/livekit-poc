import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Register.css";

const Register = () => {
  const [formData, setFormData] = useState({
    user_name: "",
    phone_number: "",
    role_id: null,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

const baseURL = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleRoleChange = (e) => {
    const roleValue = e.target.value === "seller" ? 0 : 1;
    setFormData((prev) => ({
      ...prev,
      role_id: roleValue,
    }));

    // Clear error when user selects a role
    if (errors.role_id) {
      setErrors((prev) => ({
        ...prev,
        role_id: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.user_name.trim()) {
      newErrors.user_name = "Username is required";
    }

    if (!formData.phone_number.trim()) {
      newErrors.phone_number = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone_number)) {
      newErrors.phone_number = "Please enter a valid 10-digit phone number";
    }

    if (formData.role_id === null) {
      newErrors.role_id = "Please select a role";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await axios.post(`${baseURL}/create-users`, {
        user_name: formData.user_name,
        phone_number: formData.phone_number,
        role_id: formData.role_id,
      });

      if (response.data.status) {
        setMessage(response.data.message);
        // Reset form
        setFormData({
          user_name: "",
          phone_number: "",
          role_id: null,
        });

        // Navigate to login page after successful registration
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (error) {
      console.error("Registration error:", error);
      if (error.response) {
        setMessage(
          `Error: ${error.response.data.message || "Registration failed"}`
        );
      } else {
        setMessage("Error: Network request failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-form">
        <h2>User Registration</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="user_name">Username:</label>
            <input
              type="text"
              id="user_name"
              name="user_name"
              value={formData.user_name}
              onChange={handleChange}
              placeholder="Enter your username"
              className={errors.user_name ? "error" : ""}
            />
            {errors.user_name && (
              <span className="error-message">{errors.user_name}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="phone_number">Phone Number:</label>
            <input
              type="tel"
              id="phone_number"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              placeholder="Enter 10-digit phone number"
              maxLength="10"
              className={errors.phone_number ? "error" : ""}
            />
            {errors.phone_number && (
              <span className="error-message">{errors.phone_number}</span>
            )}
          </div>

          <div className="form-group">
            <label>Role:</label>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="role"
                  value="seller"
                  checked={formData.role_id === 0}
                  onChange={handleRoleChange}
                />
                Seller
              </label>

              <label className="radio-label">
                <input
                  type="radio"
                  name="role"
                  value="vendor"
                  checked={formData.role_id === 1}
                  onChange={handleRoleChange}
                />
                Buyer
              </label>
            </div>
            {errors.role_id && (
              <span className="error-message">{errors.role_id}</span>
            )}
          </div>

          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        

        {message && (
          <div
            className={`message ${
              message.includes("successfully") ? "success" : "error"
            }`}
          >
            {message}
          </div>
        )}

        <div className="login-link">
        <p>Already have an account?</p>
        <button
            type="button"
            className="login-btn"
            onClick={() => navigate("/login")}
        >
            Go to Login
        </button>
        </div>

      </div>
    </div>
  );
};

export default Register;
