'use client'

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from 'next/link'
import Image from 'next/image'
import ProviderSigninBlock from '@/components/ProviderSigninBlock'
import SignupForm from "@/components/SignupForm"

export default function Signup() {
    return (
        <div className="flex min-h-screen bg-gradient-to-br from-orange-50 via-cream to-orange-100 relative overflow-hidden">
            {/* Decorative background circles */}
            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-orange-200/30 rounded-full blur-3xl"></div>
            <div className="absolute top-20 left-20 w-[400px] h-[400px] bg-orange-300/20 rounded-full blur-3xl"></div>
            
            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative z-10">
                <div className="w-full max-w-md">
                    {/* Signup Form */}
                    <SignupForm />
                </div>
            </div>
        </div>
    )
}