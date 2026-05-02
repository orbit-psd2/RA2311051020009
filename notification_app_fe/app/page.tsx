"use client";

import { useState, useCallback } from "react";
import NotificationForm from "../components/NotificationForm";
import NotificationList from "../components/NotificationList";

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [totalSent, setTotalSent] = useState(0);

  const handleCreated = useCallback(() => {
    setRefreshKey((k) => k + 1);
    setTotalSent((n) => n + 1);
  }, []);

  return (
    <div className="shell">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <svg viewBox="0 0 24 24">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </div>
          <span className="sidebar-logo-text">Notification App</span>
          <span className="sidebar-logo-version">v1.0</span>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-section-label">Navigation</div>
          <a className="sidebar-link active">
            <svg viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            Notifications
          </a>
        </div>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">VS</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">Venkatesh S</div>
              <div className="sidebar-user-role">Administrator</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="main">
        <div className="topbar">
          <div className="topbar-left">
            <div className="topbar-title">Notifications</div>
            <div className="topbar-subtitle">Dispatch and monitor delivery in real time</div>
          </div>
          <div className="topbar-right">
            <div className="status-pill">
              <span className="status-dot" />
              <span className="status-text">Backend connected</span>
            </div>
          </div>
        </div>

        <div className="content">
          <div className="content-inner">
          {/* Stats */}
          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-label">Sent this session</div>
              <div className="stat-value">{totalSent}</div>
              <div className="stat-desc">notifications dispatched</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Delivery</div>
              <div className="stat-value">100%</div>
              <div className="stat-desc">no failures</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">API Status</div>
              <div className="stat-value stat-value-ok">Operational</div>
              <div className="stat-desc">All good :)</div>
            </div>
          </div>

          {/* Work area */}
          <div className="work-grid">
            <NotificationForm onCreated={handleCreated} />
            <NotificationList key={refreshKey} />
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
