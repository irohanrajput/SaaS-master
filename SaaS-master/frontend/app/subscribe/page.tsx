import StripePricingTable from "@/components/StripePricingTable";
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Bell, ChevronDown } from 'lucide-react'

export default async function Subscribe() {
    const supabase = createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background p-4">
                <div className="text-center">
                    <p className="text-lg mb-4">Please log in to subscribe</p>
                    <Link href="/login" className="text-primary hover:underline">
                        Go to Login
                    </Link>
                </div>
            </div>
        )
    }

    // Get user's display name from metadata or email
    const userName = user.user_metadata?.full_name || 
                     user.user_metadata?.name || 
                     user.email?.split('@')[0] || 
                     'User';

    return (
        <div className="flex flex-col min-h-screen bg-background">
            {/* Header - Matches Dashboard Design */}
            <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-sm">C</span>
                        </div>
                        <span className="text-xl font-bold text-gray-900 hidden sm:inline">CLARYX</span>
                    </Link>

                    {/* Page Title - Center on desktop */}
                    <h1 className="absolute left-1/2 transform -translate-x-1/2 text-xl sm:text-2xl font-bold text-gray-900 hidden md:block">
                        Dashboard
                    </h1>

                    {/* Right: Actions + User Profile */}
                    <div className="flex items-center gap-3 sm:gap-4">
                        {/* Notification Bell */}
                        <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>

                        {/* User Profile */}
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="hidden sm:flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                    <span className="text-white text-sm font-semibold">
                                        {user?.email?.[0].toUpperCase() || 'U'}
                                    </span>
                                </div>
                                <span className="text-sm font-medium text-gray-700">{userName}</span>
                                <ChevronDown className="h-4 w-4 text-gray-400" />
                            </div>

                            {/* Mobile: Just avatar */}
                            <div className="sm:hidden w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-semibold">
                                    {user?.email?.[0].toUpperCase() || 'U'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
            
            {/* Main Content */}
            <div className="flex-1 w-full py-8 sm:py-12 lg:py-16 px-4 sm:px-6">
                <div className="max-w-7xl mx-auto">
                    {/* Title Section */}
                    <div className="text-center mb-8 sm:mb-12">
                        <h1 className="font-bold text-3xl sm:text-4xl md:text-5xl text-gray-900 mb-4">
                            Plans & Pricing
                        </h1>
                        <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
                            Whether your time-saving automation needs are large or small, we&apos;re here to help you scale.
                        </p>
                    </div>
                    
                    {/* Pricing Table */}
                    <StripePricingTable userEmail={user.email!} />
                </div>
            </div>
        </div>
    )
}