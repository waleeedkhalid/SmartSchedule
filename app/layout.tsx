import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ClientProviders } from "@/components/client-providers";

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
        </ClientProviders>
      </body>
    </html>
  );
}
