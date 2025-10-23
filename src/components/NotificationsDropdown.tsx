"use client";

import { useState } from "react";
import {
  Bell,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  Info,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyMedia,
} from "@/components/ui/empty";
import { ScrollArea } from "@/components/ui/scroll-area";

// UI-only notification shape (avoid collision with domain Notification in types.ts)
interface UINotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: "info" | "warning" | "success" | "error";
  actionable?: boolean;
  category?: "schedule" | "course" | "system" | "feedback";
}

export function NotificationsDropdown() {
  const [notifications, setNotifications] = useState<UINotificationItem[]>([
    {
      id: "1",
      title: "Course Schedule Published",
      message:
        "Your Spring 2025 course schedule is now available. Please review and confirm your enrollment.",
      time: "5 minutes ago",
      read: false,
      type: "info",
      actionable: true,
      category: "schedule",
    },
    {
      id: "2",
      title: "Room Change Alert",
      message:
        "CS 301 lecture venue changed from Room 204 to Auditorium A starting next week.",
      time: "1 hour ago",
      read: false,
      type: "warning",
      category: "course",
    },
    {
      id: "3",
      title: "Registration Deadline",
      message:
        "Last day to add/drop courses is Friday, Oct 25. Visit the registrar portal to make changes.",
      time: "3 hours ago",
      read: false,
      type: "error",
      actionable: true,
      category: "system",
    },
    {
      id: "4",
      title: "Schedule Feedback Received",
      message:
        "Thank you for your feedback on the Fall 2024 schedule. Your input helps us improve.",
      time: "1 day ago",
      read: true,
      type: "success",
      category: "feedback",
    },
    {
      id: "5",
      title: "New Elective Available",
      message:
        "Advanced Machine Learning (CS 450) has been added as an elective option for next semester.",
      time: "2 days ago",
      read: true,
      type: "info",
      category: "course",
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

  const dismissNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const getNotificationIcon = (type: UINotificationItem["type"]) => {
    switch (type) {
      case "warning":
        return <AlertCircle className="h-4 w-4" />;
      case "success":
        return <CheckCircle2 className="h-4 w-4" />;
      case "error":
        return <Clock className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getTypeStyles = (type: UINotificationItem["type"]) => {
    switch (type) {
      case "warning":
        return {
          bg: "bg-amber-50 dark:bg-amber-950/30",
          border: "border-l-amber-500",
          icon: "text-amber-600 dark:text-amber-400",
          badge:
            "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
        };
      case "success":
        return {
          bg: "bg-green-50 dark:bg-green-950/30",
          border: "border-l-green-500",
          icon: "text-green-600 dark:text-green-400",
          badge:
            "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
        };
      case "error":
        return {
          bg: "bg-red-50 dark:bg-red-950/30",
          border: "border-l-red-500",
          icon: "text-red-600 dark:text-red-400",
          badge: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
        };
      default:
        return {
          bg: "bg-blue-50 dark:bg-blue-950/30",
          border: "border-l-blue-500",
          icon: "text-blue-600 dark:text-blue-400",
          badge:
            "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
        };
    }
  };

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case "schedule":
        return <Calendar className="h-3.5 w-3.5" />;
      case "course":
        return <Bell className="h-3.5 w-3.5" />;
      case "system":
        return <AlertCircle className="h-3.5 w-3.5" />;
      case "feedback":
        return <CheckCircle2 className="h-3.5 w-3.5" />;
      default:
        return <Info className="h-3.5 w-3.5" />;
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
              className="absolute -right-1 -top-1 h-5 w-5 justify-center rounded-full p-0 text-xs animate-in fade-in zoom-in"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 p-0">
        <div className="flex items-center justify-between border-b bg-muted/40 px-5 py-3">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold">Notifications</h3>
          </div>
          <div className="flex gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  markAllAsRead();
                }}
                className="h-7 text-xs"
              >
                Mark all read
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  clearAll();
                }}
                className="h-7 text-xs text-muted-foreground"
              >
                Clear all
              </Button>
            )}
          </div>
        </div>

        <div className="max-h-[500px] overflow-auto">
          {notifications.length === 0 ? (
            <Empty className="min-h-[250px] border-none">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Bell className="h-8 w-8 text-muted-foreground/50" />
                </EmptyMedia>
                <EmptyTitle className="text-sm text-muted-foreground">
                  No notifications yet
                </EmptyTitle>
                <p className="mt-1 text-xs text-muted-foreground">
                  We&apos;ll notify you when something important happens
                </p>
              </EmptyHeader>
            </Empty>
          ) : (
            <ScrollArea className="h-full max-h-[500px]">
              <div className="py-2">
                {notifications.map((notification, index) => {
                  const styles = getTypeStyles(notification.type);
                  return (
                    <div
                      key={notification.id}
                      className={index > 0 ? "mt-4" : ""}
                    >
                      <DropdownMenuItem
                        className={`relative flex cursor-pointer flex-col items-start border-l-2 px-4 py-4 transition-colors focus:${
                          styles.bg
                        } ${
                          !notification.read
                            ? `${styles.bg} ${styles.border}`
                            : "border-l-transparent hover:bg-muted/50"
                        }`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex w-full items-start justify-between gap-3">
                          <div className="flex flex-1 items-start gap-3">
                            <div className={`mt-0.5 ${styles.icon}`}>
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 space-y-1">
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="text-sm font-semibold leading-tight">
                                  {notification.title}
                                </h4>
                                {!notification.read && (
                                  <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
                                )}
                              </div>
                              <p className="text-sm leading-relaxed text-muted-foreground">
                                {notification.message}
                              </p>
                              <div className="flex items-center gap-2 pt-1">
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  {notification.time}
                                </div>
                                {notification.category && (
                                  <>
                                    <span className="text-muted-foreground">
                                      •
                                    </span>
                                    <div
                                      className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${styles.badge}`}
                                    >
                                      {getCategoryIcon(notification.category)}
                                      {notification.category
                                        .charAt(0)
                                        .toUpperCase() +
                                        notification.category.slice(1)}
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 flex-shrink-0 text-muted-foreground hover:text-foreground"
                            onClick={(e) =>
                              dismissNotification(notification.id, e)
                            }
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                        {notification.actionable && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-3 h-7 w-full text-xs"
                            onClick={(e) => e.stopPropagation()}
                          >
                            View Details
                          </Button>
                        )}
                      </DropdownMenuItem>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </div>

        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-full text-xs text-muted-foreground hover:text-foreground"
              >
                View all notifications
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
