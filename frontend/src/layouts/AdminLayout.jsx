// src/layouts/AdminLayout.jsx
import React from "react";
import { Outlet, NavLink } from "react-router-dom";
import { LayoutDashboard, Users, BarChart2, Settings } from "lucide-react";
import "./AdminLayout.css";

export default function AdminLayout() {
  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <h2 className="sidebar-title">Admin Panel</h2>
        <nav className="sidebar-nav">
          <NavLink to="/admin/dashboard" className="nav-link">
            <LayoutDashboard size={18} /> Dashboard
          </NavLink>
          <NavLink to="/admin/users" className="nav-link">
            <Users size={18} /> Manage Users
          </NavLink>
          <NavLink to="/admin/reports" className="nav-link">
            <BarChart2 size={18} /> Reports
          </NavLink>
          <NavLink to="/admin/settings" className="nav-link">
            <Settings size={18} /> Settings
          </NavLink>
        </nav>
      </aside>

      {/* Main Section */}
      <div className="admin-main-wrapper">
        {/* Header */}
        <header className="admin-header">
          <h2 className="header-title">Welcome, Admin</h2>
          <div className="header-right">
            <div className="avatar">Y</div>
            <span>Yaswanth</span>
          </div>
        </header>

        {/* Scrollable Main Content */}
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
