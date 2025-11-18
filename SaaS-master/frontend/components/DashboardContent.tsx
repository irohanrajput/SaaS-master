'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  TrendingUp,
  TrendingDown,
  Minus,
  ExternalLink,
  BarChart3,
  Activity,
  Download,
  Info
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import SocialMediaPerformanceDialog from './SocialMediaPerformanceDialog'

interface DashboardContentProps {
  userEmail?: string
  userName?: string
}

interface TrafficData {
  source: string
  data: Array<{
    date: string
    day: number
    visitors: number
    sessions: number
    pageViews: number
  }>
  summary: {
    totalVisitors: number
    avgDailyVisitors: number
    trend: 'up' | 'down' | 'stable'
    changePercent: number
  }
}

export default function DashboardContent({ userEmail, userName }: DashboardContentProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'website' | 'seo' | 'social'>('website')
  const [url, setUrl] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [healthScore, setHealthScore] = useState<any>(null)
  const [lighthouseData, setLighthouseData] = useState<any>(null)
  const [error, setError] = useState('')
  const [trafficData, setTrafficData] = useState<TrafficData | null>(null)
  const [loadingTraffic, setLoadingTraffic] = useState(false)
  const [competitors, setCompetitors] = useState<Array<any>>([])
  const [competitorInput, setCompetitorInput] = useState('')
  const [loadingCompetitor, setLoadingCompetitor] = useState(false)

  const analyzeWebsite = async () => {
    if (!url) return
    
    setAnalyzing(true)
    setError('')
    
    try {
      const cleanUrl = url.replace(/^https?:\/\//, '').replace(/\/$/, '')
      const response = await fetch('http://localhost:3010/api/health/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: cleanUrl })
      })
      
      if (!response.ok) throw new Error('Analysis failed')
      
      const data = await response.json()
      setHealthScore(data)
      
      // Fetch traffic data
      fetchTrafficData(cleanUrl)
      
    } catch (err: any) {
      setError(err.message || 'Failed to analyze website')
    } finally {
      setAnalyzing(false)
    }
  }

  const fetchTrafficData = async (domain: string) => {
    setLoadingTraffic(true)
    try {
      const response = await fetch(`http://localhost:3010/api/traffic/${domain}`)
      if (response.ok) {
        const data = await response.json()
        setTrafficData(data)
      }
    } catch (err) {
      console.error('Failed to fetch traffic data:', err)
    } finally {
      setLoadingTraffic(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50">
      <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Monitor your website performance and SEO metrics</p>
          </div>
          <div>
            <Button variant="outline" className="text-sm">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => setActiveTab('website')}
            className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-all ${
              activeTab === 'website'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
            }`}
          >
            Website
          </button>
          <button
            onClick={() => setActiveTab('seo')}
            className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-all ${
              activeTab === 'seo'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
            }`}
          >
            SEO
          </button>
          <button
            onClick={() => setActiveTab('social')}
            className={`px-6 py-2.5 rounded-full font-medium text-sm transition-all border-2 ${
              activeTab === 'social'
                ? 'bg-orange-500 text-white border-orange-500'
                : 'text-gray-600 border-gray-300 hover:border-orange-500'
            }`}
          >
            Social Metrics
          </button>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            {/* Conditional Content Based on Active Tab */}
            {activeTab === 'social' ? (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 lg:gap-4">
                {/* Social Media Performance Overview */}
                <Card className="border border-gray-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Social Media Performance Overview
                    </CardTitle>
                    <CardDescription>
                      Track your social media engagement and reach across platforms
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center py-8">
                      <div className="relative">
                        <svg className="w-48 h-48 transform -rotate-90">
                          <circle
                            cx="96"
                            cy="96"
                            r="80"
                            stroke="#e5e7eb"
                            strokeWidth="24"
                            fill="none"
                          />
                          <circle
                            cx="96"
                            cy="96"
                            r="80"
                            stroke="#22c55e"
                            strokeWidth="24"
                            fill="none"
                            strokeDasharray="251.2 251.2"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <div className="text-4xl font-bold text-green-600">0%</div>
                          <div className="text-sm text-muted-foreground">vs competitors</div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2 mt-4">
                      <div className="flex items-center justify-between text-sm">
                        <span>Your social reach</span>
                        <span className="font-semibold text-green-600">0% ↑</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Competitor&apos;s reach</span>
                        <span className="font-semibold text-orange-600">0%</span>
                      </div>
                    </div>
                    <div className="mt-6">
                      <Button 
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                        onClick={() => { window.location.href = '/dashboard/social/connect' }}
                      >
                        Connect Platforms
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Platform Status */}
                <Card className="border border-gray-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Platform Connection Status
                    </CardTitle>
                    <CardDescription>
                      Connect your social media accounts to start tracking
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="text-4xl font-bold text-gray-400">0</p>
                          <p className="text-sm text-gray-600 mt-1 font-medium">Connected Platforms</p>
                        </div>
                        <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-4xl font-bold text-blue-600">4</p>
                          <p className="text-sm text-gray-600 mt-1 font-medium">Available Platforms</p>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between p-2 bg-gray-50 rounded">
                          <span>Facebook</span>
                          <span className="text-red-600">❌ Not Connected</span>
                        </div>
                        <div className="flex justify-between p-2 bg-gray-50 rounded">
                          <span>Instagram</span>
                          <span className="text-red-600">❌ Not Connected</span>
                        </div>
                        <div className="flex justify-between p-2 bg-gray-50 rounded">
                          <span>LinkedIn</span>
                          <span className="text-red-600">❌ Not Connected</span>
                        </div>
                        <div className="flex justify-between p-2 bg-gray-50 rounded">
                          <span>Twitter/X</span>
                          <span className="text-red-600">❌ Not Connected</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-6">
                      <Button 
                        onClick={() => window.location.href = '/dashboard/social/connect'}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                      >
                        Connect All Platforms
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <>
                {/* Search Bar */}
                <Card className="border-gray-200 shadow-sm">
                  <CardContent className="pt-6">
                    <div className="flex gap-3">
                      <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          type="text"
                          placeholder="Enter website URL (e.g., example.com)"
                          value={url}
                          onChange={(e) => setUrl(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && analyzeWebsite()}
                          disabled={analyzing}
                          className="pl-10 h-12 border-gray-300 focus:ring-orange-500 focus:border-orange-500"
                        />
                      </div>
                      <Button
                        onClick={analyzeWebsite}
                        disabled={analyzing || !url}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-8 h-12"
                      >
                        {analyzing ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <BarChart3 className="w-4 h-4 mr-2" />
                            Analyze
                          </>
                        )}
                      </Button>
                    </div>
                    {error && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600">{error}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Health Score Results */}
                {healthScore && (
                  <Card className="border-gray-200 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg font-bold">Website Health Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                          <div className={`text-4xl font-bold ${getScoreColor(healthScore.score)}`}>
                            {healthScore.score}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">Overall Score</div>
                        </div>
                        <div className="md:col-span-2">
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Performance</span>
                              <span className={`font-medium ${getScoreColor(healthScore.breakdown?.performance || 0)}`}>
                                {healthScore.breakdown?.performance || 0}/100
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">SEO</span>
                              <span className={`font-medium ${getScoreColor(healthScore.breakdown?.seo || 0)}`}>
                                {healthScore.breakdown?.seo || 0}/100
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Accessibility</span>
                              <span className={`font-medium ${getScoreColor(healthScore.breakdown?.accessibility || 0)}`}>
                                {healthScore.breakdown?.accessibility || 0}/100
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card className="border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Analysis Status</span>
                    <Badge variant={healthScore ? "default" : "secondary"}>
                      {healthScore ? "Complete" : "Pending"}
                    </Badge>
                  </div>
                  {trafficData && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Monthly Visitors</span>
                        <span className="font-medium">{formatNumber(trafficData.summary.totalVisitors)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Trend</span>
                        <div className="flex items-center gap-1">
                          {trafficData.summary.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-600" />}
                          {trafficData.summary.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-600" />}
                          {trafficData.summary.trend === 'stable' && <Minus className="w-4 h-4 text-gray-600" />}
                          <span className="text-sm font-medium">
                            {trafficData.summary.changePercent > 0 ? '+' : ''}{trafficData.summary.changePercent}%
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
