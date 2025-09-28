"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Icons } from "@/components/icons";
import { UserNav } from "@/components/shared/user-nav";

interface NavItem {
  title: string;
  href: string;
  icon: keyof typeof Icons;
  role?: string[];
  disabled?: boolean;
  external?: boolean;
  label?: string;
}

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  user: {
    name: string;
    email: string;
    image?: string;
    role: string;
  };
  items: NavItem[];
}

export function Sidebar({ className, user, items, ...props }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div
      className={cn("flex h-screen flex-col border-r", className)}
      {...props}
    >
      <div className="flex h-16 items-center border-b px-4">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <Icons.logo className="h-6 w-6" />
          <span className="font-bold">SmartSchedule</span>
        </Link>
      </div>
      <ScrollArea className="flex-1">
        <div className="space-y-1 p-4">
          {items.map((item) => {
            const Icon = Icons[item.icon];
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            // Skip items that don't match the user's role
            if (item.role && !item.role.includes(user.role)) {
              return null;
            }

            return (
              <Button
                key={item.href}
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  isActive && "bg-accent text-accent-foreground"
                )}
                asChild
              >
                <Link href={item.disabled ? "#" : item.href}>
                  <Icon className="mr-2 h-4 w-4" />
                  {item.title}
                  {item.label && (
                    <span className="ml-auto rounded-md bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                      {item.label}
                    </span>
                  )}
                </Link>
              </Button>
            );
          })}
        </div>
      </ScrollArea>
      <div className="border-t p-4">
        <UserNav user={user} />
      </div>
    </div>
  );
}
