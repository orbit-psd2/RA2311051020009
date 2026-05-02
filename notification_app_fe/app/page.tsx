"use client";

import { useState, useCallback } from "react";
import NotificationForm from "../components/NotificationForm";
import NotificationList from "../components/NotificationList";

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCreated = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  return (
    <main className="container">
      <h1>Notification System</h1>
      <div className="grid">
        <NotificationForm onCreated={handleCreated} />
        <NotificationList key={refreshKey} />
      </div>
    </main>
  );
}
