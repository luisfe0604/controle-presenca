import { Outlet } from "react-router-dom";
import { useState } from "react";

import Sidebar from "./Sidebar";
import Header from "./Header";

import "./layout.css";

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  return (
    <div className="app-layout">
      <Sidebar
        open={sidebarOpen}
        onClose={() =>
          setSidebarOpen(false)
        }
      />

      <div className="app-content">
        <Header
          onMenuClick={() =>
            setSidebarOpen(true)
          }
        />

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}