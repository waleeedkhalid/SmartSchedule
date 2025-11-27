// Notification Store - Manage in-app notifications
import { create } from 'zustand';
import { Notification } from '@/lib/types/database';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  
  // Actions
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  setLoading: (loading: boolean) => void;
  updateUnreadCount: () => void;
  clear: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  
  setNotifications: (notifications) => {
    // Safely handle null/undefined or invalid arrays
    const safeNotifications = Array.isArray(notifications) ? notifications : [];
    const unreadCount = safeNotifications.filter((n) => n && !n.read_at).length;
    set({ notifications: safeNotifications, unreadCount });
  },
  
  addNotification: (notification) => set((state) => {
    const notifications = [notification, ...state.notifications];
    const unreadCount = notifications.filter((n) => !n.read_at).length;
    return { notifications, unreadCount };
  }),
  
  markAsRead: (id) => set((state) => {
    const notifications = state.notifications.map((n) =>
      n.id === id ? { ...n, read_at: new Date().toISOString() } : n
    );
    const unreadCount = notifications.filter((n) => !n.read_at).length;
    return { notifications, unreadCount };
  }),
  
  markAllAsRead: () => set((state) => {
    const now = new Date().toISOString();
    const notifications = state.notifications.map((n) => ({
      ...n,
      read_at: n.read_at || now,
    }));
    return { notifications, unreadCount: 0 };
  }),
  
  deleteNotification: (id) => set((state) => {
    const notifications = state.notifications.filter((n) => n.id !== id);
    const unreadCount = notifications.filter((n) => !n.read_at).length;
    return { notifications, unreadCount };
  }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  updateUnreadCount: () => set((state) => ({
    unreadCount: state.notifications.filter((n) => !n.read_at).length,
  })),
  
  clear: () => set({
    notifications: [],
    unreadCount: 0,
    isLoading: false,
  }),
}));

