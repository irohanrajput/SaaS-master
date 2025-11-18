'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { UpgradePrompt, UsageLimitPrompt, PlanStatusBadge } from '@/components/UpgradePrompt'
import { useSubscription, usePlanCheck } from '@/contexts/SubscriptionContext'
import { 
  Brain, 
  TrendingUp, 
  Zap, 
  Target, 
  BarChart3, 
  Lightbulb,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Download,
  Share2
} from 'lucide-react'

interface AIInsight {
  id: string
  title: string
  type: 'seo' | 'performance' | 'content' | 'backlinks' | 'social' | 'conversion'
  impact: 'High' | 'Medium' | 'Low'
  effort: 'High' | 'Medium' | 'Low'
  description: string
  steps: string[]
  priority: number
  estimatedTimeframe: string
  potentialImpact: string
  status: 'new' | 'in_progress' | 'completed'
  createdAt: string
}

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3010'

export default function AIInsightsPage() {
  const { 
    usage, 
    isWithinLimit, 
    getLimit, 
    incrementUsage, 
    plan 
  } = useSubscription()
  
  const { canUseAI } = usePlanCheck()
  
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedInsight, setSelectedInsight] = useState<AIInsight | null>(null)
  const [analysisHistory, setAnalysisHistory] = useState<any[]>([])
  const [generatingNew, setGeneratingNew] = useState(false)

  const maxInsights = getLimit('aiInsights') || 0
  const currentUsage = usage.aiInsightsThisMonth || 0

  // Load insights from localStorage on component mount
  useEffect(() => {
    loadInsightsFromStorage()
    loadAnalysisHistory()
  }, [])

  const loadInsightsFromStorage = () => {
    try {
      const savedInsights = localStorage.getItem('ai_insights')
      if (savedInsights) {
        setInsights(JSON.parse(savedInsights))
      }
    } catch (error) {
      console.error('Error loading insights:', error)
    }
  }

  const loadAnalysisHistory = () => {
    try {
      const savedHistory = localStorage.getItem('competitor_analysis_history')
      if (savedHistory) {
        const history = JSON.parse(savedHistory)
        setAnalysisHistory(history.slice(0, 5)) // Show last 5 analyses
      }
    } catch (error) {
      console.error('Error loading analysis history:', error)
    }
  }

  const saveInsightsToStorage = (newInsights: AIInsight[]) => {
    try {
      localStorage.setItem('ai_insights', JSON.stringify(newInsights))
    } catch (error) {
      console.error('Error saving insights:', error)
    }
  }

  const generateAIInsights = async (analysisData?: any) => {
    if (!canUseAI) {
      setError(`You've reached your monthly AI insights limit of ${maxInsights}. Upgrade to generate more insights.`)
      return
    }

    if (!isWithinLimit('aiInsights')) {
      setError(`You've used all ${maxInsights} AI insights for this month. Upgrade to generate more insights.`)
      return
    }

    setGeneratingNew(true)
    setError(null)

    try {
      // Use provided analysis data or get from latest competitor analysis
      let dataToAnalyze = analysisData
      
      if (!dataToAnalyze) {
        // Try to get the latest competitor analysis
        const latestAnalysis = analysisHistory[0]
        if (!latestAnalysis) {
          setError('No competitor analysis data found. Please run a competitor analysis first.')
          return
        }
        dataToAnalyze = latestAnalysis
      }

      const response = await fetch(`${BACKEND}/api/competitor/ai-insights`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          yourSite: dataToAnalyze.yourSite,
          competitorSite: dataToAnalyze.competitorSite,
          comparison: dataToAnalyze.comparison
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to generate insights: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.error) {
        throw new Error(result.error)
      }

      // Transform API response to our insight format
      const newInsights: AIInsight[] = result.recommendations.map((rec: any, index: number) => ({
        id: `insight_${Date.now()}_${index}`,
        title: rec.title,
        type: inferInsightType(rec.title, rec.description),
        impact: rec.impact,
        effort: rec.effort,
        description: rec.description,
        steps: rec.steps,
        priority: index + 1,
        estimatedTimeframe: getEstimatedTimeframe(rec.effort),
        potentialImpact: getPotentialImpact(rec.impact),
        status: 'new',
        createdAt: new Date().toISOString()
      }))

      // Add to existing insights
      const updatedInsights = [...newInsights, ...insights].slice(0, 20) // Keep max 20 insights
      setInsights(updatedInsights)
      saveInsightsToStorage(updatedInsights)

      // Increment usage counter
      incrementUsage('aiInsightsThisMonth')

    } catch (error) {
      console.error('Error generating AI insights:', error)
      setError(error instanceof Error ? error.message : 'Failed to generate AI insights')
    } finally {
      setGeneratingNew(false)
    }
  }

  const inferInsightType = (title: string, description: string): AIInsight['type'] => {
    const text = (title + ' ' + description).toLowerCase()
    
    if (text.includes('speed') || text.includes('performance') || text.includes('load')) return 'performance'
    if (text.includes('backlink') || text.includes('link')) return 'backlinks'
    if (text.includes('content') || text.includes('word') || text.includes('heading')) return 'content'
    if (text.includes('social') || text.includes('media')) return 'social'
    if (text.includes('conversion') || text.includes('cta') || text.includes('button')) return 'conversion'
    return 'seo'
  }

  const getEstimatedTimeframe = (effort: string): string => {
    switch (effort) {
      case 'Low': return '1-2 weeks'
      case 'Medium': return '2-4 weeks'
      case 'High': return '1-3 months'
      default: return '2-4 weeks'
    }
  }

  const getPotentialImpact = (impact: string): string => {
    switch (impact) {
      case 'High': return '20-50% improvement'
      case 'Medium': return '10-20% improvement'
      case 'Low': return '5-10% improvement'
      default: return '10-20% improvement'
    }
  }

  const updateInsightStatus = (insightId: string, newStatus: AIInsight['status']) => {
    const updatedInsights = insights.map(insight => 
      insight.id === insightId ? { ...insight, status: newStatus } : insight
    )
    setInsights(updatedInsights)
    saveInsightsToStorage(updatedInsights)
  }

  const getStatusIcon = (status: AIInsight['status']) => {
    switch (status) {
      case 'new': return <AlertCircle className="h-4 w-4 text-blue-500" />
      case 'in_progress': return <Clock className="h-4 w-4 text-yellow-500" />
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />
    }
  }

  const getTypeIcon = (type: AIInsight['type']) => {
    switch (type) {
      case 'seo': return <Target className="h-5 w-5 text-green-600" />
      case 'performance': return <Zap className="h-5 w-5 text-blue-600" />
      case 'content': return <BarChart3 className="h-5 w-5 text-purple-600" />
      case 'backlinks': return <ExternalLink className="h-5 w-5 text-orange-600" />
      case 'social': return <Share2 className="h-5 w-5 text-pink-600" />
      case 'conversion': return <TrendingUp className="h-5 w-5 text-red-600" />
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200'
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200'
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const exportInsights = () => {
    const dataStr = JSON.stringify(insights, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'ai-insights.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Brain className="h-8 w-8 text-purple-600" />
            <h1 className="text-3xl font-bold">AI Insights Hub</h1>
            <PlanStatusBadge />
          </div>
          <p className="text-gray-600">
            Get AI-powered recommendations to improve your website performance and outrank competitors
          </p>
          
          {/* Usage Indicator */}
          {maxInsights > 0 && (
            <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-purple-700">
                  AI insights this month: {currentUsage} / {maxInsights}
                </span>
                <div className="w-32 bg-purple-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${Math.min(100, (currentUsage / maxInsights) * 100)}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            onClick={exportInsights}
            variant="outline"
            size="sm"
            disabled={insights.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button
            onClick={() => generateAIInsights()}
            disabled={generatingNew || !canUseAI || !isWithinLimit('aiInsights')}
          >
            {generatingNew ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            Generate New Insights
          </Button>
        </div>
      </div>

      {/* Upgrade prompt if at limit */}
      {!canUseAI && (
        <UpgradePrompt
          feature="AI Insights Hub"
          category="AI Insights Hub"
          requiredPlan="pro"
          title="AI Insights Hub"
          description="Get AI-powered recommendations to improve your website and outrank competitors"
          trigger="card"
        />
      )}

      {/* Usage limit prompt */}
      {canUseAI && !isWithinLimit('aiInsights') && (
        <UsageLimitPrompt
          category="AI Insights"
          limitType="aiInsights"
          current={usage.aiInsightsThisMonth}
          limit={maxInsights}
        />
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-red-900">Error</h4>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Analysis History Prompt */}
      {insights.length === 0 && analysisHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              Ready to Generate AI Insights?
            </CardTitle>
            <CardDescription>
              We found recent competitor analyses. Generate AI insights to get personalized recommendations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analysisHistory.slice(0, 3).map((analysis, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{analysis.yourSite?.domain || 'Your Site'} vs {analysis.competitorSite?.domain || 'Competitor'}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(analysis.timestamp || Date.now()).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => generateAIInsights(analysis)}
                    disabled={generatingNew || !isWithinLimit('aiInsights')}
                  >
                    Generate Insights
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Insights Grid */}
      {insights.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Your AI Insights ({insights.length})</h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInsights(insights.filter(i => i.status !== 'completed'))}
              >
                Hide Completed
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {insights.map((insight) => (
              <Card key={insight.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(insight.type)}
                      <CardTitle className="text-lg">{insight.title}</CardTitle>
                    </div>
                    {getStatusIcon(insight.status)}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Badge className={`text-xs ${getImpactColor(insight.impact)}`}>
                      {insight.impact} Impact
                    </Badge>
                    <Badge className={`text-xs ${getEffortColor(insight.effort)}`}>
                      {insight.effort} Effort
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600 text-sm">{insight.description}</p>
                  
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="font-medium text-gray-900">Timeframe:</span>
                      <p className="text-gray-600">{insight.estimatedTimeframe}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">Potential Impact:</span>
                      <p className="text-gray-600">{insight.potentialImpact}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="font-medium text-gray-900 text-sm">Action Steps:</span>
                    <ul className="space-y-1">
                      {insight.steps.slice(0, 3).map((step, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                          <span className="text-purple-600 mt-1">•</span>
                          {step}
                        </li>
                      ))}
                      {insight.steps.length > 3 && (
                        <li className="text-sm text-gray-500">
                          +{insight.steps.length - 3} more steps...
                        </li>
                      )}
                    </ul>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedInsight(insight)}
                    >
                      View Details
                    </Button>
                    {insight.status === 'new' && (
                      <Button
                        size="sm"
                        onClick={() => updateInsightStatus(insight.id, 'in_progress')}
                      >
                        Start Working
                      </Button>
                    )}
                    {insight.status === 'in_progress' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateInsightStatus(insight.id, 'completed')}
                      >
                        Mark Complete
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {insights.length === 0 && analysisHistory.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No AI Insights Yet</h3>
            <p className="text-gray-600 mb-6">
              Run a competitor analysis first, then generate AI insights to get personalized recommendations.
            </p>
            <Button
              onClick={() => window.location.href = '/dashboard/competitor'}
              variant="outline"
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              Go to Competitor Analysis
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Insight Detail Modal */}
      {selectedInsight && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getTypeIcon(selectedInsight.type)}
                  <h2 className="text-2xl font-bold">{selectedInsight.title}</h2>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedInsight(null)}
                >
                  ×
                </Button>
              </div>

              <div className="flex gap-2 mb-4">
                <Badge className={`${getImpactColor(selectedInsight.impact)}`}>
                  {selectedInsight.impact} Impact
                </Badge>
                <Badge className={`${getEffortColor(selectedInsight.effort)}`}>
                  {selectedInsight.effort} Effort
                </Badge>
                <Badge variant="outline">
                  {selectedInsight.estimatedTimeframe}
                </Badge>
              </div>

              <p className="text-gray-600 mb-6">{selectedInsight.description}</p>

              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Complete Action Plan:</h3>
                <ol className="space-y-3">
                  {selectedInsight.steps.map((step, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                      <span className="text-gray-700">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="flex gap-3 pt-6 border-t mt-6">
                {selectedInsight.status === 'new' && (
                  <Button
                    onClick={() => {
                      updateInsightStatus(selectedInsight.id, 'in_progress')
                      setSelectedInsight(null)
                    }}
                  >
                    Start Working on This
                  </Button>
                )}
                {selectedInsight.status === 'in_progress' && (
                  <Button
                    onClick={() => {
                      updateInsightStatus(selectedInsight.id, 'completed')
                      setSelectedInsight(null)
                    }}
                  >
                    Mark as Completed
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => setSelectedInsight(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
