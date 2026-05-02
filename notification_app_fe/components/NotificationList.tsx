"use client";

import { useState } from "react";
import { getNotifications, Notification } from "../services/api";

export default function NotificationList() {
  const [userId, setUserId] = useState("");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "done">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [queriedUser, setQueriedUser] = useState("");

  async function handleFetch(e: React.FormEvent) {
    e.preventDefault();
    if (!userId.trim()) return;

    setStatus("loading");
    setErrorMsg("");

    try {
      const data = await getNotifications(userId.trim());
      setNotifications(data);
      setQueriedUser(userId.trim());
      setStatus("done");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to fetch");
      setStatus("error");
    }
  }

  function formatTime(iso: string) {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <div>
          <div className="panel-title">Inbox</div>
          <div className="panel-desc">Search notifications by user ID</div>
        </div>
        <div className="panel-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
        </div>
      </div>

      <div className="panel-toolbar">
        <form onSubmit={handleFetch} className="search-bar">
          <input
            suppressHydrationWarning
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="Enter user ID to search..."
            autoComplete="off"
            required
          />
          <button
            suppressHydrationWarning
            type="submit"
            className="btn btn-ghost"
            disabled={status === "loading"}
          >
            {status === "loading" ? (
              <><span className="spin spin-dark" />Loading</>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                Search
              </>
            )}
          </button>
        </form>

        {status === "error" && (
          <div className="alert alert-error" style={{ marginTop: 10 }}>
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {errorMsg}
          </div>
        )}
      </div>

      {status === "done" && notifications.length > 0 && (
        <div className="feed-header">
          <span className="feed-user">Showing results for <strong>{queriedUser}</strong></span>
          <span className="feed-count">{notifications.length} total</span>
        </div>
      )}

      {status === "idle" && (
        <div className="empty">
          <div className="empty-icon">
            <svg viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          </div>
          <div className="empty-title">No results yet</div>
          <div className="empty-sub">Enter a user ID above to load their notifications</div>
        </div>
      )}

      {status === "done" && notifications.length === 0 && (
        <div className="empty">
          <div className="empty-icon">
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/></svg>
          </div>
          <div className="empty-title">No notifications</div>
          <div className="empty-sub">{queriedUser} has no notifications yet</div>
        </div>
      )}

      {status === "done" && notifications.length > 0 && (
        <ul className="feed-list">
          {notifications.map((n) => (
            <li key={n.id} className="feed-item">
              <span className="feed-indicator" />
              <div className="feed-body">
                <div className="feed-item-title">{n.title}</div>
                <div className="feed-item-message">{n.message}</div>
              </div>
              <span className="feed-item-time">{formatTime(n.createdAt)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
