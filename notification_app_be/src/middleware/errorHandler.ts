import { Request, Response, NextFunction } from "express";
import { Log } from "../../../logging_middleware/src/logger";

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const message = err instanceof Error ? err.message : "An unexpected error occurred";

  Log("backend", "error", "middleware", `Unhandled error on ${req.method} ${req.originalUrl}: ${message}`);

  res.status(500).json({ success: false, error: message });
}
