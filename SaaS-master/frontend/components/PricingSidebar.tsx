'use client'

import { useRouter } from 'next/navigation'
import { 
  LayoutDashboard, 
  Globe, 
  Share2, 
  Users, 
  LineChart,
  Brain,
  Bell,
  MessageCircle,
  HelpCircle,
} from 'lucide-react'

interface MenuItem {
  id: string
  title: string
  icon: React.ReactNode
}

const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    id: 'seo',
    title: 'SEO & Website Performance',
    icon: <Globe className="h-5 w-5" />,
  },
  {
    id: 'social',
    title: 'Social Media Performance',
    icon: <Share2 className="h-5 w-5" />,
  },
  {
    id: 'competitor',
    title: 'Competitor Intelligence',
    icon: <Users className="h-5 w-5" />,
  },
  {
    id: 'lead',
    title: 'Lead Funnel Diagnostics',
    icon: <LineChart className="h-5 w-5" />,
  },
  {
    id: 'ai',
    title: 'AI Insights Hub',
    icon: <Brain className="h-5 w-5" />,
  },
  {
    id: 'reports',
    title: 'Reports & Alerts',
    icon: <Bell className="h-5 w-5" />,
  },
]

const otherItems: MenuItem[] = [
  {
    id: 'chatbot',
    title: 'Chatbot',
    icon: <MessageCircle className="h-5 w-5" />,
  },
  {
    id: 'hire',
    title: 'Hire Us',
    icon: <HelpCircle className="h-5 w-5" />,
  },
]

export default function PricingSidebar() {
  const router = useRouter()

  const handleUpgradeClick = () => {
    router.push('/subscribe')
  }

  return (
    <div className="hidden lg:block w-64 bg-white border-r border-gray-200 p-6 h-screen sticky top-0 overflow-y-auto">
      {/* Logo */}
      <div className="mb-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">C</span>
          </div>
          <span className="text-xl font-bold text-gray-900">CLARYX</span>
        </div>
      </div>

      {/* MENU Label */}
      <div className="mb-4">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          MENU
        </span>
      </div>

      {/* Main Navigation */}
      <nav className="space-y-1 mb-8">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-all duration-200"
          >
            {item.icon}
            <span>{item.title}</span>
          </button>
        ))}
      </nav>

      {/* OTHER Label */}
      <div className="mb-4">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          OTHER
        </span>
      </div>

      {/* Other Items */}
      <nav className="space-y-1 mb-8">
        {otherItems.map((item) => (
          <button
            key={item.id}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-all duration-200"
          >
            {item.icon}
            <span>{item.title}</span>
          </button>
        ))}
      </nav>

      {/* Current Plan Card */}
      <div className="mt-auto">
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-gray-700">Current plan:</span>
            <span className="text-xs font-bold text-primary">Free Plan</span>
          </div>
          <p className="text-xs text-gray-600 mb-4 leading-relaxed">
            Lorem ipsum dolor sit amet consectetur adipiscing elit
          </p>
          <button
            onClick={handleUpgradeClick}
            className="w-full bg-primary hover:bg-primary-600 text-white text-sm font-semibold py-2.5 px-4 rounded-lg transition-colors shadow-sm"
          >
            Upgrade Now
          </button>
        </div>
      </div>
    </div>
  )
}