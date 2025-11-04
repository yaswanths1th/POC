import React, { useState } from "react";
import "./ManageUsers.css";

export default function ManageUsers() {
  const [users, setUsers] = useState([
    { id: 1, name: "Jay", email: "jay@gmail.com", role: "Admin", status: "Active", joined: "Jan 20, 2025" },
    { id: 2, name: "Yash", email: "yash@gmail.com", role: "User", status: "Inactive", joined: "Jan 22, 2025" },
    { id: 3, name: "Pooja", email: "pooja@gmail.com", role: "User", status: "Active", joined: "Feb 01, 2025" },
  ]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [roleFilter, setRoleFilter] = useState("All Roles");

  const [editUserId, setEditUserId] = useState(null);
  const [editData, setEditData] = useState({ name: "", email: "", role: "", status: "" });

  const [isAdding, setIsAdding] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "User", status: "Active" });

  // 🔍 Filtering
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "All Status" || user.status === statusFilter;
    const matchesRole = roleFilter === "All Roles" || user.role === roleFilter;
    return matchesSearch && matchesStatus && matchesRole;
  });

  // ✏️ Edit existing user
  const handleEditClick = (user) => {
    setEditUserId(user.id);
    setEditData({ name: user.name, email: user.email, role: user.role, status: user.status });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData({ ...editData, [name]: value });
  };

  const handleSave = (id) => {
    const updatedUsers = users.map((u) =>
      u.id === id ? { ...u, ...editData } : u
    );
    setUsers(updatedUsers);
    setEditUserId(null);
  };

  const handleCancel = () => {
    setEditUserId(null);
    setIsAdding(false);
  };

  // ➕ Inline Add User
  const handleAddUser = () => {
    setIsAdding(true);
    setNewUser({ name: "", email: "", role: "User", status: "Active" });
  };

  const handleNewUserChange = (e) => {
    const { name, value } = e.target;
    setNewUser({ ...newUser, [name]: value });
  };

  const handleSaveNewUser = () => {
    if (!newUser.name || !newUser.email) {
      alert("Please fill in all required fields!");
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

  // 🗑️ Delete
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      setUsers(users.filter((u) => u.id !== id));
    }
  };

  // 📤 Export CSV
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
          <button className="btn btn-primary" onClick={handleAddUser}>+ Add User</button>
        </div>
      </div>

      {/* Filters */}
      <div className="manage-users-filters">
        <input
          type="text"
          placeholder="Search by name or email..."
          className="search-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option>All Status</option>
          <option>Active</option>
          <option>Inactive</option>
        </select>
        <select
          className="filter-select"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
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
            {/* Add new user inline row */}
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

            {/* Normal user rows */}
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user.id}>
                  {editUserId === user.id ? (
                    <>
                      <td><input name="name" value={editData.name} onChange={handleEditChange} /></td>
                      <td><input name="email" value={editData.email} onChange={handleEditChange} /></td>
                      <td>
                        <select name="role" value={editData.role} onChange={handleEditChange}>
                          <option>Admin</option>
                          <option>User</option>
                        </select>
                      </td>
                      <td>
                        <select name="status" value={editData.status} onChange={handleEditChange}>
                          <option>Active</option>
                          <option>Inactive</option>
                        </select>
                      </td>
                      <td>{user.joined}</td>
                      <td className="actions">
                        <button className="icon-btn save" onClick={() => handleSave(user.id)}>💾</button>
                        <button className="icon-btn cancel" onClick={handleCancel}>❌</button>
                      </td>
                    </>
                  ) : (
                    <>
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
                        <button className="icon-btn delete" onClick={() => handleDelete(user.id)}>🗑️</button>
                      </td>
                    </>
                  )}
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
      </div>
    </div>
  );
}
