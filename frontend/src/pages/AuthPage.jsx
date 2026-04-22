import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Darker+Grotesque:wght@400;500;600;700;900&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }


  .sw-root::before {
    content: '';
    position: fixed;
    top: -40%;
    left: -20%;
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, #00FF8722 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
  }

  .sw-root::after {
    content: '';
    position: fixed;
    bottom: -30%;
    right: -10%;
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, #00C46322 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
  }

.sw-root {
  position: relative;
  min-height: 100vh;
  overflow-x: hidden;
}

.sw-container {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 100%;
  min-height: 100vh;
  display: flex;
  border-radius: 0;
  overflow: hidden;
}

  /* LEFT PANEL — forms */
  .sw-forms {
  flex: 1 1 50%;
  min-width: 0;
  background: #0D1210;
  position: relative;
  overflow: hidden;
  height: 100vh;
}

  .sw-form-panel {
    position: absolute;
    inset: 0;
    padding: 3rem 2.5rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
    transition: transform 0.6s cubic-bezier(0.77,0,0.175,1), opacity 0.4s ease;
  }

  .sw-form-panel.login { transform: translateX(0); opacity: 1; }
  .sw-form-panel.login.hidden { transform: translateX(-100%); opacity: 0; pointer-events: none; }
  .sw-form-panel.register { transform: translateX(100%); opacity: 0; pointer-events: none; }
  .sw-form-panel.register.visible { transform: translateX(0); opacity: 1; pointer-events: all; }

  .sw-form-tag {
    font-family: 'Darker Grotesque', sans-serif;
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #00FF87;
    margin-bottom: 0.5rem;
  }

  .sw-form-title {
    font-family: 'Darker Grotesque', sans-serif;
    font-size: 2rem;
    font-weight: 900;
    color: #F0FFF8;
    letter-spacing: -0.03em;
    line-height: 1.1;
    margin-bottom: 0.4rem;
  }

  .sw-form-sub {
    font-size: 0.8rem;
    color: #3D5A4A;
    margin-bottom: 1.75rem;
    font-weight: 400;
  }

  .sw-field {
    margin-bottom: 0.9rem;
    position: relative;
  }

  .sw-label {
    display: block;
    font-size: 0.65rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #2A4A38;
    margin-bottom: 0.35rem;
  }

  .sw-input {
    width: 100%;
    background: #111A14;
    border: 1px solid #1A2E22;
    border-radius: 10px;
    padding: 0.7rem 1rem;
    color: #E8FFF2;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.85rem;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .sw-input::placeholder { color: #2A4A38; }
  .sw-input:focus {
    border-color: #00FF87;
    box-shadow: 0 0 0 3px rgba(0,255,135,0.08);
  }

  .sw-error {
    background: rgba(255,80,80,0.08);
    border: 1px solid rgba(255,80,80,0.2);
    border-radius: 8px;
    padding: 0.6rem 0.9rem;
    color: #FF6B6B;
    font-size: 0.75rem;
    margin-bottom: 0.9rem;
  }

  .sw-btn {
    width: 100%;
    background: linear-gradient(135deg, #00FF87, #00C463);
    color: #020F06;
    border: none;
    border-radius: 10px;
    padding: 0.8rem;
    font-family: 'Darker Grotesque', sans-serif;
    font-weight: 900;
    font-size: 1rem;
    letter-spacing: 0.02em;
    cursor: pointer;
    margin-top: 0.25rem;
    transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
    box-shadow: 0 4px 20px rgba(0,255,135,0.25);
  }
  .sw-btn:hover {
    opacity: 0.92;
    transform: translateY(-1px);
    box-shadow: 0 8px 28px rgba(0,255,135,0.35);
  }
  .sw-btn:active { transform: translateY(0); }
  .sw-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

  .sw-switch-mobile {
    display: none;
    margin-top: 1.25rem;
    text-align: center;
    font-size: 0.8rem;
    color: #2A4A38;
  }
  .sw-switch-mobile button {
    background: none;
    border: none;
    color: #00FF87;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    margin-left: 0.3rem;
  }

  /* RIGHT PANEL — sliding overlay */
  .sw-overlay {
  flex: 1 1 50%;
  width: auto;
  min-width: 0;
  background: linear-gradient(160deg, #00FF87 0%, #00A854 50%, #006633 100%);
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1.5rem;
  text-align: center;
  overflow: hidden;
  height: 100vh;
  transition: transform 0.6s cubic-bezier(0.77,0,0.175,1);
}

  /* When register is active, slide overlay to left */
  .sw-container.register-mode .sw-overlay {
    order: -1;
  }

  .sw-overlay::before {
    content: '';
    position: absolute;
    top: -60px; right: -60px;
    width: 220px; height: 220px;
    border-radius: 50%;
    background: rgba(255,255,255,0.08);
  }
  .sw-overlay::after {
    content: '';
    position: absolute;
    bottom: -40px; left: -40px;
    width: 160px; height: 160px;
    border-radius: 50%;
    background: rgba(255,255,255,0.06);
  }

  .sw-overlay-logo {
    font-family: 'Darker Grotesque', sans-serif;
    font-size: 1.9rem;
    font-weight: 900;
    color: #020F06;
    letter-spacing: -0.04em;
    margin-bottom: 0.2rem;
    position: relative;
    z-index: 1;
  }

  .sw-overlay-logo span {
    color: rgba(2,15,6,0.45);
  }

  .sw-overlay-tagline {
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: rgba(2,15,6,0.5);
    margin-bottom: 2rem;
    position: relative;
    z-index: 1;
  }

  .sw-overlay-title {
    font-family: 'Darker Grotesque', sans-serif;
    font-size: 1.5rem;
    font-weight: 900;
    color: #020F06;
    letter-spacing: -0.03em;
    line-height: 1.2;
    margin-bottom: 0.75rem;
    position: relative;
    z-index: 1;
  }

  .sw-overlay-text {
    font-size: 0.8rem;
    color: rgba(2,15,6,0.6);
    line-height: 1.6;
    margin-bottom: 2rem;
    position: relative;
    z-index: 1;
  }

  .sw-overlay-btn {
    background: transparent;
    border: 2px solid rgba(2,15,6,0.3);
    border-radius: 10px;
    padding: 0.65rem 1.75rem;
    font-family: 'Darker Grotesque', sans-serif;
    font-weight: 700;
    font-size: 0.9rem;
    color: #020F06;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
    z-index: 1;
    letter-spacing: 0.02em;
  }
  .sw-overlay-btn:hover {
    background: rgba(2,15,6,0.1);
    border-color: rgba(2,15,6,0.5);
  }

  /* Decorative chart lines on overlay */
  .sw-deco {
    position: absolute;
    bottom: 60px;
    left: 50%;
    transform: translateX(-50%);
    width: 160px;
    opacity: 0.15;
    z-index: 0;
  }

  /* Stats pills */
  .sw-stat {
    position: absolute;
    background: rgba(2,15,6,0.12);
    border-radius: 20px;
    padding: 0.4rem 0.8rem;
    font-size: 0.65rem;
    font-weight: 700;
    color: rgba(2,15,6,0.7);
    letter-spacing: 0.05em;
    z-index: 1;
  }
  .sw-stat-1 { top: 1.5rem; left: 1.5rem; }
  .sw-stat-2 { bottom: 1.5rem; right: 1.5rem; }

  @media (max-width: 640px) {
    .sw-overlay { display: none; }
    .sw-switch-mobile { display: block; }
    .sw-form-panel { padding: 2rem 1.5rem; }
  }
`;

export default function AuthPage() {
  const [mode, setMode] = useState("login"); // 'login' | 'register'
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();

  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const switchMode = (m) => {
    setMode(m);
    setError("");
    setForm({ name: "", email: "", password: "" });
  };

  const submit = async () => {
    setError("");
    setLoading(true);
    const result =
      mode === "login"
        ? await login(form.email, form.password)
        : await register(form.name, form.email, form.password);
    if (!result.success) setError(result.message || "Something went wrong.");
    setLoading(false);
  };

  const onKey = (e) => e.key === "Enter" && submit();

  return (
    <>
      <style>{styles}</style>
      <div className="sw-root">
        <div className="sw-grid" />

        <div
          className={`sw-container ${mode === "register" ? "register-mode" : ""}`}
        >
          {/* FORMS SIDE */}
          <div className="sw-forms">
            {/* LOGIN FORM */}
            <div
              className={`sw-form-panel login ${mode === "register" ? "hidden" : ""}`}
            >
              <div className="sw-form-tag">Welcome back</div>
              <div className="sw-form-title">
                Sign in to
                <br />
                SpendWise
              </div>
              <div className="sw-form-sub">
                Track your spending, grow your wealth.
              </div>

              {error && <div className="sw-error">{error}</div>}

              <div className="sw-field">
                <label className="sw-label">Email</label>
                <input
                  className="sw-input"
                  type="email"
                  placeholder="you@email.com"
                  value={form.email}
                  onChange={set("email")}
                  onKeyDown={onKey}
                />
              </div>
              <div className="sw-field">
                <label className="sw-label">Password</label>
                <input
                  className="sw-input"
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={set("password")}
                  onKeyDown={onKey}
                />
              </div>

              <button className="sw-btn" onClick={submit} disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </button>

              <div className="sw-switch-mobile">
                Don't have an account?
                <button onClick={() => switchMode("register")}>
                  Create one
                </button>
              </div>
            </div>

            {/* REGISTER FORM */}
            <div
              className={`sw-form-panel register ${mode === "register" ? "visible" : ""}`}
            >
              <div className="sw-form-tag">Get started</div>
              <div className="sw-form-title">
                Create your
                <br />
                account
              </div>
              <div className="sw-form-sub">
                Join thousands managing money smarter.
              </div>

              {error && <div className="sw-error">{error}</div>}

              <div className="sw-field">
                <label className="sw-label">Full Name</label>
                <input
                  className="sw-input"
                  type="text"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={set("name")}
                  onKeyDown={onKey}
                />
              </div>
              <div className="sw-field">
                <label className="sw-label">Email</label>
                <input
                  className="sw-input"
                  type="email"
                  placeholder="you@email.com"
                  value={form.email}
                  onChange={set("email")}
                  onKeyDown={onKey}
                />
              </div>
              <div className="sw-field">
                <label className="sw-label">Password</label>
                <input
                  className="sw-input"
                  type="password"
                  placeholder="min. 6 characters"
                  value={form.password}
                  onChange={set("password")}
                  onKeyDown={onKey}
                />
              </div>

              <button className="sw-btn" onClick={submit} disabled={loading}>
                {loading ? "Creating account..." : "Create Account"}
              </button>

              <div className="sw-switch-mobile">
                Already have an account?
                <button onClick={() => switchMode("login")}>Sign in</button>
              </div>
            </div>
          </div>

          {/* OVERLAY SIDE */}
          <div className="sw-overlay">
            <div className="sw-stat sw-stat-1">📈 +24% this month</div>
            <div className="sw-stat sw-stat-2">💰 R12,450 saved</div>

            <div className="sw-overlay-logo">
              Spend<span>Wise</span>
            </div>
            <div className="sw-overlay-tagline">Smart Money Management</div>

            {mode === "login" ? (
              <>
                <div className="sw-overlay-title">
                  New here?
                  <br />
                  Join us today
                </div>
                <div className="sw-overlay-text">
                  Create an account and start tracking your expenses, setting
                  budgets, and building better financial habits.
                </div>
                <button
                  className="sw-overlay-btn"
                  onClick={() => switchMode("register")}
                >
                  Create Account
                </button>
              </>
            ) : (
              <>
                <div className="sw-overlay-title">
                  Already have
                  <br />
                  an account?
                </div>
                <div className="sw-overlay-text">
                  Sign in to access your dashboard, view your spending history
                  and stay on top of your budget.
                </div>
                <button
                  className="sw-overlay-btn"
                  onClick={() => switchMode("login")}
                >
                  Sign In
                </button>
              </>
            )}

            {/* Decorative SVG chart */}
            <svg className="sw-deco" viewBox="0 0 160 60" fill="none">
              <polyline
                points="0,50 30,35 60,42 90,15 120,25 160,5"
                stroke="rgba(2,15,6,0.6)"
                strokeWidth="2"
                fill="none"
              />
              <polyline
                points="0,50 30,35 60,42 90,15 120,25 160,5"
                stroke="rgba(2,15,6,0.3)"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="90" cy="15" r="4" fill="rgba(2,15,6,0.5)" />
              <circle cx="160" cy="5" r="4" fill="rgba(2,15,6,0.5)" />
            </svg>
          </div>
        </div>
      </div>
    </>
  );
}
