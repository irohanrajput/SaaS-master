'use client'

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bell, ReceiptText, User, Settings, HelpCircle, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { createClient } from '@/utils/supabase/client'
import { useState, useEffect } from 'react'

interface DashboardHeaderProfileDropdownClientProps {
    user: any
}

export default function DashboardHeaderProfileDropdownClient({ user }: DashboardHeaderProfileDropdownClientProps) {
    const [billingPortalURL, setBillingPortalURL] = useState('/subscribe')
    const supabase = createClient()
    
    useEffect(() => {
        // Fetch billing portal URL client-side
        const fetchBillingURL = async () => {
            try {
                const response = await fetch('/api/stripe/billing-portal', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email: user.email }),
                })
                
                if (response.ok) {
                    const data = await response.json()
                    setBillingPortalURL(data.url)
                }
            } catch (error) {
                console.error('Error fetching billing portal URL:', error)
            }
        }
        
        if (user?.email) {
            fetchBillingURL()
        }
    }, [user?.email])
    
    const handleLogout = async () => {
        await supabase.auth.signOut()
        window.location.href = '/login'
    }
    
    if (!user) {
        return null
    }
    
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-8 w-8 sm:h-9 sm:w-9">
                    <User className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="sr-only">Open user menu</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="text-sm">
                    My Account
                    <div className="text-xs text-muted-foreground font-normal truncate">
                        {user.email}
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href="#">
                    <DropdownMenuItem className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                    </DropdownMenuItem>
                </Link>
                <Link href="#">
                    <DropdownMenuItem className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                    </DropdownMenuItem>
                </Link>
                <Link href={billingPortalURL}>
                    <DropdownMenuItem className="cursor-pointer">
                        <ReceiptText className="mr-2 h-4 w-4" />
                        <span>Billing</span>
                    </DropdownMenuItem>
                </Link>
                <Link href="#">
                    <DropdownMenuItem className="cursor-pointer">
                        <HelpCircle className="mr-2 h-4 w-4" />
                        <span>Help</span>
                    </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}