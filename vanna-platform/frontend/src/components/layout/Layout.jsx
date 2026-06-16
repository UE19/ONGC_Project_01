import React from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";

export function Layout() {
  return (
    <div className="flex min-h-screen" style={{ background: "#0a0e1a" }}>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* ONGC Top Bar */}
        <header className="flex items-center justify-between px-6 py-2.5 flex-shrink-0"
          style={{ background: "#0f1520", borderBottom: "1px solid #1e2d44" }}>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#CC0000" }}>ONGC</span>
            <span className="text-gray-600 text-xs">|</span>
            <span className="text-xs text-gray-500">AI Database Intelligence Platform</span>
          </div>
          <div className="text-xs" style={{ color: "rgba(204,0,0,0.6)" }}>
            Energy: Now AND Next
          </div>
        </header>
        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6 max-w-screen-xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
