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
    house_flat: "",
    street: "",
    landmark: "",
    area: "",
    district: "",
    city: "",
    state: "",
    postal_code: "",
    country: "",
  });

  const [loadingPinLookup, setLoadingPinLookup] = useState(false);
  const token = localStorage.getItem("access");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchProfileAndAddress = async () => {
      try {
        // Fetch user data
        const userRes = await fetch("http://127.0.0.1:8000/api/auth/profile/", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const userData = await userRes.json();
        setUser({
          first_name: userData.first_name || "",
          last_name: userData.last_name || "",
          phone: userData.phone || "",
          email: userData.email || "",
        });

        // Fetch address data
        const addrRes = await fetch("http://127.0.0.1:8000/api/addresses/", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
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

  const handleChangeUser = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleChangeAddress = (e) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
    if (name === "postal_code" && value.length >= 4) {
      lookupPostalCode(value, address.country);
    }
  };

  const lookupPostalCode = async (postalCodeValue, countryValue) => {
    try {
      setLoadingPinLookup(true);
      if (countryValue === "India") {
        const res = await fetch(`https://api.postalpincode.in/pincode/${postalCodeValue}`);
        const data = await res.json();
        if (data && data[0]?.Status === "Success" && data[0]?.PostOffice?.length > 0) {
          const info = data[0].PostOffice[0];
          setAddress((prev) => ({
            ...prev,
            district: info.District || prev.district,
            city: info.Name || prev.city,
            state: info.State || prev.state,
            country: info.Country || prev.country,
          }));
        }
      }
    } catch (err) {
      console.error("Error looking up postal code:", err);
    } finally {
      setLoadingPinLookup(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      // Save user details
      await fetch("http://127.0.0.1:8000/api/auth/profile/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(user),
      });

      // Save address
      const addressUrl = address.id
        ? `http://127.0.0.1:8000/api/addresses/${address.id}/`
        : "http://127.0.0.1:8000/api/addresses/";
      const method = address.id ? "PUT" : "POST";

      await fetch(addressUrl, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(address),
      });

      navigate("/viewprofile");
    } catch (err) {
      console.error("Error saving profile:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access");
    navigate("/login");
  };

  return (
    <div className="edit-profile-page">
      <div className="edit-profile-header">
        <h2>Edit Profile</h2>
        <div className="header-actions">
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      <div className="edit-profile-content">
        <form onSubmit={handleSave}>
          {/* ---------- Personal Details ---------- */}
          <div className="edit-profile-card">
            <h3 className="edit-subsection-title">Personal Details</h3>
            <div className="edit-form-grid">
              {["first_name", "last_name", "phone", "email"].map((key) => (
                <div className="edit-form-group" key={key}>
                  <label>{key.replace(/_/g, " ").toUpperCase()}</label>
                  <input
                    type="text"
                    name={key}
                    value={user[key]}
                    onChange={handleChangeUser}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* ---------- Address Details ---------- */}
          <div className="edit-profile-card">
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
                    {key === "house_flat"
                      ? "Flat No. / House"
                      : key
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (char) => char.toUpperCase())}
                    {key === "postal_code" && loadingPinLookup && (
                      <span style={{ marginLeft: 8, color: "#888", fontSize: "0.9em" }}>
                        (Fetching…)
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    name={key}
                    value={address[key] || ""}
                    onChange={handleChangeAddress}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* ---------- Buttons ---------- */}
          <div className="action-buttons">
            <button
              type="button"
              className="cancel-btn"
              onClick={() => navigate("/viewprofile")}
            >
              Cancel
            </button>
            <button type="submit" className="save-btn">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProfilePage;
