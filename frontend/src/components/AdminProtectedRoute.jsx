import { Navigate } from "react-router-dom";

function AdminProtectedRoute({ children }) {
  const token = localStorage.getItem("access");
  const userData = localStorage.getItem("user");

  // No token at all → login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

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
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default AdminProtectedRoute;
