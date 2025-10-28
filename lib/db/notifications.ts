import { createClient } from '@/supabase/server'

export interface Notification {
  id: string
  user_id: string
  type: string
  payload: Record<string, any>
  read_at: string | null
  created_at: string
}

/**
 * Get all notifications for the current user
 */
export async function getUserNotifications(userId: string, limit: number = 50) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('notification')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data as Notification[]
}

/**
 * Get unread notification count for the current user
 */
export async function getUnreadCount(userId: string) {
  const supabase = await createClient()

  const { count, error } = await supabase
    .from('notification')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .is('read_at', null)

  if (error) throw error
  return count || 0
}

/**
 * Get only unread notifications
 */
export async function getUnreadNotifications(userId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('notification')
    .select('*')
    .eq('user_id', userId)
    .is('read_at', null)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Notification[]
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(notificationId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('notification')
    .update({ read_at: new Date().toISOString() })
    .eq('id', notificationId)

  if (error) throw error
}

/**
 * Mark all notifications as read for the current user
 */
export async function markAllAsRead(userId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('notification')
    .update({ read_at: new Date().toISOString() })
    .eq('user_id', userId)
    .is('read_at', null)

  if (error) throw error
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('notification')
    .delete()
    .eq('id', notificationId)

  if (error) throw error
}

/**
 * Delete all read notifications for the current user
 */
export async function deleteReadNotifications(userId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('notification')
    .delete()
    .eq('user_id', userId)
    .not('read_at', 'is', null)

  if (error) throw error
}

/**
 * Create a notification
 * Note: This should typically be called by scheduling committee or system triggers
 */
export async function createNotification(
  userId: string,
  type: string,
  payload: Record<string, any>
) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('notification')
    .insert({
      user_id: userId,
      type,
      payload
    })
    .select()
    .single()

  if (error) throw error
  return data as Notification
}

/**
 * Create notifications for multiple users
 */
export async function createBulkNotifications(
  userIds: string[],
  type: string,
  payload: Record<string, any>
) {
  const supabase = await createClient()

  const notifications = userIds.map(userId => ({
    user_id: userId,
    type,
    payload
  }))

  const { data, error } = await supabase
    .from('notification')
    .insert(notifications)
    .select()

  if (error) throw error
  return data as Notification[]
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
  const supabase = await createClient()

  // Total notifications
  const { count: total } = await supabase
    .from('notification')
    .select('*', { count: 'exact', head: true })

  // Unread notifications
  const { count: unread } = await supabase
    .from('notification')
    .select('*', { count: 'exact', head: true })
    .is('read_at', null)

  // Notifications by type
  const { data: byType } = await supabase
    .from('notification')
    .select('type')

  const typeCount = byType?.reduce((acc: Record<string, number>, notif: any) => {
    acc[notif.type] = (acc[notif.type] || 0) + 1
    return acc
  }, {})

  return {
    total: total || 0,
    unread: unread || 0,
    read: (total || 0) - (unread || 0),
    byType: typeCount || {}
  }
}

