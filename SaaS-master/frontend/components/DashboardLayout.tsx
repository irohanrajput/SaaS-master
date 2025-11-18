'use client'

import { useState, ReactNode } from 'react'
import DashboardSidebar from './DashboardSidebar'
import DashboardHeaderClient from './DashboardHeaderClient'

interface DashboardLayoutProps {
  user: any
  children?: ReactNode
}

export default function DashboardLayout({ user, children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          transform transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${sidebarCollapsed ? 'lg:w-20' : 'lg:w-80'}
          w-80
        `}
      >
        <DashboardSidebar 
          onClose={() => setSidebarOpen(false)} 
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeaderClient 
          user={user}
          onMenuClick={() => setSidebarOpen(true)}
          onDownloadReport={() => {
            alert('Please go to SEO & Website Performance page to analyze and download reports.')
          }}
        />
        {/* Render passed children (page-specific content) or a simple welcome message */}
        {children ? (
          children
        ) : (
          <div className="flex-1 p-6">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-3xl font-bold tracking-tight mb-4">Dashboard</h1>
              <p className="text-muted-foreground mb-8">
                Welcome to your dashboard, {user?.email}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="p-6 border rounded-lg">
                  <h3 className="font-semibold mb-2">Quick Start</h3>
                  <p className="text-sm text-muted-foreground">
                    Navigate using the sidebar to access different features
                  </p>
                </div>
                <div className="p-6 border rounded-lg">
                  <h3 className="font-semibold mb-2">Reports</h3>
                  <p className="text-sm text-muted-foreground">
                    Generate and download business reports
                  </p>
                </div>
                <div className="p-6 border rounded-lg">
                  <h3 className="font-semibold mb-2">Analytics</h3>
                  <p className="text-sm text-muted-foreground">
                    View your website performance metrics
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}