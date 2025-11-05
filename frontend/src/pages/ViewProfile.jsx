import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./ViewProfilePage.css";

function ViewProfilePage() {
  const { id: routeId } = useParams();
  const [user, setUser] = useState({});
  const [address, setAddress] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("access");

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        navigate("/login");
        return;
      }

      // ✅ Get user ID
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = routeId || storedUser.id;

      if (!userId) {
        console.error("❌ No user ID found!");
        navigate("/login");
        return;
      }

      try {
        // ✅ Fetch user details
        const userRes = await fetch(`http://127.0.0.1:8000/api/accounts/user/${userId}/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!userRes.ok) throw new Error("Failed to fetch user profile");
        const userData = await userRes.json();
        setUser(userData);

        // ✅ Fetch address details
        const addrRes = await fetch(`http://127.0.0.1:8000/api/addresses/?user=${userId}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (addrRes.ok) {
          const addrData = await addrRes.json();
          if (Array.isArray(addrData) && addrData.length > 0) {
            setAddress(addrData[0]);
          }
        }

        setLoading(false);
      } catch (err) {
        console.error("❌ Error fetching profile:", err);
        setLoading(false);
      }
    };

    fetchData();
  }, [token, navigate, routeId]);

  const handleEdit = () => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = routeId || storedUser.id;
    localStorage.setItem("edit_user_id", userId);
    navigate("/edit-profile");
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleChangePassword = () => navigate("/changepassword");

  if (loading)
    return (
      <div className="view-profile-page">
        <h3>Loading...</h3>
      </div>
    );

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

      {/* ✅ Personal Details */}
      <div className="profile-card">
        <h3 className="edit-subsection-title">Personal Details</h3>
        <div className="edit-form-grid">
          {[
            { label: "First Name", key: "first_name" },
            { label: "Last Name", key: "last_name" },
            { label: "Username", key: "username" },
            { label: "Email", key: "email" },
            { label: "Phone Number", key: "phone" },
            {
              label: "Role",
              key: "is_superuser",
              value: user.is_superuser ? "Admin" : "User",
            },
          ].map((field) => (
            <div className="edit-form-group" key={field.key}>
              <label>{field.label}</label>
              <input
                readOnly
                value={field.value ?? user[field.key] ?? ""}
              />
            </div>
          ))}
        </div>
      </div>

      {/* ✅ Address Details */}
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
