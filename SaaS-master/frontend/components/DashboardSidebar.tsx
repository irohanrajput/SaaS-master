'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  Home, 
  BarChart3, 
  Users, 
  FileText, 
  Settings, 
  Search,
  Bell,
  HelpCircle,
  Crown,
  TrendingUp,
  Menu,
  X,
  Globe,
  Share2,
  LineChart,
  Brain,
  MessageCircle,
  ChevronRight,
  ChevronLeft
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

interface MenuItem {
  id: string
  title: string
  icon: React.ReactNode
  href: string
}

interface DashboardSidebarProps {
  onClose?: () => void
  collapsed: boolean
  onToggle: () => void
}

const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    icon: <Home className="h-5 w-5" />,
    href: '/dashboard'
  },
  {
    id: 'seo',
    title: 'SEO & Website Performance',
    icon: <Globe className="h-5 w-5" />,
    href: '/dashboard/seo-performance'
  },
  {
    id: 'social',
    title: 'Social Media Performance',
    icon: <Share2 className="h-5 w-5" />,
    href: '/dashboard/social'
  },
  {
    id: 'competitor',
    title: 'Competitor Intelligence',
    icon: <Users className="h-5 w-5" />,
    href: '/dashboard/competitor'
  },
  {
    id: 'lead',
    title: 'Lead Funnel Diagnostics',
    icon: <LineChart className="h-5 w-5" />,
    href: '/dashboard/leads'
  },
  {
    id: 'ai',
    title: 'AI Insights Hub',
    icon: <Brain className="h-5 w-5" />,
    href: '/dashboard/ai-insights'
  },
  {
    id: 'reports',
    title: 'Reports & Alerts',
    icon: <Bell className="h-5 w-5" />,
    href: '/dashboard/reports'
  },
]

const otherItems: MenuItem[] = [
  {
    id: 'pricing',
    title: 'Upgrade Plan',
    icon: <Crown className="h-5 w-5" />,
    href: '/pricing'
  },
  {
    id: 'settings',
    title: 'Business Settings',
    icon: <Settings className="h-5 w-5" />,
    href: '/dashboard/settings'
  },
  {
    id: 'chatbot',
    title: 'Chatbot',
    icon: <MessageCircle className="h-5 w-5" />,
    href: '/dashboard/chatbot'
  },
  {
    id: 'hire',
    title: 'Hire Us',
    icon: <HelpCircle className="h-5 w-5" />,
    href: '/dashboard/hire'
  },
]

export default function DashboardSidebar({ onClose, collapsed, onToggle }: DashboardSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()

  const handleUpgradeClick = () => {
    router.push('/pricing')
  }

  const handleMenuClick = (href: string) => {
    router.push(href)
    if (onClose) onClose()
  }

  return (
    <div className="h-full flex flex-col bg-white border-r border-gray-200 relative">
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="hidden lg:flex absolute -right-3 top-20 z-50 w-6 h-6 bg-white border border-gray-200 rounded-full items-center justify-center hover:bg-gray-50 transition-colors shadow-sm"
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4 text-gray-600" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        )}
      </button>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        {/* Close button for mobile */}
        <div className="flex justify-between items-center mb-6 lg:hidden">
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-900"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Logo */}
        {!collapsed && (
          <div className="mb-8 px-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="text-xl font-bold text-gray-900">CLARYX</span>
            </div>
          </div>
        )}

        {collapsed && (
          <div className="mb-8 px-2 flex justify-center">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
          </div>
        )}

        {/* MENU Label */}
        {!collapsed && (
          <div className="mb-4 px-2">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              MENU
            </span>
          </div>
        )}

        {/* Main Navigation */}
        <nav className="space-y-1 mb-8">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.href)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-50 text-primary border-l-4 border-primary'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                } ${collapsed ? 'justify-center' : ''}`}
                title={collapsed ? item.title : undefined}
              >
                {item.icon}
                {!collapsed && <span>{item.title}</span>}
              </button>
            )
          })}
        </nav>

        {/* OTHER Label */}
        {!collapsed && (
          <div className="mb-4 px-2">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              OTHER
            </span>
          </div>
        )}

        {/* Other Items */}
        <nav className="space-y-1 mb-8">
          {otherItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.href)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                } ${collapsed ? 'justify-center' : ''}`}
                title={collapsed ? item.title : undefined}
              >
                {item.icon}
                {!collapsed && <span>{item.title}</span>}
              </button>
            )
          })}
        </nav>

  {/* AI Insights Hub: link available in menu above */}
      </div>

      {/* Upgrade Card */}
      {!collapsed && (
        <div className="p-4 border-t border-gray-200">
          <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-4 space-y-3">
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-1">
                Upgrade to Pro
              </h3>
              <p className="text-xs text-gray-600">
                Get access to all premium features
              </p>
            </div>
            <Button 
              onClick={handleUpgradeClick}
              className="w-full bg-primary hover:bg-primary-600 text-white font-semibold text-sm h-9"
            >
              Upgrade Now
            </Button>
          </div>
        </div>
      )}

      {collapsed && (
        <div className="p-4 border-t border-gray-200 flex justify-center">
          <Button 
            onClick={handleUpgradeClick}
            size="icon"
            className="bg-primary hover:bg-primary-600 text-white"
            title="Upgrade to Pro"
          >
            <TrendingUp className="w-5 h-5" />
          </Button>
        </div>
      )}
    </div>
  )
}