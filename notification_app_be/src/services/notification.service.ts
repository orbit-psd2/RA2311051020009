import { v4 as uuidv4 } from "uuid";
import { Log } from "../../../logging_middleware/src/logger";

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  createdAt: string;
}

const store: Map<string, Notification[]> = new Map();

export function createNotification(
  userId: string,
  title: string,
  message: string
): Notification {
  Log("backend", "info", "service", `Creating notification for user ${userId}`);

  const notification: Notification = {
    id: uuidv4(),
    userId,
    title,
    message,
    createdAt: new Date().toISOString(),
  };

  const existing = store.get(userId) ?? [];
  store.set(userId, [...existing, notification]);

  Log("backend", "info", "service", `Notification ${notification.id} stored in memory`);

  return notification;
}

export function getNotificationsByUser(userId: string): Notification[] {
  Log("backend", "info", "service", `Fetching notifications for user ${userId}`);
  return store.get(userId) ?? [];
}
