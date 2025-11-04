import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./AdminSidebar.css";

export default function AdminSidebar() {
  const loc = useLocation().pathname;

  const items = [
    { name: "Dashboard", path: "/admin/dashboard", icon: "▦" },
    { name: "Manage Users", path: "/admin/users", icon: "👥" },
    { name: "Reports", path: "/admin/reports", icon: "📊" },
    { name: "Settings", path: "/admin/settings", icon: "⚙️" },
  ];

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-top">
        <h2 className="sidebar-logo">Admin Panel</h2>
      </div>

      <nav className="sidebar-nav">
        {items.map((it) => (
          <Link
            to={it.path}
            key={it.path}
            className={`nav-item ${loc === it.path ? "active" : ""}`}
          >
            <span className="nav-icon">{it.icon}</span>
            <span className="nav-text">{it.name}</span>
          </Link>
        ))}
      </nav>

      <div style={{flex:1}} />

      <button className="logout-btn" onClick={handleLogout}>
        ⤺ Logout
      </button>
    </aside>
  );
}
