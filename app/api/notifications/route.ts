import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/supabase/server'
import {
  getUserNotifications,
  getUnreadCount,
  getUnreadNotifications,
  markAllAsRead,
  deleteReadNotifications,
  createNotification,
  createBulkNotifications,
  getNotificationStats
} from '@/lib/db/notifications'

/**
 * GET /api/notifications
 * Get notifications for current user
 * 
 * Query params:
 * - unreadOnly: 'true' | 'false' (default: false)
 * - count: 'true' | 'false' (default: false) - returns only count
 * - stats: 'true' | 'false' (default: false) - admin only
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const unreadOnly = searchParams.get('unreadOnly') === 'true'
    const countOnly = searchParams.get('count') === 'true'
    const stats = searchParams.get('stats') === 'true'

    // Admin stats
    if (stats) {
      // Check if user is scheduling role
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle()

      if (userRole?.role !== 'scheduling') {
        return NextResponse.json(
          { error: 'Forbidden' },
          { status: 403 }
        )
      }

      const data = await getNotificationStats()
      return NextResponse.json(data)
    }

    // Count only
    if (countOnly) {
      const count = await getUnreadCount(user.id)
      return NextResponse.json({ count })
    }

    // Get notifications
    const data = unreadOnly
      ? await getUnreadNotifications(user.id)
      : await getUserNotifications(user.id)

    return NextResponse.json(data)

  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/notifications
 * Create a notification (scheduling role only)
 * 
 * Body:
 * - userId or userIds: string | string[]
 * - type: string
 * - payload: object
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user has scheduling role
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle()

    if (userRole?.role !== 'scheduling') {
      return NextResponse.json(
        { error: 'Only scheduling committee can create notifications' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { userId, userIds, type, payload } = body

    if (!type || !payload) {
      return NextResponse.json(
        { error: 'Missing required fields: type, payload' },
        { status: 400 }
      )
    }

    let data
    if (userIds && Array.isArray(userIds)) {
      data = await createBulkNotifications(userIds, type, payload)
    } else if (userId) {
      data = await createNotification(userId, type, payload)
    } else {
      return NextResponse.json(
        { error: 'Must provide userId or userIds' },
        { status: 400 }
      )
    }

    return NextResponse.json(data, { status: 201 })

  } catch (error) {
    console.error('Error creating notification:', error)
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/notifications
 * Mark all notifications as read for current user
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await markAllAsRead(user.id)

    return NextResponse.json({ message: 'All notifications marked as read' })

  } catch (error) {
    console.error('Error marking notifications as read:', error)
    return NextResponse.json(
      { error: 'Failed to update notifications' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/notifications
 * Delete all read notifications for current user
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await deleteReadNotifications(user.id)

    return NextResponse.json({ message: 'Read notifications deleted' })

  } catch (error) {
    console.error('Error deleting notifications:', error)
    return NextResponse.json(
      { error: 'Failed to delete notifications' },
      { status: 500 }
    )
  }
}

