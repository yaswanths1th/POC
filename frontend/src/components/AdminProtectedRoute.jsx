import { Navigate } from "react-router-dom";

function AdminProtectedRoute({ children }) {
  const token = localStorage.getItem("access");
<<<<<<< HEAD
  const userData = localStorage.getItem("user");
=======
  const user = JSON.parse(localStorage.getItem("user"));
>>>>>>> c4abb73 (Updated backend and frontend structure, removed old sidebar components)

  // No token at all → login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

<<<<<<< HEAD
  // Parse user only if exists
  let user = null;
  try {
    user = userData ? JSON.parse(userData) : null;
  } catch (err) {
    console.error("Error parsing user from localStorage:", err);
    return <Navigate to="/login" replace />;
  }

  // Not admin → redirect to normal dashboard
  if (!user?.is_superuser && !user?.is_admin && !user?.is_staff) {
=======
  // ✅ Allow any admin/superuser/staff role
  if (!(user?.is_superuser || user?.is_admin || user?.is_staff)) {
>>>>>>> c4abb73 (Updated backend and frontend structure, removed old sidebar components)
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default AdminProtectedRoute;
