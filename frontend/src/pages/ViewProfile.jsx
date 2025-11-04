// src/pages/ViewProfilePage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./ViewProfilePage.css";

function ViewProfilePage() {
  const [user, setUser] = useState({});
  const [address, setAddress] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const API = axios.create({
    baseURL: "http://127.0.0.1:8000/api/",
  });

  // 🔁 Token refresh interceptor
  API.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      if (
        error.response?.status === 401 &&
        !originalRequest._retry &&
        localStorage.getItem("refresh")
      ) {
        originalRequest._retry = true;
        try {
          const refreshToken = localStorage.getItem("refresh");
          const res = await axios.post("http://127.0.0.1:8000/api/auth/token/refresh/", {
            refresh: refreshToken,
          });

          localStorage.setItem("access", res.data.access);
          API.defaults.headers.common["Authorization"] = `Bearer ${res.data.access}`;
          originalRequest.headers["Authorization"] = `Bearer ${res.data.access}`;
          return API(originalRequest);
        } catch (refreshError) {
          console.error("Token refresh failed", refreshError);
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");
          navigate("/login");
        }
      }
      return Promise.reject(error);
    }
  );

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const userRes = await API.get("auth/profile/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(userRes.data);

        const addrRes = await API.get("addresses/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (Array.isArray(addrRes.data) && addrRes.data.length > 0) {
          setAddress(addrRes.data[0]);
        }
      } catch (err) {
        console.error("❌ Error fetching profile:", err);
        setError("Failed to load user profile. Please check your token or backend.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleEdit = () => navigate("/edit-profile");
  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");
    navigate("/login");
  };
  const handleChangePassword = () => navigate("/changepassword");

  if (loading) return <p>Loading profile...</p>;
  if (error) return <p className="error-text">{error}</p>;

  return (
    <div className="view-profile-page">
      {/* Header */}
      <div className="view-profile-header">
        <h2>User Details</h2>
        <div className="header-actions">
          <button className="edit-btn" onClick={handleEdit}>
            Edit Details
          </button>
          <button className="change-pass-btn" onClick={handleChangePassword}>
            Change Password
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* Account Information */}
      <div className="profile-card">
        <h3 className="edit-subsection-title">Account Information</h3>
        <div className="edit-form-grid">
          <div className="edit-form-group">
            <label>Account Status</label>
            <input readOnly value={user.status || "Active"} />
          </div>
          <div className="edit-form-group">
            <label>Role</label>
            <input readOnly value={user.role || (user.is_superuser ? "Admin" : "User")} />
          </div>
          <div className="edit-form-group">
            <label>Date Joined</label>
            <input readOnly value={user.date_joined?.split("T")[0] || ""} />
          </div>
        </div>
      </div>

      {/* Personal Details */}
      <div className="profile-card">
        <h3 className="edit-subsection-title">Personal Details</h3>
        <div className="edit-form-grid">
          <div className="edit-form-group">
            <label>First Name</label>
            <input readOnly value={user.first_name || ""} />
          </div>
          <div className="edit-form-group">
            <label>Last Name</label>
            <input readOnly value={user.last_name || ""} />
          </div>
          <div className="edit-form-group">
            <label>Phone Number</label>
            <input readOnly value={user.phone || ""} />
          </div>
          <div className="edit-form-group">
            <label>Email</label>
            <input readOnly value={user.email || ""} />
          </div>
        </div>
      </div>

      {/* Address Details */}
      <div className="profile-card">
        <h3 className="edit-subsection-title">Address Details</h3>
        <div className="edit-form-grid">
          {[
            "house_flat",
            "street",
            "landmark",
            "area",
            "district",
            "city",
            "state",
            "postal_code",
            "country",
          ].map((key) => (
            <div className="edit-form-group" key={key}>
              <label>
                {key.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())}
              </label>
              <input readOnly value={address[key] || ""} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ViewProfilePage;
