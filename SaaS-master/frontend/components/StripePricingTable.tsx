"use client"
import React, { useState } from 'react';
import { CheckCircle } from 'lucide-react';

interface PricingPlan {
    id: string
    name: string
    price: number
    description: string
    features: string[]
    popular?: boolean
    buttonText: string
    highlighted?: boolean
}

const pricingPlans: PricingPlan[] = [
    {
        id: 'starter',
        name: 'Starter',
        price: 29,
        description: 'See the Essentials',
        features: [
            'Dashboard Overview',
            'SEO & Website Performance',
            'Social Media Performance',
            'Reports & Alerts',
        ],
        buttonText: 'Choose plan',
    },
    {
        id: 'growth',
        name: 'Growth',
        price: 99,
        description: 'Benchmark and Improve',
        features: [
            'SEO & Website Performance',
            'Social Media Performance',
            'Lead Funnel Diagnostics',
            'Reports & Alerts',
            'AI Insights Hub',
        ],
        buttonText: 'Choose plan',
    },
    {
        id: 'pro',
        name: 'Pro',
        price: 249,
        description: 'Predict and Dominate',
        features: [
            'Dashboard Overview',
            'SEO & Website Performance',
            'Social Media Performance',
            'Competitor Intelligence',
            'Lead Funnel Diagnostics',
            'Reports & Alerts',
            'AI Insights Hub',
            'Additional Features',
        ],
        popular: true,
        highlighted: true,
        buttonText: 'Choose plan',
    }
]

export default function StripePricingTable({ userEmail }: { userEmail: string }) {
    const [loading, setLoading] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly')

    const handleSubscribe = async (plan: PricingPlan) => {
        if (plan.id === 'free') return

        setLoading(plan.id)
        setError(null)

        try {
            console.log('🔄 Creating checkout with dynamic pricing...')
            
            const response = await fetch('/api/stripe/create-checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: userEmail,
                    planName: plan.name,
                    planPrice: plan.price,
                    planFeatures: plan.features
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'Failed to create checkout session')
            }

            console.log('✅ Checkout created:', data)
            
            if (data.sessionUrl) {
                window.location.href = data.sessionUrl
            } else {
                throw new Error('No checkout URL received')
            }
        } catch (err: any) {
            console.error('❌ Checkout error:', err)
            setError(err.message || 'Failed to start checkout. Please try again.')
            setLoading(null)
        }
    }

    return (
        <div className="max-w-7xl mx-auto px-4">
            {/* Billing Toggle */}
            <div className="flex justify-center mb-12">
                <div className="inline-flex items-center bg-white rounded-full p-1 shadow-sm border border-gray-200">
                    <button
                        onClick={() => setBillingPeriod('monthly')}
                        className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                            billingPeriod === 'monthly'
                                ? 'bg-primary text-white shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        MONTHLY
                    </button>
                    <button
                        onClick={() => setBillingPeriod('yearly')}
                        className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                            billingPeriod === 'yearly'
                                ? 'bg-primary text-white shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        YEARLY
                    </button>
                </div>
            </div>

            {error && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                    <p className="text-red-700 font-medium">⚠️ {error}</p>
                    <button 
                        onClick={() => setError(null)}
                        className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                    >
                        Dismiss
                    </button>
                </div>
            )}

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                {pricingPlans.map((plan) => (
                    <div
                        key={plan.id}
                        className={`relative bg-white rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl border ${
                            plan.highlighted 
                                ? 'bg-gradient-to-br from-orange-600 to-orange-800 text-white transform md:scale-105' 
                                : 'border-gray-200'
                        }`}
                    >
                        {/* Most Popular Badge */}
                        {plan.popular && (
                            <div className="absolute -top-3 right-6">
                                <div className="bg-white text-primary text-xs font-bold px-4 py-1.5 rounded-full shadow-md">
                                    MOST POPULAR
                                </div>
                            </div>
                        )}

                        <div className="p-8">
                            {/* Price */}
                            <div className="mb-6">
                                <div className="flex items-baseline gap-1 mb-2">
                                    <span className={`text-5xl font-bold ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                                        ${plan.price}
                                    </span>
                                    <span className={`text-lg ${plan.highlighted ? 'text-white/80' : 'text-gray-600'}`}>
                                        /month
                                    </span>
                                </div>
                            </div>

                            {/* Plan Name & Description */}
                            <div className="mb-6">
                                <h3 className={`text-2xl font-bold mb-2 ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                                    {plan.name}
                                </h3>
                                <p className={`text-sm ${plan.highlighted ? 'text-white/80' : 'text-gray-600'}`}>
                                    {plan.description}
                                </p>
                            </div>

                            {/* Features List */}
                            <ul className="space-y-3 mb-8">
                                {plan.features.map((feature, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <CheckCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                                            plan.highlighted ? 'text-white' : 'text-primary'
                                        }`} />
                                        <span className={`text-sm ${plan.highlighted ? 'text-white' : 'text-gray-700'}`}>
                                            {feature}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            {/* CTA Button */}
                            <button
                                onClick={() => handleSubscribe(plan)}
                                disabled={loading === plan.id}
                                className={`w-full py-3 px-6 rounded-lg font-semibold text-sm transition-all duration-200 ${
                                    plan.highlighted
                                        ? 'bg-white text-primary hover:bg-gray-50 shadow-md hover:shadow-lg'
                                        : 'bg-primary text-white hover:bg-primary-600 shadow-md hover:shadow-lg'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                {loading === plan.id ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Processing...
                                    </span>
                                ) : (
                                    plan.buttonText
                                )}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
