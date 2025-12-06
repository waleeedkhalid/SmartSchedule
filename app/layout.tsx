import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ClientProviders } from "@/components/client-providers";
import { Chatbot } from "@/components/chatbot";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SmartSchedule - Intelligent Academic Scheduling",
  description:
    "SmartSchedule is a collaborative scheduling platform for academic institutions. Generate conflict-free schedules, manage teaching loads, and coordinate across multiple roles with real-time collaboration.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SmartSchedule",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#6366f1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}>
        <ClientProviders>
          {children}
          <Toaster position="top-center" duration={3000} />
          <Chatbot />
        </ClientProviders>
      </body>
    </html>
  );
}
