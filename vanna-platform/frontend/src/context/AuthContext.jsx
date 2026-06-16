import React, { createContext, useContext, useEffect, useState } from "react";
import { authAPI, usersAPI } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      usersAPI.getMe()
        .then((r) => setUser(r.data))
        .catch(() => localStorage.removeItem("access_token"))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const { data } = await authAPI.login(email, password);
    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("refresh_token", data.refresh_token);
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    await authAPI.logout().catch(() => {});
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("api_token");
    setUser(null);
  };

  const isAdmin = () => ["super_admin", "admin"].includes(user?.role);
  const isSuperAdmin = () => user?.role === "super_admin";

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin, isSuperAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
