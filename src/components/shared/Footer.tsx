import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface FooterProps {
  className?: string;
}

export function Footer({ className = "" }: FooterProps) {
  return (
    <footer className={`border-t bg-background ${className}`}>
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <Image src="/icon.png" alt="SmartSchedule" width={32} height={32} />
            <div className="text-left">
              <div className="font-bold text-lg">SmartSchedule</div>
              <div className="text-xs text-muted-foreground">
                Academic scheduling platform
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                v4.0.0
              </Badge>
            </div>
            <Separator orientation="vertical" className="h-4" />
            <span>© 2025 SmartSchedule</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
