import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "./providers";
import { Footer } from "@/components/shared/Footer";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import { seedData } from "@/lib/seed-data";

// Seed data on app start
if (typeof window === "undefined") {
  seedData();
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// PRD 3.4 - SEO Metadata: Production-ready SEO optimization
export const metadata: Metadata = {
  metadataBase: new URL("https://smartschedule.ksu.edu.sa"),
  title: {
    default:
      "SmartSchedule - Intelligent Academic Timetabling System | King Saud University",
    template: "%s | SmartSchedule - KSU",
  },
  description:
    "Revolutionary academic scheduling platform for King Saud University's Software Engineering Department. AI-powered course timetabling, automated conflict detection, faculty load management, and student registration optimization. Transform your academic planning with intelligent automation.",
  keywords: [
    "academic scheduling software",
    "university timetabling system",
    "course scheduling automation",
    "King Saud University",
    "KSU software engineering",
    "faculty load management",
    "student registration system",
    "AI schedule optimization",
    "academic planning tool",
    "conflict-free timetabling",
    "automated course scheduling",
    "educational technology",
    "academic resource optimization",
  ],
  authors: [{ name: "King Saud University - Software Engineering Department" }],
  creator: "King Saud University",
  publisher: "King Saud University",
  openGraph: {
    title: "SmartSchedule - Intelligent Academic Timetabling for KSU",
    description:
      "Transform academic planning with AI-powered scheduling, automated conflict resolution, and comprehensive resource optimization. Designed for KSU Software Engineering Department.",
    type: "website",
    locale: "en_US",
    url: "https://smartschedule.ksu.edu.sa",
    siteName: "SmartSchedule",
  },
  twitter: {
    card: "summary_large_image",
    title: "SmartSchedule - AI-Powered Academic Scheduling",
    description:
      "Intelligent timetabling system for King Saud University. Automate scheduling, optimize resources, and enhance academic excellence.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "education",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="theme-ksu-royal">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <Providers>
          <div className="flex-1">{children}</div>
          <Footer />
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
