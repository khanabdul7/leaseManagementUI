import './RegisterPage.css';
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post("/api/auth/register", {
        email,
        password
      });

      setMessage("✅ Registration successful. Redirecting to login...");
      setLoading(false);
      setTimeout(() => {
        navigate("/login", {
          state: { message: "Account created successfully. Please login." }
        });
      }, 3000);
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed !!"
      );
      setLoading(false);
    }
  };

  const getStrength = (password) => {
    if (password.length < 6) return "Weak";
    if (/[-Za-z]/.test(password) && /\d/.test(password))
      return "Strong";
    return "Medium";
  };




  return (
    <div className="register-page">
      <div className="register-card">
        <h2>Lease Management</h2>
        <p className="subtitle">Create a new account</p>

        {message && <div className="success-msg">{message}</div>}
        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="text"
              placeholder="Choose an email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? "Hide" : "Show"}
              </span>
            </div>

            {password && (
              <p className={`strength ${getStrength(password).toLowerCase()}`}>
                Strength: {getStrength(password)}
              </p>
            )}
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="register-btn" disabled={loading}>
            {loading ? "Creating..." : "Register"}
          </button>
        </form>

        <p className="link-text">
          Already have an account?
          <span onClick={() => navigate("/login")}> Login</span>
        </p>
      </div>
    </div>
  );
}
