/**
 * Centralized API service — wraps all backend API calls.
 * Uses axios with JWT auth interceptor.
 */
import axios from "axios";

const BASE = "/api/v1";
const QUERY_BASE = "/api";

const api = axios.create({ baseURL: BASE });

// ── Auth interceptor ──────────────────────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  async (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  login: (email, password) =>
    api.post("/auth/login", { email, password }),
  register: (data) => api.post("/auth/register", data),
  logout: () => api.post("/auth/logout"),
  changePassword: (data) => api.post("/auth/change-password", data),
  refresh: () =>
    api.post("/auth/refresh", null, {
      headers: { Authorization: `Bearer ${localStorage.getItem("refresh_token")}` },
    }),
};

// ── Users ─────────────────────────────────────────────────────────────────────
export const usersAPI = {
  getMe: () => api.get("/users/me"),
  list: () => api.get("/users"),
  get: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  deactivate: (id) => api.delete(`/users/${id}`),
};

// ── Connection Profiles ───────────────────────────────────────────────────────
export const profilesAPI = {
  list: () => api.get("/profiles"),
  get: (id) => api.get(`/profiles/${id}`),
  create: (data) => api.post("/profiles", data),
  update: (id, data) => api.put(`/profiles/${id}`, data),
  delete: (id) => api.delete(`/profiles/${id}`),
  test: (id) => api.post(`/profiles/${id}/test`),
  getSchema: (id) => api.get(`/profiles/${id}/schema`),
};

// ── API Tokens ────────────────────────────────────────────────────────────────
export const tokensAPI = {
  list: () => api.get("/tokens"),
  get: (id) => api.get(`/tokens/${id}`),
  create: (data) => api.post("/tokens", data),
  update: (id, data) => api.put(`/tokens/${id}`, data),
  revoke: (id) => api.post(`/tokens/${id}/revoke`),
  rotate: (id) => api.post(`/tokens/${id}/rotate`),
  delete: (id) => api.delete(`/tokens/${id}`),
  validate: () => api.get("/tokens/validate"),
};

// ── Query Engine ──────────────────────────────────────────────────────────────
export const queryAPI = {
  execute: (question, opts = {}) =>
    axios.post(
      `${QUERY_BASE}/query`,
      { question, ...opts },
      { headers: { Authorization: `Bearer ${localStorage.getItem("api_token")}` } }
    ),
  history: (page = 1, size = 50) =>
    api.get(`/query/history?page=${page}&page_size=${size}`),  // uses JWT
};

// ── Schema Ingestion ──────────────────────────────────────────────────────────
export const schemaAPI = {
  ingest: (profileId) => api.post(`/schema/ingest/${profileId}`),
  getMetadata: (profileId) => api.get(`/schema/metadata/${profileId}`),
  updateMetadata: (metaId, data) => api.put(`/schema/metadata/${metaId}`, data),
  addGlossary: (data) => api.post("/schema/glossary", data),
  listGlossary: (profileId) => api.get(`/schema/glossary/${profileId}`),
  deleteGlossary: (termId) => api.delete(`/schema/glossary/${termId}`),
};

// ── Audit & Monitoring ────────────────────────────────────────────────────────
export const auditAPI = {
  getLogs: (params) => api.get("/audit/logs", { params }),
  getQueryHistory: (params) => api.get("/audit/query-history", { params }),
  getTokenUsage: () => api.get("/audit/token-usage"),
  getFailedQueries: (params) => api.get("/audit/failed-queries", { params }),
};

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const dashboardAPI = {
  getStats: () => api.get("/dashboard/stats"),
};
