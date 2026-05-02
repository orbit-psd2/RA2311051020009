import axios from "axios";
import fs from "fs";
import path from "path";

// reads from notification_app_be/.env — shared credentials
const ENV_PATH = path.resolve(process.cwd(), "../notification_app_be/.env");
const LOG_ENDPOINT = "http://20.207.122.201/evaluation-service/logs";

const USER_CONFIG = {
  email: "vs7710@srmist.edu.in",
  name: "Venkatesh S",
  rollNo: "RA2311051020009",
  accessCode: "QkbpxH",
};

const SAFE_PACKAGES = ["route", "service", "db", "middleware", "api", "component"] as const;
type SafePackage = (typeof SAFE_PACKAGES)[number];

function readEnv(): Record<string, string> {
  try {
    const raw = fs.readFileSync(ENV_PATH, "utf-8");
    const result: Record<string, string> = {};
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      result[trimmed.substring(0, eq).trim()] = trimmed.substring(eq + 1).trim();
    }
    return result;
  } catch {
    return {};
  }
}

function writeEnvValues(updates: Record<string, string>): void {
  try {
    const current = readEnv();
    const merged = { ...current, ...updates };
    fs.writeFileSync(ENV_PATH, Object.entries(merged).map(([k, v]) => `${k}=${v}`).join("\n") + "\n");
  } catch {
    // best-effort — don't crash if .env is unwritable
  }
}

async function getToken(): Promise<string> {
  const env = readEnv();
  const token = env.ACCESS_TOKEN;
  const expiry = parseInt(env.TOKEN_EXPIRY || "0", 10);

  if (token && expiry && Date.now() < expiry - 30_000) return token;

  return fetchFreshToken(env);
}

async function fetchFreshToken(env: Record<string, string>): Promise<string> {
  const res = await axios.post<{ access_token: string; expires_in: number }>(
    `${env.BASE_URL}/auth`,
    {
      email: USER_CONFIG.email,
      name: USER_CONFIG.name,
      rollNo: USER_CONFIG.rollNo,
      accessCode: USER_CONFIG.accessCode,
      clientID: env.CLIENT_ID,
      clientSecret: env.CLIENT_SECRET,
    },
    { timeout: 5000 }
  );
  const { access_token, expires_in } = res.data;
  writeEnvValues({ ACCESS_TOKEN: access_token, TOKEN_EXPIRY: (expires_in * 1000).toString() });
  return access_token;
}

async function sendLog(
  token: string,
  stack: string,
  level: string,
  pkg: SafePackage,
  message: string
): Promise<void> {
  await axios.post(
    LOG_ENDPOINT,
    { stack, level, package: pkg, message },
    { headers: { Authorization: `Bearer ${token}` }, timeout: 5000 }
  );
}

export function Log(stack: string, level: string, pkg: string, message: string): void {
  (async () => {
    const safePackage = SAFE_PACKAGES.includes(pkg as SafePackage)
      ? (pkg as SafePackage)
      : "service";
    const safeMessage = String(message ?? "").slice(0, 48);

    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${stack}] [${level.toUpperCase()}] [${safePackage}] ${safeMessage}`);

    try {
      const token = await getToken();
      await sendLog(token, stack, level, safePackage, safeMessage);
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        try {
          const env = readEnv();
          const fresh = await fetchFreshToken(env);
          await sendLog(fresh, stack, level, safePackage, safeMessage);
        } catch (retryErr) {
          const detail = axios.isAxiosError(retryErr)
            ? retryErr.response?.data ?? retryErr.message
            : retryErr;
          console.warn("[logger] Retry failed:", detail);
        }
      } else {
        const detail = axios.isAxiosError(err) ? err.response?.data ?? err.message : err;
        console.warn("[logger] Failed to send log:", detail);
      }
    }
  })();
}
