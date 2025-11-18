'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export type SubscriptionPlan = 'free' | 'pro' | 'enterprise'

export interface SubscriptionFeatureLimits {
  aiInsights: number
  socialConnections: number
  competitorAnalysis: number
  reports: number
}

export interface SubscriptionUsage {
  aiInsightsThisMonth: number
  socialConnectionsThisMonth: number
  competitorAnalysisThisMonth: number
  reportsThisMonth: number
}

export interface SubscriptionContextType {
  plan: SubscriptionPlan
  usage: SubscriptionUsage
  getLimit: (feature: keyof SubscriptionFeatureLimits) => number
  isWithinLimit: (feature: keyof SubscriptionFeatureLimits) => boolean
  incrementUsage: (feature: keyof SubscriptionUsage) => void
  updateUsage: (feature: keyof SubscriptionUsage, value: number) => void
  setPlan: (plan: SubscriptionPlan) => void
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined)

const PLAN_LIMITS: Record<SubscriptionPlan, SubscriptionFeatureLimits> = {
  free: {
    aiInsights: 5,
    socialConnections: 2,
    competitorAnalysis: 3,
    reports: 2
  },
  pro: {
    aiInsights: 50,
    socialConnections: 10,
    competitorAnalysis: 25,
    reports: 20
  },
  enterprise: {
    aiInsights: 999999,
    socialConnections: 999999,
    competitorAnalysis: 999999,
    reports: 999999
  }
}

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [plan, setPlan] = useState<SubscriptionPlan>('free')
  const [usage, setUsage] = useState<SubscriptionUsage>({
    aiInsightsThisMonth: 0,
    socialConnectionsThisMonth: 0,
    competitorAnalysisThisMonth: 0,
    reportsThisMonth: 0
  })

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedPlan = localStorage.getItem('subscriptionPlan') as SubscriptionPlan
      const savedUsage = localStorage.getItem('subscriptionUsage')
      
      if (savedPlan && ['free', 'pro', 'enterprise'].includes(savedPlan)) {
        setPlan(savedPlan)
      }
      
      if (savedUsage) {
        try {
          const parsedUsage = JSON.parse(savedUsage)
          setUsage(parsedUsage)
        } catch (error) {
          console.error('Error parsing saved usage:', error)
        }
      }
    }
  }, [])

  // Save to localStorage when state changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('subscriptionPlan', plan)
      localStorage.setItem('subscriptionUsage', JSON.stringify(usage))
    }
  }, [plan, usage])

  const getLimit = (feature: keyof SubscriptionFeatureLimits): number => {
    return PLAN_LIMITS[plan][feature]
  }

  const isWithinLimit = (feature: keyof SubscriptionFeatureLimits): boolean => {
    const limit = getLimit(feature)
    const currentUsage = usage[`${feature}ThisMonth` as keyof SubscriptionUsage] || 0
    return currentUsage < limit
  }

  const incrementUsage = (feature: keyof SubscriptionUsage): void => {
    setUsage(prev => ({
      ...prev,
      [feature]: (prev[feature] || 0) + 1
    }))
  }

  const updateUsage = (feature: keyof SubscriptionUsage, value: number): void => {
    setUsage(prev => ({
      ...prev,
      [feature]: value
    }))
  }

  const contextValue: SubscriptionContextType = {
    plan,
    usage,
    getLimit,
    isWithinLimit,
    incrementUsage,
    updateUsage,
    setPlan
  }

  return (
    <SubscriptionContext.Provider value={contextValue}>
      {children}
    </SubscriptionContext.Provider>
  )
}

export function useSubscription(): SubscriptionContextType {
  const context = useContext(SubscriptionContext)
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider')
  }
  return context
}

export function useSubscriptionSafe(): SubscriptionContextType | null {
  const context = useContext(SubscriptionContext)
  return context || null
}

// Define specific return types for each feature
type DefaultChecks = {
  canUseAI: boolean;
  canUseSocialMedia: boolean;
  canGenerateReports: boolean;
  canAnalyzeCompetitors: boolean;
  maxSocialConnections: number;
  maxReports: number;
  maxAIInsights: number;
  maxCompetitorAnalysis: number;
};

type LeadsChecks = {
  canAccess: boolean;
  limitMessage: string | null;
};

type SocialChecks = {
  canUseSocialMedia: boolean;
  maxSocialConnections: number;
};

type ReportsChecks = {
  canGenerateReports: boolean;
  maxReports: number;
};

type AIChecks = {
  canUseAI: boolean;
  maxAIInsights: number;
};

export function usePlanCheck(feature?: string): DefaultChecks;
export function usePlanCheck(feature: 'leads'): LeadsChecks;
export function usePlanCheck(feature: 'social'): SocialChecks;
export function usePlanCheck(feature: 'reports'): ReportsChecks;
export function usePlanCheck(feature: 'ai'): AIChecks;
export function usePlanCheck(feature?: string) {
  const { plan, usage, getLimit, isWithinLimit } = useSubscription()

  // Default checks for all features
  const defaultChecks = {
    canUseAI: isWithinLimit('aiInsights'),
    canUseSocialMedia: isWithinLimit('socialConnections'),
    canGenerateReports: isWithinLimit('reports'),
    canAnalyzeCompetitors: isWithinLimit('competitorAnalysis'),
    maxSocialConnections: getLimit('socialConnections'),
    maxReports: getLimit('reports'),
    maxAIInsights: getLimit('aiInsights'),
    maxCompetitorAnalysis: getLimit('competitorAnalysis')
  }

  // Feature-specific checks
  if (feature === 'leads') {
    return {
      canAccess: plan !== 'free', // Leads might be a premium feature
      limitMessage: plan === 'free' ? 'Upgrade to access lead management features' : null
    } as LeadsChecks
  }

  if (feature === 'social') {
    return {
      canUseSocialMedia: defaultChecks.canUseSocialMedia,
      maxSocialConnections: defaultChecks.maxSocialConnections
    } as SocialChecks
  }

  if (feature === 'reports') {
    return {
      canGenerateReports: defaultChecks.canGenerateReports,
      maxReports: defaultChecks.maxReports
    } as ReportsChecks
  }

  if (feature === 'ai') {
    return {
      canUseAI: defaultChecks.canUseAI,
      maxAIInsights: defaultChecks.maxAIInsights
    } as AIChecks
  }

  // Return all checks if no specific feature requested
  return defaultChecks
}
