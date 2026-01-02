import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X, Check, AlertCircle, Package, TrendingUp, MessageCircle } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export default function NotificationCenter() {
  const { user } = useAuthStore()
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [dismissedNotifications, setDismissedNotifications] = useState(new Set())

  useEffect(() => {
    if (user) {
      loadDismissedNotifications()
    }
  }, [user])

  useEffect(() => {
    if (user && dismissedNotifications.size >= 0) {
      loadNotifications()
      setupRealTimeNotifications()
    }
  }, [user, dismissedNotifications])

  const loadDismissedNotifications = () => {
    try {
      const dismissed = localStorage.getItem(`dismissed_notifications_${user.id}`)
      if (dismissed) {
        const dismissedArray = JSON.parse(dismissed)
        setDismissedNotifications(new Set(dismissedArray))
      } else {
        setDismissedNotifications(new Set())
      }
    } catch (error) {
      console.error('Error loading dismissed notifications:', error)
      setDismissedNotifications(new Set())
    }
  }

  const saveDismissedNotifications = (dismissedSet) => {
    localStorage.setItem(`dismissed_notifications_${user.id}`, JSON.stringify([...dismissedSet]))
  }

  const loadNotifications = async () => {
    // Load only real notifications from localStorage (product sold, out of stock)
    const { profile } = useAuthStore.getState()
    const userRole = profile?.role
    
    let realNotifications = []
    
    if (userRole === 'farmer') {
      // Load stored farmer notifications (only real ones from sales)
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith('farmer_notification_')) {
          try {
            const notification = JSON.parse(localStorage.getItem(key))
            if (notification.farmer_id === user.id) {
              const notificationId = parseInt(key.split('_')[2])
              // Skip if notification was dismissed
              if (!dismissedNotifications.has(notificationId)) {
                realNotifications.push({
                  id: notificationId,
                  type: notification.type,
                  title: notification.title,
                  message: notification.message,
                  timestamp: notification.created_at,
                  read: false,
                  icon: notification.type === 'product_sold' ? Package : AlertCircle,
                  color: notification.type === 'product_sold' ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
                })
              }
            }
          } catch (e) {
            console.error('Error parsing notification:', e)
          }
        }
      }
    }

    setNotifications(realNotifications)
    setUnreadCount(realNotifications.filter(n => !n.read).length)
  }

  const setupRealTimeNotifications = () => {
    // Subscribe to real-time order updates
    const subscription = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'orders',
        filter: `farmer_id=eq.${user.id}`
      }, (payload) => {
        addNotification({
          type: 'order',
          title: 'New Order Received',
          message: `New order for ${payload.new.quantity}kg`,
          icon: Package,
          color: 'text-green-600 bg-green-100'
        })
      })
      .subscribe()

    return () => subscription.unsubscribe()
  }

  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now(),
      ...notification,
      timestamp: new Date().toISOString(),
      read: false
    }

    setNotifications(prev => [newNotification, ...prev])
    setUnreadCount(prev => prev + 1)
    
    // Show toast notification
    toast.success(notification.title)
    
    // Request permission and show browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/icon-192.png'
      })
    }
  }

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  const deleteNotification = (id) => {
    // Add to dismissed notifications
    const newDismissed = new Set(dismissedNotifications)
    newDismissed.add(id)
    setDismissedNotifications(newDismissed)
    saveDismissedNotifications(newDismissed)
    
    // Remove from current notifications
    setNotifications(prev => prev.filter(n => n.id !== id))
    const notification = notifications.find(n => n.id === id)
    if (notification && !notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1))
    }
  }

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        toast.success('Notifications enabled!')
      }
    }
  }

  const getTimeAgo = (timestamp) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInMinutes = Math.floor((now - time) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  return (
    <>
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(true)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black bg-opacity-25 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              className="fixed right-4 top-16 w-80 bg-white rounded-lg shadow-xl border z-50 max-h-96 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="font-medium text-gray-900">Notifications</h3>
                <div className="flex items-center space-x-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Notifications List */}
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p>No notifications yet</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {notifications.map((notification) => {
                      const Icon = notification.icon
                      return (
                        <div
                          key={notification.id}
                          className={`p-4 hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''}`}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`p-1 rounded-full ${notification.color}`}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-gray-900">
                                  {notification.title}
                                </p>
                                <button
                                  onClick={() => deleteNotification(notification.id)}
                                  className="text-gray-400 hover:text-gray-600"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">
                                {notification.message}
                              </p>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-xs text-gray-500">
                                  {getTimeAgo(notification.timestamp)}
                                </span>
                                {!notification.read && (
                                  <button
                                    onClick={() => markAsRead(notification.id)}
                                    className="text-xs text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                                  >
                                    <Check className="h-3 w-3" />
                                    <span>Mark read</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-3 border-t bg-gray-50">
                <button
                  onClick={requestNotificationPermission}
                  className="w-full text-xs text-blue-600 hover:text-blue-800"
                >
                  Enable browser notifications
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}