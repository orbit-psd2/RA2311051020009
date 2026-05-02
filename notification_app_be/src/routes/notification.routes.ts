import { Router } from "express";
import { postNotification, getNotifications } from "../controllers/notification.controller";
import { Log } from "../../../logging_middleware/src/logger";

const router = Router();

router.post("/", (req, res, next) => {
  Log("backend", "info", "route", "POST /notifications hit");
  postNotification(req, res, next);
});

router.get("/:userId", (req, res, next) => {
  Log("backend", "info", "route", `GET /notifications/${req.params.userId} hit`);
  getNotifications(req, res, next);
});

export default router;
