import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { Log } from "../../../lib/logger";

const BACKEND = "http://localhost:3000";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    Log("frontend", "info", "api", "POST /notifications called");

    const response = await axios.post(`${BACKEND}/notifications`, body);

    Log("frontend", "info", "api", "Notification created successfully");
    return NextResponse.json(response.data, { status: 201 });
  } catch (err) {
    const message = axios.isAxiosError(err)
      ? err.response?.data?.error ?? err.message
      : "Unexpected error";
    Log("frontend", "error", "api", `Failed to create notification`);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
