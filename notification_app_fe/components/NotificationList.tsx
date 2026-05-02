"use client";

import { useState } from "react";
import { getNotifications, Notification } from "../services/api";

export default function NotificationList() {
  const [userId, setUserId] = useState("");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleFetch(e: React.FormEvent) {
    e.preventDefault();
    if (!userId.trim()) return;

    setStatus("loading");
    setErrorMsg("");

    try {
      const data = await getNotifications(userId.trim());
      setNotifications(data);
      setStatus("idle");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to fetch");
      setStatus("error");
    }
  }

  return (
    <div className="list-card">
      <h2>Notifications</h2>

      <form onSubmit={handleFetch} className="fetch-row">
        <input
          suppressHydrationWarning
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="Enter user ID"
          required
        />
        <button suppressHydrationWarning type="submit" disabled={status === "loading"}>
          {status === "loading" ? "Loading..." : "Fetch"}
        </button>
      </form>

      {status === "error" && <p className="msg-error">{errorMsg}</p>}

      {notifications.length === 0 && status === "idle" && (
        <p className="empty">No notifications to show.</p>
      )}

      <ul className="notification-list">
        {notifications.map((n) => (
          <li key={n.id} className="notification-item">
            <div className="notification-header">
              <span className="notification-title">{n.title}</span>
              <span className="notification-time">
                {new Date(n.createdAt).toLocaleString()}
              </span>
            </div>
            <p className="notification-message">{n.message}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
