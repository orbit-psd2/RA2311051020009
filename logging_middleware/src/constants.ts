import { Stack, Level, Package } from "./types";

export const VALID_STACKS: Stack[] = ["backend", "frontend"];

export const VALID_LEVELS: Level[] = ["debug", "info", "warn", "error", "fatal"];

export const VALID_PACKAGES: Package[] = [
  // backend
  "cache",
  "controller",
  "cron_job",
  "db",
  "domain",
  "handler",
  "repository",
  "route",
  "service",
  // frontend
  "api",
  "component",
  "hook",
  "page",
  "state",
  "style",
  // common
  "auth",
  "config",
  "middleware",
  "utils",
];

export const LOG_ENDPOINT = "http://20.207.122.201/evaluation-service/logs";
