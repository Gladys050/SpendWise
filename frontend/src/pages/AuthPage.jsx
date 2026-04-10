import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .auth-root {
    min-height: 100vh;
    background: #0A0A0F;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Syne', sans-serif;
    padding: 1rem;
  }
  .auth-box {
    width: 100%;
    max-width: 400px;
    background: #111118;
    border: 1px solid #1E1E2A;
    border-radius: 20px;
    padding: 2.5rem 2rem;
    animation: fadeUp 0.3s ease;
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .auth-logo {
    font-size: 1.8rem;
    font-weight: 800;
    letter-spacing: -0.04em;
    color: #F0EDE8;
    margin-bottom: 0.25rem;
  }
  .auth-logo span { color: #7C6AF5; }
  .auth-sub {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.7rem;
    color: #444;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 2rem;
  }
  .auth-tabs {
    display: flex;
    background: #0A0A0F;
    border-radius: 8px;
    padding: 3px;
    margin-bottom: 1.75rem;
  }
  .auth-tab {
    flex: 1;
    padding: 0.5rem;
    border: none;
    background: none;
    color: #444;
    font-family: 'Syne', sans-serif;
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    border-radius: 6px;
    transition: all 0.2s;
  }
  .auth-tab.active { background: #1E1E2A; color: #F0EDE8; }
  .auth-field { margin-bottom: 1rem; }
  .auth-label {
    display: block;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.65rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #555;
    margin-bottom: 0.4rem;
  }
  .auth-input {
    width: 100%;
    background: #0A0A0F;
    border: 1px solid #1E1E2A;
    border-radius: 8px;
    padding: 0.65rem 0.9rem;
    color: #F0EDE8;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.82rem;
    outline: none;
    transition: border-color 0.2s;
    box-sizing: border-box;
  }
  .auth-input:focus { border-color: #7C6AF5; }
  .auth-error {
    background: #2A1118;
    border: 1px solid #FF6B6B44;
    border-radius: 8px;
    padding: 0.65rem 0.9rem;
    color: #FF6B6B;
    font-size: 0.75rem;
    font-family: 'JetBrains Mono', monospace;
    margin-bottom: 1rem;
  }
  .auth-btn {
    width: 100%;
    background: #7C6AF5;
    color: #fff;
    border: none;
    border-radius: 8px;
    padding: 0.75rem;
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: 0.9rem;
    cursor: pointer;
    margin-top: 0.5rem;
    transition: background 0.2s, transform 0.1s;
  }
  .auth-btn:hover { background: #6354D4; }
  .auth-btn:active { transform: scale(0.98); }
  .auth-btn:disabled { opacity: 0.5; cursor: not-allowed; }
`;

export default function AuthPage() {
  const [tab, setTab] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();

  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const submit = async () => {
    setError("");
    setLoading(true);
    const result =
      tab === "login"
        ? await login(form.email, form.password)
        : await register(form.name, form.email, form.password);
    if (!result.success) setError(result.message || "Something went wrong.");
    setLoading(false);
  };

  const onKey = (e) => e.key === "Enter" && submit();

  return (
    <>
      <style>{styles}</style>
      <div className="auth-root">
        <div className="auth-box">
          <div className="auth-logo">
            Expense<span>.</span>
          </div>
          <div className="auth-sub">// track every rand</div>

          <div className="auth-tabs">
            <button
              className={`auth-tab ${tab === "login" ? "active" : ""}`}
              onClick={() => {
                setTab("login");
                setError("");
              }}
            >
              Login
            </button>
            <button
              className={`auth-tab ${tab === "register" ? "active" : ""}`}
              onClick={() => {
                setTab("register");
                setError("");
              }}
            >
              Register
            </button>
          </div>

          {error && <div className="auth-error">{error}</div>}

          {tab === "register" && (
            <div className="auth-field">
              <label className="auth-label">Full Name</label>
              <input
                className="auth-input"
                type="text"
                placeholder="John Doe"
                value={form.name}
                onChange={set("name")}
                onKeyDown={onKey}
              />
            </div>
          )}
          <div className="auth-field">
            <label className="auth-label">Email</label>
            <input
              className="auth-input"
              type="email"
              placeholder="you@email.com"
              value={form.email}
              onChange={set("email")}
              onKeyDown={onKey}
            />
          </div>
          <div className="auth-field">
            <label className="auth-label">Password</label>
            <input
              className="auth-input"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={set("password")}
              onKeyDown={onKey}
            />
          </div>

          <button className="auth-btn" onClick={submit} disabled={loading}>
            {loading
              ? "Please wait..."
              : tab === "login"
                ? "Login"
                : "Create Account"}
          </button>
        </div>
      </div>
    </>
  );
}
