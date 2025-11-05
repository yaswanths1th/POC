import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./EditProfilePage.css";

function EditProfilePage() {
  const [user, setUser] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
  });

  const [address, setAddress] = useState({
    id: null,
    house_flat: "",
    street: "",
    landmark: "",
    area: "",
    district: "",
    city: "",
    state: "",
    postal_code: "",
    country: "India",
  });

  const [loadingPinLookup, setLoadingPinLookup] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editUserId, setEditUserId] = useState(null);

  const token = localStorage.getItem("access");
  const navigate = useNavigate();

  // Load user & address
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const localEditId = localStorage.getItem("edit_user_id");

    if (!localEditId) {
      setIsAdding(true);
      return;
    }

    setEditUserId(localEditId);
    setIsAdding(false);

    const fetchProfileAndAddress = async () => {
      try {
        const userRes = await fetch(
          `http://127.0.0.1:8000/api/accounts/user/${localEditId}/`,
          {
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          }
        );
        const userData = await userRes.json();
        setUser({
          first_name: userData.first_name || "",
          last_name: userData.last_name || "",
          phone: userData.phone || "",
          email: userData.email || "",
        });

        const addrRes = await fetch(
          `http://127.0.0.1:8000/api/addresses/?user=${localEditId}`,
          {
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          }
        );
        const addrData = await addrRes.json();
        if (addrData.length > 0) {
          const a = addrData[0];
          setAddress({
            id: a.id,
            house_flat: a.house_flat || "",
            street: a.street || "",
            landmark: a.landmark || "",
            area: a.area || "",
            district: a.district || "",
            city: a.city || "",
            state: a.state || "",
            postal_code: a.postal_code || "",
            country: a.country || "India",
          });
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };

    fetchProfileAndAddress();
  }, [token, navigate]);

  // Input handlers
  const handleChangeUser = (e) => setUser(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleChangeAddress = (e) => {
    const { name, value } = e.target;
    setAddress(prev => {
      const updated = { ...prev, [name]: value };
      if (name === "postal_code" && value.length === 6) lookupPostalCode(value);
      return updated;
    });
  };

  const lookupPostalCode = async (postalCodeValue) => {
    try {
      setLoadingPinLookup(true);
      const res = await fetch(`https://api.postalpincode.in/pincode/${postalCodeValue}`);
      const data = await res.json();
      if (data[0]?.Status === "Success" && data[0]?.PostOffice?.length > 0) {
        const info = data[0].PostOffice[0];
        setAddress(prev => ({
          ...prev,
          district: info.District || prev.district,
          city: info.Name || prev.city,
          state: info.State || prev.state,
          country: "India",
        }));
      } else {
        alert("Invalid Pincode. Please check again.");
      }
    } catch (err) {
      console.error("Error looking up postal code:", err);
    } finally {
      setLoadingPinLookup(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    // Validation
    const requiredUserFields = ["first_name", "last_name", "phone", "email"];
    const requiredAddressFields = ["house_flat", "street", "area", "district", "city", "state", "postal_code", "country"];

    for (const field of requiredUserFields) if (!user[field].trim()) return alert(`${field} is required`);
    for (const field of requiredAddressFields) if (!address[field].trim()) return alert(`${field} is required`);

    try {
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const isAdmin = storedUser.is_superuser || storedUser.is_staff;
      let userId = editUserId;

      // --- Add Mode: create new user ---
      if (isAdding) {
        const newUserPayload = {
          first_name: user.first_name,
          last_name: user.last_name,
          phone: user.phone,
          email: user.email,
          username: user.email,
          password: user.email.length >= 8 ? user.email : user.email + "12345678".slice(0, 8 - user.email.length),
        };

        const res = await fetch("http://127.0.0.1:8000/api/accounts/register/", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(newUserPayload),
        });

        if (!res.ok) {
          const errData = await res.json();
          console.error("Failed to create user:", JSON.stringify(errData, null, 2));
          return alert("Failed to create user. Check console.");
        }

        const createdUser = await res.json();
        userId = createdUser.id;
      }

      // --- Edit Mode: update user ---
      else {
        const userEndpoint = isAdmin
          ? `http://127.0.0.1:8000/api/accounts/user/${editUserId}/update/`
          : "http://127.0.0.1:8000/api/auth/profile/";
        const userMethod = isAdmin ? "PUT" : "POST";

        const resUser = await fetch(userEndpoint, {
          method: userMethod,
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(user),
        });

        if (!resUser.ok) {
          const errData = await resUser.json();
          console.error("Failed to update user:", JSON.stringify(errData, null, 2));
          return alert("Failed to update user. Check console.");
        }
      }

      // --- Address Create/Update ---
      const addressPayload = { ...address, user: userId };
      let addressUrl, addressMethod;

      if (!address.id) {
        addressUrl = "http://127.0.0.1:8000/api/addresses/";
        addressMethod = "POST";
      } else {
        addressUrl = isAdmin
          ? `http://127.0.0.1:8000/api/addresses/${address.id}/update-admin/`
          : `http://127.0.0.1:8000/api/addresses/${address.id}/`;
        addressMethod = "PUT";
      }

      const resAddress = await fetch(addressUrl, {
        method: addressMethod,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(addressPayload),
      });

      if (!resAddress.ok) {
        const text = await resAddress.text();
        console.error("Address save failed:", resAddress.status, text);
        return alert(`Failed to save address: ${resAddress.status}`);
      }

      navigate(`/viewprofile/${userId}`);
    } catch (err) {
      console.error("Error saving profile:", err);
      alert("Error saving profile. Check console.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access");
    navigate("/login");
  };

  return (
    <div className="edit-profile-page">
      <div className="edit-profile-header">
        <h2>{isAdding ? "Add New User" : "Edit Profile"}</h2>
        <div className="header-actions">
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div className="edit-profile-content">
        <form onSubmit={handleSave}>
          {/* Personal Details */}
          <div className="edit-profile-card">
            <h3 className="edit-subsection-title">Personal Details</h3>
            <div className="edit-form-grid">
              {["first_name", "last_name", "phone", "email"].map(key => (
                <div className="edit-form-group" key={key}>
                  <label>{key.replace(/_/g, " ").toUpperCase()}</label>
                  <input type="text" name={key} value={user[key]} onChange={handleChangeUser} required />
                </div>
              ))}
            </div>
          </div>

          {/* Address Details */}
          <div className="edit-profile-card">
            <h3 className="edit-subsection-title">Address Details</h3>
            <div className="edit-form-grid">
              {["house_flat", "street", "landmark", "area", "district", "city", "state", "postal_code", "country"].map(key => (
                <div className="edit-form-group" key={key}>
                  <label>
                    {key === "house_flat" ? "Flat No. / House" : key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
                    {key === "postal_code" && loadingPinLookup && <span style={{ marginLeft: 8, color: "#888", fontSize: "0.9em" }}>(Fetching…)</span>}
                  </label>
                  <input type="text" name={key} value={address[key] || ""} onChange={handleChangeAddress} />
                </div>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="action-buttons">
            <button type="button" className="cancel-btn" onClick={() => navigate(`/viewprofile/${JSON.parse(localStorage.getItem("user") || "{}").id}`)}>Cancel</button>
            <button type="submit" className="save-btn">{isAdding ? "Create User" : "Save Changes"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProfilePage;
