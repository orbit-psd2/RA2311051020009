import axios from "axios";
import { getValidToken, forceRefreshToken } from "./auth";
import { Stack, Level, Package, LogPayload } from "./types";
import { VALID_STACKS, VALID_LEVELS, LOG_ENDPOINT } from "./constants";

const SAFE_PACKAGES = ["route", "service", "db", "middleware", "api", "component"] as const;
const FALLBACK_PACKAGE = "service";

function isValidPackage(pkg: string): pkg is Package {
  return SAFE_PACKAGES.includes(pkg as (typeof SAFE_PACKAGES)[number]);
}

function sanitizeMessage(raw: unknown): string {
  const str = typeof raw === "string" ? raw : String(raw ?? "");
  return str.slice(0, 48);
}

function validateStackAndLevel(stack: string, level: string): string | null {
  if (!VALID_STACKS.includes(stack as Stack)) {
    return `Invalid stack "${stack}". Allowed: ${VALID_STACKS.join(", ")}`;
  }
  if (!VALID_LEVELS.includes(level as Level)) {
    return `Invalid level "${level}". Allowed: ${VALID_LEVELS.join(", ")}`;
  }
  return null;
}

async function sendLog(payload: LogPayload, token: string): Promise<void> {
  await axios.post(LOG_ENDPOINT, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    timeout: 5000,
  });
}

export function Log(stack: string, level: string, pkg: string, message: string): void {
  // fire and forget — never block the caller
  (async () => {
    const validationError = validateStackAndLevel(stack, level);
    if (validationError) {
      console.warn("[logger] Validation failed:", validationError);
      return;
    }

    const safePackage = isValidPackage(pkg) ? pkg : FALLBACK_PACKAGE;
    const safeMessage = sanitizeMessage(message);

    if (safePackage !== pkg) {
      console.warn(`[logger] Package "${pkg}" is not accepted by API, falling back to "${safePackage}"`);
    }

    const payload: LogPayload = {
      stack: stack as Stack,
      level: level as Level,
      package: safePackage as Package,
      message: safeMessage,
    };

    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${stack}] [${level.toUpperCase()}] [${safePackage}] ${safeMessage}`);

    try {
      const token = await getValidToken();
      await sendLog(payload, token);
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        try {
          const freshToken = await forceRefreshToken();
          await sendLog(payload, freshToken);
        } catch (retryErr) {
          const detail = axios.isAxiosError(retryErr)
            ? retryErr.response?.data ?? retryErr.message
            : retryErr;
          console.warn("[logger] Retry after 401 failed:", detail);
        }
      } else {
        const detail = axios.isAxiosError(err)
          ? err.response?.data ?? err.message
          : err;
        console.warn("[logger] Failed to send log:", detail);
      }
    }
  })();
}
