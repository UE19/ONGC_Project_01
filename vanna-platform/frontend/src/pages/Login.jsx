import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

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

  const inputBase = {
    width: "100%",
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: "8px",
    padding: "12px 16px",
    fontSize: "14px",
    color: "white",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", fontFamily: "Arial, sans-serif" }}>

      {/* ── LEFT PANEL: ONGC Platform Image Background ── */}
      <div
        style={{
          flex: "1",
          position: "relative",
          overflow: "hidden",
          display: "none",
        }}
        className="lg-panel"
      >
        {/* Offshore platform background */}
        <img
          src="/ongc-bg4.jpg"
          alt="ONGC Offshore Platform"
          style={{
            position: "absolute", inset: 0,
            width: "100%", height: "100%",
            objectFit: "cover",
          }}
        />
        {/* Dark overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(135deg, rgba(100,0,0,0.75) 0%, rgba(0,0,0,0.65) 100%)",
        }} />

        {/* Content over background */}
        <div style={{
          position: "relative", zIndex: 10,
          height: "100%", display: "flex", flexDirection: "column",
          justifyContent: "space-between", padding: "40px",
        }}>
          {/* ONGC Logo + Name */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <img src="/ongc-logo.png" alt="ONGC Logo" style={{ width: "64px", height: "64px", borderRadius: "8px" }} />
            <div>
              <div style={{ color: "white", fontWeight: "bold", fontSize: "22px", letterSpacing: "2px" }}>
                ओ एन जी सी
              </div>
              <div style={{ color: "rgba(255,200,200,0.8)", fontSize: "11px", letterSpacing: "1px", marginTop: "2px" }}>
                OIL AND NATURAL GAS CORPORATION
              </div>
            </div>
          </div>

          {/* Center tagline */}
          <div style={{ textAlign: "center" }}>
            <h2 style={{ color: "white", fontSize: "36px", fontWeight: "bold", margin: 0, textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>
              ENERGY: <span style={{ color: "#FFD700" }}>Now</span> AND <span style={{ color: "#FFD700" }}>Next</span>
            </h2>
            <p style={{ color: "rgba(255,230,230,0.85)", marginTop: "12px", fontSize: "15px", lineHeight: "1.6" }}>
              AI-Powered Database Intelligence Platform<br/>
              for Enterprise Analytics
            </p>
          </div>

          {/* Bottom features */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {[
              "Natural Language to SQL — Vanna AI",
              "PostgreSQL · MySQL · Oracle · MSSQL · MongoDB",
              "Enterprise RBAC & Full Audit Trail",
            ].map((f) => (
              <div key={f} style={{ display: "flex", alignItems: "center", gap: "10px", color: "rgba(255,220,220,0.9)", fontSize: "13px" }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#FFD700", flexShrink: 0 }} />
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL: Login Form ── */}
      <div style={{
        width: "100%",
        maxWidth: "480px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 40px",
        background: "#0f1520",
        position: "relative",
      }}>
        {/* Background image on mobile / small screens */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "url(/ongc-bg3.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.08,
        }} />

        <div style={{ width: "100%", maxWidth: "360px", position: "relative", zIndex: 10 }}>

          {/* Logo + Title */}
          <div style={{ marginBottom: "32px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "16px" }}>
              <img src="/ongc-logo.png" alt="ONGC" style={{ width: "52px", height: "52px", borderRadius: "8px" }} />
              <div>
                <div style={{ color: "white", fontWeight: "bold", fontSize: "18px", letterSpacing: "1px" }}>ONGC</div>
                <div style={{ color: "#CC0000", fontSize: "11px", marginTop: "2px" }}>Energy: Now AND Next</div>
              </div>
            </div>
            <h1 style={{ color: "white", fontSize: "24px", fontWeight: "bold", margin: 0 }}>Sign In</h1>
            <p style={{ color: "#7a8599", fontSize: "13px", marginTop: "4px" }}>
              AI Database Intelligence Platform
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ display: "block", color: "#c0cce0", fontSize: "13px", fontWeight: "500", marginBottom: "6px" }}>
                Email Address
              </label>
              <input
                type="email" required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                style={inputBase}
                onFocus={(e) => { e.target.style.borderColor = "#CC0000"; e.target.style.boxShadow = "0 0 0 3px rgba(204,0,0,0.2)"; }}
                onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.15)"; e.target.style.boxShadow = "none"; }}
                placeholder="admin@ongc.co.in"
              />
            </div>
            <div>
              <label style={{ display: "block", color: "#c0cce0", fontSize: "13px", fontWeight: "500", marginBottom: "6px" }}>
                Password
              </label>
              <input
                type="password" required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                style={inputBase}
                onFocus={(e) => { e.target.style.borderColor = "#CC0000"; e.target.style.boxShadow = "0 0 0 3px rgba(204,0,0,0.2)"; }}
                onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.15)"; e.target.style.boxShadow = "none"; }}
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit" disabled={loading}
              style={{
                width: "100%",
                background: loading ? "#991111" : "#CC0000",
                color: "white",
                border: "none",
                borderRadius: "8px",
                padding: "13px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: loading ? "not-allowed" : "pointer",
                marginTop: "4px",
                transition: "background 0.2s",
                letterSpacing: "0.5px",
              }}
              onMouseEnter={(e) => !loading && (e.target.style.background = "#aa0000")}
              onMouseLeave={(e) => !loading && (e.target.style.background = "#CC0000")}
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>

            <p style={{ textAlign: "center", fontSize: "13px", color: "#566070", margin: 0 }}>
              New user?{" "}
              <Link to="/register" style={{ color: "#ff5555", textDecoration: "none", fontWeight: "500" }}>
                Create Account
              </Link>
            </p>
          </form>

          {/* Default credentials hint */}
          <div style={{
            marginTop: "24px",
            padding: "12px 16px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "8px",
            fontSize: "12px",
            color: "#566070",
            textAlign: "center",
          }}>
            Default admin: <span style={{ color: "#8899aa" }}>admin@vanna-platform.local</span>
            {" / "}
            <span style={{ color: "#8899aa" }}>Admin@ONGC123</span>
          </div>
        </div>
      </div>

      {/* Responsive: show left panel on large screens */}
      <style>{`
        @media (min-width: 1024px) {
          .lg-panel { display: block !important; }
        }
      `}</style>
    </div>
  );
}
