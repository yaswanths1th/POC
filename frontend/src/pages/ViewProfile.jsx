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

      // ✅ Get user ID from route or localStorage
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = routeId || storedUser.id;

      if (!userId) {
        console.error("❌ No user ID found!");
        navigate("/login");
        return;
      }

      try {
        // ✅ Fetch user profile
        const profileUrl = `http://127.0.0.1:8000/api/accounts/user/${userId}/`;
        const userRes = await fetch(profileUrl, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!userRes.ok) throw new Error("Failed to fetch user profile");
        const userData = await userRes.json();
        setUser(userData);

        // ✅ Fetch user address
        const addressUrl = `http://127.0.0.1:8000/api/addresses/?user=${userId}`;
        const addrRes = await fetch(addressUrl, {
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

  // ✅ Handlers
  const handleEdit = () => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = routeId || storedUser.id;

    // ✅ Store the user ID before navigating
    localStorage.setItem("edit_user_id", userId);
    navigate("/edit-profile");
  };

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleChangePassword = () => navigate("/changepassword");

  if (loading) return <div className="view-profile-page">Loading...</div>;

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
          <div className="edit-form-group">
            <label>First Name</label>
            <input readOnly value={user.first_name || ""} />
          </div>
          <div className="edit-form-group">
            <label>Last Name</label>
            <input readOnly value={user.last_name || ""} />
          </div>
          <div className="edit-form-group">
            <label>Username</label>
            <input readOnly value={user.username || ""} />
          </div>
          <div className="edit-form-group">
            <label>Email</label>
            <input readOnly value={user.email || ""} />
          </div>
          <div className="edit-form-group">
            <label>Phone Number</label>
            <input readOnly value={user.phone || ""} />
          </div>
          <div className="edit-form-group">
            <label>Role</label>
            <input readOnly value={user.is_superuser ? "Admin" : "User"} />
          </div>
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
                {key
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
