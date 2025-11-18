'use client'

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from 'next/link'
import Image from 'next/image'
import ProviderSigninBlock from '@/components/ProviderSigninBlock'
import LoginForm from "@/components/LoginForm"
import { Suspense } from 'react'

export default function Login() {
    return (
        <div className="flex min-h-screen bg-gradient-to-br from-orange-50 via-cream to-orange-100 relative overflow-hidden">
            {/* Decorative background circles */}
            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-orange-200/30 rounded-full blur-3xl"></div>
            <div className="absolute top-20 left-20 w-[400px] h-[400px] bg-orange-300/20 rounded-full blur-3xl"></div>
            
            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative z-10">
                <div className="w-full max-w-md">
                    {/* Login Form */}
                    <Suspense fallback={
                        <div className="w-full bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
                            <div className="animate-pulse space-y-4">
                                <div className="h-20 w-20 bg-gray-200 rounded-full mx-auto"></div>
                                <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                            </div>
                        </div>
                    }>
                        <LoginForm />
                    </Suspense>
                </div>
            </div>
        </div>
    )
}