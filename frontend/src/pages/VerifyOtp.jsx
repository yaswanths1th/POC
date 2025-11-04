import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./VerifyOtp.css";

export default function VerifyOtp() {
  const location = useLocation();
  const navigate = useNavigate();
  const prefilledEmail = location.state?.email || "";

  const [form, setForm] = useState({
    email: prefilledEmail,
    otp: "",
    new_password: "",
    confirm_password: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await axios.post("http://127.0.0.1:8000/api/password-reset/verify-otp/", form);
      setMessage(res.data.detail);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.detail || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="verify-container">
      <div className="verify-card">
        <h2 className="verify-title">Verification Details</h2>
        <p className="verify-subtext">
          Enter the verification code sent to your email and set a new password.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              readOnly
              className="readonly-input"
            />
          </div>

          <div className="form-group">
            <label>Verification Code</label>
            <input
              type="text"
              name="otp"
              value={form.otp}
              onChange={handleChange}
              placeholder="Enter verification code"
              required
            />
          </div>

          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              name="new_password"
              value={form.new_password}
              onChange={handleChange}
              placeholder="Enter new password"
              required
            />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirm_password"
              value={form.confirm_password}
              onChange={handleChange}
              placeholder="Confirm new password"
              required
            />
          </div>

          <button type="submit" className="verify-btn" disabled={loading}>
            {loading ? "Verifying..." : "Reset Password"}
          </button>
        </form>

        {message && <p className="success">{message}</p>}
        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
}
