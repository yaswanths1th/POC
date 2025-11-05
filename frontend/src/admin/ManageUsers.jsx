// src/admin/ManageUsers.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./ManageUsers.css";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [isAdding, setIsAdding] = useState(false);
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    role: "User",
    is_active: "Active",
  });

  const [showConfirm, setShowConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const usersPerPage = 10;
  const token = localStorage.getItem("access");
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/accounts/all-users/", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const fetchedUsers = Array.isArray(res.data)
        ? res.data
        : res.data.results || [];

      const formatted = fetchedUsers.map((u, index) => ({
        id: u.id || index + 1,
        name: u.username,
        email: u.email,
        role: u.is_superuser ? "Admin" : "User",
        status: u.is_active ? "Active" : "Inactive",
        joined: new Date(u.date_joined).toLocaleDateString(),
      }));

      setUsers(formatted);
    } catch (err) {
      console.error("❌ Error fetching users:", err.response?.data || err.message);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "All Status" || user.status === statusFilter;
    const matchesRole = roleFilter === "All Roles" || user.role === roleFilter;
    return matchesSearch && matchesStatus && matchesRole;
  });

  // Pagination Logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / usersPerPage));

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  // When clicking "Edit" from the table we navigate to the user's view profile.
  // Keep this behavior (so admin can review before editing). We also store edit_user_id
  // so the EditProfilePage can pick up edit mode when admin moves to edit.
  const handleEditClick = (user) => {
    try {
      localStorage.setItem("edit_user_id", String(user.id));
    } catch (e) {
      // ignore storage errors
    }
    navigate(`/viewprofile/${user.id}`);
  };

  // Explicit Add handler: clear any leftover edit_user_id and go to edit-profile (Add mode)
  const handleAddUser = () => {
    try {
      localStorage.removeItem("edit_user_id"); // ensures EditProfilePage enters "Add" mode
    } catch (e) {
      // ignore storage errors
    }
    navigate("/edit-profile");
  };

  const handleNewUserChange = (e) => {
    const { name, value } = e.target;
    setNewUser({ ...newUser, [name]: value });
  };

  const handleSaveNewUser = () => {
    if (!newUser.name || !newUser.email) {
      return;
    }
    const newEntry = {
      id: users.length + 1,
      ...newUser,
      joined: new Date().toLocaleDateString(),
    };
    setUsers([...users, newEntry]);
    setIsAdding(false);
  };

  const handleCancel = () => setIsAdding(false);

  const handleDelete = (user) => {
    setUserToDelete(user);
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    try {
      const res = await axios.delete(
        `http://127.0.0.1:8000/api/accounts/delete-user/${userToDelete.id}/`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      if (res.status === 204 || res.status === 200) {
        setUsers(users.filter((u) => u.id !== userToDelete.id));
      } else {
        console.warn("⚠️ Unexpected response:", res.status, res.data);
      }
    } catch (err) {
      console.error("❌ Error deleting user:", err.response?.data || err.message);
    } finally {
      setShowConfirm(false);
      setUserToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowConfirm(false);
    setUserToDelete(null);
  };

  const handleExport = () => {
    const csv = [
      ["Name", "Email", "Role", "Status", "Joined"],
      ...users.map((u) => [u.name, u.email, u.role, u.status, u.joined]),
    ]
      .map((r) => r.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "users.csv";
    link.click();
  };

  return (
    <div className="manage-users-page">
      {/* Header */}
      <div className="manage-users-header">
        <div className="header-left">
          <h2>User Management</h2>
          <p>View, edit, and manage all registered users efficiently.</p>
        </div>
        <div className="header-right">
          <button className="btn btn-gray" onClick={handleExport}>Export</button>
          <button
  className="btn btn-primary"
  onClick={() => {
    localStorage.removeItem("edit_user_id");
    navigate("/edit-profile");
  }}
>
  + Add User
</button>
        </div>
      </div>

      {/* Filters */}
      <div className="manage-users-filters">
        <input
          type="text"
          placeholder="Search by name or email..."
          className="search-input"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1); // reset to page 1 on new search
          }}
        />
        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
        >
          <option>All Status</option>
          <option>Active</option>
          <option>Inactive</option>
        </select>
        <select
          className="filter-select"
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}
        >
          <option>All Roles</option>
          <option>Admin</option>
          <option>User</option>
        </select>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table className="manage-users-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isAdding && (
              <tr className="adding-row">
                <td>
                  <input
                    name="name"
                    value={newUser.name}
                    onChange={handleNewUserChange}
                    placeholder="Enter name"
                  />
                </td>
                <td>
                  <input
                    name="email"
                    value={newUser.email}
                    onChange={handleNewUserChange}
                    placeholder="Enter email"
                  />
                </td>
                <td>
                  <select name="role" value={newUser.role} onChange={handleNewUserChange}>
                    <option>Admin</option>
                    <option>User</option>
                  </select>
                </td>
                <td>
                  <select name="status" value={newUser.status} onChange={handleNewUserChange}>
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </td>
                <td>—</td>
                <td className="actions">
                  <button className="icon-btn save" onClick={handleSaveNewUser}>💾</button>
                  <button className="icon-btn cancel" onClick={handleCancel}>❌</button>
                </td>
              </tr>
            )}

            {currentUsers.length > 0 ? (
              currentUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`role-badge ${user.role.toLowerCase()}`}>{user.role}</span>
                  </td>
                  <td>
                    <span className={`status ${user.status.toLowerCase()}`}>{user.status}</span>
                  </td>
                  <td>{user.joined}</td>
                  <td className="actions">
                    <button className="icon-btn edit" onClick={() => handleEditClick(user)}>✏️</button>
                    <button className="icon-btn delete" onClick={() => handleDelete(user)}>🗑️</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", color: "#999" }}>
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination Controls */}
        {filteredUsers.length > usersPerPage && (
          <div className="pagination-controls">
            <button
              className="btn btn-gray"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
            >
              &lt;&lt; Prev
            </button>

            <span className="page-info">
              Page {currentPage} of {totalPages}
            </span>

            <button
              className="btn btn-gray"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              Next &gt;&gt;
            </button>
          </div>
        )}
      </div>

      {/* Custom Delete Popup */}
      {showConfirm && (
        <div className="confirm-overlay">
          <div className="confirm-box">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete <strong>{userToDelete?.name}</strong>?</p>
            <div className="confirm-buttons">
              <button className="btn btn-danger" onClick={confirmDelete}>Delete</button>
              <button className="btn btn-gray" onClick={cancelDelete}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
