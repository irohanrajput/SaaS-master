'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useSubscription, useSubscriptionSafe, SubscriptionPlan } from '@/contexts/SubscriptionContext'
import { PLANS, PlanType, getNextPlan, formatPrice } from '@/lib/plans'
import { 
  Crown, Zap, TrendingUp, Target, BarChart3, 
  Check, ArrowRight, Lock, Star 
} from 'lucide-react'

interface UpgradePromptProps {
  feature: string
  category: string
  requiredPlan?: PlanType
  title?: string
  description?: string
  children?: React.ReactNode
  trigger?: 'button' | 'card' | 'banner' | 'modal'
  className?: string
}

export function UpgradePrompt({ 
  feature, 
  category, 
  requiredPlan = 'beginner',
  title,
  description,
  children,
  trigger = 'card',
  className = ''
}: UpgradePromptProps) {
  // Use safe hook with fallback
  const subscriptionContext = useSubscriptionSafe()
  
  // If no context available, show a simple upgrade message
  if (!subscriptionContext) {
    return (
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start space-x-3">
          <Crown className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900">Upgrade Required</h3>
            <p className="text-sm text-blue-700 mt-1">
              {description || `Unlock ${feature} and other premium features.`}
            </p>
            <Button 
              size="sm" 
              className="mt-2 bg-blue-600 hover:bg-blue-700"
              onClick={() => window.location.href = '/pricing'}
            >
              View Plans
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const { plan, setPlan } = subscriptionContext
  const nextPlan = getNextPlan(plan)
  const targetPlan = nextPlan || requiredPlan
  const targetPlanDetails = PLANS[targetPlan]

  // Ensure targetPlan is a valid SubscriptionPlan
  const isValidSubscriptionPlan = (plan: PlanType): plan is SubscriptionPlan => {
    return ['free', 'pro', 'enterprise'].includes(plan)
  }

  const getFeatureIcon = (feature: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      'competitor': <Target className="h-6 w-6 text-blue-500" />,
      'ai': <Zap className="h-6 w-6 text-purple-500" />,
      'reports': <BarChart3 className="h-6 w-6 text-green-500" />,
      'social': <TrendingUp className="h-6 w-6 text-pink-500" />,
      'technical': <Crown className="h-6 w-6 text-yellow-500" />
    }
    return iconMap[category] || <Lock className="h-6 w-6 text-gray-500" />
  }

  const handleUpgrade = (plan: SubscriptionPlan) => {
    // In a real app, this would redirect to Stripe checkout
    setPlan(plan)
    alert(`Successfully upgraded to ${PLANS[plan].name} plan! 🎉`)
  }

  const defaultTitle = title || `Unlock ${feature} Feature`
  const defaultDescription = description || `Upgrade to ${targetPlanDetails.name} to access ${feature} and more powerful features.`

  if (trigger === 'button') {
    return (
      <Dialog>
        <DialogTrigger asChild>
          {children || (
            <Button variant="outline" className={className}>
              <Lock className="h-4 w-4 mr-2" />
              Upgrade Required
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {getFeatureIcon(feature)}
              {defaultTitle}
            </DialogTitle>
            <DialogDescription>
              {defaultDescription}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">{targetPlanDetails.name}</h4>
                <Badge>{formatPrice(targetPlanDetails.price.monthly)}</Badge>
              </div>
              <ul className="text-sm text-gray-600 space-y-1">
                {targetPlanDetails.features.slice(0, 3).map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <Check className="h-3 w-3 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <Button 
              onClick={() => isValidSubscriptionPlan(targetPlan) && handleUpgrade(targetPlan)} 
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Upgrade Now
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (trigger === 'banner') {
    return (
      <div className={`bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getFeatureIcon(feature)}
            <div>
              <h4 className="font-semibold text-gray-900">{defaultTitle}</h4>
              <p className="text-sm text-gray-600">{defaultDescription}</p>
            </div>
          </div>
          <Button 
            onClick={() => isValidSubscriptionPlan(targetPlan) && handleUpgrade(targetPlan)}
            size="sm"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            Upgrade
          </Button>
        </div>
      </div>
    )
  }

  // Default card trigger
  return (
    <Card className={`border-dashed border-2 border-gray-300 ${className}`}>
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 p-3 bg-gray-100 rounded-full w-fit">
          {getFeatureIcon(feature)}
        </div>
        <CardTitle className="text-lg">{defaultTitle}</CardTitle>
        <CardDescription>{defaultDescription}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <Badge variant="outline" className="text-lg px-3 py-1">
            {formatPrice(targetPlanDetails.price.monthly)}
          </Badge>
        </div>
        <ul className="text-sm space-y-2">
          {targetPlanDetails.features.slice(0, 4).map((feature, idx) => (
            <li key={idx} className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
              {feature}
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={() => isValidSubscriptionPlan(targetPlan) && handleUpgrade(targetPlan)} 
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          Upgrade to {targetPlanDetails.name}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </CardFooter>
    </Card>
  )
}

// Component to show when usage limit is reached
interface UsageLimitPromptProps {
  category: string
  limitType: string
  current: number
  limit: number
  nextPlan?: SubscriptionPlan
}

export function UsageLimitPrompt({ 
  category, 
  limitType, 
  current, 
  limit, 
  nextPlan = 'pro' 
}: UsageLimitPromptProps) {
  const subscriptionContext = useSubscriptionSafe()
  const targetPlan = PLANS[nextPlan]

  const handleUpgrade = () => {
    if (subscriptionContext && nextPlan) {
      subscriptionContext.setPlan(nextPlan)
      alert(`Successfully upgraded to ${targetPlan.name} plan! 🎉`)
    } else {
      window.location.href = '/pricing'
    }
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-amber-100 rounded-lg">
          <Star className="h-5 w-5 text-amber-600" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-amber-900 mb-1">
            Usage Limit Reached
          </h4>
          <p className="text-sm text-amber-700 mb-3">
            You&apos;ve used {current} of {limit} {limitType.replace(/([A-Z])/g, ' $1').toLowerCase()} this month.
          </p>
          <div className="flex items-center gap-2">
            <Button 
              onClick={handleUpgrade}
              size="sm"
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              Upgrade to {targetPlan.name}
            </Button>
            <span className="text-sm text-amber-600">
              {formatPrice(targetPlan.price.monthly)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Component to display current plan status
export function PlanStatusBadge({ className = '' }: { className?: string }) {
  const subscriptionContext = useSubscriptionSafe()
  
  if (!subscriptionContext) {
    return (
      <Badge variant="outline" className={className}>
        Free Plan
      </Badge>
    )
  }
  
  const { plan } = subscriptionContext
  
  const badgeColors = {
    free: 'bg-gray-100 text-gray-800',
    beginner: 'bg-blue-100 text-blue-800', 
    growth: 'bg-green-100 text-green-800',
    pro: 'bg-purple-100 text-purple-800',
    enterprise: 'bg-orange-100 text-orange-800'
  }

  return (
    <Badge className={`${badgeColors[plan]} ${className}`}>
      {PLANS[plan].name} Plan
    </Badge>
  )
}