'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Loader2, Search, AlertCircle, CheckCircle, TrendingUp, TrendingDown, BarChart3, ExternalLink, Sparkles } from 'lucide-react'

// Import Chart Components
import CategoryDonutChart from '@/components/charts/CategoryDonutChart'
import CoreWebVitalsDisplay from '@/components/charts/CoreWebVitalsDisplay'
import PerformanceTimeline from '@/components/charts/PerformanceTimeline'
import ResourceBreakdown from '@/components/charts/ResourceBreakdown'

interface AnalysisResult {
  domain: string
  overall_score: number
  breakdown: {
    technical: number
    technical_seo: number
    user_experience?: number
    seo_health?: number
    search_visibility?: number
  }
  timestamp: string
  data_quality: {
    level: string
    sources: {
      lighthouse_available: boolean
      pagespeed_available: boolean
      analytics_available: boolean
      search_console_available: boolean
      technical_seo_available: boolean
    }
  }
}

interface GoogleAnalyticsOAuthProps {
  userEmail?: string
}

// Loading facts array
const loadingFacts = [
  "🚀 Analyzing your website's performance metrics...",
  "🔍 Scanning for SEO optimization opportunities...",
  "⚡ Measuring page load speed and Core Web Vitals...",
  "🎯 Checking mobile responsiveness and accessibility...",
  "🔒 Evaluating security headers and HTTPS configuration...",
  "📊 Running comprehensive Lighthouse audit...",
  "🌐 Testing cross-browser compatibility...",
  "💡 Identifying technical SEO improvements...",
  "📱 Analyzing mobile user experience...",
  "🎨 Reviewing design and usability patterns...",
  "⚙️ Checking meta tags and structured data...",
  "🔗 Analyzing internal and external links...",
  "📈 Measuring time to interactive and first contentful paint...",
  "🛡️ Scanning for security vulnerabilities...",
  "✨ Generating actionable recommendations..."
]

export default function WebsiteAnalyzer({ userEmail = 'test@example.com' }: GoogleAnalyticsOAuthProps) {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState('')
  const [lighthouseData, setLighthouseData] = useState<any>(null)
  const [loadingCharts, setLoadingCharts] = useState(false)
  const [currentFact, setCurrentFact] = useState(0)
  const [progress, setProgress] = useState(0)
  
  // Google Analytics OAuth states
  const [googleConnected, setGoogleConnected] = useState(false)
  const [checkingConnection, setCheckingConnection] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const getCurrentUserEmail = () => {
    return userEmail || 'test@example.com'
  }

  const checkGoogleConnection = async () => {
    setCheckingConnection(true)
    try {
      const email = getCurrentUserEmail()
      const response = await fetch(`http://localhost:3010/api/auth/google/status?email=${encodeURIComponent(email)}`)
      if (response.ok) {
        const data = await response.json()
        setGoogleConnected(data.connected || false)
      } else {
        setGoogleConnected(false)
      }
    } catch (error) {
      console.error('Error checking Google Analytics connection:', error)
      setGoogleConnected(false)
    } finally {
      setCheckingConnection(false)
    }
  }

  const connectGoogleAnalytics = () => {
    setGoogleLoading(true)
    const email = getCurrentUserEmail()
    window.location.href = `http://localhost:3010/api/auth/google?email=${encodeURIComponent(email)}`
  }

  const disconnectGoogleAnalytics = async () => {
    setGoogleLoading(true)
    try {
      const email = getCurrentUserEmail()
      const response = await fetch(`http://localhost:3010/api/auth/google/disconnect?email=${encodeURIComponent(email)}`, {
        method: 'POST'
      })
      if (response.ok) {
        setGoogleConnected(false)
      }
    } catch (error) {
      console.error('Error disconnecting Google Analytics:', error)
    } finally {
      setGoogleLoading(false)
    }
  }

  useEffect(() => {
    checkGoogleConnection()
    
    const urlParams = new URLSearchParams(window.location.search)
    const success = urlParams.get('success')
    const errorParam = urlParams.get('error')
    
    if (success) {
      setGoogleConnected(true)
      window.history.replaceState({}, document.title, window.location.pathname)
    } else if (errorParam) {
      setError(`OAuth Error: ${errorParam}`)
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

  // Rotate facts and simulate progress during loading
  useEffect(() => {
    let factInterval: NodeJS.Timeout
    let progressInterval: NodeJS.Timeout

    if (loading) {
      setCurrentFact(0)
      setProgress(0)
      
      // Rotate facts every 3 seconds
      factInterval = setInterval(() => {
        setCurrentFact((prev) => (prev + 1) % loadingFacts.length)
      }, 3000)

      // Simulate progress
      progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev
          return prev + Math.random() * 15
        })
      }, 500)
    }

    return () => {
      if (factInterval) clearInterval(factInterval)
      if (progressInterval) clearInterval(progressInterval)
    }
  }, [loading])

  const analyzeWebsite = async () => {
    if (!url.trim()) {
      setError('Please enter a website URL')
      return
    }

    setLoading(true)
    setLoadingCharts(true)
    setError('')
    setResult(null)
    setLighthouseData(null)
    setProgress(0)

    try {
      const cleanUrl = url.replace(/^https?:\/\//, '').replace(/\/$/, '')
      
      // Fetch basic analysis
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to analyze website')
      }

      const data = await response.json()
      setResult(data)
      setProgress(100)
      
      // Fetch Lighthouse data for charts (in background)
      try {
        const lighthouseResponse = await fetch(`http://localhost:3010/api/lighthouse/${cleanUrl}`)
        
        if (lighthouseResponse.ok) {
          const lighthouseResult = await lighthouseResponse.json()
          setLighthouseData(lighthouseResult)
        }
      } catch (lighthouseError) {
        console.error('Lighthouse data fetch failed:', lighthouseError)
        // Continue without charts if Lighthouse fails
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setProgress(0)
    } finally {
      setLoading(false)
      setLoadingCharts(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50'
    if (score >= 60) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-4 w-4" />
    if (score >= 60) return <TrendingUp className="h-4 w-4" />
    return <AlertCircle className="h-4 w-4" />
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Input Section */}
      <Card className="border border-gray-200 bg-white">
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="flex items-center space-x-2 text-base sm:text-lg text-gray-900">
            <Search className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
            <span>Website Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1">
              <Input
                type="url"
                placeholder="Enter your website URL (e.g., https://example.com)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && analyzeWebsite()}
                className="w-full h-10 sm:h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
                disabled={loading}
              />
            </div>
            <Button 
              onClick={analyzeWebsite} 
              disabled={loading}
              className="px-4 sm:px-6 h-10 sm:h-11 bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base w-full sm:w-auto"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  <span className="hidden sm:inline">Analyzing...</span>
                  <span className="sm:hidden">Loading...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Analyze Website</span>
                  <span className="sm:hidden">Analyze</span>
                </>
              )}
            </Button>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 mt-3">
            Get comprehensive SEO analysis, performance insights, and technical health score for your website.
          </p>
        </CardContent>
      </Card>

      {/* Loading State with Facts */}
      {loading && (
        <Card className="border border-blue-200 bg-blue-50">
          <CardContent className="py-8 sm:py-12">
            <div className="flex flex-col items-center justify-center space-y-4 sm:space-y-6">
              <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 animate-spin text-blue-600" />
              <div className="w-full max-w-md px-4">
                <div className="w-full bg-blue-200 rounded-full h-2 sm:h-3 mb-3 sm:mb-4">
                  <div 
                    className="bg-blue-600 h-2 sm:h-3 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-sm sm:text-base text-blue-900 text-center font-medium px-2">
                  {loadingFacts[currentFact]}
                </p>
                <p className="text-xs sm:text-sm text-blue-700 text-center mt-2">
                  {Math.round(progress)}% complete
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Google Analytics Integration Section */}
      <Card className="border border-gray-200 bg-white">
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="flex items-center space-x-2 text-base sm:text-lg text-gray-900">
            <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
            <span>Google Analytics Integration</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gray-50 rounded-lg gap-3">
              <div className="flex items-start sm:items-center space-x-3 min-w-0">
                <div className={`w-3 h-3 rounded-full flex-shrink-0 mt-1 sm:mt-0 ${googleConnected ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-gray-900 text-sm sm:text-base">
                    {checkingConnection ? 'Checking connection...' : 
                     googleConnected ? 'Connected' : 'Not connected'}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 mt-1">
                    {googleConnected ? 
                      'Your Google Analytics account is connected and ready to use.' :
                      'Connect your Google Analytics account to get deeper insights.'
                    }
                  </div>
                </div>
              </div>
              
              <Badge 
                variant={googleConnected ? "default" : "secondary"}
                className={`${googleConnected ? "bg-green-100 text-green-800" : ""} text-xs whitespace-nowrap self-start sm:self-center`}
              >
                {checkingConnection ? (
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                ) : googleConnected ? (
                  <CheckCircle className="h-3 w-3 mr-1" />
                ) : (
                  <AlertCircle className="h-3 w-3 mr-1" />
                )}
                {checkingConnection ? 'Checking...' : googleConnected ? 'Connected' : 'Disconnected'}
              </Badge>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {!googleConnected ? (
                <Button 
                  onClick={connectGoogleAnalytics}
                  disabled={googleLoading || checkingConnection}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base w-full sm:w-auto"
                >
                  {googleLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      <span className="hidden sm:inline">Connecting...</span>
                      <span className="sm:hidden">Connecting...</span>
                    </>
                  ) : (
                    <>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Connect Google Analytics</span>
                      <span className="sm:hidden">Connect GA</span>
                    </>
                  )}
                </Button>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <Button 
                    onClick={checkGoogleConnection}
                    disabled={checkingConnection}
                    variant="outline"
                    className="text-sm sm:text-base"
                  >
                    {checkingConnection ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Checking...
                      </>
                    ) : (
                      'Refresh Status'
                    )}
                  </Button>
                  <Button 
                    onClick={disconnectGoogleAnalytics}
                    disabled={googleLoading}
                    variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50 text-sm sm:text-base"
                  >
                    {googleLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Disconnecting...
                      </>
                    ) : (
                      'Disconnect'
                    )}
                  </Button>
                </div>
              )}
            </div>

            <div className="text-xs text-gray-500 pt-2 border-t border-gray-200 truncate">
              Connected as: {getCurrentUserEmail()}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex items-start space-x-2 text-red-600">
              <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 mt-0.5" />
              <span className="text-sm sm:text-base">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Display */}
      {result && (
        <div className="space-y-4 sm:space-y-6">
          {/* Overall Score */}
          <Card className="border border-gray-200 bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-base sm:text-lg text-gray-900">
                <span>Overall Health Score</span>
                <Badge className={`px-3 sm:px-4 py-1.5 sm:py-2 text-base sm:text-lg font-bold ${getScoreColor(result.overall_score)} self-start sm:self-center`}>
                  {result.overall_score}/100
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-3 sm:mb-4">
                {getScoreIcon(result.overall_score)}
                <span className="text-xs sm:text-sm text-gray-600">
                  Analysis for <strong className="text-gray-900 break-all">{result.domain}</strong>
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 sm:h-4">
                <div 
                  className={`h-3 sm:h-4 rounded-full transition-all duration-500 ${
                    result.overall_score >= 80 ? 'bg-green-500' :
                    result.overall_score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${result.overall_score}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          {/* Charts Section */}
          {loadingCharts && (
            <Card className="border border-gray-200 bg-white">
              <CardContent className="py-8 sm:py-12">
                <div className="flex flex-col items-center justify-center">
                  <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 animate-spin text-blue-600 mb-4" />
                  <p className="text-sm sm:text-base text-gray-600">Loading performance insights...</p>
                </div>
              </CardContent>
            </Card>
          )}

          {lighthouseData && !loadingCharts && (
            <>
              <div className="flex items-center gap-2 pt-2 sm:pt-4">
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Performance Insights</h2>
              </div>
              
              {/* Charts Grid - Stacked on mobile, side-by-side on desktop */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <CategoryDonutChart data={lighthouseData} />
                <CoreWebVitalsDisplay data={lighthouseData} />
              </div>
              
              <PerformanceTimeline data={lighthouseData} />
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <ResourceBreakdown data={lighthouseData} />
                
                {/* Analysis Summary Card */}
                <Card className="border border-gray-200 bg-white">
                  <CardHeader>
                    <CardTitle className="text-base sm:text-lg">Analysis Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center pb-2 border-b">
                        <span className="text-sm sm:text-base text-gray-600">Overall Score</span>
                        <span className="text-xl sm:text-2xl font-bold text-blue-600">
                          {Math.round((
                            lighthouseData.categoryScores.performance +
                            lighthouseData.categoryScores.accessibility +
                            lighthouseData.categoryScores.bestPractices +
                            lighthouseData.categoryScores.seo
                          ) / 4)}
                        </span>
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500">
                        Analyzed: {new Date(lighthouseData.timestamp).toLocaleString()}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500">
                        Lighthouse v{lighthouseData.lighthouseVersion}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {/* Breakdown Scores */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <Card className="border border-gray-200 bg-white">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="text-base sm:text-lg text-gray-900">Technical Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm font-medium text-gray-700">Technical Score</span>
                    <Badge className={`px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium ${getScoreColor(result.breakdown.technical)}`}>
                      {result.breakdown.technical}/100
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm font-medium text-gray-700">Technical SEO</span>
                    <Badge className={`px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium ${getScoreColor(result.breakdown.technical_seo)}`}>
                      {result.breakdown.technical_seo}/100
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 bg-white">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="text-base sm:text-lg text-gray-900">Data Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm font-medium text-gray-700">Google Analytics</span>
                    <Badge variant={googleConnected ? "default" : "secondary"} className="text-xs">
                      {googleConnected ? "Connected" : "Not Connected"}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm font-medium text-gray-700">PageSpeed Insights</span>
                    <Badge variant={result.data_quality.sources.pagespeed_available ? "default" : "secondary"} className="text-xs">
                      {result.data_quality.sources.pagespeed_available ? "Available" : "N/A"}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm font-medium text-gray-700">Lighthouse</span>
                    <Badge variant={lighthouseData ? "default" : "secondary"} className="text-xs">
                      {lighthouseData ? "Available" : "N/A"}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm font-medium text-gray-700">Data Quality</span>
                    <Badge variant="outline" className="text-xs capitalize">
                      {result.data_quality.level}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Analysis Info */}
          <Card className="border border-gray-200 bg-white">
            <CardContent className="pt-4 sm:pt-6">
              <div className="text-xs sm:text-sm text-gray-500 text-center">
                Analysis completed at {new Date(result.timestamp).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
