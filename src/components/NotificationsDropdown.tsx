"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

// UI-only notification shape (avoid collision with domain Notification in types.ts)
interface UINotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: "info" | "warning" | "success" | "error";
}

export function NotificationsDropdown() {
  const [notifications, setNotifications] = useState<UINotificationItem[]>([
    {
      id: "1",
      title: "Schedule Update",
      message: "The preliminary schedule is now available for review.",
      time: "10 minutes ago",
      read: false,
      type: "info",
    },
    {
      id: "2",
      title: "Action Required",
      message: "Please submit your course preferences by Friday.",
      time: "2 hours ago",
      read: false,
      type: "warning",
    },
    {
      id: "3",
      title: "Feedback Received",
      message: "Your feedback on the schedule has been recorded.",
      time: "1 day ago",
      read: true,
      type: "success",
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const getTypeStyles = (type: UINotificationItem["type"]) => {
    switch (type) {
      case "warning":
        return "bg-amber-100 text-amber-900 dark:bg-amber-900/20 dark:text-amber-400";
      case "success":
        return "bg-green-100 text-green-900 dark:bg-green-900/20 dark:text-green-400";
      case "error":
        return "bg-red-100 text-red-900 dark:bg-red-900/20 dark:text-red-400";
      default:
        return "bg-blue-100 text-blue-900 dark:bg-blue-900/20 dark:text-blue-400";
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="default"
              className="absolute -right-1 -top-1 h-5 w-5 justify-center rounded-full p-0 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-3 py-2">
          <h3 className="text-sm font-medium">Notifications</h3>
          <div className="space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                markAllAsRead();
              }}
              disabled={unreadCount === 0}
              className="h-6 text-xs"
            >
              Mark all as read
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                clearAll();
              }}
              className="h-6 text-xs"
              disabled={notifications.length === 0}
            >
              Clear all
            </Button>
          </div>
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No notifications
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className="relative flex flex-col items-start gap-1 p-3"
                onClick={() => markAsRead(notification.id)}
              >
                <div className="absolute right-2 top-2">
                  {!notification.read && (
                    <span className="h-2 w-2 rounded-full bg-primary" />
                  )}
                </div>
                <div className="flex w-full items-start justify-between">
                  <h4 className="text-sm font-medium">{notification.title}</h4>
                  <span className="text-xs text-muted-foreground">
                    {notification.time}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {notification.message}
                </p>
                <div
                  className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-xs ${getTypeStyles(
                    notification.type
                  )}`}
                >
                  {notification.type.charAt(0).toUpperCase() +
                    notification.type.slice(1)}
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
