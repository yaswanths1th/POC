// src/admin/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import "../layouts/AdminLayout.css";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ today: 0, week: 0, total: 0 });
  const [recentUsers, setRecentUsers] = useState([]);

  const token = localStorage.getItem("access");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await axios.get(
        "http://127.0.0.1:8000/api/viewprofile/admin/users/",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const users = Array.isArray(res.data)
        ? res.data
        : res.data.results || [];

      // sort newest first
      const sorted = [...users].sort(
        (a, b) => new Date(b.date_joined) - new Date(a.date_joined)
      );

      const today = new Date().toISOString().slice(0, 10);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const todayCount = sorted.filter(
        (u) => u.date_joined && u.date_joined.slice(0, 10) === today
      ).length;

      const weekCount = sorted.filter(
        (u) => new Date(u.date_joined) >= weekAgo
      ).length;

      setStats({
        today: todayCount,
        week: weekCount,
        total: sorted.length,
      });
      setRecentUsers(sorted.slice(0, 4));
    } catch (err) {
      console.error("Error loading dashboard:", err.response?.data || err.message);
    }
  };

  return (
    <div className="admin-dashboard-container">
      {/* 👋 Welcome */}
      <section className="welcome-section">
        <h1 className="welcome-text">Welcome To Admin Dashboard..!!</h1>
        <p className="subtitle">Manage your platform and settings</p>
      </section>

      {/* 📊 Registration Stats */}
      <section className="stats-section">
        <h3 className="section-title">User Registrations</h3>
        <div className="stats-cards">
          <div className="stat-card orange">
            <div className="stat-info">
              <h2>{stats.today}</h2>
              <p>Today's Registrations</p>
            </div>
            <span className="badge orange">Today</span>
          </div>

          <div className="stat-card blue">
            <div className="stat-info">
              <h2>{stats.week}</h2>
              <p>Weekly Registrations</p>
            </div>
            <span className="badge blue">Week</span>
          </div>

          <div className="stat-card green">
            <div className="stat-info">
              <h2>{stats.total}</h2>
              <p>Total Registrations</p>
            </div>
            <span className="badge green">All Time</span>
          </div>
        </div>
      </section>

      {/* 🧾 Recent Registrations */}
      <section className="recent-section">
        <h3 className="section-title">Recent Registrations</h3>
        <div className="recent-table">
          {recentUsers.length === 0 ? (
            <p className="empty-text">No recent registrations found.</p>
          ) : (
            recentUsers.map((user) => (
              <div key={user.id} className="recent-row">
                <div className="user-info">
                  <div className="user-name">{user.username}</div>
                  <div className="user-email">{user.email}</div>
                </div>
                <div className="user-status active">Active</div>
                <div className="user-date">
                  {new Date(user.date_joined).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
