import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { ProtectedRoute } from "./components/common/ProtectedRoute";
import { Layout } from "./components/layout/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profiles from "./pages/Profiles";
import TokenManager from "./pages/TokenManager";
import QueryConsole from "./pages/QueryConsole";
import AuditLogs from "./pages/AuditLogs";
import Users from "./pages/Users";
import SchemaManager from "./pages/SchemaManager";
import ChatApp from "./pages/ChatApp";

// Top-level error boundary
class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(err) {
    return { error: err };
  }
  componentDidCatch(err, info) {
    console.error("[AppErrorBoundary]", err, info);
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{
          background: "var(--bg)", minHeight: "100vh",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          gap: 14, fontFamily: "Arial, sans-serif",
        }}>
          <div style={{ fontSize: 52 }}>⚠️</div>
          <div style={{ fontSize: 19, fontWeight: 700, color: "var(--text)" }}>Something went wrong</div>
          <div style={{ fontSize: 12, maxWidth: 480, textAlign: "center", color: "var(--text3)", background: "var(--card)", padding: "10px 16px", borderRadius: 8, border: "1px solid var(--border)" }}>
            {String(this.state.error.message)}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="ongc-btn-primary"
            style={{ marginTop: 8 }}
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function ToasterWrapper() {
  const { theme } = useTheme();
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: theme === "light"
          ? { background: "#fff", color: "#0d1526", border: "1px solid #dce5f0", boxShadow: "0 4px 16px rgba(0,0,0,0.12)" }
          : { background: "#111d30", color: "#e8eef7", border: "1px solid #1a2d47", boxShadow: "0 4px 16px rgba(0,0,0,0.4)" },
        success: { iconTheme: { primary: "#22c55e", secondary: "#fff" } },
        error: { iconTheme: { primary: "#CC0000", secondary: "#fff" } },
      }}
    />
  );
}

export default function App() {
  return (
    <AppErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <ToasterWrapper />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/chat" element={<ChatApp />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="profiles" element={<Profiles />} />
                <Route path="tokens" element={<TokenManager />} />
                <Route path="query" element={<QueryConsole />} />
                <Route path="schema" element={<SchemaManager />} />
                <Route path="audit" element={<ProtectedRoute requireAdmin><AuditLogs /></ProtectedRoute>} />
                <Route path="users" element={<ProtectedRoute requireAdmin><Users /></ProtectedRoute>} />
              </Route>
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </AppErrorBoundary>
  );
}
