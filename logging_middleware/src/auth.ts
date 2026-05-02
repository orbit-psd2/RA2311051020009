import fs from "fs";
import path from "path";
import axios from "axios";

const ENV_PATH = path.resolve(__dirname, "../../notification_app_be/.env");

const USER_CONFIG = {
  email: "vs7710@srmist.edu.in",
  name: "Venkatesh S",
  mobileNo: "9620691634",
  githubUsername: "orbit-psd2",
  rollNo: "RA2311051020009",
  accessCode: "QkbpxH",
};

function readEnv(): Record<string, string> {
  const raw = fs.readFileSync(ENV_PATH, "utf-8");
  const result: Record<string, string> = {};
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    result[trimmed.substring(0, eqIndex).trim()] = trimmed.substring(eqIndex + 1).trim();
  }
  return result;
}

function writeEnvValues(updates: Record<string, string>): void {
  const current = readEnv();
  const merged = { ...current, ...updates };
  const lines = Object.entries(merged).map(([k, v]) => `${k}=${v}`);
  fs.writeFileSync(ENV_PATH, lines.join("\n") + "\n", "utf-8");
  for (const [k, v] of Object.entries(updates)) {
    process.env[k] = v;
  }
}

async function fetchFreshToken(env: Record<string, string>): Promise<string> {
  const response = await axios.post<{ access_token: string; expires_in: number }>(
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

  const { access_token, expires_in } = response.data;
  if (!access_token) throw new Error("Auth response missing access_token.");

  // expires_in is an absolute unix timestamp in seconds, not a duration
  const expiresAt = expires_in * 1000;

  writeEnvValues({
    ACCESS_TOKEN: access_token,
    TOKEN_EXPIRY: expiresAt.toString(),
  });

  return access_token;
}

export async function getValidToken(): Promise<string> {
  const env = readEnv();

  const token = env.ACCESS_TOKEN;
  const expiry = parseInt(env.TOKEN_EXPIRY || "0", 10);
  const isValid = token && expiry && Date.now() < expiry - 30_000;

  if (isValid) {
    return token;
  }

  return fetchFreshToken(env);
}

// called by logger on 401 — bypasses cache and always re-authenticates
export async function forceRefreshToken(): Promise<string> {
  const env = readEnv();

  if (!env.CLIENT_ID || !env.CLIENT_SECRET) {
    throw new Error("CLIENT_ID or CLIENT_SECRET missing from notification_app_be/.env.");
  }

  return fetchFreshToken(env);
}
