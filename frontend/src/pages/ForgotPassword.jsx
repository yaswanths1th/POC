import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./ForgotPassword.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const res = await axios.post("http://127.0.0.1:8000/api/password-reset/send-otp/", {
        email,
      });

      setMessage(res.data.detail || "OTP sent successfully!");
      // ✅ Redirect to Verify OTP page and pass email
      setTimeout(() => {
        navigate("/verify-otp", { state: { email } });
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.detail || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-container">
      <h2 className="forgot-title">Forgot Password</h2>
      <p className="forgot-subtext">Enter your registered email to receive an Verification code.</p>
      <form onSubmit={handleSubmit} className="forgot-form">
        <input
          className="forgot-input"
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button className="forgot-btn" type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send Verfication code"}
        </button>
      </form>

        {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}
    </div>
  );
}
