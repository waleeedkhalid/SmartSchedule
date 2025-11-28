import type { Metadata } from "next";
import type { ReactNode } from "react";
import React from "react";
import iPhoneFrameComponent from "@/app/mobile/components/iphone-frame";

export const metadata: Metadata = {
  title: "SmartSchedule Mobile",
  description: "Mobile interface for SmartSchedule - Access your schedule, courses, and enrollments on the go",
};

export default function MobileLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return React.createElement(iPhoneFrameComponent, null, children);
}
