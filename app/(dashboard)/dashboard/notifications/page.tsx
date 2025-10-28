'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Trash2, 
  AlertTriangle, 
  Info,
  Calendar,
  BookOpen,
  X
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface Notification {
  id: string
  user_id: string
  type: string
  payload: Record<string, any>
  read_at: string | null
  created_at: string
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all')

  useEffect(() => {
    fetchNotifications()
  }, [])

  async function fetchNotifications() {
    try {
      setLoading(true)
      const res = await fetch('/api/notifications')
      if (!res.ok) throw new Error('Failed to fetch notifications')
      const data = await res.json()
      setNotifications(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  async function markAsRead(notificationId: string) {
    try {
      const res = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PATCH'
      })
      if (!res.ok) throw new Error('Failed to mark as read')
      
      // Update local state
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId
            ? { ...n, read_at: new Date().toISOString() }
            : n
        )
      )
      toast.success('Marked as read')
    } catch (err) {
      toast.error('Failed to mark as read')
    }
  }

  async function markAllAsRead() {
    try {
      const res = await fetch('/api/notifications', {
        method: 'PATCH'
      })
      if (!res.ok) throw new Error('Failed to mark all as read')
      
      // Update local state
      const now = new Date().toISOString()
      setNotifications(prev =>
        prev.map(n => ({ ...n, read_at: n.read_at || now }))
      )
      toast.success('All notifications marked as read')
    } catch (err) {
      toast.error('Failed to mark all as read')
    }
  }

  async function deleteNotification(notificationId: string) {
    try {
      const res = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE'
      })
      if (!res.ok) throw new Error('Failed to delete notification')
      
      // Update local state
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
      toast.success('Notification deleted')
    } catch (err) {
      toast.error('Failed to delete notification')
    }
  }

  async function deleteReadNotifications() {
    try {
      const res = await fetch('/api/notifications', {
        method: 'DELETE'
      })
      if (!res.ok) throw new Error('Failed to delete notifications')
      
      // Update local state
      setNotifications(prev => prev.filter(n => !n.read_at))
      toast.success('Read notifications deleted')
    } catch (err) {
      toast.error('Failed to delete notifications')
    }
  }

  const unreadNotifications = notifications.filter(n => !n.read_at)
  const readNotifications = notifications.filter(n => n.read_at)

  const displayNotifications = activeTab === 'all' ? notifications : unreadNotifications

  function getNotificationIcon(type: string) {
    switch (type) {
      case 'section_updated':
      case 'section_deleted':
        return <Calendar className="h-4 w-4" />
      case 'exam_updated':
      case 'exam_deleted':
        return <AlertTriangle className="h-4 w-4" />
      case 'schedule_released':
        return <BookOpen className="h-4 w-4" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  function getNotificationColor(type: string) {
    switch (type) {
      case 'section_updated':
        return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20'
      case 'section_deleted':
      case 'exam_deleted':
        return 'text-red-600 bg-red-50 dark:bg-red-900/20'
      case 'exam_updated':
        return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20'
      case 'schedule_released':
        return 'text-green-600 bg-green-50 dark:bg-green-900/20'
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20'
    }
  }

  function formatNotificationMessage(notification: Notification): string {
    const { type, payload } = notification
    
    switch (type) {
      case 'section_updated':
        return `Section ${payload.section_number || ''} of ${payload.course_code || 'a course'} has been updated`
      case 'section_deleted':
        return `Section ${payload.section_number || ''} of ${payload.course_code || 'a course'} has been deleted`
      case 'exam_updated':
        return `Exam for ${payload.course_code || 'a course'} has been rescheduled`
      case 'exam_deleted':
        return `Exam for ${payload.course_code || 'a course'} has been cancelled`
      case 'schedule_released':
        return `New schedule has been released: ${payload.release_tag || 'Latest'}`
      default:
        return payload.message || 'You have a new notification'
    }
  }

  function formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">
            Stay updated with schedule changes and important announcements
          </p>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-12 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">
            Stay updated with schedule changes and important announcements
          </p>
        </div>
        <div className="flex gap-2">
          {unreadNotifications.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
            >
              <CheckCheck className="mr-2 h-4 w-4" />
              Mark all read
            </Button>
          )}
          {readNotifications.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={deleteReadNotifications}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear read
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <CardTitle>All Notifications</CardTitle>
              {unreadNotifications.length > 0 && (
                <Badge variant="destructive">{unreadNotifications.length}</Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'all' | 'unread')}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">
                All ({notifications.length})
              </TabsTrigger>
              <TabsTrigger value="unread">
                Unread ({unreadNotifications.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-2">
              {displayNotifications.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                  <p className="mt-4 text-muted-foreground">
                    {activeTab === 'all' ? 'No notifications yet' : 'No unread notifications'}
                  </p>
                </div>
              ) : (
                displayNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      "flex items-start gap-3 rounded-lg border p-4 transition-colors",
                      !notification.read_at && "bg-accent/50"
                    )}
                  >
                    <div className={cn(
                      "rounded-full p-2",
                      getNotificationColor(notification.type)
                    )}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium">
                          {formatNotificationMessage(notification)}
                        </p>
                        {!notification.read_at && (
                          <Badge variant="default" className="shrink-0">
                            New
                          </Badge>
                        )}
                      </div>
                      
                      {notification.payload.details && (
                        <p className="text-sm text-muted-foreground">
                          {notification.payload.details}
                        </p>
                      )}
                      
                      <p className="text-xs text-muted-foreground">
                        {formatTimestamp(notification.created_at)}
                      </p>
                    </div>

                    <div className="flex gap-1">
                      {!notification.read_at && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                          title="Mark as read"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNotification(notification.id)}
                        title="Delete"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="unread" className="space-y-2">
              {displayNotifications.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                  <p className="mt-4 text-muted-foreground">
                    No unread notifications
                  </p>
                </div>
              ) : (
                displayNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      "flex items-start gap-3 rounded-lg border p-4 transition-colors bg-accent/50"
                    )}
                  >
                    <div className={cn(
                      "rounded-full p-2",
                      getNotificationColor(notification.type)
                    )}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium">
                          {formatNotificationMessage(notification)}
                        </p>
                        <Badge variant="default" className="shrink-0">
                          New
                        </Badge>
                      </div>
                      
                      {notification.payload.details && (
                        <p className="text-sm text-muted-foreground">
                          {notification.payload.details}
                        </p>
                      )}
                      
                      <p className="text-xs text-muted-foreground">
                        {formatTimestamp(notification.created_at)}
                      </p>
                    </div>

                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsRead(notification.id)}
                        title="Mark as read"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNotification(notification.id)}
                        title="Delete"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

