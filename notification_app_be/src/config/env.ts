import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export const config = {
  baseUrl: process.env.BASE_URL || "",
  clientId: process.env.CLIENT_ID || "",
  clientSecret: process.env.CLIENT_SECRET || "",
  accessToken: process.env.ACCESS_TOKEN || "",
  tokenExpiry: process.env.TOKEN_EXPIRY || "",
};
