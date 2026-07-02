import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";

export default function AuthScreen() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="brand auth-brand">
          <svg className="brand-mark" width="30" height="30" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2C12 7.523 16.477 12 22 12C16.477 12 12 16.477 12 22C12 16.477 7.523 12 2 12C7.523 12 12 7.523 12 2Z"
              fill="url(#BeatBoxGradAuth)"
            />
            <defs>
              <linearGradient id="BeatBoxGradAuth" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                <stop stopColor="#4285F4" />
                <stop offset="0.5" stopColor="#9B72CB" />
                <stop offset="1" stopColor="#D96570" />
              </linearGradient>
            </defs>
          </svg>
          <span className="brand-name">BeatBox</span>
        </div>

        <h1 className="auth-title">{mode === "login" ? "Welcome back" : "Create your account"}</h1>
        <p className="auth-subtitle">
          {mode === "login" ? "Log in to see your chat history." : "Sign up to start chatting with BeatBox."}
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === "signup" && (
            <label className="auth-field">
              <span>Name</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
                placeholder="Ada Lovelace"
              />
            </label>
          )}

          <label className="auth-field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="you@example.com"
            />
          </label>

          <label className="auth-field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              placeholder="At least 6 characters"
            />
          </label>

          {error && <div className="error-banner auth-error">{error}</div>}

          <button type="submit" className="auth-submit" disabled={submitting}>
            {submitting ? "Please wait…" : mode === "login" ? "Log in" : "Sign up"}
          </button>
        </form>

        <p className="auth-toggle">
          {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            type="button"
            className="auth-toggle-btn"
            onClick={() => {
              setError(null);
              setMode(mode === "login" ? "signup" : "login");
            }}
          >
            {mode === "login" ? "Sign up" : "Log in"}
          </button>
        </p>
      </div>
    </div>
  );
}
