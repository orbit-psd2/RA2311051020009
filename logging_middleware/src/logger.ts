import axios from "axios";
import { getValidToken } from "../../notification_app_be/src/services/auth.service";
import { Stack, Level, Package, LogPayload } from "./types";
import { VALID_STACKS, VALID_LEVELS, VALID_PACKAGES, LOG_ENDPOINT } from "./constants";

function validate(stack: string, level: string, pkg: string): string | null {
  if (!VALID_STACKS.includes(stack as Stack)) {
    return `Invalid stack "${stack}". Allowed: ${VALID_STACKS.join(", ")}`;
  }
  if (!VALID_LEVELS.includes(level as Level)) {
    return `Invalid level "${level}". Allowed: ${VALID_LEVELS.join(", ")}`;
  }
  if (!VALID_PACKAGES.includes(pkg as Package)) {
    return `Invalid package "${pkg}". Allowed: ${VALID_PACKAGES.join(", ")}`;
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
    const validationError = validate(stack, level, pkg);
    if (validationError) {
      console.warn("[logger] Validation failed:", validationError);
      return;
    }

    const payload: LogPayload = {
      stack: stack as Stack,
      level: level as Level,
      package: pkg as Package,
      message,
    };

    try {
      const token = await getValidToken();
      await sendLog(payload, token);
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        // token was stale despite cache — force a fresh one and retry once
        try {
          const freshToken = await getValidToken();
          await sendLog(payload, freshToken);
        } catch (retryErr) {
          console.warn("[logger] Retry after 401 failed:", retryErr);
        }
      } else {
        console.warn("[logger] Failed to send log:", err);
      }
    }
  })();
}
