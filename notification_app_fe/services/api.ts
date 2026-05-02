export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  createdAt: string;
}

export interface CreateNotificationPayload {
  title: string;
  message: string;
  userId: string;
}

export async function createNotification(data: CreateNotificationPayload): Promise<{ notificationId: string }> {
  const res = await fetch("/api/notifications", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "Failed to create notification");
  return json;
}

export async function getNotifications(userId: string): Promise<Notification[]> {
  const res = await fetch(`/api/notifications/${userId}`);
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "Failed to fetch notifications");
  return json.notifications ?? [];
}
