import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ViewProfilePage.css";

function ViewProfilePage() {
  const [user, setUser] = useState({});
  const [address, setAddress] = useState({});
  const token = localStorage.getItem("access");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const userRes = await fetch("http://127.0.0.1:8000/api/auth/profile/", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const userData = await userRes.json();
        setUser(userData);

        const addrRes = await fetch("http://127.0.0.1:8000/api/addresses/", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const addrData = await addrRes.json();
        if (addrData.length > 0) setAddress(addrData[0]);
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };

    fetchData();
  }, [token, navigate]);

  const handleEdit = () => navigate("/edit-profile");
  const handleLogout = () => {
    localStorage.removeItem("access");
    navigate("/login");
  };
  const handleChangePassword = () => navigate("/changepassword");

  return (
    <div className="view-profile-page">
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
                {key === "house"
                  ? "Flat No. / House"
                  : key
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (char) => char.toUpperCase())}
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
