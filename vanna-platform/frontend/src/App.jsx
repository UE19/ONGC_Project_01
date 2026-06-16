import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
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

// Top-level error boundary — catches any React crash and shows an error instead of blank screen
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
          background: "#0a0e1a", minHeight: "100vh",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          gap: 12, color: "#9ca3af", fontFamily: "Arial, sans-serif",
        }}>
          <div style={{ fontSize: 48 }}>⚠️</div>
          <div style={{ fontSize: 18, color: "white" }}>Something went wrong</div>
          <div style={{ fontSize: 12, maxWidth: 480, textAlign: "center", color: "#6b7280" }}>
            {String(this.state.error.message)}
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{ marginTop: 8, background: "#CC0000", color: "white", border: "none", padding: "10px 28px", borderRadius: 8, cursor: "pointer", fontSize: 14 }}
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <AppErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              style: { background: "#1f2937", color: "#f9fafb", border: "1px solid #374151" },
            }}
          />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
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
    </AppErrorBoundary>
  );
}
