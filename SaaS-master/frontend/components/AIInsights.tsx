'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Lightbulb, TrendingUp, Target, Users, Globe, ChevronDown, ChevronUp, 
  RefreshCw, Sparkles, CheckCircle2, ArrowRight, AlertCircle
} from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

interface ActionStep {
  step: string
  completed?: boolean
}

interface Recommendation {
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  category: 'SEO' | 'Social Media' | 'Competitor' | 'Traffic' | 'Overall'
  impact: string
  actionSteps: string[]
}

interface AIInsightsData {
  recommendations: Recommendation[]
  overallScore: number
  summary: string
}

const categoryIcons = {
  'SEO': <Globe className="w-5 h-5" />,
  'Social Media': <Users className="w-5 h-5" />,
  'Competitor': <Target className="w-5 h-5" />,
  'Traffic': <TrendingUp className="w-5 h-5" />,
  'Overall': <Sparkles className="w-5 h-5" />
}

const categoryColors = {
  'SEO': 'bg-blue-500',
  'Social Media': 'bg-pink-500',
  'Competitor': 'bg-purple-500',
  'Traffic': 'bg-green-500',
  'Overall': 'bg-orange-500'
}

const priorityColors = {
  high: 'bg-red-100 text-red-700 border-red-200',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  low: 'bg-gray-100 text-gray-700 border-gray-200'
}

export default function AIInsights() {
  const [insights, setInsights] = useState<AIInsightsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set([0])) // First card expanded by default
  const [userEmail, setUserEmail] = useState<string>('')

  useEffect(() => {
    const init = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email) {
        setUserEmail(user.email)
        await loadLatestInsights(user.email)
      }
      setLoading(false)
    }
    init()
  }, [])

  const loadLatestInsights = async (email: string) => {
    try {
      const response = await fetch(`http://localhost:3010/api/ai-insights/latest?email=${encodeURIComponent(email)}`)
      const data = await response.json()
      
      if (data.success && data.insights) {
        setInsights(data.insights)
        console.log('✅ Loaded AI insights')
      }
    } catch (error) {
      console.error('Failed to load AI insights:', error)
    }
  }

  const generateNewInsights = async () => {
    if (!userEmail) {
      alert('Please log in to generate insights')
      return
    }

    setGenerating(true)
    try {
      const response = await fetch('http://localhost:3010/api/ai-insights/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: userEmail })
      })

      const data = await response.json()

      if (data.success && data.insights) {
        setInsights(data.insights)
        console.log('✅ Generated new AI insights')
      } else {
        alert('Failed to generate insights: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Failed to generate insights:', error)
      alert('Failed to generate AI insights. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  const toggleCard = (index: number) => {
    const newExpanded = new Set(expandedCards)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedCards(newExpanded)
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    if (score >= 40) return 'Fair'
    return 'Needs Improvement'
  }

  if (loading) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="p-12">
          <div className="flex flex-col items-center justify-center">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mb-4" />
            <p className="text-sm text-gray-500">Loading AI insights...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!insights) {
    return (
      <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-purple-50">
        <CardContent className="p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lightbulb className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No AI Insights Yet
            </h3>
            <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
              Generate AI-powered recommendations to improve your business performance based on your SEO, social media, and competitor data.
            </p>
            <Button 
              onClick={generateNewInsights}
              disabled={generating}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {generating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Generating Insights...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate AI Insights
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Card with Overall Score */}
      <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5" />
                <h3 className="text-lg font-semibold">AI Business Insights</h3>
              </div>
              <p className="text-sm text-white/90">{insights.summary}</p>
            </div>
            <div className="text-center ml-6">
              <div className="text-4xl font-bold mb-1">{insights.overallScore}</div>
              <div className="text-sm text-white/80">{getScoreLabel(insights.overallScore)}</div>
            </div>
            <Button 
              onClick={generateNewInsights}
              disabled={generating}
              variant="outline"
              className="ml-6 bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              {generating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.recommendations.map((rec, index) => (
          <Card 
            key={index} 
            className="border-0 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`${categoryColors[rec.category]} p-2 rounded-lg text-white flex-shrink-0`}>
                    {categoryIcons[rec.category]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base font-semibold text-gray-900 mb-1">
                      {rec.title}
                    </CardTitle>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className={priorityColors[rec.priority]}>
                        {rec.priority.toUpperCase()} PRIORITY
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {rec.category}
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleCard(index)}
                  className="flex-shrink-0"
                >
                  {expandedCards.has(index) ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-gray-600 mb-3">
                {rec.description}
              </p>
              
              <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg mb-3">
                <TrendingUp className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-900">
                  <span className="font-medium">Expected Impact:</span> {rec.impact}
                </p>
              </div>

              {expandedCards.has(index) && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-900 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    Action Steps:
                  </div>
                  {rec.actionSteps.map((step, stepIndex) => (
                    <div 
                      key={stepIndex}
                      className="flex items-start gap-2 p-2 bg-gray-50 rounded text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <ArrowRight className="w-4 h-4 flex-shrink-0 mt-0.5 text-gray-400" />
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Info Footer */}
      <Card className="border-0 shadow-sm bg-gray-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <AlertCircle className="w-4 h-4" />
            <span>
              AI insights are generated based on your SEO, social media, competitor analysis, and traffic data.
              Refresh weekly for updated recommendations.
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
