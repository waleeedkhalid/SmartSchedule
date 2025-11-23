/**
 * Database queries for notifications
 * 
 * MIGRATED: Now uses Prisma ORM instead of Supabase Client
 */
import { db } from '@/lib/db'
import type { Notification } from '@prisma/client'

/**
 * Get all notifications for the current user
 */
export async function getUserNotifications(userId: string, limit: number = 50): Promise<Notification[]> {
  return await db.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit
  })
}

/**
 * Get unread notification count for the current user
 */
export async function getUnreadCount(userId: string): Promise<number> {
  return await db.notification.count({
    where: {
      userId,
      readAt: null
    }
  })
}

/**
 * Get only unread notifications
 */
export async function getUnreadNotifications(userId: string): Promise<Notification[]> {
  return await db.notification.findMany({
    where: {
      userId,
      readAt: null
    },
    orderBy: { createdAt: 'desc' }
  })
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(notificationId: string): Promise<void> {
  await db.notification.update({
    where: { id: notificationId },
    data: { readAt: new Date() }
  })
}

/**
 * Mark all notifications as read for the current user
 */
export async function markAllAsRead(userId: string): Promise<void> {
  await db.notification.updateMany({
    where: {
      userId,
      readAt: null
    },
    data: { readAt: new Date() }
  })
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: string): Promise<void> {
  await db.notification.delete({
    where: { id: notificationId }
  })
}

/**
 * Delete all read notifications for the current user
 */
export async function deleteReadNotifications(userId: string): Promise<void> {
  await db.notification.deleteMany({
    where: {
      userId,
      readAt: { not: null }
    }
  })
}

/**
 * Create a notification
 * Note: This should typically be called by scheduling committee or system triggers
 * 
 * SECURITY: Validates that userId exists in Prisma before creating notification
 */
export async function createNotification(
  userId: string,
  type: string,
  payload: Record<string, any>
): Promise<Notification> {
  // Verify user exists in Prisma
  const userExists = await db.userRole.findUnique({
    where: { userId },
    select: { userId: true }
  })
  
  if (!userExists) {
    throw new Error(`User ${userId} does not exist`)
  }
  
  return await db.notification.create({
    data: {
      userId,
      type,
      payload
    }
  })
}

/**
 * Create notifications for multiple users
 * 
 * SECURITY: Validates that all userIds exist in Prisma before creating notifications
 */
export async function createBulkNotifications(
  userIds: string[],
  type: string,
  payload: Record<string, any>
): Promise<Notification[]> {
  // Verify all users exist in Prisma
  const existingUsers = await db.userRole.findMany({
    where: { userId: { in: userIds } },
    select: { userId: true }
  })
  
  const existingIds = new Set(existingUsers.map(u => u.userId))
  const invalidIds = userIds.filter(id => !existingIds.has(id))
  
  if (invalidIds.length > 0) {
    throw new Error(`Invalid user IDs: ${invalidIds.join(', ')}`)
  }
  
  return await db.notification.createManyAndReturn({
    data: userIds.map(userId => ({
      userId,
      type,
      payload
    }))
  })
}

/**
 * Notify users about a schedule change
 */
export async function notifyScheduleChange(
  affectedUserIds: string[],
  changeType: 'section_updated' | 'section_deleted' | 'exam_updated' | 'exam_deleted' | 'schedule_released',
  details: Record<string, any>
) {
  return createBulkNotifications(affectedUserIds, changeType, details)
}

/**
 * Get notification statistics for admin
 */
export async function getNotificationStats() {
  const [total, unread, byTypeData] = await Promise.all([
    db.notification.count(),
    db.notification.count({ where: { readAt: null } }),
    db.notification.findMany({
      select: { type: true }
    })
  ])
  
  const typeCount = byTypeData.reduce((acc, notif) => {
    acc[notif.type] = (acc[notif.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  return {
    total,
    unread,
    read: total - unread,
    byType: typeCount
  }
}

