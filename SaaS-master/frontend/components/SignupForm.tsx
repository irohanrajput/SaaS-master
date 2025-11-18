"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useFormState } from 'react-dom'
import { signup } from '@/app/auth/actions'
import Link from 'next/link'
import ProviderSigninBlock from '@/components/ProviderSigninBlock'

export default function SignupForm() {
    const initialState = {
        message: ''
    }
    const [formState, formAction] = useFormState(signup, initialState)
    
    return (
        <div className="w-full">
            {/* Claryx Logo - Circular Orange "C" */}
            <div className="flex justify-center mb-6">
                <div className="relative w-20 h-20">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                        {/* Orange circle background */}
                        <circle cx="50" cy="50" r="50" fill="#FF6B00"/>
                        {/* White "C" cutout */}
                        <path 
                            d="M 50 15 A 35 35 0 0 1 50 85" 
                            stroke="white" 
                            strokeWidth="18" 
                            fill="none"
                            strokeLinecap="round"
                        />
                        {/* Inner white circle */}
                        <circle cx="50" cy="50" r="20" fill="white"/>
                    </svg>
                </div>
            </div>

            {/* Welcome Text */}
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                    Welcome
                </h1>
                <p className="text-gray-600">
                    Create your account to start your journey.
                </p>
            </div>

            {/* Form Container */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
                <form action={formAction} className="space-y-5">
                    {/* Full Name Field */}
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-semibold text-gray-900">
                            Full name
                        </Label>
                        <Input
                            id="name"
                            type="text"
                            placeholder="Enter your name"
                            name="name"
                            required
                            className="h-14 border-gray-200 bg-gray-50 focus:border-orange-500 focus:ring-orange-500 rounded-xl text-base"
                        />
                    </div>

                    {/* Email Field */}
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-semibold text-gray-900">
                            Email address
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="Enter your email"
                            name="email"
                            required
                            className="h-14 border-gray-200 bg-gray-50 focus:border-orange-500 focus:ring-orange-500 rounded-xl text-base"
                        />
                    </div>

                    {/* Password Field */}
                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-sm font-semibold text-gray-900">
                            Password
                        </Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••"
                            name="password"
                            required
                            className="h-14 border-gray-200 bg-gray-50 focus:border-orange-500 focus:ring-orange-500 rounded-xl text-base"
                        />
                    </div>

                    {/* Error Message */}
                    {formState?.message && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                            <p className="text-sm text-red-600 text-center">{formState.message}</p>
                        </div>
                    )}

                    {/* Create Account Button */}
                    <Button 
                        className="w-full h-14 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg transition-all text-base" 
                        type="submit"
                    >
                        Create New Account
                    </Button>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="bg-white px-4 text-gray-500 font-medium">OR</span>
                        </div>
                    </div>

                    {/* Google Sign Up */}
                    <ProviderSigninBlock />

                    {/* Sign In Link */}
                    <div className="text-center pt-4">
                        <p className="text-sm text-gray-600">
                            Already have an account?{' '}
                            <Link 
                                href="/login" 
                                className="text-orange-500 hover:text-orange-600 font-bold transition-colors"
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    )
}