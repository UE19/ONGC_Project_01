import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authAPI } from "../services/api";
import toast from "react-hot-toast";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", username: "", full_name: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.register(form);
      toast.success("Account created! Please log in.");
      navigate("/login");
    } catch (err) {
      const detail = err.response?.data?.detail;
      const msg = Array.isArray(detail)
        ? (detail[0]?.msg || "Validation error")
        : (typeof detail === "string" ? detail : "Registration failed");
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.15)",
    width: "100%",
    borderRadius: "8px",
    padding: "12px 16px",
    fontSize: "14px",
    color: "white",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
  };

  const handleFocus = (e) => {
    e.target.style.borderColor = "#CC0000";
    e.target.style.boxShadow = "0 0 0 3px rgba(204,0,0,0.2)";
  };
  const handleBlur = (e) => {
    e.target.style.borderColor = "rgba(255,255,255,0.15)";
    e.target.style.boxShadow = "none";
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", fontFamily: "Arial, sans-serif" }}>

      {/* ── LEFT PANEL: ONGC Image Background ── */}
      <div
        style={{
          flex: "1",
          position: "relative",
          overflow: "hidden",
          display: "none",
        }}
        className="lg-panel"
      >
        {/* Real ONGC offshore platform image */}
        <img
          src="/ongc-bg2.jpg"
          alt="ONGC Operations"
          style={{
            position: "absolute", inset: 0,
            width: "100%", height: "100%",
            objectFit: "cover",
          }}
        />
        {/* Dark red overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(135deg, rgba(120,0,0,0.80) 0%, rgba(0,0,0,0.60) 100%)",
        }} />

        {/* Content */}
        <div style={{
          position: "relative", zIndex: 10,
          height: "100%", display: "flex", flexDirection: "column",
          justifyContent: "space-between", padding: "40px",
        }}>
          {/* Logo + Name */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <img src="/ongc-logo.png" alt="ONGC Logo"
              style={{ width: "64px", height: "64px", borderRadius: "8px" }} />
            <div>
              <div style={{ color: "white", fontWeight: "bold", fontSize: "22px", letterSpacing: "2px" }}>
                ओ एन जी सी
              </div>
              <div style={{ color: "rgba(255,200,200,0.8)", fontSize: "11px", letterSpacing: "1px", marginTop: "2px" }}>
                OIL AND NATURAL GAS CORPORATION
              </div>
            </div>
          </div>

          {/* Center */}
          <div style={{ textAlign: "center" }}>
            <h2 style={{ color: "white", fontSize: "32px", fontWeight: "bold", margin: 0, textShadow: "0 2px 10px rgba(0,0,0,0.6)" }}>
              ENERGY: <span style={{ color: "#FFD700" }}>Now</span> AND <span style={{ color: "#FFD700" }}>Next</span>
            </h2>
            <p style={{ color: "rgba(255,230,230,0.85)", marginTop: "12px", fontSize: "14px", lineHeight: "1.7" }}>
              Join the AI Database Intelligence Platform<br/>
              enabling natural language querying across enterprise databases.
            </p>
            {/* DB chips */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center", marginTop: "20px" }}>
              {["PostgreSQL", "MySQL", "Oracle", "MSSQL"].map((db) => (
                <span key={db} style={{
                  background: "rgba(0,0,0,0.35)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "rgba(255,230,230,0.9)",
                  padding: "6px 14px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: "500",
                }}>
                  {db}
                </span>
              ))}
            </div>
          </div>

          {/* Bottom features */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {[
              "Vanna AI: Natural Language → SQL",
              "Role-based Access Control",
              "Full Audit Trail & Query History",
            ].map((f) => (
              <div key={f} style={{ display: "flex", alignItems: "center", gap: "10px", color: "rgba(255,220,220,0.9)", fontSize: "13px" }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#FFD700", flexShrink: 0 }} />
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL: Register Form ── */}
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
        {/* Subtle background */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "url(/ongc-bg4.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.06,
        }} />

        <div style={{ width: "100%", maxWidth: "360px", position: "relative", zIndex: 10 }}>

          {/* Logo (mobile) + Header */}
          <div style={{ marginBottom: "28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "16px" }}>
              <img src="/ongc-logo.png" alt="ONGC"
                style={{ width: "52px", height: "52px", borderRadius: "8px" }} />
              <div>
                <div style={{ color: "white", fontWeight: "bold", fontSize: "18px", letterSpacing: "1px" }}>ONGC</div>
                <div style={{ color: "#CC0000", fontSize: "11px", marginTop: "2px" }}>Energy: Now AND Next</div>
              </div>
            </div>
            <h1 style={{ color: "white", fontSize: "24px", fontWeight: "bold", margin: 0 }}>Create Account</h1>
            <p style={{ color: "#7a8599", fontSize: "13px", marginTop: "4px" }}>
              Register for ONGC AI Intelligence Platform
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {[
              { key: "email",     label: "Email Address", type: "email",    placeholder: "you@ongc.co.in" },
              { key: "username",  label: "Username",      type: "text",     placeholder: "johndoe" },
              { key: "full_name", label: "Full Name",     type: "text",     placeholder: "John Doe" },
              { key: "password",  label: "Password",      type: "password", placeholder: "min 8 characters" },
            ].map(({ key, label, type, placeholder }) => (
              <div key={key}>
                <label style={{ display: "block", color: "#c0cce0", fontSize: "13px", fontWeight: "500", marginBottom: "6px" }}>
                  {label}
                </label>
                <input
                  type={type} required
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  style={inputStyle}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  placeholder={placeholder}
                />
              </div>
            ))}

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
              }}
              onMouseEnter={(e) => !loading && (e.target.style.background = "#aa0000")}
              onMouseLeave={(e) => !loading && (e.target.style.background = "#CC0000")}
            >
              {loading ? "Creating Account…" : "Create Account"}
            </button>

            <p style={{ textAlign: "center", fontSize: "13px", color: "#566070", margin: 0 }}>
              Already registered?{" "}
              <Link to="/login" style={{ color: "#ff5555", textDecoration: "none", fontWeight: "500" }}>
                Sign In
              </Link>
            </p>
          </form>
        </div>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .lg-panel { display: block !important; }
        }
      `}</style>
    </div>
  );
}
