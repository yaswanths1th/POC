import { Navigate } from "react-router-dom";

function AdminProtectedRoute({ children }) {
  const token = localStorage.getItem("access");
  const user = JSON.parse(localStorage.getItem("user")); // Store user info when login

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!user?.is_superuser) {
    return <Navigate to="/dashboard" replace />; // redirect normal users
  }

  return children;
}

export default AdminProtectedRoute;
