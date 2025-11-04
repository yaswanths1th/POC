import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./ChangePassword.css";

export default function ChangePassword() {
  const [form, setForm] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("access");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (form.new_password !== form.confirm_password) {
      setError("New password and confirm password do not match.");
      return;
    }

    try {
      const res = await axios.post(
         "http://127.0.0.1:8000/api/change-password/change-password/",
        {
          old_password: form.old_password,
          new_password: form.new_password,
          confirm_password: form.confirm_password,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess(res.data.detail || "Password updated successfully!");
      setTimeout(() => navigate("/viewprofile"), 2000);
    } catch (err) {
  console.error("Error details:", err.response?.data);
  setError(
    err.response?.data?.detail ||
    Object.values(err.response?.data || {}).join(" ") ||
    "Something went wrong while changing password."
  );
}

  };

  return (
    <div className="change-password-container">
      <h2>Change Password</h2>

      <form onSubmit={handleSubmit} className="change-password-form">
        <input
          type="password"
          name="old_password"
          placeholder="Current Password"
          value={form.old_password}
          onChange={handleChange}
          className="change-password-input"
          required
        />

        <input
          type="password"
          name="new_password"
          placeholder="New Password"
          value={form.new_password}
          onChange={handleChange}
          className="change-password-input"
          required
        />

        <input
          type="password"
          name="confirm_password"
          placeholder="Confirm New Password"
          value={form.confirm_password}
          onChange={handleChange}
          className="change-password-input"
          required
        />

        <button type="submit" className="change-password-button">
          Update Password
        </button>
      </form>

      {success && <p className="change-password-success">{success}</p>}
      {error && <p className="change-password-error">{error}</p>}

      <p className="back-to-profile">
        <Link to="/viewprofile">← Back to Profile</Link>
      </p>
    </div>
  );
}
