import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    message: "Hello from API",
    env: process.env.NODE_ENV || "development",
  });
}
