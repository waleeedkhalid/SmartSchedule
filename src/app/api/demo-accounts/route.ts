import { NextResponse } from "next/server";

export async function GET() {
  const demoAccounts = [
    {
      full_name: "Ahmed",
      email: "3ee8fcc8d8@webxios.pro",
      role: "student",
    },
    {
      full_name: "Elliott",
      email: "394e3da6b0@webxios.pro",
      role: "scheduling_committee",
    },
    {
      full_name: "Doe",
      email: "f5545f4c5d@webxios.pro",
      role: "registrar",
    },
    {
      full_name: "John Doe",
      email: "d05e85a298@webxios.pro",
      role: "faculty",
    },
  ];

  return NextResponse.json(demoAccounts);
}
