import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import toast from "react-hot-toast";
import { Eye, EyeOff, Sun, Moon, Zap, Shield, Database, BarChart2 } from "lucide-react";

const FEATURES = [
  { icon: Zap,       label: "Natural Language to SQL", sub: "Ask questions in plain English — Vanna AI writes the SQL" },
  { icon: Database,  label: "8 Database Profiles",     sub: "PostgreSQL · MySQL · Oracle · MSSQL · MongoDB" },
  { icon: Shield,    label: "Enterprise Security",     sub: "RBAC, audit trails, token-based access control" },
  { icon: BarChart2, label: "Real-time Analytics",     sub: "Dashboard, query history, usage insights" },
];

export default function Login() {
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      const detail = err.response?.data?.detail;
      const msg = Array.isArray(detail)
        ? (detail[0]?.msg || "Validation error")
        : (typeof detail === "string" ? detail : "Invalid credentials");
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      fontFamily: "'Inter', system-ui, sans-serif",
      opacity: mounted ? 1 : 0,
      transition: "opacity 0.4s ease",
    }}>

      {/* ── LEFT: Background Image Panel ── */}
      <div className="lg-panel" style={{
        flex: 1,
        position: "relative",
        overflow: "hidden",
        display: "none",
      }}>
        {/* Background image */}
        <img
          src="/ongc-bg4.jpg"
          alt="ONGC Platform"
          style={{
            position: "absolute", inset: 0,
            width: "100%", height: "100%",
            objectFit: "cover",
            objectPosition: "center",
            filter: "brightness(0.7) saturate(1.1)",
          }}
        />

        {/* Gradient overlay — ensures text always readable */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(135deg, rgba(120,0,0,0.82) 0%, rgba(10,14,26,0.78) 60%, rgba(10,14,26,0.88) 100%)",
        }} />
        {/* Bottom dark fade */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: "35%",
          background: "linear-gradient(to top, rgba(10,14,26,0.95), transparent)",
        }} />

        {/* Content over image */}
        <div style={{
          position: "relative", zIndex: 10,
          height: "100%",
          display: "flex", flexDirection: "column",
          justifyContent: "space-between",
          padding: "40px 48px",
        }}>
          {/* Top: Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <img src="/ongc-logo.png" alt="ONGC" style={{ width: 60, height: 60, borderRadius: 10, boxShadow: "0 4px 20px rgba(0,0,0,0.5)" }} />
            <div>
              <div style={{ color: "#fff", fontWeight: 800, fontSize: 22, letterSpacing: 2, textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>ONGC</div>
              <div style={{ color: "rgba(255,210,210,0.85)", fontSize: 11, letterSpacing: 1, marginTop: 2, textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>OIL AND NATURAL GAS CORPORATION</div>
            </div>
          </div>

          {/* Center: Headline */}
          <div>
            <div style={{
              display: "inline-block",
              background: "rgba(204,0,0,0.25)",
              border: "1px solid rgba(204,0,0,0.45)",
              borderRadius: 6,
              padding: "4px 12px",
              fontSize: 11,
              color: "#ff9999",
              fontWeight: 600,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              marginBottom: 18,
            }}>
              AI-Powered Platform
            </div>
            <h1 style={{
              color: "#fff",
              fontSize: 42,
              fontWeight: 800,
              margin: 0,
              lineHeight: 1.15,
              textShadow: "0 2px 12px rgba(0,0,0,0.6)",
            }}>
              Energy:<br/>
              <span style={{ color: "#FFD700" }}>Now</span> AND <span style={{ color: "#FFD700" }}>Next</span>
            </h1>
            <p style={{
              color: "rgba(220,230,255,0.85)",
              marginTop: 16,
              fontSize: 16,
              lineHeight: 1.7,
              maxWidth: 420,
              textShadow: "0 1px 6px rgba(0,0,0,0.5)",
            }}>
              Enterprise Database Intelligence Platform — ask any question, get instant answers powered by Vanna AI.
            </p>

            {/* Feature list */}
            <div style={{ marginTop: 36, display: "flex", flexDirection: "column", gap: 16 }}>
              {FEATURES.map(({ icon: Icon, label, sub }) => (
                <div key={label} style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 9,
                    background: "rgba(204,0,0,0.3)",
                    border: "1px solid rgba(204,0,0,0.5)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <Icon size={16} color="#ff9999" />
                  </div>
                  <div>
                    <div style={{ color: "#fff", fontSize: 14, fontWeight: 600, textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>{label}</div>
                    <div style={{ color: "rgba(200,215,240,0.75)", fontSize: 12, marginTop: 2, textShadow: "0 1px 3px rgba(0,0,0,0.4)" }}>{sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom: footer text */}
          <div style={{ color: "rgba(180,200,230,0.5)", fontSize: 11, letterSpacing: 0.5 }}>
            © 2024 Oil and Natural Gas Corporation Limited. All rights reserved.
          </div>
        </div>
      </div>

      {/* ── RIGHT: Login Form Panel ── */}
      <div style={{
        width: "100%",
        maxWidth: 460,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 36px",
        background: "var(--surface)",
        position: "relative",
        boxShadow: "inset -1px 0 0 var(--border)",
      }}>
        {/* Subtle background texture for right panel */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "url(/ongc-bg2.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: theme === "dark" ? 0.04 : 0.03,
        }} />

        {/* Theme toggle — top right */}
        <button
          onClick={toggleTheme}
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          style={{
            position: "absolute", top: 20, right: 20,
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 8, padding: "7px 10px",
            cursor: "pointer", color: "var(--text2)",
            display: "flex", alignItems: "center", gap: 6,
            fontSize: 12,
            transition: "background 0.2s, color 0.2s",
            zIndex: 10,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "var(--surface2)"; e.currentTarget.style.color = "var(--text)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "var(--card)"; e.currentTarget.style.color = "var(--text2)"; }}
        >
          {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
          {theme === "dark" ? "Light" : "Dark"}
        </button>

        {/* Form content */}
        <div style={{ width: "100%", maxWidth: 380, position: "relative", zIndex: 10, animation: "slideUp 0.4s ease" }}>

          {/* Logo + Title */}
          <div style={{ marginBottom: 36 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
              <img src="/ongc-logo.png" alt="ONGC" style={{
                width: 56, height: 56, borderRadius: 10,
                boxShadow: "0 4px 16px rgba(204,0,0,0.3)",
              }} />
              <div>
                <div style={{ color: "var(--text)", fontWeight: 800, fontSize: 20, letterSpacing: 1 }}>ONGC</div>
                <div style={{ color: "var(--accent)", fontSize: 11, marginTop: 2, fontWeight: 500 }}>AI Query Intelligence Platform</div>
              </div>
            </div>
            <h1 style={{ color: "var(--text)", fontSize: 26, fontWeight: 700, margin: 0, letterSpacing: "-0.3px" }}>
              Welcome back
            </h1>
            <p style={{ color: "var(--text3)", fontSize: 13, marginTop: 6, margin: "6px 0 0" }}>
              Sign in to your account to continue
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <label className="ongc-label">Email Address</label>
              <input
                className="ongc-input"
                type="email" required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="admin@vanna-platform.local"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="ongc-label">Password</label>
              <div style={{ position: "relative" }}>
                <input
                  className="ongc-input"
                  type={showPwd ? "text" : "password"} required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  style={{ paddingRight: 42 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  style={{
                    position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer",
                    color: "var(--text3)", padding: 2,
                    display: "flex", alignItems: "center",
                  }}
                >
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="ongc-btn-primary"
              style={{ width: "100%", justifyContent: "center", padding: "13px", fontSize: 15, borderRadius: 10, marginTop: 4 }}
            >
              {loading ? (
                <>
                  <span style={{ display: "inline-block", animation: "spin 0.8s linear infinite", fontSize: 16 }}>⟳</span>
                  Signing in…
                </>
              ) : "Sign In"}
            </button>

            <p style={{ textAlign: "center", fontSize: 13, color: "var(--text3)", margin: 0 }}>
              New user?{" "}
              <Link to="/register" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 600 }}>
                Create account
              </Link>
            </p>
          </form>

          {/* Default credentials hint */}
          <div style={{
            marginTop: 28,
            padding: "12px 16px",
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            fontSize: 12,
            color: "var(--text3)",
            textAlign: "center",
          }}>
            <div style={{ fontWeight: 600, marginBottom: 4, color: "var(--text2)" }}>Default Admin Credentials</div>
            <div>admin@vanna-platform.local</div>
            <div style={{ color: "var(--text2)", marginTop: 2 }}>Admin@ONGC123</div>
          </div>
        </div>
      </div>

      {/* Responsive styles */}
      <style>{`
        @media (min-width: 960px) {
          .lg-panel { display: block !important; }
        }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
