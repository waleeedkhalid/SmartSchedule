import { Logo } from "@/components/brand/logo";
import Link from "next/link";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-brand-blue-50 via-background to-teal-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <header className="w-full border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="flex items-center">
            <Logo size="md" />
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        {children}
      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-sm text-slate-600 dark:text-slate-400">
        <p>© {new Date().getFullYear()} SmartSchedule. All rights reserved.</p>
      </footer>
    </div>
  );
}
