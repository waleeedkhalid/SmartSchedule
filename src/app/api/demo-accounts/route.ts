import { NextResponse } from "next/server";
import { DEMO_ACCOUNTS } from "@/data/demo-accounts";

export async function GET() {
  return NextResponse.json(DEMO_ACCOUNTS);
}
