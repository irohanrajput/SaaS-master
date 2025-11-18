'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, Star } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function PricingPage() {
  const router = useRouter()

  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: '/month',
      description: 'Perfect for getting started',
      features: [
        '1 website analysis',
        'Basic SEO insights',
        'Weekly reports',
        'Email support'
      ],
      popular: false,
      buttonText: 'Get Started Free',
      buttonAction: () => router.push('/signup')
    },
    {
      name: 'Pro',
      price: '$29',
      period: '/month',
      description: 'For growing businesses',
      features: [
        'Unlimited website analysis',
        'Advanced SEO insights',
        'Competitor tracking',
        'AI-powered recommendations',
        'Daily reports',
        'Priority support',
        'Social media monitoring'
      ],
      popular: true,
      buttonText: 'Start Pro Trial',
      buttonAction: () => router.push('/subscribe')
    },
    {
      name: 'Enterprise',
      price: '$99',
      period: '/month',
      description: 'For large organizations',
      features: [
        'Everything in Pro',
        'White-label reports',
        'API access',
        'Custom integrations',
        'Dedicated account manager',
        'Advanced analytics',
        'Custom training'
      ],
      popular: false,
      buttonText: 'Contact Sales',
      buttonAction: () => window.open('mailto:sales@claryx.com', '_blank')
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get powerful insights to grow your business with our comprehensive 
            SEO and marketing analytics platform
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card key={index} className={`relative ${
              plan.popular 
                ? 'ring-2 ring-orange-500 shadow-xl scale-105' 
                : 'shadow-lg'
            }`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    Most Popular
                  </div>
                </div>
              )}

              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600">{plan.period}</span>
                </div>
                <p className="text-gray-600 mt-2">{plan.description}</p>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  onClick={plan.buttonAction}
                  className={`w-full ${
                    plan.popular 
                      ? 'bg-orange-500 hover:bg-orange-600' 
                      : 'bg-gray-900 hover:bg-gray-800'
                  }`}
                >
                  {plan.buttonText}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-4">
            All plans include a 14-day free trial. No credit card required.
          </p>
          <div className="flex justify-center gap-8 text-sm text-gray-500">
            <span>✓ Cancel anytime</span>
            <span>✓ 24/7 support</span>
            <span>✓ Money-back guarantee</span>
          </div>
        </div>
      </div>
    </div>
  )
}
