import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./LoginPage.css";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://127.0.0.1:8000/api/auth/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      console.log("🧠 Login response:", data);

      if (!response.ok) {
        setError("Login failed: " + (data.detail || "Unknown error"));
        return;
      }

      // ✅ Save access & refresh tokens
      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);

      // ✅ Store user info including ID
      const userInfo = {
        id: data.id, // 👈 make sure backend returns `id`
        username: data.username,
        email: data.email,
        is_superuser: data.is_superuser,
        is_staff: data.is_staff,
        is_admin: data.is_admin,
      };
      localStorage.setItem("user", JSON.stringify(userInfo));

      // ✅ Redirect admins to dashboard
      if (data.is_admin || data.is_superuser || data.is_staff) {
        console.log("✅ Redirecting to admin dashboard...");
        navigate("/admin/dashboard", { replace: true });
        return;
      }

      // ✅ Check if address exists for normal users
      const token = data.access;
      const checkResponse = await fetch(
        "http://127.0.0.1:8000/api/addresses/check/",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const checkData = await checkResponse.json();
      console.log("🏠 Address check:", checkData);

      if (checkResponse.ok && checkData.has_address) {
  navigate(`/viewprofile/${data.id}`, { replace: true });
} else {
  navigate("/addresses", { replace: true });
}

    } catch (err) {
      console.error("❌ Login error:", err);
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin} className="login-form" noValidate>
        <input
          className="login-input"
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          className="login-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="login-error">{error}</p>}
        <button className="login-button" type="submit">
          Login
        </button>
      </form>

      <div className="login-links">
        <p>
          <Link to="/forgot-password">Forgot password?</Link>
        </p>
        <p>
          Don’t have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
