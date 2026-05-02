import fs from "fs";
import path from "path";
import httpClient from "../utils/httpClient";

const ENV_PATH = path.resolve(__dirname, "../../.env");
let runtimeToken: string | null = null;
let runtimeTokenExpiry = 0;

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

    const key = trimmed.substring(0, eqIndex).trim();
    const value = trimmed.substring(eqIndex + 1).trim();
    result[key] = value;
  }

  return result;
}

export async function registerUser(): Promise<void> {
  const env = readEnv();

  if (env.CLIENT_ID && env.CLIENT_SECRET) {
    console.log("Already registered. Skipping registration.");
    return;
  }

  throw new Error(
    "CLIENT_ID and CLIENT_SECRET are missing in .env. Please add them manually."
  );
}

export async function authenticate(): Promise<{ token: string; expiresAt: number }> {
  const env = readEnv();

  if (!env.CLIENT_ID || !env.CLIENT_SECRET) {
    throw new Error("Client credentials not found. Run registerUser() first.");
  }

  const response = await httpClient.post<{ access_token: string; expires_in: number }>(
    "/auth",
    {
      email: USER_CONFIG.email,
      name: USER_CONFIG.name,
      rollNo: USER_CONFIG.rollNo,
      accessCode: USER_CONFIG.accessCode,
      clientID: env.CLIENT_ID,
      clientSecret: env.CLIENT_SECRET,
    }
  );

  const { access_token, expires_in } = response.data;

  if (!access_token) {
    throw new Error("Auth response missing access_token");
  }

  const expiresAt = Date.now() + expires_in * 1000;

  runtimeToken = access_token;
  runtimeTokenExpiry = expiresAt;

  return { token: access_token, expiresAt };
}

export async function getValidToken(): Promise<string> {
  if (runtimeToken && runtimeTokenExpiry && Date.now() < runtimeTokenExpiry - 30_000) {
    console.log("Using cached token.");
    return runtimeToken;
  }

  const env = readEnv();

  const token = env.ACCESS_TOKEN;
  const expiry = parseInt(env.TOKEN_EXPIRY || "0", 10);

  // give a 30-second buffer before actual expiry
  const isValid = token && expiry && Date.now() < expiry - 30_000;

  if (isValid) {
    runtimeToken = token;
    runtimeTokenExpiry = expiry;
    console.log("Using cached token.");
    return token;
  }

  console.log("Token missing or expired. Re-authenticating...");
  const { token: newToken } = await authenticate();
  return newToken;
}
