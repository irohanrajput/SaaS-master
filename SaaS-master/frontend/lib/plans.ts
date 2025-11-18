export type PlanType = 'free' | 'beginner' | 'growth' | 'pro' | 'enterprise'

export interface Plan {
  name: string
  description: string
  price: {
    monthly: number
    yearly: number
  }
  features: string[]
  limits: {
    aiInsights: number
    socialConnections: number
    competitorAnalysis: number
    reports: number
  }
}

export const PLANS: Record<PlanType, Plan> = {
  free: {
    name: 'Free',
    description: 'Perfect for getting started',
    price: {
      monthly: 0,
      yearly: 0
    },
    features: [
      'Basic AI Insights',
      '2 Social Connections',
      '3 Competitor Analysis',
      '2 Reports per month'
    ],
    limits: {
      aiInsights: 5,
      socialConnections: 2,
      competitorAnalysis: 3,
      reports: 2
    }
  },
  beginner: {
    name: 'Beginner',
    description: 'Great for small projects',
    price: {
      monthly: 29,
      yearly: 290
    },
    features: [
      'Everything in Free',
      '20 AI Insights',
      '5 Social Connections',
      '10 Competitor Analysis',
      '10 Reports per month',
      'Basic analytics'
    ],
    limits: {
      aiInsights: 20,
      socialConnections: 5,
      competitorAnalysis: 10,
      reports: 10
    }
  },
  growth: {
    name: 'Growth',
    description: 'Perfect for growing businesses',
    price: {
      monthly: 79,
      yearly: 790
    },
    features: [
      'Everything in Beginner',
      'Unlimited AI Insights',
      '15 Social Connections',
      '25 Competitor Analysis',
      '25 Reports per month',
      'Advanced analytics',
      'Priority support'
    ],
    limits: {
      aiInsights: 999999,
      socialConnections: 15,
      competitorAnalysis: 25,
      reports: 25
    }
  },
  pro: {
    name: 'Pro',
    description: 'For professional teams',
    price: {
      monthly: 149,
      yearly: 1490
    },
    features: [
      'Everything in Growth',
      'Unlimited Social Connections',
      'Unlimited Competitor Analysis',
      '50 Reports per month',
      'Custom integrations',
      'Dedicated support',
      'White-label options'
    ],
    limits: {
      aiInsights: 999999,
      socialConnections: 999999,
      competitorAnalysis: 999999,
      reports: 50
    }
  },
  enterprise: {
    name: 'Enterprise',
    description: 'Custom solutions for large teams',
    price: {
      monthly: 299,
      yearly: 2990
    },
    features: [
      'Everything in Pro',
      'Unlimited everything',
      'Custom features',
      'SLA guarantee',
      'Personal account manager',
      'On-premise deployment option'
    ],
    limits: {
      aiInsights: 999999,
      socialConnections: 999999,
      competitorAnalysis: 999999,
      reports: 999999
    }
  }
}

export function getNextPlan(currentPlan: PlanType): PlanType | null {
  const planOrder: PlanType[] = ['free', 'beginner', 'growth', 'pro', 'enterprise']
  const currentIndex = planOrder.indexOf(currentPlan)
  
  if (currentIndex < planOrder.length - 1) {
    return planOrder[currentIndex + 1]
  }
  
  return null
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price)
}