"use client";

import { useState } from "react";
import { createNotification, CreateNotificationPayload } from "../services/api";

interface Props {
  onCreated: () => void;
}

const empty: CreateNotificationPayload = { title: "", message: "", userId: "" };

export default function NotificationForm({ onCreated }: Props) {
  const [form, setForm] = useState(empty);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      await createNotification(form);
      setStatus("success");
      setForm(empty);
      onCreated();
      setTimeout(() => setStatus("idle"), 3000);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
      setStatus("error");
    }
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <div>
          <div className="panel-title">Send Notification</div>
          <div className="panel-desc">Dispatch a message to a user</div>
        </div>
        <div className="panel-icon">
          <svg viewBox="0 0 24 24">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-body">
          <div className="field-group">
            <label className="field-label" htmlFor="userId">User ID</label>
            <input
              suppressHydrationWarning
              className="field-input"
              id="userId"
              name="userId"
              value={form.userId}
              onChange={handleChange}
              placeholder="e.g. user42"
              autoComplete="off"
              required
            />
          </div>

          <div className="field-group">
            <label className="field-label" htmlFor="title">Title</label>
            <input
              suppressHydrationWarning
              className="field-input"
              id="title"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Short notification title"
              autoComplete="off"
              required
            />
          </div>

          <div className="field-group">
            <label className="field-label" htmlFor="message">Message</label>
            <textarea
              suppressHydrationWarning
              className="field-textarea"
              id="message"
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="Write the notification body..."
              rows={4}
              required
            />
          </div>

          {status === "success" && (
            <div className="alert alert-success">
              <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
              Notification delivered successfully.
            </div>
          )}

          {status === "error" && (
            <div className="alert alert-error">
              <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {errorMsg}
            </div>
          )}
        </div>

        <div className="panel-footer">
          <span className="panel-footer-hint">All fields required</span>
          <button
            suppressHydrationWarning
            type="submit"
            className="btn btn-primary"
            disabled={status === "loading"}
          >
            {status === "loading" ? (
              <><span className="spin" />Sending...</>
            ) : (
              <>
                <svg viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                Send
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
