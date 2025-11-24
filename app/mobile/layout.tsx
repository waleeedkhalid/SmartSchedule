import type { Metadata } from "next";
import iPhoneFrameComponent from "@/app/mobile/components/iphone-frame";
import type { ReactNode } from "react";
import React from "react";

export const metadata: Metadata = {
  title: "SmartSchedule Mobile",
  description: "Mobile interface for SmartSchedule - Access your schedule, courses, and enrollments on the go",
};

export default function MobileLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return React.createElement(iPhoneFrameComponent, { children });
}
