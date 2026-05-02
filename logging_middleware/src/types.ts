export type Stack = "backend" | "frontend";

export type Level = "debug" | "info" | "warn" | "error" | "fatal";

export type BackendPackage =
  | "cache"
  | "controller"
  | "cron_job"
  | "db"
  | "domain"
  | "handler"
  | "repository"
  | "route"
  | "service";

export type FrontendPackage = "api" | "component" | "hook" | "page" | "state" | "style";

export type CommonPackage = "auth" | "config" | "middleware" | "utils";

export type Package = BackendPackage | FrontendPackage | CommonPackage;

export interface LogPayload {
  stack: Stack;
  level: Level;
  package: Package;
  message: string;
}
