import { Request, Response, NextFunction } from "express";
import { createNotification, getNotificationsByUser } from "../services/notification.service";
import { Log } from "../../../logging_middleware/src/logger";

export function postNotification(req: Request, res: Response, next: NextFunction): void {
  try {
    Log("backend", "info", "route", "POST /notifications - request received");

    const { title, message, userId } = req.body as {
      title?: string;
      message?: string;
      userId?: string;
    };

    if (!title || !message || !userId) {
      Log("backend", "error", "middleware", "POST /notifications - missing required fields");
      res.status(400).json({ success: false, error: "title, message, and userId are required" });
      return;
    }

    const notification = createNotification(userId, title, message);

    Log("backend", "info", "service", `POST /notifications - response sent, id ${notification.id}`);

    res.status(201).json({ success: true, notificationId: notification.id });
  } catch (err) {
    next(err);
  }
}

export function getNotifications(req: Request, res: Response, next: NextFunction): void {
  try {
    const { userId } = req.params;

    Log("backend", "info", "route", `GET /notifications/${userId} - request received`);

    const notifications = getNotificationsByUser(userId);

    Log("backend", "info", "service", `GET /notifications/${userId} - returning ${notifications.length} items`);

    res.status(200).json({ notifications });
  } catch (err) {
    next(err);
  }
}
