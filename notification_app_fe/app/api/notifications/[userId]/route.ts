import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { Log } from "../../../../lib/logger";

const BACKEND = "http://localhost:3000";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  try {
    Log("frontend", "info", "api", `GET /notifications/${userId} called`);

    const response = await axios.get(`${BACKEND}/notifications/${userId}`);

    Log("frontend", "info", "api", "Notifications fetched successfully");
    return NextResponse.json(response.data);
  } catch (err) {
    const message = axios.isAxiosError(err)
      ? err.response?.data?.error ?? err.message
      : "Unexpected error";
    Log("frontend", "error", "api", `Failed to fetch notifications`);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
