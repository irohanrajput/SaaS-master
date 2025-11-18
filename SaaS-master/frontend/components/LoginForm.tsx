"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useFormState } from 'react-dom'
import { loginUser } from '@/app/auth/actions'
import Link from 'next/link'
import ProviderSigninBlock from '@/components/ProviderSigninBlock'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function LoginForm() {
    const initialState = {
        message: ''
    }
    const [formState, formAction] = useFormState(loginUser, initialState)
    const searchParams = useSearchParams()
    const [signupMessage, setSignupMessage] = useState<string | null>(null)
    const [isMounted, setIsMounted] = useState(false)
    
    useEffect(() => {
        setIsMounted(true)
        if (searchParams) {
            const message = searchParams.get('message')
            if (message === 'verify-email') {
                setSignupMessage('Please check your email to verify your account before logging in.')
            }
        }
    }, [searchParams])
    
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
                    Welcome Back
                </h1>
                <p className="text-gray-600">
                    Sign in to your account to continue
                </p>
            </div>

            {/* Form Container */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
                <form action={formAction} className="space-y-5">
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

                    {/* Success Message from Signup */}
                    {isMounted && signupMessage && (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4 animate-in fade-in duration-500">
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0">
                                    <svg className="w-5 h-5 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-green-800">Account created successfully!</p>
                                    <p className="text-sm text-green-700 mt-1">{signupMessage}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSignupMessage(null)}
                                    className="flex-shrink-0 text-green-600 hover:text-green-800"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Error Message */}
                    {formState?.message && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                            <p className="text-sm text-red-600 text-center">{formState.message}</p>
                        </div>
                    )}

                    {/* Sign In Button */}
                    <Button 
                        className="w-full h-14 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg transition-all text-base" 
                        type="submit"
                    >
                        Sign In
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

                    {/* Google Sign In */}
                    <ProviderSigninBlock mode="signin" />

                    {/* Sign Up Link */}
                    <div className="text-center pt-4">
                        <p className="text-sm text-gray-600">
                            Don&apos;t have an account?{' '}
                            <Link 
                                href="/signup" 
                                className="text-orange-500 hover:text-orange-600 font-bold transition-colors"
                            >
                                Sign up
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    )
}