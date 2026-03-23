import { useState } from "react";
import "./login.css";
import { adminLogin } from "../api/auth";

export default function Login() {
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors: any = {};

    if (!employeeId) newErrors.employeeId = "Employee ID is required";
    if (!password) newErrors.password = "Password is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    try {
      setLoading(true);
      setErrors({}); // clear previous errors

      const data = await adminLogin(employeeId, password);
      console.log("ADMIN LOGIN RESULT ", data);
      window.location.href = "/";
    } catch (error) {
      setErrors({ general: "Invalid employeeId or password" });
      console.log("Login error:", error);

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Admin Login</h2>

        {/* Employee ID */}
        <input
          placeholder="Employee ID"
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
        />
        {errors.employeeId && (
          <p className="error-text">{errors.employeeId}</p>
        )}

        {/* Password */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {errors.password && (
          <p className="error-text">{errors.password}</p>
        )}

        {/* General error */}
        {errors.general && (
          <p className="error-text center">{errors.general}</p>
        )}

        <button onClick={handleLogin} disabled={loading}>
          {loading ? "Loading..." : "Login"}
        </button>
      </div>
    </div>
  );
}