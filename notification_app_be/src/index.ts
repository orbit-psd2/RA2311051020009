import { registerUser, getValidToken } from "./services/auth.service";

async function main() {
  try {
    await registerUser();

    const token = await getValidToken();
    console.log("Access token:", token);
  } catch (err) {
    if (err instanceof Error) {
      console.error("Error:", err.message);
    } else {
      console.error("Unexpected error:", err);
    }
    process.exit(1);
  }
}

main();
