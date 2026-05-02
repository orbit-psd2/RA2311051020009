import { Request, Response, NextFunction } from "express";
import { Log } from "../../../logging_middleware/src/logger";

export function requestLogger(req: Request, _res: Response, next: NextFunction): void {
  Log("backend", "info", "middleware", `${req.method} ${req.originalUrl} - incoming request`);
  next();
}
