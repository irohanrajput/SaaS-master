'use client'

import { useState } from 'react'
import { Bell, ChevronDown, Menu, Download, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import DashboardHeaderProfileDropdownClient from './DashboardHeaderProfileDropdownClient'
import { useRouter } from 'next/navigation'

interface DashboardHeaderClientProps {
  user: any
  onMenuClick: () => void
  onDownloadReport?: () => void
}

interface Notification {
  id: string
  title: string
  message: string
  time: string
  read: boolean
}

export default function DashboardHeaderClient({ user, onMenuClick, onDownloadReport }: DashboardHeaderClientProps) {
  const router = useRouter()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  
  // Sample notifications (you can replace with real data from API)
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Website Analysis Complete',
      message: 'Your SEO analysis for example.com is ready',
      time: '5 minutes ago',
      read: false
    },
    {
      id: '2',
      title: 'New Quick Win Available',
      message: 'Optimize your page load speed to improve SEO',
      time: '1 hour ago',
      read: false
    },
    {
      id: '3',
      title: 'Weekly Report Ready',
      message: 'Your weekly performance report is available',
      time: '2 days ago',
      read: true
    }
  ])

  const unreadCount = notifications.filter(n => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ))
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })))
  }

  const clearNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id))
  }

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true)
      
      // Call the sign out API
      const response = await fetch('/auth/signout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        // Redirect to login page
        router.push('/login')
        // Force a page reload to clear all state
        window.location.href = '/login'
      } else {
        console.error('Sign out failed')
        // Still redirect even if API fails
        window.location.href = '/login'
      }
    } catch (error) {
      console.error('Error signing out:', error)
      // Redirect to login page anyway
      window.location.href = '/login'
    }
  }

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Menu button + Page Title */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              className="lg:hidden text-gray-600 hover:text-gray-900"
            >
              <Menu className="h-6 w-6" />
            </Button>
            
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Dashboard
            </h1>
          </div>

          {/* Right: Actions + User Profile */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Download Button - Hidden on mobile */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/dashboard/reports')}
              className="hidden md:flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span className="text-sm font-medium">Download Report</span>
            </Button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications)
                  setShowProfileMenu(false)
                }}
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full z-10"></span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-40">
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs text-primary hover:text-primary-600 font-medium"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <p className="text-xs text-gray-500">{unreadCount} unread notification{unreadCount > 1 ? 's' : ''}</p>
                    )}
                  </div>

                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-sm text-gray-500">No notifications</p>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
                            !notification.read ? 'bg-blue-50' : ''
                          }`}
                          onClick={() => markAsRead(notification.id)}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-sm font-semibold text-gray-900">
                                  {notification.title}
                                </h4>
                                {!notification.read && (
                                  <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></span>
                                )}
                              </div>
                              <p className="text-xs text-gray-600 mb-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-400">
                                {notification.time}
                              </p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                clearNotification(notification.id)
                              }}
                              className="p-1 text-gray-400 hover:text-gray-600 rounded"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="p-3 border-t border-gray-200">
                    <button className="w-full text-center text-sm text-primary hover:text-primary-600 font-medium py-2">
                      View All Notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile - Desktop */}
            <div className="hidden sm:block relative">
              <button
                onClick={() => {
                  setShowProfileMenu(!showProfileMenu)
                  setShowNotifications(false)
                }}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {user?.email?.[0].toUpperCase() || 'U'}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Your name'}
                </span>
                <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* Profile Dropdown Menu */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-40">
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-lg font-semibold">
                          {user?.email?.[0].toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {user?.user_metadata?.full_name || 'User'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user?.email || 'user@example.com'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-2">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false)
                        router.push('/dashboard')
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={() => {
                        setShowProfileMenu(false)
                        router.push('/dashboard/settings')
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      Settings
                    </button>
                    <button
                      onClick={() => {
                        setShowProfileMenu(false)
                        router.push('/subscribe')
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      Subscription
                    </button>
                    <button
                      onClick={() => {
                        setShowProfileMenu(false)
                        router.push('/dashboard/billing')
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      Billing
                    </button>
                  </div>

                  <div className="p-2 border-t border-gray-200">
                    <button
                      onClick={handleSignOut}
                      disabled={isSigningOut}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSigningOut ? 'Signing out...' : 'Sign Out'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile: Just avatar with dropdown */}
            <div className="sm:hidden">
              <DashboardHeaderProfileDropdownClient user={user} />
            </div>
          </div>
        </div>
      </header>

      {/* Click outside to close dropdowns */}
      {(showNotifications || showProfileMenu) && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => {
            setShowNotifications(false)
            setShowProfileMenu(false)
          }}
        />
      )}
    </>
  )
}