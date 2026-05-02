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
      setTimeout(() => setStatus("idle"), 2500);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="form-card">
      <h2>New Notification</h2>

      <label>
        User ID
        <input
          suppressHydrationWarning
          name="userId"
          value={form.userId}
          onChange={handleChange}
          placeholder="e.g. user42"
          required
        />
      </label>

      <label>
        Title
        <input
          suppressHydrationWarning
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Notification title"
          required
        />
      </label>

      <label>
        Message
        <textarea
          suppressHydrationWarning
          name="message"
          value={form.message}
          onChange={handleChange}
          placeholder="Notification message"
          rows={3}
          required
        />
      </label>

      <button suppressHydrationWarning type="submit" disabled={status === "loading"}>
        {status === "loading" ? "Sending..." : "Send Notification"}
      </button>

      {status === "success" && <p className="msg-success">Notification sent.</p>}
      {status === "error" && <p className="msg-error">{errorMsg}</p>}
    </form>
  );
}
