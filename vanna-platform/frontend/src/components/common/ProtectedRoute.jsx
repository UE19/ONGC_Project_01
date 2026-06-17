import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-950">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (requireAdmin && !["super_admin", "admin"].includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
