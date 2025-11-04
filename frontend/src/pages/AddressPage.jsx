import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AddressPage.css";

function AddressPage() {
  const [form, setForm] = useState({
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

  const navigate = useNavigate();
  const token = localStorage.getItem("access");

  useEffect(() => {
    if (!token) navigate("/login");
  }, [token, navigate]);

  // 🧭 Detect City / State / Country by Postal Code
  const handlePostalCodeChange = async (e) => {
    const postal_code = e.target.value.trim();
    setForm((prev) => ({ ...prev, postal_code }));

    if (postal_code.length < 5) return;

    try {
      // 🇮🇳 Indian Postal Code API
      const indiaRes = await fetch(`https://api.postalpincode.in/pincode/${postal_code}`);
      const indiaData = await indiaRes.json();

      if (indiaData[0]?.Status === "Success") {
        const info = indiaData[0].PostOffice?.[0];
        if (info) {
          let correctedState = info.State;

          // Fix Telangana
          if (
            info.Circle?.toLowerCase().includes("telangana") ||
            info.Region?.toLowerCase().includes("hyderabad") ||
            postal_code.startsWith("50")
          ) {
            correctedState = "Telangana";
          }

          setForm((prev) => ({
            ...prev,
            district: info.District || "",
            city: info.Block || info.Name || info.District || "",
            state: correctedState || "",
            country: "India",
          }));
          return;
        }
      }

      // 🌍 Global fallback
      const res = await fetch(`https://api.zippopotam.us/${form.country?.toLowerCase() || "us"}/${postal_code}`);
      if (res.ok) {
        const data = await res.json();
        const place = data.places?.[0];
        if (place) {
          setForm((prev) => ({
            ...prev,
            city: place["place name"] || "",
            state: place["state"] || "",
            country: data["country"] || "",
          }));
        }
      }
    } catch (err) {
      console.error("Postal lookup failed:", err);
    }
  };

  // 💾 Submit Address
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        house_flat: form.house_flat,
        street: form.street,
        landmark: form.landmark,
        area: form.area,
        district: form.district,
        city: form.city,
        state: form.state,
        postal_code: form.postal_code,
        country: form.country,
      };

      const res = await fetch("http://127.0.0.1:8000/api/addresses/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) navigate("/viewprofile");
    } catch (err) {
      console.error("Error saving address:", err);
    }
  };

  return (
    <div className="address-page">
      <div className="address-container">
        <h2 className="address-title">Address Details</h2>

        <div className="address-card">
          <form onSubmit={handleSubmit} className="address-form">
            {[
              { label: "House / Flat No.", name: "house_flat" },
              { label: "Street", name: "street" },
              { label: "Landmark", name: "landmark" },
              { label: "Area", name: "area" },
              { label: "District", name: "district" },
              { label: "City / Town", name: "city" },
              { label: "State", name: "state" },
              { label: "Country", name: "country" },
              { label: "Pincode", name: "postal_code" },
            ].map((field) => (
              <div key={field.name} className="address-form-group">
                <label>{field.label}</label>
                <input
                  type="text"
                  value={form[field.name]}
                  onChange={
                    field.name === "postal_code"
                      ? handlePostalCodeChange
                      : (e) =>
                          setForm({ ...form, [field.name]: e.target.value })
                  }
                  required={
                    ["house_flat", "street", "area", "postal_code"].includes(
                      field.name
                    )
                  }
                />
              </div>
            ))}

            <button type="submit" className="address-button">
              Save Address
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddressPage;
